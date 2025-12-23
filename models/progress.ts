import { Timestamp } from 'firebase/firestore';
import { StudySession } from '@/types';

export interface StudySessionDocument {
  id: string;
  userId: string;
  deckId: string;
  cardsStudied: number;
  correctCount: number;
  incorrectCount: number;
  duration: number;
  completedAt: Timestamp;
}

export function toStudySession(doc: StudySessionDocument): StudySession {
  return {
    ...doc,
    completedAt: doc.completedAt.toDate(),
  };
}

export function toStudySessionDocument(session: StudySession): StudySessionDocument {
  return {
    ...session,
    completedAt: Timestamp.fromDate(session.completedAt),
  };
}
