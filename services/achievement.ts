import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  query,
  where,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  UserAchievement,
  AchievementDefinition,
  AchievementWithStatus,
} from '@/types';
import {
  toUserAchievement,
  toUserAchievementDocument,
  getUserAchievementDocId,
  UserAchievementDocument,
} from '@/models/achievement';
import { ACHIEVEMENT_DEFINITIONS } from '@/data/achievements';
import { getTodayStats } from './progress';

const COLLECTION = 'userAchievements';

function getDb() {
  if (!db) throw new Error('Firebase Firestore not initialized');
  return db;
}

// Get all user achievements from Firestore
export async function getUserAchievements(
  userId: string
): Promise<UserAchievement[]> {
  if (!db) return [];

  try {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((d) =>
      toUserAchievement(d.data() as UserAchievementDocument)
    );
  } catch (error) {
    console.error(`[Achievement] Failed to query "${COLLECTION}" collection:`, error);
    throw error;
  }
}

// Unlock a specific achievement
export async function unlockAchievement(
  userId: string,
  achievementId: string,
  progress: number = 0
): Promise<UserAchievement> {
  const docId = getUserAchievementDocId(userId, achievementId);
  const achievement: UserAchievement = {
    userId: userId,
    odachievementId: achievementId,
    unlockedAt: new Date(),
    progress,
    notified: false,
  };

  await setDoc(
    doc(getDb(), COLLECTION, docId),
    toUserAchievementDocument(achievement)
  );

  return achievement;
}

// Mark achievement as notified (user has seen the popup)
export async function markAchievementNotified(
  userId: string,
  achievementId: string
): Promise<void> {
  const docId = getUserAchievementDocId(userId, achievementId);
  await updateDoc(doc(getDb(), COLLECTION, docId), {
    notified: true,
  });
}

// Get user stats for achievement calculation
export interface UserStats {
  streak: number;
  totalCardsStudied: number;
  overallAccuracy: number;
  decksCompleted: number;
  goalsCompleted: number;
  pathsCompleted: number;
  todayCardsStudied: number;
  hasStudiedCard: boolean;
  hasCreatedDeck: boolean;
  hasCreatedGoal: boolean;
  hasCreatedPath: boolean;
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const defaultStats: UserStats = {
    streak: 0,
    totalCardsStudied: 0,
    overallAccuracy: 0,
    decksCompleted: 0,
    goalsCompleted: 0,
    pathsCompleted: 0,
    todayCardsStudied: 0,
    hasStudiedCard: false,
    hasCreatedDeck: false,
    hasCreatedGoal: false,
    hasCreatedPath: false,
  };

  if (!db) {
    return defaultStats;
  }

  let streak = 0;
  let totalCards = 0;
  let totalCorrect = 0;
  let decksCompleted = 0;
  let goalsCompleted = 0;
  let pathsCompleted = 0;
  let todayCardsStudied = 0;
  let hasCreatedDeck = false;
  let hasCreatedGoal = false;
  let hasCreatedPath = false;

