import { Timestamp } from 'firebase/firestore';
import {
  TypingPath,
  TypingPathStage,
  TypingPathStatus,
  TypingStageStatus,
  TypingStageProgress,
} from '@/types';

export interface TypingPathStageDocument {
  snippetId: string;
  snippetTitle: string;
  language: string;
  languageName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  order: number;
  targetWpm: number;
  targetAccuracy: number;
  progress: {
    bestWpm: number;
    bestAccuracy: number;
    attempts: number;
    completedAt?: Timestamp;
  };
  status: TypingStageStatus;
}

export interface TypingPathDocument {
  id: string;
  userId: string;
  name: string;
  description: string;
  stages: TypingPathStageDocument[];
  currentStageIndex: number;
  status: TypingPathStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

function toStageProgress(doc: TypingPathStageDocument['progress']): TypingStageProgress {
  return {
    bestWpm: doc.bestWpm,
    bestAccuracy: doc.bestAccuracy,
    attempts: doc.attempts,
    completedAt: doc.completedAt?.toDate(),
  };
}

function toStage(doc: TypingPathStageDocument): TypingPathStage {
  return {
    snippetId: doc.snippetId,
    snippetTitle: doc.snippetTitle,
    language: doc.language,
    languageName: doc.languageName,
    difficulty: doc.difficulty,
    order: doc.order,
    targetWpm: doc.targetWpm,
    targetAccuracy: doc.targetAccuracy,
    progress: toStageProgress(doc.progress),
    status: doc.status,
  };
}

export function toTypingPath(doc: TypingPathDocument): TypingPath {
  return {
    id: doc.id,
    userId: doc.userId,
    name: doc.name,
    description: doc.description,
    stages: doc.stages.map(toStage),
    currentStageIndex: doc.currentStageIndex,
    status: doc.status,
    createdAt: doc.createdAt?.toDate() || new Date(),
    updatedAt: doc.updatedAt?.toDate() || new Date(),
  };
}
