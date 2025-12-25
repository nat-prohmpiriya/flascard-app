import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parseJSON } from '@/services/importExport';
import { getAdminDb, validateUserId } from '@/lib/firebase-admin';
import { Language } from '@/types';
import { Timestamp } from 'firebase-admin/firestore';

const DATA_BASE_DIR = path.join(process.cwd(), 'data');

// Default SRS values
const DEFAULT_CARD_SRS = {
  interval: 0,
  easeFactor: 2.5,
  repetitions: 0,
};

function validateApiKey(request: Request): boolean {
  const apiKey = request.headers.get('X-API-Key');
  const expectedKey = process.env.IMPORT_API_KEY;
  return apiKey === expectedKey && !!expectedKey;
}

// Validate path to prevent directory traversal
function validatePath(inputPath: string): boolean {
  const normalized = path.normalize(inputPath);
  // Must not contain .. or start with /
  if (normalized.includes('..') || path.isAbsolute(normalized)) {
    return false;
  }
  return true;
}

interface ImportRequest {
  path: string; // e.g., "cefr/english" or "cefr/chinese"
  filename: string;
  userId: string;
}

// GET - List available flashcard files
export async function GET(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const subPath = searchParams.get('path') || 'cefr/english';

    if (!validatePath(subPath)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    const dirPath = path.join(DATA_BASE_DIR, subPath);

    if (!fs.existsSync(dirPath)) {
      return NextResponse.json({ error: `Directory not found: ${subPath}` }, { status: 404 });
    }

    const files = fs.readdirSync(dirPath)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        try {
          const filePath = path.join(dirPath, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const data = JSON.parse(content);
          return {
            filename: file,
            deckName: data.deck?.name || 'Unknown',
            cardCount: data.cards?.length || 0,
            category: data.deck?.category || 'Unknown',
            sourceLang: data.deck?.sourceLang || 'en',
            targetLang: data.deck?.targetLang || 'th',
          };
        } catch {
          return {
            filename: file,
            deckName: 'Error reading file',
            cardCount: 0,
            category: 'Unknown',
          };
        }
      });

    return NextResponse.json({
      success: true,
      path: subPath,
      files,
      totalFiles: files.length,
    });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Failed to list files', details: String(error) },
      { status: 500 }
    );
  }
}

