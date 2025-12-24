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
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Deck, DeckFormData } from '@/types';
import { toDeck, DeckDocument } from '@/models/deck';

const COLLECTION = 'decks';

function getDb() {
  if (!db) throw new Error('Firebase Firestore not initialized');
  return db;
}

export async function createDeck(
  userId: string,
  data: DeckFormData
): Promise<Deck> {
  const now = Timestamp.now();
  const deckData: Omit<DeckDocument, 'id'> = {
    userId,
    name: data.name,
    description: data.description,
    category: data.category,
    tags: data.tags || [],
    sourceLang: data.sourceLang,
    targetLang: data.targetLang,
    cardCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(getDb(), COLLECTION), deckData);
  return toDeck({ id: docRef.id, ...deckData });
}

export async function getDeck(deckId: string): Promise<Deck | null> {
  if (!db) return null;
  const docRef = doc(db, COLLECTION, deckId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return toDeck({ id: docSnap.id, ...docSnap.data() } as DeckDocument);
}

export async function getUserDecks(userId: string): Promise<Deck[]> {
  if (!db) return [];
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((d) =>
    toDeck({ id: d.id, ...d.data() } as DeckDocument)
  );
}

export async function updateDeck(
  deckId: string,
  data: Partial<DeckFormData>
): Promise<void> {
  const docRef = doc(getDb(), COLLECTION, deckId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteDeck(deckId: string): Promise<void> {
  await deleteDoc(doc(getDb(), COLLECTION, deckId));
}

export async function deleteAllDecks(userId: string): Promise<void> {
  const userDecks = await getUserDecks(userId);
  const deletePromises = userDecks.map(deck => deleteDeck(deck.id));
  await Promise.all(deletePromises);
}

export async function updateDeckCardCount(
  deckId: string,
  increment: number
): Promise<void> {
  const docRef = doc(getDb(), COLLECTION, deckId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const currentCount = docSnap.data().cardCount || 0;
    await updateDoc(docRef, {
      cardCount: Math.max(0, currentCount + increment),
      updatedAt: Timestamp.now(),
    });
  }
}
