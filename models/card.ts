import { Timestamp } from 'firebase/firestore';
import { Card } from '@/types';

export interface CardDocument {
  id: string;
  deckId: string;
  userId: string;
  vocab: string;
  pronunciation: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
  nextReview: Timestamp;
  interval: number;
  easeFactor: number;
  repetitions: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export function toCard(doc: CardDocument): Card {
  return {
    ...doc,
    nextReview: doc.nextReview.toDate(),
    createdAt: doc.createdAt.toDate(),
    updatedAt: doc.updatedAt.toDate(),
  };
}

export function toCardDocument(card: Card): CardDocument {
  return {
    ...card,
    nextReview: Timestamp.fromDate(card.nextReview),
    createdAt: Timestamp.fromDate(card.createdAt),
    updatedAt: Timestamp.fromDate(card.updatedAt),
  };
}

// Default SRS values for new cards
export const DEFAULT_CARD_SRS = {
  interval: 0,
  easeFactor: 2.5,
  repetitions: 0,
};
