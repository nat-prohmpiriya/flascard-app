import { Timestamp } from 'firebase/firestore';
import { Deck, Language } from '@/types';

export interface DeckDocument {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  sourceLang: Language;
  targetLang: Language;
  cardCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export function toDeck(doc: DeckDocument): Deck {
  return {
    ...doc,
    createdAt: doc.createdAt.toDate(),
    updatedAt: doc.updatedAt.toDate(),
  };
}

export function toDeckDocument(deck: Deck): DeckDocument {
  return {
    ...deck,
    createdAt: Timestamp.fromDate(deck.createdAt),
    updatedAt: Timestamp.fromDate(deck.updatedAt),
  };
}

export const DECK_CATEGORIES = [
  'english',
  'programming',
  'science',
  'math',
  'language',
  'other',
] as const;

export type DeckCategory = (typeof DECK_CATEGORIES)[number];
