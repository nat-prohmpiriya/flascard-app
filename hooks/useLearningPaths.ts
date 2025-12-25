'use client';

import { useState, useEffect, useCallback } from 'react';
import { LearningPath, LearningPathFormData, Deck } from '@/types';
import {
  getUserLearningPaths,
  getActiveLearningPaths,
  createLearningPath,
  updateLearningPath,
  deleteLearningPath,
  syncPathProgress,
} from '@/services/learningPath';
import { useAuth } from '@/contexts/AuthContext';

export function useLearningPaths(activeOnly: boolean = false) {
  const { firebaseUser } = useAuth();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaths = useCallback(async () => {
    if (!firebaseUser) {
      setPaths([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userPaths = activeOnly
        ? await getActiveLearningPaths(firebaseUser.uid)
        : await getUserLearningPaths(firebaseUser.uid);
      setPaths(userPaths);
      setError(null);
    } catch (err) {
      setError('Failed to fetch learning paths');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser, activeOnly]);

  useEffect(() => {
    fetchPaths();
  }, [fetchPaths]);

  const addPath = async (
    data: LearningPathFormData,
    decks: Deck[]
  ): Promise<LearningPath | null> => {
    if (!firebaseUser) return null;

    try {
      const newPath = await createLearningPath(firebaseUser.uid, data, decks);
      setPaths((prev) => [newPath, ...prev]);
      return newPath;
    } catch (err) {
      setError('Failed to create learning path');
      console.error(err);
      return null;
    }
  };

  const editPath = async (
    pathId: string,
    data: Partial<{ name: string; description: string }>
  ): Promise<boolean> => {
    try {
      await updateLearningPath(pathId, data);
      setPaths((prev) =>
        prev.map((path) =>
          path.id === pathId
            ? { ...path, ...data, updatedAt: new Date() }
            : path
        )
      );
      return true;
    } catch (err) {
      setError('Failed to update learning path');
      console.error(err);
      return false;
    }
  };

  const removePath = async (pathId: string): Promise<boolean> => {
    try {
      await deleteLearningPath(pathId);
      setPaths((prev) => prev.filter((path) => path.id !== pathId));
      return true;
    } catch (err) {
      setError('Failed to delete learning path');
      console.error(err);
      return false;
    }
  };

  const pausePath = async (pathId: string): Promise<boolean> => {
    try {
      await updateLearningPath(pathId, { status: 'paused' });
      setPaths((prev) =>
        prev.map((path) =>
          path.id === pathId ? { ...path, status: 'paused' } : path
        )
      );
      return true;
    } catch (err) {
      setError('Failed to pause learning path');
      console.error(err);
      return false;
    }
  };

  const resumePath = async (pathId: string): Promise<boolean> => {
    try {
      await updateLearningPath(pathId, { status: 'active' });
      setPaths((prev) =>
        prev.map((path) =>
          path.id === pathId ? { ...path, status: 'active' } : path
        )
      );
      return true;
    } catch (err) {
      setError('Failed to resume learning path');
      console.error(err);
      return false;
    }
  };

  const refreshPathProgress = async (pathId: string): Promise<LearningPath | null> => {
    if (!firebaseUser) return null;

    try {
      const updatedPath = await syncPathProgress(firebaseUser.uid, pathId);
      setPaths((prev) =>
        prev.map((path) => (path.id === pathId ? updatedPath : path))
      );
      return updatedPath;
    } catch (err) {
      setError('Failed to refresh path progress');
      console.error(err);
      return null;
    }
  };

  const refreshAllPaths = async (): Promise<void> => {
    if (!firebaseUser) return;

    try {
      const activePathsList = paths.filter((p) => p.status === 'active');
      const refreshPromises = activePathsList.map((path) =>
        syncPathProgress(firebaseUser.uid, path.id)
      );
      const updatedPaths = await Promise.all(refreshPromises);

      setPaths((prev) =>
        prev.map((path) => {
          const updated = updatedPaths.find((p) => p.id === path.id);
          return updated || path;
        })
      );
    } catch (err) {
      setError('Failed to refresh paths');
      console.error(err);
    }
  };

  return {
    paths,
    loading,
    error,
    fetchPaths,
    addPath,
    editPath,
    removePath,
    pausePath,
    resumePath,
    refreshPathProgress,
    refreshAllPaths,
  };
}
