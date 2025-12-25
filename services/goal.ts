import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Goal, GoalFormData, GoalStatus, GoalType } from '@/types';
import { toGoal, GoalDocument } from '@/models/goal';
import { getDailyProgress } from './progress';

const COLLECTION = 'goals';

function getDb() {
  if (!db) throw new Error('Firebase Firestore not initialized');
  return db;
}

// CRUD Operations

export async function createGoal(
  userId: string,
  data: GoalFormData
): Promise<Goal> {
  const now = Timestamp.now();
  const period = data.period || getCurrentPeriod(data.type);

  const goalData: Omit<GoalDocument, 'id'> = {
    userId,
    type: data.type,
    period,
    targets: data.targets,
    progress: {
      cardsStudied: 0,
      accuracy: 0,
      currentStreak: 0,
      daysWithStudy: 0,
    },
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(getDb(), COLLECTION), goalData);
  return toGoal({ id: docRef.id, ...goalData });
}

export async function getGoal(goalId: string): Promise<Goal | null> {
  if (!db) return null;
  const docRef = doc(db, COLLECTION, goalId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return toGoal({ id: docSnap.id, ...docSnap.data() } as GoalDocument);
}

export async function getUserGoals(userId: string): Promise<Goal[]> {
  if (!db) return [];
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((d) =>
    toGoal({ id: d.id, ...d.data() } as GoalDocument)
  );
}

export async function getActiveGoals(userId: string): Promise<Goal[]> {
  if (!db) return [];
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('status', '==', 'active')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((d) =>
    toGoal({ id: d.id, ...d.data() } as GoalDocument)
  );
}

export async function updateGoal(
  goalId: string,
  data: Partial<GoalFormData & { status: GoalStatus; progress: Goal['progress'] }>
): Promise<void> {
  const docRef = doc(getDb(), COLLECTION, goalId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteGoal(goalId: string): Promise<void> {
  await deleteDoc(doc(getDb(), COLLECTION, goalId));
}

// Progress Calculation

export async function calculateGoalProgress(
  userId: string,
  goal: Goal
): Promise<Goal['progress']> {
  const { startDate, endDate } = getPeriodDateRange(goal.type, goal.period);
  const now = new Date();
  const effectiveEndDate = now < endDate ? now : endDate;
  const days = Math.ceil(
    (effectiveEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  const dailyProgress = await getDailyProgress(userId, days + 7); // Extra buffer

  // Filter to only include days within the goal period
  const periodProgress = dailyProgress.filter((day) => {
    const dayDate = new Date(day.date);
    return dayDate >= startDate && dayDate <= effectiveEndDate;
  });

  const cardsStudied = periodProgress.reduce((sum, d) => sum + d.cardsStudied, 0);
  const correctCount = periodProgress.reduce((sum, d) => sum + d.correctCount, 0);
  const incorrectCount = periodProgress.reduce((sum, d) => sum + d.incorrectCount, 0);
  const totalAnswers = correctCount + incorrectCount;
  const accuracy = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0;
  const daysWithStudy = periodProgress.filter((d) => d.cardsStudied > 0).length;

  // Calculate current streak (consecutive days ending today or yesterday)
  const sortedDays = [...periodProgress].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let currentStreak = 0;
  const today = new Date().toISOString().split('T')[0];

  for (let i = 0; i < sortedDays.length; i++) {
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedDateStr = expectedDate.toISOString().split('T')[0];

    const dayData = sortedDays.find((d) => d.date === expectedDateStr);
    if (dayData && dayData.cardsStudied > 0) {
      currentStreak++;
    } else if (expectedDateStr !== today) {
      break;
    }
  }

  return {
    cardsStudied,
    accuracy,
    currentStreak,
    daysWithStudy,
  };
}

export async function syncGoalProgress(
  userId: string,
  goalId: string
): Promise<Goal> {
  const goal = await getGoal(goalId);
  if (!goal) throw new Error('Goal not found');

  const progress = await calculateGoalProgress(userId, goal);
  const status = evaluateGoalStatus(goal, progress);

  await updateGoal(goalId, { progress, status });

  return { ...goal, progress, status };
}

// Status Evaluation

function evaluateGoalStatus(
  goal: Goal,
  progress: Goal['progress']
): GoalStatus {
  const { endDate } = getPeriodDateRange(goal.type, goal.period);
  const now = new Date();
  const isPeriodOver = now > endDate;

  // Check if all targets are met
  const targetsMetCards = progress.cardsStudied >= goal.targets.cardsToStudy;
  const targetsMetAccuracy =
    !goal.targets.accuracy || progress.accuracy >= goal.targets.accuracy;
  const targetsMetStreak =
    !goal.targets.streakDays || progress.currentStreak >= goal.targets.streakDays;
  const allTargetsMet = targetsMetCards && targetsMetAccuracy && targetsMetStreak;

  if (allTargetsMet) {
    return 'completed';
  }

  if (isPeriodOver) {
    return 'failed';
  }

  return 'active';
}

// Date Utilities

export function getCurrentPeriod(type: GoalType): string {
  const now = new Date();
  if (type === 'monthly') {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  // Weekly: ISO week number
  const week = getISOWeek(now);
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function getPeriodDateRange(
  type: GoalType,
  period: string
): { startDate: Date; endDate: Date } {
  if (type === 'monthly') {
    const [year, month] = period.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(year, month, 0); // Last day of month
    endDate.setHours(23, 59, 59, 999);
    return { startDate, endDate };
  }

  // Weekly
  const [yearStr, weekStr] = period.split('-W');
  const week = parseInt(weekStr);
  const year = parseInt(yearStr);
  const startDate = getDateOfISOWeek(week, year);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate };
}

export function formatPeriodLabel(type: GoalType, period: string): string {
  if (type === 'monthly') {
    const [year, month] = period.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  const { startDate, endDate } = getPeriodDateRange('weekly', period);
  return `${startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} - ${endDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getDateOfISOWeek(week: number, year: number): Date {
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const dow = simple.getUTCDay();
  const isoWeekStart = new Date(simple);
  if (dow <= 4) {
    isoWeekStart.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1);
  } else {
    isoWeekStart.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay());
  }
  return isoWeekStart;
}
