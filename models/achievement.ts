import { Timestamp } from 'firebase/firestore';
import { UserAchievement } from '@/types';

// Firestore document interface
export interface UserAchievementDocument {
  oduserId: string;
  odachievementId: string;
  unlockedAt: Timestamp;
  progress: number;
  notified: boolean;
}

// Convert Firestore document to UserAchievement
export function toUserAchievement(
  doc: UserAchievementDocument
): UserAchievement {
  return {
    oduserId: doc.oduserId,
    odachievementId: doc.odachievementId,
    unlockedAt: doc.unlockedAt.toDate(),
    progress: doc.progress,
    notified: doc.notified,
  };
}

// Convert UserAchievement to Firestore document
export function toUserAchievementDocument(
  achievement: Omit<UserAchievement, 'unlockedAt'> & { unlockedAt: Date }
): UserAchievementDocument {
  return {
    oduserId: achievement.oduserId,
    odachievementId: achievement.odachievementId,
    unlockedAt: Timestamp.fromDate(achievement.unlockedAt),
    progress: achievement.progress,
    notified: achievement.notified,
  };
}

// Generate document ID for user achievement
export function getUserAchievementDocId(
  userId: string,
  achievementId: string
): string {
  return `${userId}_${achievementId}`;
}
