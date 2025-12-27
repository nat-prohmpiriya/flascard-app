'use client';

import { useState, useEffect, useCallback } from 'react';
import { TypingPath, TypingPathFormData } from '@/types';
import { TypingSnippet } from '@/models/typingSnippet';
import {
  getUserTypingPaths,
  getActiveTypingPaths,
  createTypingPath,
  updateTypingPath,
  deleteTypingPath,
  updateStageProgress,
} from '@/services/typingPath';
import { useAuth } from '@/contexts/AuthContext';

export function useTypingPaths(activeOnly: boolean = false) {
  const { firebaseUser } = useAuth();
  const [paths, setPaths] = useState<TypingPath[]>([]);
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
        ? await getActiveTypingPaths(firebaseUser.uid)
        : await getUserTypingPaths(firebaseUser.uid);
      setPaths(userPaths);
      setError(null);
    } catch (err) {
      setError('Failed to fetch typing paths');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser, activeOnly]);

  useEffect(() => {
    fetchPaths();
  }, [fetchPaths]);

  const addPath = async (
    data: TypingPathFormData,
    snippets: TypingSnippet[]
  ): Promise<TypingPath | null> => {
    if (!firebaseUser) return null;

    try {
      const newPath = await createTypingPath(firebaseUser.uid, data, snippets);
      setPaths((prev) => [newPath, ...prev]);
      return newPath;
    } catch (err) {
      setError('Failed to create typing path');
      console.error(err);
      return null;
    }
  };

  const editPath = async (
    pathId: string,
    data: Partial<{ name: string; description: string }>
  ): Promise<boolean> => {
    try {
      await updateTypingPath(pathId, data);
      setPaths((prev) =>
        prev.map((path) =>
          path.id === pathId
            ? { ...path, ...data, updatedAt: new Date() }
            : path
        )
      );
      return true;
    } catch (err) {
      setError('Failed to update typing path');
      console.error(err);
      return false;
    }
  };

  const removePath = async (pathId: string): Promise<boolean> => {
    try {
      await deleteTypingPath(pathId);
      setPaths((prev) => prev.filter((path) => path.id !== pathId));
      return true;
    } catch (err) {
      setError('Failed to delete typing path');
      console.error(err);
      return false;
    }
  };

  const pausePath = async (pathId: string): Promise<boolean> => {
    try {
      await updateTypingPath(pathId, { status: 'paused' });
      setPaths((prev) =>
        prev.map((path) =>
          path.id === pathId ? { ...path, status: 'paused' } : path
        )
      );
      return true;
    } catch (err) {
      setError('Failed to pause typing path');
      console.error(err);
      return false;
    }
  };

  const resumePath = async (pathId: string): Promise<boolean> => {
    try {
      await updateTypingPath(pathId, { status: 'active' });
      setPaths((prev) =>
        prev.map((path) =>
          path.id === pathId ? { ...path, status: 'active' } : path
        )
      );
      return true;
    } catch (err) {
      setError('Failed to resume typing path');
      console.error(err);
      return false;
    }
  };

  const recordProgress = async (
    pathId: string,
    stageIndex: number,
    wpm: number,
    accuracy: number
  ): Promise<TypingPath | null> => {
    try {
      const updatedPath = await updateStageProgress(pathId, stageIndex, wpm, accuracy);
      setPaths((prev) =>
        prev.map((path) => (path.id === pathId ? updatedPath : path))
      );
      return updatedPath;
    } catch (err) {
      setError('Failed to record progress');
      console.error(err);
      return null;
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
    recordProgress,
  };
}
