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
import {
  TypingPath,
  TypingPathFormData,
  TypingPathStage,
  TypingPathStatus,
  TypingStageStatus,
} from '@/types';
import { toTypingPath, TypingPathDocument, TypingPathStageDocument } from '@/models/typingPath';
import { TypingSnippet } from '@/models/typingSnippet';

const COLLECTION = 'typingPaths';

function getDb() {
  if (!db) throw new Error('Firebase Firestore not initialized');
  return db;
}

// CRUD Operations

export async function createTypingPath(
  userId: string,
  data: TypingPathFormData,
  snippets: TypingSnippet[]
): Promise<TypingPath> {
  const now = Timestamp.now();

  // Create stages from selected snippets
  const stages: TypingPathStageDocument[] = data.snippetIds.map((snippetId, index) => {
    const snippet = snippets.find((s) => s.id === snippetId);
    return {
      snippetId,
      snippetTitle: snippet?.title || 'Unknown Snippet',
      language: snippet?.language || 'other',
      languageName: snippet?.languageName || 'Other',
      difficulty: snippet?.difficulty || 'medium',
      order: index,
      targetWpm: data.targetWpm,
      targetAccuracy: data.targetAccuracy,
      progress: {
        bestWpm: 0,
        bestAccuracy: 0,
        attempts: 0,
      },
      status: index === 0 ? 'active' : 'locked',
    };
  });

  const pathData = {
    userId,
    name: data.name,
    description: data.description,
    stages,
    currentStageIndex: 0,
    status: 'active' as TypingPathStatus,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(getDb(), COLLECTION), pathData);
  return toTypingPath({ id: docRef.id, ...pathData } as TypingPathDocument);
}

export async function getTypingPath(pathId: string): Promise<TypingPath | null> {
  if (!db) return null;
  const docRef = doc(db, COLLECTION, pathId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return toTypingPath({ id: docSnap.id, ...docSnap.data() } as TypingPathDocument);
}

export async function getUserTypingPaths(userId: string): Promise<TypingPath[]> {
  if (!db) return [];
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((d) =>
    toTypingPath({ id: d.id, ...d.data() } as TypingPathDocument)
  );
}

export async function getActiveTypingPaths(userId: string): Promise<TypingPath[]> {
  if (!db) return [];
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('status', '==', 'active')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((d) =>
    toTypingPath({ id: d.id, ...d.data() } as TypingPathDocument)
  );
}

export async function updateTypingPath(
  pathId: string,
  data: Partial<{
    name: string;
    description: string;
    status: TypingPathStatus;
    stages: TypingPathStage[];
    currentStageIndex: number;
  }>
): Promise<void> {
  const docRef = doc(getDb(), COLLECTION, pathId);

  // Convert stages to document format if provided
  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: Timestamp.now(),
  };

  if (data.stages) {
    updateData.stages = data.stages.map((stage) => ({
      ...stage,
      progress: {
        ...stage.progress,
        completedAt: stage.progress.completedAt
          ? Timestamp.fromDate(stage.progress.completedAt)
          : null,
      },
    }));
  }

  await updateDoc(docRef, updateData);
}

export async function deleteTypingPath(pathId: string): Promise<void> {
  await deleteDoc(doc(getDb(), COLLECTION, pathId));
}

// Progress Update

export async function updateStageProgress(
  pathId: string,
  stageIndex: number,
  wpm: number,
  accuracy: number
): Promise<TypingPath> {
  const path = await getTypingPath(pathId);
  if (!path) throw new Error('Typing path not found');

  const updatedStages = [...path.stages];
  const stage = updatedStages[stageIndex];

  // Update progress
  stage.progress.attempts += 1;
  if (wpm > stage.progress.bestWpm) {
    stage.progress.bestWpm = wpm;
  }
  if (accuracy > stage.progress.bestAccuracy) {
    stage.progress.bestAccuracy = accuracy;
  }

  // Check if stage is completed
  let newStatus: TypingStageStatus = stage.status;
  if (wpm >= stage.targetWpm && accuracy >= stage.targetAccuracy) {
    newStatus = 'completed';
    if (!stage.progress.completedAt) {
      stage.progress.completedAt = new Date();
    }
  }
  stage.status = newStatus;

  // Unlock next stage if current is completed
  let currentStageIndex = path.currentStageIndex;
  if (newStatus === 'completed' && stageIndex < updatedStages.length - 1) {
    const nextStage = updatedStages[stageIndex + 1];
    if (nextStage.status === 'locked') {
      nextStage.status = 'active';
      currentStageIndex = stageIndex + 1;
    }
  }

  // Check if all stages completed
  const allCompleted = updatedStages.every((s) => s.status === 'completed');
  const pathStatus: TypingPathStatus = allCompleted ? 'completed' : path.status;

  await updateTypingPath(pathId, {
    stages: updatedStages,
    currentStageIndex,
    status: pathStatus,
  });

  return {
    ...path,
    stages: updatedStages,
    currentStageIndex,
    status: pathStatus,
  };
}

// Helper functions

export function calculateOverallProgress(path: TypingPath): number {
  if (path.stages.length === 0) return 0;
  const completedCount = path.stages.filter((s) => s.status === 'completed').length;
  return Math.round((completedCount / path.stages.length) * 100);
}

export function getCompletedStagesCount(path: TypingPath): number {
  return path.stages.filter((s) => s.status === 'completed').length;
}

export function getCurrentStage(path: TypingPath): TypingPathStage | null {
  return path.stages.find((s) => s.status === 'active') || null;
}

export function getAverageWpm(path: TypingPath): number {
  const completedStages = path.stages.filter((s) => s.progress.attempts > 0);
  if (completedStages.length === 0) return 0;
  const totalWpm = completedStages.reduce((sum, s) => sum + s.progress.bestWpm, 0);
  return Math.round(totalWpm / completedStages.length);
}

export function getAverageAccuracy(path: TypingPath): number {
  const completedStages = path.stages.filter((s) => s.progress.attempts > 0);
  if (completedStages.length === 0) return 0;
  const totalAccuracy = completedStages.reduce((sum, s) => sum + s.progress.bestAccuracy, 0);
  return Math.round(totalAccuracy / completedStages.length);
}
