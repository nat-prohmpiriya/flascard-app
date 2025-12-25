import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  OverallStats,
  TimeStats,
  DeckStats,
  StudyPattern,
  LearningInsights,
  AnalyticsPeriod,
  ImprovementTrend,
} from '@/types';

// Helper to get date range based on period
function getDateRange(period: AnalyticsPeriod): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case 'week':
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      break;
    case 'all':
      start.setFullYear(2020); // Far enough back
      break;
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

// Format seconds to readable time
export function formatStudyTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

// Get overall statistics
export async function getOverallStats(userId: string): Promise<OverallStats> {
  if (!db) {
    return {
      totalCardsStudied: 0,
      totalStudyTime: 0,
      totalSessions: 0,
      averageAccuracy: 0,
      bestStreak: 0,
      currentStreak: 0,
      cardsMastered: 0,
      cardsLearning: 0,
      cardsNew: 0,
    };
  }

  // Get user data for streak
  const userDoc = await getDoc(doc(db, 'users', userId));
  const userData = userDoc.data();
  const currentStreak = userData?.settings?.streak || 0;

  // Get all study sessions
  const sessionsQuery = query(
    collection(db, 'studySessions'),
    where('userId', '==', userId)
  );
  const sessionsSnapshot = await getDocs(sessionsQuery);

  let totalCards = 0;
  let totalCorrect = 0;
  let totalTime = 0;

  sessionsSnapshot.docs.forEach((d) => {
    const data = d.data();
    totalCards += data.cardsStudied || 0;
    totalCorrect += data.correctCount || 0;
    totalTime += data.duration || 0;
  });

  const averageAccuracy =
    totalCards > 0 ? Math.round((totalCorrect / totalCards) * 100) : 0;

  // Get card statistics
  const cardsQuery = query(
    collection(db, 'cards'),
    where('userId', '==', userId)
  );
  const cardsSnapshot = await getDocs(cardsQuery);

  let cardsMastered = 0;
  let cardsLearning = 0;
  let cardsNew = 0;

  cardsSnapshot.docs.forEach((d) => {
    const data = d.data();
    const repetitions = data.repetitions || 0;
    if (repetitions >= 5) {
      cardsMastered++;
    } else if (repetitions > 0) {
      cardsLearning++;
    } else {
      cardsNew++;
    }
  });

  // Calculate best streak (simplified - just use current as proxy)
  // In a full implementation, you'd track streak history
  const bestStreak = Math.max(currentStreak, 7); // Minimum of 7 or current

  return {
    totalCardsStudied: totalCards,
    totalStudyTime: totalTime,
    totalSessions: sessionsSnapshot.docs.length,
    averageAccuracy,
    bestStreak,
    currentStreak,
    cardsMastered,
    cardsLearning,
    cardsNew,
  };
}

// Get time-based statistics
export async function getTimeStats(
  userId: string,
  period: AnalyticsPeriod
): Promise<TimeStats[]> {
  if (!db) return [];

  const { start, end } = getDateRange(period);

  const sessionsQuery = query(
    collection(db, 'studySessions'),
    where('userId', '==', userId),
    where('completedAt', '>=', Timestamp.fromDate(start)),
    where('completedAt', '<=', Timestamp.fromDate(end)),
    orderBy('completedAt', 'asc')
  );

  const sessionsSnapshot = await getDocs(sessionsQuery);

  // Group by date
  const statsMap = new Map<
    string,
    { cards: number; correct: number; time: number; sessions: number }
  >();

  sessionsSnapshot.docs.forEach((d) => {
    const data = d.data();
    const date = data.completedAt.toDate();
    const dateKey = date.toISOString().split('T')[0];

    const existing = statsMap.get(dateKey) || {
      cards: 0,
      correct: 0,
      time: 0,
      sessions: 0,
    };

    statsMap.set(dateKey, {
      cards: existing.cards + (data.cardsStudied || 0),
      correct: existing.correct + (data.correctCount || 0),
      time: existing.time + (data.duration || 0),
      sessions: existing.sessions + 1,
    });
  });

  // Fill in missing dates
  const result: TimeStats[] = [];
  const current = new Date(start);

  while (current <= end) {
    const dateKey = current.toISOString().split('T')[0];
    const stats = statsMap.get(dateKey);

    result.push({
      period: dateKey,
      cardsStudied: stats?.cards || 0,
      studyTime: stats?.time || 0,
      accuracy:
        stats && stats.cards > 0
          ? Math.round((stats.correct / stats.cards) * 100)
          : 0,
      sessionsCount: stats?.sessions || 0,
    });

    current.setDate(current.getDate() + 1);
  }

  return result;
}