// POST - Import flashcard JSON to Firestore
export async function POST(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: ImportRequest = await request.json();
    const { path: subPath, filename, userId } = body;

    if (!filename || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: filename, userId' },
        { status: 400 }
      );
    }

    // Validate userId exists in Firebase Auth
    const isValidUser = await validateUserId(userId);
    if (!isValidUser) {
      return NextResponse.json(
        { error: `User not found in Firebase Auth: ${userId}` },
        { status: 404 }
      );
    }

    const dataPath = subPath || 'cefr/english';

    if (!validatePath(dataPath) || !validatePath(filename)) {
      return NextResponse.json({ error: 'Invalid path or filename' }, { status: 400 });
    }

    const filePath = path.join(DATA_BASE_DIR, dataPath, filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `File not found: ${dataPath}/${filename}` },
        { status: 404 }
      );
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = parseJSON(content);

    if (!parsed) {
      return NextResponse.json(
        { error: 'Failed to parse JSON file' },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const now = Timestamp.now();

    // Create deck using Admin SDK
    const deckData = {
      userId,
      name: parsed.deck.name,
      description: parsed.deck.description,
      category: parsed.deck.category,
      tags: parsed.deck.tags || [],
      sourceLang: (parsed.deck.sourceLang || 'en') as Language,
      targetLang: (parsed.deck.targetLang || 'th') as Language,
      cardCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    const deckRef = await db.collection('decks').add(deckData);
    const deckId = deckRef.id;

    // Create cards using batch write (max 500 per batch)
    const cardsCount = parsed.cards.length;
    const batchSize = 400;

    for (let i = 0; i < cardsCount; i += batchSize) {
      const batch = db.batch();
      const chunk = parsed.cards.slice(i, i + batchSize);

      chunk.forEach((card) => {
        const cardRef = db.collection('cards').doc();
        batch.set(cardRef, {
          userId,
          deckId,
          vocab: card.vocab,
          pronunciation: card.pronunciation || '',
          meaning: card.meaning,
          example: card.example || '',
          exampleTranslation: card.exampleTranslation || '',
          nextReview: now,
          interval: DEFAULT_CARD_SRS.interval,
          easeFactor: DEFAULT_CARD_SRS.easeFactor,
          repetitions: DEFAULT_CARD_SRS.repetitions,
          createdAt: now,
          updatedAt: now,
        });
      });

      await batch.commit();
    }

    // Update deck card count
    await deckRef.update({
      cardCount: cardsCount,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      message: `Imported ${cardsCount} cards to deck "${parsed.deck.name}"`,
      deck: {
        id: deckId,
        name: parsed.deck.name,
        cardCount: cardsCount,
      },
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to import file', details: String(error) },
      { status: 500 }
    );
  }
}

// PUT - Update deck or card
interface UpdateDeckData {
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  sourceLang?: Language;
  targetLang?: Language;
}

interface UpdateCardData {
  vocab?: string;
  pronunciation?: string;
  meaning?: string;
  example?: string;
  exampleTranslation?: string;
  // SRS fields
  interval?: number;
  easeFactor?: number;
  repetitions?: number;
  nextReview?: string; // ISO date string
}

interface UpdateRequest {
  type: 'deck' | 'card';
  id: string;
  data: UpdateDeckData | UpdateCardData;
}

export async function PUT(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: UpdateRequest = await request.json();
    const { type, id, data } = body;

    if (!type || !id || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: type, id, data' },
        { status: 400 }
      );
    }

    if (type !== 'deck' && type !== 'card') {
      return NextResponse.json(
        { error: 'Invalid type. Must be "deck" or "card"' },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const collection = type === 'deck' ? 'decks' : 'cards';
    const docRef = db.collection(collection).doc(id);

    // Check if document exists
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return NextResponse.json(
        { error: `${type} not found with id: ${id}` },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    // Convert nextReview string to Timestamp if provided
    if (type === 'card' && 'nextReview' in data && data.nextReview) {
      updateData.nextReview = Timestamp.fromDate(new Date(data.nextReview as string));
    }

    await docRef.update(updateData);

    // Get updated document
    const updatedDoc = await docRef.get();

    return NextResponse.json({
      success: true,
      message: `${type} updated successfully`,
      [type]: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
    });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update', details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Delete all decks and cards for a user
export async function DELETE(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    // Validate userId exists in Firebase Auth
    const isValidUser = await validateUserId(userId);
    if (!isValidUser) {
      return NextResponse.json(
        { error: `User not found in Firebase Auth: ${userId}` },
        { status: 404 }
      );
    }

    const db = getAdminDb();

    // Get all decks for user
    const decksSnapshot = await db.collection('decks')
      .where('userId', '==', userId)
      .get();

    // Get all cards for user
    const cardsSnapshot = await db.collection('cards')
      .where('userId', '==', userId)
      .get();

    // Delete in batches (Firestore batch limit is 500)
    const batchSize = 400;
    let deletedDecks = 0;
    let deletedCards = 0;

    // Delete cards
    const cardDocs = cardsSnapshot.docs;
    for (let i = 0; i < cardDocs.length; i += batchSize) {
      const batch = db.batch();
      const chunk = cardDocs.slice(i, i + batchSize);
      chunk.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      deletedCards += chunk.length;
    }

    // Delete decks
    const deckDocs = decksSnapshot.docs;
    for (let i = 0; i < deckDocs.length; i += batchSize) {
      const batch = db.batch();
      const chunk = deckDocs.slice(i, i + batchSize);
      chunk.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      deletedDecks += chunk.length;
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${deletedDecks} decks and ${deletedCards} cards`,
      deleted: {
        decks: deletedDecks,
        cards: deletedCards,
      },
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete', details: String(error) },
      { status: 500 }
    );
  }
}
