import { Timestamp } from 'firebase/firestore';
import { Goal, GoalTargets, GoalProgress, GoalType, GoalStatus } from '@/types';

export interface GoalDocument {
  id: string;
  userId: string;
  type: GoalType;
  period: string;
  targets: GoalTargets;
  progress: GoalProgress;
  status: GoalStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export function toGoal(doc: GoalDocument): Goal {
  return {
    ...doc,
    createdAt: doc.createdAt.toDate(),
    updatedAt: doc.updatedAt.toDate(),
  };
}

export function toGoalDocument(goal: Goal): GoalDocument {
  return {
    ...goal,
    createdAt: Timestamp.fromDate(goal.createdAt),
    updatedAt: Timestamp.fromDate(goal.updatedAt),
  };
}

export const GOAL_PRESETS = {
  weekly: {
    beginner: { cardsToStudy: 50, accuracy: 60, streakDays: 3 },
    intermediate: { cardsToStudy: 100, accuracy: 70, streakDays: 5 },
    advanced: { cardsToStudy: 200, accuracy: 80, streakDays: 7 },
  },
  monthly: {
    beginner: { cardsToStudy: 200, accuracy: 60, streakDays: 10 },
    intermediate: { cardsToStudy: 500, accuracy: 70, streakDays: 20 },
    advanced: { cardsToStudy: 1000, accuracy: 80, streakDays: 25 },
  },
} as const;

export type GoalPresetLevel = 'beginner' | 'intermediate' | 'advanced';
