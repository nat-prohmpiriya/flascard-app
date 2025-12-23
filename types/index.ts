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
  streak: number;
  lastStudyDate: string | null; // ISO date string (YYYY-MM-DD)
}

// Language types
export type Language = 'en' | 'th' | 'zh' | 'ja' | 'ko' | 'vi' | 'fr' | 'de' | 'es';

export const LANGUAGES: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
];

// Map language code to TTS locale
export const LANG_TO_TTS: Record<Language, string> = {
  en: 'en-US',
  th: 'th-TH',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
  vi: 'vi-VN',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
};

// Deck types
export interface Deck {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  sourceLang: Language;  // Language of vocab/example
  targetLang: Language;  // Language of meaning
  cardCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeckFormData {
  name: string;
  description: string;
  category: string;
  sourceLang: Language;
  targetLang: Language;
}

// Card types
export interface Card {
  id: string;
  deckId: string;
  userId: string;
  vocab: string;                // Vocabulary word (sourceLang)
  pronunciation: string;        // Phonetic/reading
  meaning: string;              // Translation (targetLang)
  example: string;              // Example sentence (sourceLang)
  exampleTranslation: string;   // Example translated to targetLang
  // SRS fields
  nextReview: Date;
  interval: number;
  easeFactor: number;
  repetitions: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CardFormData {
  vocab: string;
  pronunciation: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
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
    sourceLang: Language;
    targetLang: Language;
  };
  cards: {
    vocab: string;
    pronunciation: string;
    meaning: string;
    example: string;
    exampleTranslation: string;
  }[];
}

export interface ImportCard {
  vocab: string;
  pronunciation: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
}
