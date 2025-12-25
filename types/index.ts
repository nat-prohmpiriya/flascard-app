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
  tags: string[];        // Dynamic tags for filtering (e.g., ["english", "A2", "vocabulary"])
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
  tags?: string[];
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
  imageUrl?: string;            // Optional image URL from Firebase Storage
  imageStoragePath?: string;    // Storage path for deletion
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
  imageUrl?: string;
  imageStoragePath?: string;
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
    tags?: string[];
    sourceLang: Language;
    targetLang: Language;
  };
  cards: {
    vocab: string;
    pronunciation: string;
    meaning: string;
    example: string;
    exampleTranslation: string;
    imageUrl?: string;
  }[];
}

export interface ImportCard {
  vocab: string;
  pronunciation: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
  imageUrl?: string;
}

// Goal types
export type GoalType = 'weekly' | 'monthly';
export type GoalStatus = 'active' | 'completed' | 'failed';

export interface GoalTargets {
  cardsToStudy: number;
  accuracy?: number;
  streakDays?: number;
}

export interface GoalProgress {
  cardsStudied: number;
  accuracy: number;
  currentStreak: number;
  daysWithStudy: number;
}

export interface Goal {
  id: string;
  userId: string;
  type: GoalType;
  period: string; // Format: "2025-W01" for weekly, "2025-01" for monthly
  targets: GoalTargets;
  progress: GoalProgress;
  status: GoalStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalFormData {
  type: GoalType;
  period?: string;
  targets: GoalTargets;
}

// Calendar types
export interface CalendarDay {
  date: string; // ISO date string (YYYY-MM-DD)
  cardsStudied: number;
  correctCount: number;
  incorrectCount: number;
  sessionsCount: number;
  intensity: 0 | 1 | 2 | 3 | 4; // Heatmap intensity level
}

export interface CalendarMonth {
  year: number;
  month: number; // 1-12
  days: CalendarDay[];
}

// Learning Path types
export type PathStatus = 'active' | 'completed' | 'paused';
export type StageStatus = 'locked' | 'active' | 'completed';

export interface StageProgress {
  cardsStudied: number;
  totalCards: number;
  accuracy: number;
  completedAt?: Date;
}

export interface PathStage {
  deckId: string;
  deckName: string;
  order: number;
  targetAccuracy: number;
  progress: StageProgress;
  status: StageStatus;
}

export interface LearningPath {
  id: string;
  userId: string;
  name: string;
  description: string;
  stages: PathStage[];
  currentStageIndex: number;
  status: PathStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningPathFormData {
  name: string;
  description: string;
  deckIds: string[];
  targetAccuracy: number;
}

// Achievement types
export type AchievementCategory =
  | 'streak'      // Study streak milestones
  | 'cards'       // Cards studied milestones
  | 'accuracy'    // Accuracy milestones
  | 'completion'  // Deck/goal/path completion
  | 'first'       // First time actions
  | 'speed';      // Speed achievements

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface AchievementCriteria {
  type: 'streak' | 'total_cards' | 'accuracy' | 'decks_completed' |
        'goals_completed' | 'paths_completed' | 'first_action' | 'daily_cards';
  value: number;
  action?: string;  // for first_action type
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  tier: AchievementTier;
  criteria: AchievementCriteria;
  reward?: number;
}

export interface UserAchievement {
  userId: string;
  odachievementId: string;
  unlockedAt: Date;
  progress: number;
  notified: boolean;
}

export interface AchievementWithStatus extends AchievementDefinition {
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

// Analytics types
export type AnalyticsPeriod = 'week' | 'month' | 'year' | 'all';

export interface OverallStats {
  totalCardsStudied: number;
  totalStudyTime: number;       // in seconds
  totalSessions: number;
  averageAccuracy: number;
  bestStreak: number;
  currentStreak: number;
  cardsMastered: number;        // cards with repetitions >= 5
  cardsLearning: number;        // cards with 1-4 repetitions
  cardsNew: number;             // cards with 0 repetitions
}

export interface TimeStats {
  period: string;               // date or week/month identifier
  cardsStudied: number;
  studyTime: number;
  accuracy: number;
  sessionsCount: number;
}

export interface DeckStats {
  deckId: string;
  deckName: string;
  totalCards: number;
  cardsStudied: number;
  cardsMastered: number;
  cardsLearning: number;
  cardsNew: number;
  averageAccuracy: number;
  lastStudied?: Date;
  studyTime: number;
}

export interface StudyPattern {
  hourOfDay: number[];          // 24 items (0-23), cards studied per hour
  dayOfWeek: number[];          // 7 items (0-6, Sun-Sat), cards studied per day
  bestHour: number;
  bestDay: number;
}

export type ImprovementTrend = 'improving' | 'stable' | 'declining';

export interface LearningInsights {
  learningVelocity: number;     // cards/day average
  retentionRate: number;        // % of cards remembered after review
  improvementTrend: ImprovementTrend;
  streakConsistency: number;    // % of days with study in last 30 days
  averageSessionLength: number; // in seconds
  difficultCardsCount: number;  // cards with accuracy < 50%
}

// Notification types
export type NotificationType = 'study_reminder' | 'streak_alert' | 'goal_update' | 'achievement';

export interface StudyReminderSettings {
  enabled: boolean;
  time: string;           // "HH:mm" format (e.g., "09:00")
  days: number[];         // 0-6 (Sun-Sat), which days to remind
}

export interface StreakReminderSettings {
  enabled: boolean;
  time: string;           // When to remind if not studied today
}

export interface NotificationSettings {
  enabled: boolean;
  studyReminder: StudyReminderSettings;
  streakReminder: StreakReminderSettings;
  goalUpdates: boolean;
  achievements: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  studyReminder: {
    enabled: true,
    time: '09:00',
    days: [1, 2, 3, 4, 5], // Mon-Fri
  },
  streakReminder: {
    enabled: true,
    time: '20:00',
  },
  goalUpdates: true,
  achievements: true,
};
