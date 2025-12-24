import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parseJSON } from '@/services/importExport';
import { getAdminDb } from '@/lib/firebase-admin';
import { Language } from '@/types';
import { Timestamp } from 'firebase-admin/firestore';

const DATA_DIR = path.join(process.cwd(), 'data/cefr/english/a2');

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

interface ImportRequest {
  filename: string;
  userId: string;
}

export async function POST(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: ImportRequest = await request.json();
    const { filename, userId } = body;

    if (!filename || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: filename, userId' },
        { status: 400 }
      );
    }

    // Validate filename to prevent path traversal
    if (filename.includes('..') || filename.includes('/')) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    const filePath = path.join(DATA_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `File not found: ${filename}` },
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

    // Create cards using batch write
    const batch = db.batch();
    const cardsCount = parsed.cards.length;

    parsed.cards.forEach((card) => {
      const cardRef = db.collection('cards').doc();
      batch.set(cardRef, {
        userId,
        deckId,
        vocab: card.vocab,
        pronunciation: card.pronunciation,
        meaning: card.meaning,
        example: card.example,
        exampleTranslation: card.exampleTranslation,
        nextReview: now,
        interval: DEFAULT_CARD_SRS.interval,
        easeFactor: DEFAULT_CARD_SRS.easeFactor,
        repetitions: DEFAULT_CARD_SRS.repetitions,
        createdAt: now,
        updatedAt: now,
      });
    });

    await batch.commit();

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