  // 1. Get user document for streak
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    streak = userData?.settings?.streak || 0;
  } catch (error) {
    console.error('[Achievement] Failed to query "users" collection:', error);
  }

  // 2. Get all study sessions
  let sessionsSnapshot;
  try {
    const sessionsQuery = query(
      collection(db, 'studySessions'),
      where('userId', '==', userId)
    );
    sessionsSnapshot = await getDocs(sessionsQuery);
    sessionsSnapshot.docs.forEach((d) => {
      const data = d.data();
      totalCards += data.cardsStudied || 0;
      totalCorrect += data.correctCount || 0;
    });
  } catch (error) {
    console.error('[Achievement] Failed to query "studySessions" collection:', error);
  }

  // 3. Get today's stats
  try {
    const todayStats = await getTodayStats(userId);
    todayCardsStudied = todayStats.cardsStudied;
  } catch (error) {
    console.error('[Achievement] Failed to get todayStats:', error);
  }

  // 4. Get decks
  let decksSnapshot;
  try {
    const decksQuery = query(
      collection(db, 'decks'),
      where('userId', '==', userId)
    );
    decksSnapshot = await getDocs(decksQuery);
    hasCreatedDeck = decksSnapshot.docs.length > 0;

    // Calculate decks completed
    if (sessionsSnapshot) {
      const deckSessionsMap = new Map<string, number>();
      sessionsSnapshot.docs.forEach((d) => {
        const data = d.data();
        deckSessionsMap.set(
          data.deckId,
          (deckSessionsMap.get(data.deckId) || 0) + data.cardsStudied
        );
      });

      for (const deckDoc of decksSnapshot.docs) {
        const deckData = deckDoc.data();
        const studiedInDeck = deckSessionsMap.get(deckDoc.id) || 0;
        if (studiedInDeck >= (deckData.cardCount || 0) && deckData.cardCount > 0) {
          decksCompleted++;
        }
      }
    }
  } catch (error) {
    console.error('[Achievement] Failed to query "decks" collection:', error);
  }

  // 5. Get completed goals
  try {
    const goalsQuery = query(
      collection(db, 'goals'),
      where('userId', '==', userId),
      where('status', '==', 'completed')
    );
    const goalsSnapshot = await getDocs(goalsQuery);
    goalsCompleted = goalsSnapshot.docs.length;
  } catch (error) {
    console.error('[Achievement] Failed to query "goals" (completed) collection:', error);
  }

  // 6. Check if has created any goal
  try {
    const allGoalsQuery = query(
      collection(db, 'goals'),
      where('userId', '==', userId)
    );
    const allGoalsSnapshot = await getDocs(allGoalsQuery);
    hasCreatedGoal = allGoalsSnapshot.docs.length > 0;
  } catch (error) {
    console.error('[Achievement] Failed to query "goals" (all) collection:', error);
  }

  // 7. Get completed paths
  try {
    const pathsQuery = query(
      collection(db, 'learningPaths'),
      where('userId', '==', userId),
      where('status', '==', 'completed')
    );
    const pathsSnapshot = await getDocs(pathsQuery);
    pathsCompleted = pathsSnapshot.docs.length;
  } catch (error) {
    console.error('[Achievement] Failed to query "learningPaths" (completed) collection:', error);
  }

  // 8. Check if has created any path
  try {
    const allPathsQuery = query(
      collection(db, 'learningPaths'),
      where('userId', '==', userId)
    );
    const allPathsSnapshot = await getDocs(allPathsQuery);
    hasCreatedPath = allPathsSnapshot.docs.length > 0;
  } catch (error) {
    console.error('[Achievement] Failed to query "learningPaths" (all) collection:', error);
  }

  const overallAccuracy =
    totalCards >= 100 ? Math.round((totalCorrect / totalCards) * 100) : 0;

  return {
    streak,
    totalCardsStudied: totalCards,
    overallAccuracy,
    decksCompleted,
    goalsCompleted,
    pathsCompleted,
    todayCardsStudied,
    hasStudiedCard: totalCards > 0,
    hasCreatedDeck,
    hasCreatedGoal,
    hasCreatedPath,
  };
}

// Calculate progress for a specific achievement
export function calculateAchievementProgress(
  definition: AchievementDefinition,
  stats: UserStats
): { progress: number; maxProgress: number; isCompleted: boolean } {
  const { criteria } = definition;
  let progress = 0;
  const maxProgress = criteria.value;

  switch (criteria.type) {
    case 'streak':
      progress = stats.streak;
      break;
    case 'total_cards':
      progress = stats.totalCardsStudied;
      break;
    case 'accuracy':
      // Only count if user has studied 100+ cards
      progress = stats.totalCardsStudied >= 100 ? stats.overallAccuracy : 0;
      break;
    case 'decks_completed':
      progress = stats.decksCompleted;
      break;
    case 'goals_completed':
      progress = stats.goalsCompleted;
      break;
    case 'paths_completed':
      progress = stats.pathsCompleted;
      break;
    case 'daily_cards':
      progress = stats.todayCardsStudied;
      break;
    case 'first_action':
      switch (criteria.action) {
        case 'study_card':
          progress = stats.hasStudiedCard ? 1 : 0;
          break;
        case 'create_deck':
          progress = stats.hasCreatedDeck ? 1 : 0;
          break;
        case 'create_goal':
          progress = stats.hasCreatedGoal ? 1 : 0;
          break;
        case 'create_path':
          progress = stats.hasCreatedPath ? 1 : 0;
          break;
      }
      break;
  }

  return {
    progress,
    maxProgress,
    isCompleted: progress >= maxProgress,
  };
}

