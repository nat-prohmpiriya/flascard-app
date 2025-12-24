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
