import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COLLECTION = 'typingStats';

export interface TypingResult {
  id?: string;
  userId: string;
  type: 'code' | 'deck';
  sourceId: string; // language id or deck id
  sourceName: string; // language name or deck name
  snippetTitle?: string;
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  elapsedTime: number;
  createdAt: Date;
}

interface TypingResultDocument {
  userId: string;
  type: 'code' | 'deck';
  sourceId: string;
  sourceName: string;
  snippetTitle?: string;
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  elapsedTime: number;
  createdAt: Timestamp;
}

function getDb() {
  if (!db) throw new Error('Firebase Firestore not initialized');
  return db;
}

export async function saveTypingResult(
  data: Omit<TypingResult, 'id' | 'createdAt'>
): Promise<string> {
  const docData = {
    ...data,
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(getDb(), COLLECTION), docData);
  return docRef.id;
}

export async function getUserTypingStats(
  userId: string,
  limitCount = 50
): Promise<TypingResult[]> {
  if (!db) return [];

  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data() as TypingResultDocument;
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
    };
  });
}

export async function getUserBestWpm(userId: string): Promise<number> {
  if (!db) return 0;

  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('wpm', 'desc'),
    limit(1)
  );

  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return 0;

  const doc = querySnapshot.docs[0];
  return doc.data().wpm;
}

export async function getUserAverageStats(
  userId: string
): Promise<{ avgWpm: number; avgAccuracy: number; totalSessions: number }> {
  if (!db) return { avgWpm: 0, avgAccuracy: 0, totalSessions: 0 };

  const stats = await getUserTypingStats(userId, 100);
  if (stats.length === 0) {
    return { avgWpm: 0, avgAccuracy: 0, totalSessions: 0 };
  }

  const totalWpm = stats.reduce((sum, s) => sum + s.wpm, 0);
  const totalAccuracy = stats.reduce((sum, s) => sum + s.accuracy, 0);

  return {
    avgWpm: Math.round(totalWpm / stats.length),
    avgAccuracy: Math.round(totalAccuracy / stats.length),
    totalSessions: stats.length,
  };
}

export async function getLanguageStats(
  userId: string,
  languageId: string
): Promise<TypingResult[]> {
  if (!db) return [];

  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('type', '==', 'code'),
    where('sourceId', '==', languageId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data() as TypingResultDocument;
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
    };
  });
}