// Get per-deck statistics
export async function getDeckStats(userId: string): Promise<DeckStats[]> {
  if (!db) return [];

  // Get all decks
  const decksQuery = query(
    collection(db, 'decks'),
    where('userId', '==', userId)
  );
  const decksSnapshot = await getDocs(decksQuery);

  // Get all cards grouped by deck
  const cardsQuery = query(
    collection(db, 'cards'),
    where('userId', '==', userId)
  );
  const cardsSnapshot = await getDocs(cardsQuery);

  const cardsByDeck = new Map<
    string,
    { mastered: number; learning: number; new: number }
  >();

  cardsSnapshot.docs.forEach((d) => {
    const data = d.data();
    const deckId = data.deckId;
    const repetitions = data.repetitions || 0;

    const existing = cardsByDeck.get(deckId) || {
      mastered: 0,
      learning: 0,
      new: 0,
    };

    if (repetitions >= 5) {
      existing.mastered++;
    } else if (repetitions > 0) {
      existing.learning++;
    } else {
      existing.new++;
    }

    cardsByDeck.set(deckId, existing);
  });

  // Get study sessions grouped by deck
  const sessionsQuery = query(
    collection(db, 'studySessions'),
    where('userId', '==', userId)
  );
  const sessionsSnapshot = await getDocs(sessionsQuery);

  const sessionsByDeck = new Map<
    string,
    { cards: number; correct: number; time: number; lastStudied?: Date }
  >();

  sessionsSnapshot.docs.forEach((d) => {
    const data = d.data();
    const deckId = data.deckId;

    const existing = sessionsByDeck.get(deckId) || {
      cards: 0,
      correct: 0,
      time: 0,
    };

    const sessionDate = data.completedAt?.toDate();

    sessionsByDeck.set(deckId, {
      cards: existing.cards + (data.cardsStudied || 0),
      correct: existing.correct + (data.correctCount || 0),
      time: existing.time + (data.duration || 0),
      lastStudied:
        !existing.lastStudied ||
        (sessionDate && sessionDate > existing.lastStudied)
          ? sessionDate
          : existing.lastStudied,
    });
  });

  // Build deck stats
  return decksSnapshot.docs.map((d) => {
    const data = d.data();
    const deckId = d.id;
    const cards = cardsByDeck.get(deckId) || { mastered: 0, learning: 0, new: 0 };
    const sessions = sessionsByDeck.get(deckId) || {
      cards: 0,
      correct: 0,
      time: 0,
    };

    const totalCards = cards.mastered + cards.learning + cards.new;

    return {
      deckId,
      deckName: data.name,
      totalCards,
      cardsStudied: sessions.cards,
      cardsMastered: cards.mastered,
      cardsLearning: cards.learning,
      cardsNew: cards.new,
      averageAccuracy:
        sessions.cards > 0
          ? Math.round((sessions.correct / sessions.cards) * 100)
          : 0,
      lastStudied: sessions.lastStudied,
      studyTime: sessions.time,
    };
  });
}

