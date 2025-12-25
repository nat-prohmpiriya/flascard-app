import { AchievementDefinition } from '@/types';

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // ============ STREAK ACHIEVEMENTS ============
  {
    id: 'streak-3',
    name: 'Getting Started',
    description: 'Maintain a 3-day study streak',
    icon: '🔥',
    category: 'streak',
    tier: 'bronze',
    criteria: { type: 'streak', value: 3 },
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day study streak',
    icon: '🔥',
    category: 'streak',
    tier: 'silver',
    criteria: { type: 'streak', value: 7 },
  },
  {
    id: 'streak-30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day study streak',
    icon: '🔥',
    category: 'streak',
    tier: 'gold',
    criteria: { type: 'streak', value: 30 },
  },
  {
    id: 'streak-100',
    name: 'Century Champion',
    description: 'Maintain a 100-day study streak',
    icon: '🔥',
    category: 'streak',
    tier: 'platinum',
    criteria: { type: 'streak', value: 100 },
  },

  // ============ CARDS STUDIED ACHIEVEMENTS ============
  {
    id: 'cards-100',
    name: 'Card Collector',
    description: 'Study 100 cards',
    icon: '📚',
    category: 'cards',
    tier: 'bronze',
    criteria: { type: 'total_cards', value: 100 },
  },
  {
    id: 'cards-500',
    name: 'Card Enthusiast',
    description: 'Study 500 cards',
    icon: '📚',
    category: 'cards',
    tier: 'silver',
    criteria: { type: 'total_cards', value: 500 },
  },
  {
    id: 'cards-1000',
    name: 'Card Master',
    description: 'Study 1,000 cards',
    icon: '📚',
    category: 'cards',
    tier: 'gold',
    criteria: { type: 'total_cards', value: 1000 },
  },
  {
    id: 'cards-5000',
    name: 'Card Legend',
    description: 'Study 5,000 cards',
    icon: '📚',
    category: 'cards',
    tier: 'platinum',
    criteria: { type: 'total_cards', value: 5000 },
  },

  // ============ ACCURACY ACHIEVEMENTS ============
  {
    id: 'accuracy-70',
    name: 'Good Memory',
    description: 'Achieve 70% accuracy (100+ cards)',
    icon: '🎯',
    category: 'accuracy',
    tier: 'bronze',
    criteria: { type: 'accuracy', value: 70 },
  },
  {
    id: 'accuracy-80',
    name: 'Sharp Mind',
    description: 'Achieve 80% accuracy (100+ cards)',
    icon: '🎯',
    category: 'accuracy',
    tier: 'silver',
    criteria: { type: 'accuracy', value: 80 },
  },
  {
    id: 'accuracy-90',
    name: 'Excellent Recall',
    description: 'Achieve 90% accuracy (100+ cards)',
    icon: '🎯',
    category: 'accuracy',
    tier: 'gold',
    criteria: { type: 'accuracy', value: 90 },
  },
  {
    id: 'accuracy-95',
    name: 'Perfect Memory',
    description: 'Achieve 95% accuracy (100+ cards)',
    icon: '🎯',
    category: 'accuracy',
    tier: 'platinum',
    criteria: { type: 'accuracy', value: 95 },
  },

  // ============ COMPLETION ACHIEVEMENTS ============
  {
    id: 'deck-1',
    name: 'First Deck Done',
    description: 'Complete studying 1 deck',
    icon: '✅',
    category: 'completion',
    tier: 'bronze',
    criteria: { type: 'decks_completed', value: 1 },
  },
  {
    id: 'deck-5',
    name: 'Deck Collector',
    description: 'Complete studying 5 decks',
    icon: '✅',
    category: 'completion',
    tier: 'silver',
    criteria: { type: 'decks_completed', value: 5 },
  },
  {
    id: 'goal-1',
    name: 'Goal Getter',
    description: 'Complete 1 goal',
    icon: '🏆',
    category: 'completion',
    tier: 'bronze',
    criteria: { type: 'goals_completed', value: 1 },
  },
  {
    id: 'goal-5',
    name: 'Goal Crusher',
    description: 'Complete 5 goals',
    icon: '🏆',
    category: 'completion',
    tier: 'silver',
    criteria: { type: 'goals_completed', value: 5 },
  },
  {
    id: 'path-1',
    name: 'Pathfinder',
    description: 'Complete 1 learning path',
    icon: '🛤️',
    category: 'completion',
    tier: 'gold',
    criteria: { type: 'paths_completed', value: 1 },
  },
  {
    id: 'path-3',
    name: 'Path Master',
    description: 'Complete 3 learning paths',
    icon: '🛤️',
    category: 'completion',
    tier: 'platinum',
    criteria: { type: 'paths_completed', value: 3 },
  },

  // ============ FIRST TIME ACHIEVEMENTS ============
  {
    id: 'first-card',
    name: 'First Step',
    description: 'Study your first card',
    icon: '👶',
    category: 'first',
    tier: 'bronze',
    criteria: { type: 'first_action', value: 1, action: 'study_card' },
  },
  {
    id: 'first-deck',
    name: 'Deck Creator',
    description: 'Create your first deck',
    icon: '🎨',
    category: 'first',
    tier: 'bronze',
    criteria: { type: 'first_action', value: 1, action: 'create_deck' },
  },
  {
    id: 'first-goal',
    name: 'Goal Setter',
    description: 'Set your first goal',
    icon: '🎯',
    category: 'first',
    tier: 'bronze',
    criteria: { type: 'first_action', value: 1, action: 'create_goal' },
  },
  {
    id: 'first-path',
    name: 'Path Planner',
    description: 'Create your first learning path',
    icon: '🗺️',
    category: 'first',
    tier: 'bronze',
    criteria: { type: 'first_action', value: 1, action: 'create_path' },
  },

  // ============ SPEED ACHIEVEMENTS ============
  {
    id: 'speed-25',
    name: 'Quick Learner',
    description: 'Study 25 cards in one day',
    icon: '⚡',
    category: 'speed',
    tier: 'bronze',
    criteria: { type: 'daily_cards', value: 25 },
  },
  {
    id: 'speed-50',
    name: 'Speed Demon',
    description: 'Study 50 cards in one day',
    icon: '⚡',
    category: 'speed',
    tier: 'silver',
    criteria: { type: 'daily_cards', value: 50 },
  },
  {
    id: 'speed-100',
    name: 'Lightning Fast',
    description: 'Study 100 cards in one day',
    icon: '⚡',
    category: 'speed',
    tier: 'gold',
    criteria: { type: 'daily_cards', value: 100 },
  },
];

