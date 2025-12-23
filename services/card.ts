import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardFormData, ReviewQuality } from '@/types';
import { toCard, CardDocument, DEFAULT_CARD_SRS } from '@/models/card';
import { updateDeckCardCount } from './deck';

const COLLECTION = 'cards';

function getDb() {
  if (!db) throw new Error('Firebase Firestore not initialized');
  return db;
}

export async function createCard(
  userId: string,
  deckId: string,
  data: CardFormData
): Promise<Card> {
  const now = Timestamp.now();
  const cardData: Omit<CardDocument, 'id'> = {
    userId,
    deckId,
    vocab: data.vocab,
    pronunciation: data.pronunciation,
    meaning: data.meaning,
    example: data.example,
    exampleTranslation: data.exampleTranslation,
    nextReview: now,
    interval: DEFAULT_CARD_SRS.interval,
    easeFactor: DEFAULT_CARD_SRS.easeFactor,
    repetitions: DEFAULT_CARD_SRS.repetitions,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(getDb(), COLLECTION), cardData);
  await updateDeckCardCount(deckId, 1);
  return toCard({ id: docRef.id, ...cardData });
}

export async function getCard(cardId: string): Promise<Card | null> {
  if (!db) return null;
  const docRef = doc(db, COLLECTION, cardId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return toCard({ id: docSnap.id, ...docSnap.data() } as CardDocument);
}

export async function getDeckCards(deckId: string, userId?: string): Promise<Card[]> {
  if (!db) return [];
  const constraints = [
    where('deckId', '==', deckId),
    orderBy('createdAt', 'desc')
  ];

  if (userId) {
    constraints.unshift(where('userId', '==', userId));
  }

  const q = query(collection(db, COLLECTION), ...constraints);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((d) =>
    toCard({ id: d.id, ...d.data() } as CardDocument)
  );
}

export async function getCardsForReview(
  userId: string,
  deckId?: string
): Promise<Card[]> {
  if (!db) return [];
  const now = new Date();
  let q;

  if (deckId) {
    q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      where('deckId', '==', deckId),
      where('nextReview', '<=', Timestamp.fromDate(now)),
      orderBy('nextReview', 'asc')
    );
  } else {
    q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      where('nextReview', '<=', Timestamp.fromDate(now)),
      orderBy('nextReview', 'asc')
    );
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((d) =>
    toCard({ id: d.id, ...d.data() } as CardDocument)
  );
}

export async function updateCard(
  cardId: string,
  data: Partial<CardFormData>
): Promise<void> {
  const docRef = doc(getDb(), COLLECTION, cardId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteCard(cardId: string, deckId: string): Promise<void> {
  await deleteDoc(doc(getDb(), COLLECTION, cardId));
  await updateDeckCardCount(deckId, -1);
}

// SM-2 Algorithm for Spaced Repetition
export async function reviewCard(
  cardId: string,
  quality: ReviewQuality
): Promise<void> {
  const card = await getCard(cardId);
  if (!card) return;

  let { interval, easeFactor, repetitions } = card;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Incorrect response
    repetitions = 0;
    interval = 1;
  }

  // Update ease factor
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  await updateDoc(doc(getDb(), COLLECTION, cardId), {
    interval,
    easeFactor,
    repetitions,
    nextReview: Timestamp.fromDate(nextReview),
    updatedAt: Timestamp.now(),
  });
}

export async function bulkCreateCards(
  userId: string,
  deckId: string,
  cards: CardFormData[]
): Promise<void> {
  const database = getDb();
  const batch = writeBatch(database);
  const now = Timestamp.now();

  cards.forEach((card) => {
    const docRef = doc(collection(database, COLLECTION));
    const cardData: Omit<CardDocument, 'id'> = {
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
    };
    batch.set(docRef, cardData);
  });

  await batch.commit();
  await updateDeckCardCount(deckId, cards.length);
}
