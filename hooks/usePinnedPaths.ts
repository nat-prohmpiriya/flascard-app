'use client';

import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserSettings } from '@/services/auth';
import { toast } from 'sonner';

const MAX_PINNED_LEARNING_PATHS = 6;
const MAX_PINNED_TYPING_PATHS = 6;

// Hook for Learning Paths
export function usePinnedPaths() {
  const { user, refreshUser } = useAuth();
  const pinnedPaths = user?.settings?.pinnedPaths || [];

  const isPinned = useCallback(
    (pathId: string) => pinnedPaths.includes(pathId),
    [pinnedPaths]
  );

  const pinPath = useCallback(
    async (pathId: string) => {
      if (!user) return false;

      if (pinnedPaths.length >= MAX_PINNED_LEARNING_PATHS) {
        toast.error(`Maximum ${MAX_PINNED_LEARNING_PATHS} pinned learning paths allowed`);
        return false;
      }

      if (isPinned(pathId)) {
        toast.info('Path already pinned');
        return false;
      }

      try {
        const newPinnedPaths = [...pinnedPaths, pathId];
        await updateUserSettings(user.uid, { pinnedPaths: newPinnedPaths });
        await refreshUser();
        toast.success('Path pinned to dashboard');
        return true;
      } catch (error) {
        console.error('Error pinning path:', error);
        toast.error('Failed to pin path');
        return false;
      }
    },
    [user, pinnedPaths, isPinned, refreshUser]
  );

  const unpinPath = useCallback(
    async (pathId: string) => {
      if (!user) return false;

      if (!isPinned(pathId)) {
        return false;
      }

      try {
        const newPinnedPaths = pinnedPaths.filter((id) => id !== pathId);
        await updateUserSettings(user.uid, { pinnedPaths: newPinnedPaths });
        await refreshUser();
        toast.success('Path unpinned');
        return true;
      } catch (error) {
        console.error('Error unpinning path:', error);
        toast.error('Failed to unpin path');
        return false;
      }
    },
    [user, pinnedPaths, isPinned, refreshUser]
  );

  const togglePin = useCallback(
    async (pathId: string) => {
      if (isPinned(pathId)) {
        return unpinPath(pathId);
      } else {
        return pinPath(pathId);
      }
    },
    [isPinned, pinPath, unpinPath]
  );

  return {
    pinnedPaths,
    isPinned,
    pinPath,
    unpinPath,
    togglePin,
    canPinMore: pinnedPaths.length < MAX_PINNED_LEARNING_PATHS,
    maxPinnedPaths: MAX_PINNED_LEARNING_PATHS,
  };
}

// Hook for Typing Paths
export function usePinnedTypingPaths() {
  const { user, refreshUser } = useAuth();
  const pinnedTypingPaths = user?.settings?.pinnedTypingPaths || [];

  const isPinned = useCallback(
    (pathId: string) => pinnedTypingPaths.includes(pathId),
    [pinnedTypingPaths]
  );

  const pinPath = useCallback(
    async (pathId: string) => {
      if (!user) return false;

      if (pinnedTypingPaths.length >= MAX_PINNED_TYPING_PATHS) {
        toast.error(`Maximum ${MAX_PINNED_TYPING_PATHS} pinned typing paths allowed`);
        return false;
      }

      if (isPinned(pathId)) {
        toast.info('Path already pinned');
        return false;
      }

      try {
        const newPinnedPaths = [...pinnedTypingPaths, pathId];
        await updateUserSettings(user.uid, { pinnedTypingPaths: newPinnedPaths });
        await refreshUser();
        toast.success('Typing path pinned to dashboard');
        return true;
      } catch (error) {
        console.error('Error pinning typing path:', error);
        toast.error('Failed to pin path');
        return false;
      }
    },
    [user, pinnedTypingPaths, isPinned, refreshUser]
  );

  const unpinPath = useCallback(
    async (pathId: string) => {
      if (!user) return false;

      if (!isPinned(pathId)) {
        return false;
      }

      try {
        const newPinnedPaths = pinnedTypingPaths.filter((id) => id !== pathId);
        await updateUserSettings(user.uid, { pinnedTypingPaths: newPinnedPaths });
        await refreshUser();
        toast.success('Typing path unpinned');
        return true;
      } catch (error) {
        console.error('Error unpinning typing path:', error);
        toast.error('Failed to unpin path');
        return false;
      }
    },
    [user, pinnedTypingPaths, isPinned, refreshUser]
  );

  const togglePin = useCallback(
    async (pathId: string) => {
      if (isPinned(pathId)) {
        return unpinPath(pathId);
      } else {
        return pinPath(pathId);
      }
    },
    [isPinned, pinPath, unpinPath]
  );

  return {
    pinnedTypingPaths,
    isPinned,
    pinPath,
    unpinPath,
    togglePin,
    canPinMore: pinnedTypingPaths.length < MAX_PINNED_TYPING_PATHS,
    maxPinnedPaths: MAX_PINNED_TYPING_PATHS,
  };
}