// Helper to get achievement by ID
export function getAchievementById(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENT_DEFINITIONS.find((a) => a.id === id);
}

// Helper to get achievements by category
export function getAchievementsByCategory(
  category: AchievementDefinition['category']
): AchievementDefinition[] {
  return ACHIEVEMENT_DEFINITIONS.filter((a) => a.category === category);
}

// Tier colors for UI
export const TIER_COLORS = {
  bronze: {
    bg: 'bg-amber-100 dark:bg-amber-900',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-500',
    gradient: 'from-amber-400 to-amber-600',
  },
  silver: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-600 dark:text-slate-300',
    border: 'border-slate-400',
    gradient: 'from-slate-300 to-slate-500',
  },
  gold: {
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-500',
    gradient: 'from-yellow-400 to-yellow-600',
  },
  platinum: {
    bg: 'bg-purple-100 dark:bg-purple-900',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-500',
    gradient: 'from-purple-400 to-purple-600',
  },
};

// Category labels for UI
export const CATEGORY_LABELS = {
  streak: { label: 'Streak', icon: '🔥' },
  cards: { label: 'Cards Studied', icon: '📚' },
  accuracy: { label: 'Accuracy', icon: '🎯' },
  completion: { label: 'Completion', icon: '✅' },
  first: { label: 'First Time', icon: '⭐' },
  speed: { label: 'Speed', icon: '⚡' },
};
