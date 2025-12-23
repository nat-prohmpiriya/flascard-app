// User types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  dailyGoal: number;
  notifications: boolean;
}

// Deck types
export interface Deck {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  cardCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeckFormData {
  name: string;
  description: string;
  category: string;
}

// Card types
export interface Card {
  id: string;
  deckId: string;
  userId: string;
  front: string;
  back: string;
  // SRS fields
  nextReview: Date;
  interval: number;
  easeFactor: number;
  repetitions: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CardFormData {
  front: string;
  back: string;
}

// SRS types
export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

export interface ReviewResult {
  cardId: string;
  quality: ReviewQuality;
  reviewedAt: Date;
}

// Progress types
export interface StudySession {
  id: string;
  userId: string;
  deckId: string;
  cardsStudied: number;
  correctCount: number;
  incorrectCount: number;
  duration: number; // in seconds
  completedAt: Date;
}

export interface DailyProgress {
  date: string;
  cardsStudied: number;
  correctCount: number;
  incorrectCount: number;
}

// Import/Export types
export interface ExportData {
  version: string;
  exportedAt: string;
  deck: {
    name: string;
    description: string;
    category: string;
  };
  cards: {
    front: string;
    back: string;
  }[];
}

export interface ImportCard {
  front: string;
  back: string;
}