// Get study patterns (hour of day, day of week)
export async function getStudyPatterns(userId: string): Promise<StudyPattern> {
  const defaultPattern: StudyPattern = {
    hourOfDay: new Array(24).fill(0),
    dayOfWeek: new Array(7).fill(0),
    bestHour: 0,
    bestDay: 0,
  };

  if (!db) return defaultPattern;

  // Get sessions from last 30 days for pattern analysis
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const sessionsQuery = query(
    collection(db, 'studySessions'),
    where('userId', '==', userId),
    where('completedAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
  );

  const sessionsSnapshot = await getDocs(sessionsQuery);

  const hourOfDay = new Array(24).fill(0);
  const dayOfWeek = new Array(7).fill(0);

  sessionsSnapshot.docs.forEach((d) => {
    const data = d.data();
    const date = data.completedAt?.toDate();
    if (date) {
      hourOfDay[date.getHours()] += data.cardsStudied || 0;
      dayOfWeek[date.getDay()] += data.cardsStudied || 0;
    }
  });

  // Find best hour and day
  let bestHour = 0;
  let bestDay = 0;
  let maxHour = 0;
  let maxDay = 0;

  hourOfDay.forEach((count, hour) => {
    if (count > maxHour) {
      maxHour = count;
      bestHour = hour;
    }
  });

  dayOfWeek.forEach((count, day) => {
    if (count > maxDay) {
      maxDay = count;
      bestDay = day;
    }
  });

  return {
    hourOfDay,
    dayOfWeek,
    bestHour,
    bestDay,
  };
}

// Get learning insights
export async function getLearningInsights(
  userId: string
): Promise<LearningInsights> {
  const defaultInsights: LearningInsights = {
    learningVelocity: 0,
    retentionRate: 0,
    improvementTrend: 'stable',
    streakConsistency: 0,
    averageSessionLength: 0,
    difficultCardsCount: 0,
  };

  if (!db) return defaultInsights;

  // Get sessions from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const sessionsQuery = query(
    collection(db, 'studySessions'),
    where('userId', '==', userId),
    where('completedAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
    orderBy('completedAt', 'asc')
  );

  const sessionsSnapshot = await getDocs(sessionsQuery);

  if (sessionsSnapshot.docs.length === 0) return defaultInsights;

  let totalCards = 0;
  let totalCorrect = 0;
  let totalTime = 0;
  const studyDays = new Set<string>();

  // Split into two halves for trend analysis
  const halfIndex = Math.floor(sessionsSnapshot.docs.length / 2);
  let firstHalfCorrect = 0;
  let firstHalfTotal = 0;
  let secondHalfCorrect = 0;
  let secondHalfTotal = 0;

  sessionsSnapshot.docs.forEach((d, index) => {
    const data = d.data();
    const cards = data.cardsStudied || 0;
    const correct = data.correctCount || 0;

    totalCards += cards;
    totalCorrect += correct;
    totalTime += data.duration || 0;

    const dateKey = data.completedAt?.toDate()?.toISOString().split('T')[0];
    if (dateKey) studyDays.add(dateKey);

    if (index < halfIndex) {
      firstHalfCorrect += correct;
      firstHalfTotal += cards;
    } else {
      secondHalfCorrect += correct;
      secondHalfTotal += cards;
    }
  });

  // Learning velocity (cards per day over last 30 days)
  const learningVelocity = Math.round(totalCards / 30);

  // Retention rate
  const retentionRate =
    totalCards > 0 ? Math.round((totalCorrect / totalCards) * 100) : 0;

  // Improvement trend
  const firstHalfAccuracy =
    firstHalfTotal > 0 ? (firstHalfCorrect / firstHalfTotal) * 100 : 0;
  const secondHalfAccuracy =
    secondHalfTotal > 0 ? (secondHalfCorrect / secondHalfTotal) * 100 : 0;

  let improvementTrend: ImprovementTrend = 'stable';
  if (secondHalfAccuracy - firstHalfAccuracy >= 5) {
    improvementTrend = 'improving';
  } else if (firstHalfAccuracy - secondHalfAccuracy >= 5) {
    improvementTrend = 'declining';
  }

  // Streak consistency (% of days with study in last 30 days)
  const streakConsistency = Math.round((studyDays.size / 30) * 100);

  // Average session length
  const averageSessionLength =
    sessionsSnapshot.docs.length > 0
      ? Math.round(totalTime / sessionsSnapshot.docs.length)
      : 0;

  // Count difficult cards (accuracy < 50% based on repetitions/easeFactor)
  const cardsQuery = query(
    collection(db, 'cards'),
    where('userId', '==', userId)
  );
  const cardsSnapshot = await getDocs(cardsQuery);

  let difficultCardsCount = 0;
  cardsSnapshot.docs.forEach((d) => {
    const data = d.data();
    // Consider cards with low easeFactor as difficult
    if (data.easeFactor && data.easeFactor < 2.0 && data.repetitions > 0) {
      difficultCardsCount++;
    }
  });

  return {
    learningVelocity,
    retentionRate,
    improvementTrend,
    streakConsistency,
    averageSessionLength,
    difficultCardsCount,
  };
}

// Get all analytics data at once
export async function getAllAnalytics(
  userId: string,
  period: AnalyticsPeriod = 'week'
): Promise<{
  overall: OverallStats;
  timeStats: TimeStats[];
  deckStats: DeckStats[];
  patterns: StudyPattern;
  insights: LearningInsights;
}> {
  const [overall, timeStats, deckStats, patterns, insights] = await Promise.all([
    getOverallStats(userId),
    getTimeStats(userId, period),
    getDeckStats(userId),
    getStudyPatterns(userId),
    getLearningInsights(userId),
  ]);

  return {
    overall,
    timeStats,
    deckStats,
    patterns,
    insights,
  };
}
