'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AchievementWithStatus, AchievementDefinition, AchievementCategory } from '@/types';
import {
  getAchievementsWithStatus,
  checkAndUnlockAchievements,
  getUnnotifiedAchievements,
  markAchievementNotified,
  getAchievementSummary,
} from '@/services/achievement';
import { toast } from 'sonner';

export function useAchievements() {
  const { firebaseUser } = useAuth();
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [unnotified, setUnnotified] = useState<AchievementWithStatus[]>([]);
  const [summary, setSummary] = useState<{
    totalUnlocked: number;
    totalAchievements: number;
    recentUnlock?: AchievementWithStatus;
  }>({ totalUnlocked: 0, totalAchievements: 0 });

  // Fetch all achievements with status
  const fetchAchievements = useCallback(async () => {
    if (!firebaseUser) {
      setAchievements([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [allAchievements, unnotifiedList, summaryData] = await Promise.all([
        getAchievementsWithStatus(firebaseUser.uid),
        getUnnotifiedAchievements(firebaseUser.uid),
        getAchievementSummary(firebaseUser.uid),
      ]);
      setAchievements(allAchievements);
      setUnnotified(unnotifiedList);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  }, [firebaseUser]);

  // Check and unlock new achievements
  const checkAchievements = useCallback(async (): Promise<AchievementDefinition[]> => {
    if (!firebaseUser) return [];

    try {
      const newlyUnlocked = await checkAndUnlockAchievements(firebaseUser.uid);

      if (newlyUnlocked.length > 0) {
        // Refresh achievements list
        await fetchAchievements();
      }

      return newlyUnlocked;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }, [firebaseUser, fetchAchievements]);

  // Dismiss notification (mark as notified)
  const dismissNotification = useCallback(
    async (achievementId: string) => {
      if (!firebaseUser) return;

      try {
        await markAchievementNotified(firebaseUser.uid, achievementId);
        setUnnotified((prev) =>
          prev.filter((a) => a.id !== achievementId)
        );
      } catch (error) {
        console.error('Error dismissing notification:', error);
      }
    },
    [firebaseUser]
  );

  // Dismiss all notifications
  const dismissAllNotifications = useCallback(async () => {
    if (!firebaseUser) return;

    try {
      await Promise.all(
        unnotified.map((a) =>
          markAchievementNotified(firebaseUser.uid, a.id)
        )
      );
      setUnnotified([]);
    } catch (error) {
      console.error('Error dismissing all notifications:', error);
    }
  }, [firebaseUser, unnotified]);

  // Get achievements by category
  const getByCategory = useCallback(
    (category: AchievementCategory): AchievementWithStatus[] => {
      return achievements.filter((a) => a.category === category);
    },
    [achievements]
  );

  // Get unlocked achievements
  const getUnlocked = useCallback((): AchievementWithStatus[] => {
    return achievements.filter((a) => a.unlocked);
  }, [achievements]);

  // Get locked achievements
  const getLocked = useCallback((): AchievementWithStatus[] => {
    return achievements.filter((a) => !a.unlocked);
  }, [achievements]);

  // Initial fetch
  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  return {
    achievements,
    loading,
    unnotified,
    summary,
    fetchAchievements,
    checkAchievements,
    dismissNotification,
    dismissAllNotifications,
    getByCategory,
    getUnlocked,
    getLocked,
  };
}
