import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { StudySession, DailyProgress } from '@/types';
import { toStudySession, StudySessionDocument } from '@/models/progress';

const COLLECTION = 'studySessions';

function getDb() {
  if (!db) throw new Error('Firebase Firestore not initialized');
  return db;
}

export async function createStudySession(
  userId: string,
  deckId: string,
  cardsStudied: number,
  correctCount: number,
  incorrectCount: number,
  duration: number
): Promise<StudySession> {
  const sessionData: Omit<StudySessionDocument, 'id'> = {
    userId,
    deckId,
    cardsStudied,
    correctCount,
    incorrectCount,
    duration,
    completedAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(getDb(), COLLECTION), sessionData);
  return toStudySession({ id: docRef.id, ...sessionData });
}

export async function getUserStudySessions(
  userId: string,
  limitCount: number = 50
): Promise<StudySession[]> {
  if (!db) return [];
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('completedAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((d) =>
    toStudySession({ id: d.id, ...d.data() } as StudySessionDocument)
  );
}

export async function getDeckStudySessions(
  deckId: string,
  limitCount: number = 50
): Promise<StudySession[]> {
  if (!db) return [];
  const q = query(
    collection(db, COLLECTION),
    where('deckId', '==', deckId),
    orderBy('completedAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((d) =>
    toStudySession({ id: d.id, ...d.data() } as StudySessionDocument)
  );
}

export async function getDailyProgress(
  userId: string,
  days: number = 7
): Promise<DailyProgress[]> {
  // Fill in missing days with empty data if db not initialized
  const result: DailyProgress[] = [];
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    result.push({
      date: dateKey,
      cardsStudied: 0,
      correctCount: 0,
      incorrectCount: 0,
    });
  }

  if (!db) return result;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('completedAt', '>=', Timestamp.fromDate(startDate)),
    orderBy('completedAt', 'asc')
  );

  const querySnapshot = await getDocs(q);
  const sessions = querySnapshot.docs.map((d) =>
    toStudySession({ id: d.id, ...d.data() } as StudySessionDocument)
  );

  // Group by date
  const progressMap = new Map<string, DailyProgress>();

  sessions.forEach((session) => {
    const dateKey = session.completedAt.toISOString().split('T')[0];
    const existing = progressMap.get(dateKey);

    if (existing) {
      existing.cardsStudied += session.cardsStudied;
      existing.correctCount += session.correctCount;
      existing.incorrectCount += session.incorrectCount;
    } else {
      progressMap.set(dateKey, {
        date: dateKey,
        cardsStudied: session.cardsStudied,
        correctCount: session.correctCount,
        incorrectCount: session.incorrectCount,
      });
    }
  });

  // Fill in with actual data
  return result.map((day) => progressMap.get(day.date) || day);
}

export async function getTodayStats(userId: string): Promise<{
  cardsStudied: number;
  correctCount: number;
  incorrectCount: number;
}> {
  if (!db) return { cardsStudied: 0, correctCount: 0, incorrectCount: 0 };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('completedAt', '>=', Timestamp.fromDate(today))
  );

  const querySnapshot = await getDocs(q);
  const sessions = querySnapshot.docs.map((d) => d.data() as StudySessionDocument);

  return sessions.reduce(
    (acc, session) => ({
      cardsStudied: acc.cardsStudied + session.cardsStudied,
      correctCount: acc.correctCount + session.correctCount,
      incorrectCount: acc.incorrectCount + session.incorrectCount,
    }),
    { cardsStudied: 0, correctCount: 0, incorrectCount: 0 }
  );
}
