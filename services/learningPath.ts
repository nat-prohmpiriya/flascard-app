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
  LearningPath,
  LearningPathFormData,
  PathStage,
  PathStatus,
  StageStatus,
  Deck,
} from '@/types';
import { toLearningPath, LearningPathDocument, PathStageDocument } from '@/models/learningPath';
import { getDeckStudySessions } from './progress';

const COLLECTION = 'learningPaths';

function getDb() {
  if (!db) throw new Error('Firebase Firestore not initialized');
  return db;
}

// CRUD Operations

export async function createLearningPath(
  userId: string,
  data: LearningPathFormData,
  decks: Deck[]
): Promise<LearningPath> {
  const now = Timestamp.now();

  // Create stages from selected decks
  const stages: PathStageDocument[] = data.deckIds.map((deckId, index) => {
    const deck = decks.find((d) => d.id === deckId);
    return {
      deckId,
      deckName: deck?.name || 'Unknown Deck',
      order: index,
      targetAccuracy: data.targetAccuracy,
      progress: {
        cardsStudied: 0,
        totalCards: deck?.cardCount || 0,
        accuracy: 0,
      },
      status: index === 0 ? 'active' : 'locked',
    };
  });

  const pathData: Omit<LearningPathDocument, 'id'> = {
    userId,
    name: data.name,
    description: data.description,
    stages,
    currentStageIndex: 0,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(getDb(), COLLECTION), pathData);
  return toLearningPath({ id: docRef.id, ...pathData });
}

export async function getLearningPath(pathId: string): Promise<LearningPath | null> {
  if (!db) return null;
  const docRef = doc(db, COLLECTION, pathId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return toLearningPath({ id: docSnap.id, ...docSnap.data() } as LearningPathDocument);
}

export async function getUserLearningPaths(userId: string): Promise<LearningPath[]> {
  if (!db) return [];
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((d) =>
    toLearningPath({ id: d.id, ...d.data() } as LearningPathDocument)
  );
}

export async function getActiveLearningPaths(userId: string): Promise<LearningPath[]> {
  if (!db) return [];
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('status', '==', 'active')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((d) =>
    toLearningPath({ id: d.id, ...d.data() } as LearningPathDocument)
  );
}

export async function updateLearningPath(
  pathId: string,
  data: Partial<{
    name: string;
    description: string;
    status: PathStatus;
    stages: PathStage[];
    currentStageIndex: number;
  }>
): Promise<void> {
  const docRef = doc(getDb(), COLLECTION, pathId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteLearningPath(pathId: string): Promise<void> {
  await deleteDoc(doc(getDb(), COLLECTION, pathId));
}

// Progress Calculation

export async function calculateStageProgress(
  userId: string,
  stage: PathStage
): Promise<PathStage['progress']> {
  const sessions = await getDeckStudySessions(stage.deckId, 1000);

  // Filter sessions for this user only
  const userSessions = sessions.filter((s) => s.userId === userId);

  const cardsStudied = userSessions.reduce((sum, s) => sum + s.cardsStudied, 0);
  const correctCount = userSessions.reduce((sum, s) => sum + s.correctCount, 0);
  const incorrectCount = userSessions.reduce((sum, s) => sum + s.incorrectCount, 0);
  const totalAnswers = correctCount + incorrectCount;
  const accuracy = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0;

  return {
    cardsStudied,
    totalCards: stage.progress.totalCards,
    accuracy,
    completedAt: stage.progress.completedAt,
  };
}

function evaluateStageStatus(stage: PathStage, progress: PathStage['progress']): StageStatus {
  if (stage.status === 'locked') return 'locked';

  // Check completion: studied all cards AND accuracy meets target
  const hasStudiedAll = progress.cardsStudied >= progress.totalCards && progress.totalCards > 0;
  const accuracyMet = progress.accuracy >= stage.targetAccuracy;

  if (hasStudiedAll && accuracyMet) {
    return 'completed';
  }

  return 'active';
}

export async function syncPathProgress(
  userId: string,
  pathId: string
): Promise<LearningPath> {
  const path = await getLearningPath(pathId);
  if (!path) throw new Error('Learning path not found');

  let currentStageIndex = path.currentStageIndex;
  let allCompleted = true;

  // Calculate progress for each stage
  const updatedStages = await Promise.all(
    path.stages.map(async (stage, index) => {
      // Only calculate progress for active or completed stages
      if (stage.status === 'locked' && index > currentStageIndex) {
        allCompleted = false;
        return stage;
      }

      const progress = await calculateStageProgress(userId, stage);
      let status = evaluateStageStatus(stage, progress);

      // If previous stage was just completed, unlock this one
      if (status === 'locked' && index === currentStageIndex) {
        status = 'active';
      }

      // Mark as completed with timestamp if newly completed
      if (status === 'completed' && !stage.progress.completedAt) {
        progress.completedAt = new Date();
      }

      if (status !== 'completed') {
        allCompleted = false;
      }

      return {
        ...stage,
        progress,
        status,
      };
    })
  );

  // Advance to next stage if current is completed
  for (let i = currentStageIndex; i < updatedStages.length - 1; i++) {
    if (updatedStages[i].status === 'completed' && updatedStages[i + 1].status === 'locked') {
      updatedStages[i + 1].status = 'active';
      currentStageIndex = i + 1;
    }
  }

  // Update path status
  const pathStatus: PathStatus = allCompleted ? 'completed' : path.status;

  await updateLearningPath(pathId, {
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

// Helper to get overall progress percentage
export function calculateOverallProgress(path: LearningPath): number {
  if (path.stages.length === 0) return 0;

  const totalProgress = path.stages.reduce((sum, stage) => {
    const stageProgress =
      stage.progress.totalCards > 0
        ? (stage.progress.cardsStudied / stage.progress.totalCards) * 100
        : 0;
    return sum + Math.min(stageProgress, 100);
  }, 0);

  return Math.round(totalProgress / path.stages.length);
}

export function getCompletedStagesCount(path: LearningPath): number {
  return path.stages.filter((s) => s.status === 'completed').length;
}
