import { Timestamp } from 'firebase/firestore';
import { LearningPath, PathStage, StageProgress, PathStatus, StageStatus } from '@/types';

export interface StageProgressDocument {
  cardsStudied: number;
  totalCards: number;
  accuracy: number;
  completedAt?: Timestamp;
}

export interface PathStageDocument {
  deckId: string;
  deckName: string;
  order: number;
  targetAccuracy: number;
  progress: StageProgressDocument;
  status: StageStatus;
}

export interface LearningPathDocument {
  id: string;
  userId: string;
  name: string;
  description: string;
  stages: PathStageDocument[];
  currentStageIndex: number;
  status: PathStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

function toStageProgress(doc: StageProgressDocument): StageProgress {
  return {
    ...doc,
    completedAt: doc.completedAt?.toDate(),
  };
}

function toPathStage(doc: PathStageDocument): PathStage {
  return {
    ...doc,
    progress: toStageProgress(doc.progress),
  };
}

export function toLearningPath(doc: LearningPathDocument): LearningPath {
  return {
    ...doc,
    stages: doc.stages.map(toPathStage),
    createdAt: doc.createdAt.toDate(),
    updatedAt: doc.updatedAt.toDate(),
  };
}

function toStageProgressDocument(progress: StageProgress): StageProgressDocument {
  return {
    ...progress,
    completedAt: progress.completedAt ? Timestamp.fromDate(progress.completedAt) : undefined,
  };
}

function toPathStageDocument(stage: PathStage): PathStageDocument {
  return {
    ...stage,
    progress: toStageProgressDocument(stage.progress),
  };
}

export function toLearningPathDocument(path: LearningPath): LearningPathDocument {
  return {
    ...path,
    stages: path.stages.map(toPathStageDocument),
    createdAt: Timestamp.fromDate(path.createdAt),
    updatedAt: Timestamp.fromDate(path.updatedAt),
  };
}
