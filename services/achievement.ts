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

  const q = query(
    collection(db, COLLECTION),
    where('oduserId', '==', userId)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((d) =>
    toUserAchievement(d.data() as UserAchievementDocument)
  );
}

// Unlock a specific achievement
export async function unlockAchievement(
  userId: string,
  achievementId: string,
  progress: number = 0
): Promise<UserAchievement> {
  const docId = getUserAchievementDocId(userId, achievementId);
  const achievement: UserAchievement = {
    oduserId: userId,
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
  if (!db) {
    return {
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
  }

  // Get user document for streak
  const userDoc = await getDoc(doc(db, 'users', userId));
  const userData = userDoc.data();
  const streak = userData?.settings?.streak || 0;

  // Get all study sessions for total cards and accuracy
  const sessionsQuery = query(
    collection(db, 'studySessions'),
    where('userId', '==', userId)
  );
  const sessionsSnapshot = await getDocs(sessionsQuery);
  let totalCards = 0;
  let totalCorrect = 0;

  sessionsSnapshot.docs.forEach((d) => {
    const data = d.data();
    totalCards += data.cardsStudied || 0;
    totalCorrect += data.correctCount || 0;
  });

  const overallAccuracy =
    totalCards >= 100 ? Math.round((totalCorrect / totalCards) * 100) : 0;

  // Get today's stats
  const todayStats = await getTodayStats(userId);

  // Get decks count
  const decksQuery = query(
    collection(db, 'decks'),
    where('userId', '==', userId)
  );
  const decksSnapshot = await getDocs(decksQuery);
  const hasCreatedDeck = decksSnapshot.docs.length > 0;

  // For decks completed, we need to check if all cards in a deck have been studied
  // This is a simplified version - just count decks that have at least one session
  const deckSessionsMap = new Map<string, number>();
  sessionsSnapshot.docs.forEach((d) => {
    const data = d.data();
    deckSessionsMap.set(
      data.deckId,
      (deckSessionsMap.get(data.deckId) || 0) + data.cardsStudied
    );
  });

  // Count decks where studied cards >= deck card count
  let decksCompleted = 0;
  for (const deckDoc of decksSnapshot.docs) {
    const deckData = deckDoc.data();
    const studiedInDeck = deckSessionsMap.get(deckDoc.id) || 0;
    if (studiedInDeck >= (deckData.cardCount || 0) && deckData.cardCount > 0) {
      decksCompleted++;
    }
  }

  // Get completed goals count
  const goalsQuery = query(
    collection(db, 'goals'),
    where('userId', '==', userId),
    where('status', '==', 'completed')
  );
  const goalsSnapshot = await getDocs(goalsQuery);
  const goalsCompleted = goalsSnapshot.docs.length;

  // Check if has created any goal
  const allGoalsQuery = query(
    collection(db, 'goals'),
    where('userId', '==', userId)
  );
  const allGoalsSnapshot = await getDocs(allGoalsQuery);
  const hasCreatedGoal = allGoalsSnapshot.docs.length > 0;

  // Get completed paths count
  const pathsQuery = query(
    collection(db, 'learningPaths'),
    where('userId', '==', userId),
    where('status', '==', 'completed')
  );
  const pathsSnapshot = await getDocs(pathsQuery);
  const pathsCompleted = pathsSnapshot.docs.length;

  // Check if has created any path
  const allPathsQuery = query(
    collection(db, 'learningPaths'),
    where('userId', '==', userId)
  );
  const allPathsSnapshot = await getDocs(allPathsQuery);
  const hasCreatedPath = allPathsSnapshot.docs.length > 0;

  return {
    streak,
    totalCardsStudied: totalCards,
    overallAccuracy,
    decksCompleted,
    goalsCompleted,
    pathsCompleted,
    todayCardsStudied: todayStats.cardsStudied,
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