// Check and unlock all eligible achievements
export async function checkAndUnlockAchievements(
  userId: string
): Promise<AchievementDefinition[]> {
  const stats = await getUserStats(userId);
  const existingAchievements = await getUserAchievements(userId);
  const unlockedIds = new Set(existingAchievements.map((a) => a.odachievementId));

  const newlyUnlocked: AchievementDefinition[] = [];

  for (const definition of ACHIEVEMENT_DEFINITIONS) {
    // Skip if already unlocked
    if (unlockedIds.has(definition.id)) continue;

    const { progress, isCompleted } = calculateAchievementProgress(
      definition,
      stats
    );

    if (isCompleted) {
      await unlockAchievement(userId, definition.id, progress);
      newlyUnlocked.push(definition);
    }
  }

  return newlyUnlocked;
}

// Get all achievements with status for display
export async function getAchievementsWithStatus(
  userId: string
): Promise<AchievementWithStatus[]> {
  const stats = await getUserStats(userId);
  const userAchievements = await getUserAchievements(userId);
  const unlockedMap = new Map(
    userAchievements.map((a) => [a.odachievementId, a])
  );

  return ACHIEVEMENT_DEFINITIONS.map((definition) => {
    const unlocked = unlockedMap.get(definition.id);
    const { progress, maxProgress } = calculateAchievementProgress(
      definition,
      stats
    );

    return {
      ...definition,
      unlocked: !!unlocked,
      unlockedAt: unlocked?.unlockedAt,
      progress,
      maxProgress,
    };
  });
}

// Get unnotified achievements (for showing popup)
export async function getUnnotifiedAchievements(
  userId: string
): Promise<AchievementWithStatus[]> {
  const userAchievements = await getUserAchievements(userId);
  const unnotified = userAchievements.filter((a) => !a.notified);

  const result: AchievementWithStatus[] = [];

  for (const ua of unnotified) {
    const definition = ACHIEVEMENT_DEFINITIONS.find(
      (d) => d.id === ua.odachievementId
    );
    if (definition) {
      result.push({
        ...definition,
        unlocked: true,
        unlockedAt: ua.unlockedAt,
        progress: ua.progress,
        maxProgress: definition.criteria.value,
      });
    }
  }

  return result;
}

// Get achievement summary for dashboard
export async function getAchievementSummary(
  userId: string
): Promise<{
  totalUnlocked: number;
  totalAchievements: number;
  recentUnlock?: AchievementWithStatus;
}> {
  const userAchievements = await getUserAchievements(userId);

  // Find most recent unlock
  let recentUnlock: AchievementWithStatus | undefined;
  if (userAchievements.length > 0) {
    const sorted = [...userAchievements].sort(
      (a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime()
    );
    const recent = sorted[0];
    const definition = ACHIEVEMENT_DEFINITIONS.find(
      (d) => d.id === recent.odachievementId
    );
    if (definition) {
      recentUnlock = {
        ...definition,
        unlocked: true,
        unlockedAt: recent.unlockedAt,
        progress: recent.progress,
        maxProgress: definition.criteria.value,
      };
    }
  }

  return {
    totalUnlocked: userAchievements.length,
    totalAchievements: ACHIEVEMENT_DEFINITIONS.length,
    recentUnlock,
  };
}
