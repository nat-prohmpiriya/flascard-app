'use client';

import { useState, useCallback } from 'react';
import { Card, ReviewQuality, AchievementDefinition } from '@/types';
import { getCardsForReview, reviewCard } from '@/services/card';
import { createStudySession, getTodayStats, calculateStreak } from '@/services/progress';
import { updateUserSettings } from '@/services/auth';
import { checkAndUnlockAchievements } from '@/services/achievement';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface StudyStats {
  total: number;
  correct: number;
  incorrect: number;
  remaining: number;
}

export function useStudy(deckId?: string) {
  const { firebaseUser, user } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [stats, setStats] = useState<StudyStats>({
    total: 0,
    correct: 0,
    incorrect: 0,
    remaining: 0,
  });

  const currentCard = cards[currentIndex] || null;
  const isComplete = currentIndex >= cards.length && cards.length > 0;

  const startStudySession = useCallback(async () => {
    if (!firebaseUser) return;

    try {
      setLoading(true);
      const reviewCards = await getCardsForReview(firebaseUser.uid, deckId);
      setCards(reviewCards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setSessionStartTime(new Date());
      setStats({
        total: reviewCards.length,
        correct: 0,
        incorrect: 0,
        remaining: reviewCards.length,
      });
    } catch (err) {
      console.error('Failed to start study session:', err);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser, deckId]);

  const flipCard = () => {
    setIsFlipped((prev) => !prev);
  };

  const answerCard = async (quality: ReviewQuality) => {
    if (!currentCard || !firebaseUser) return;

    try {
      await reviewCard(currentCard.id, quality);

      const isCorrect = quality >= 3;
      setStats((prev) => ({
        ...prev,
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1),
        remaining: prev.remaining - 1,
      }));

      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } catch (err) {
      console.error('Failed to review card:', err);
    }
  };

  const endSession = async (): Promise<AchievementDefinition[]> => {
    if (!firebaseUser || !sessionStartTime || !deckId) return [];

    const duration = Math.round((new Date().getTime() - sessionStartTime.getTime()) / 1000);
    const cardsStudiedThisSession = stats.total - stats.remaining;

    try {
      // Save study session
      await createStudySession(
        firebaseUser.uid,
        deckId,
        cardsStudiedThisSession,
        stats.correct,
        stats.incorrect,
        duration
      );

      // Update streak
      const currentStreak = user?.settings?.streak || 0;
      const lastStudyDate = user?.settings?.lastStudyDate || null;
      const { streak: newStreak, lastStudyDate: newLastStudyDate } = calculateStreak(currentStreak, lastStudyDate);

      await updateUserSettings(firebaseUser.uid, {
        streak: newStreak,
        lastStudyDate: newLastStudyDate,
      });

      // Check if daily goal is reached
      const dailyGoal = user?.settings?.dailyGoal || 20;
      const todayStats = await getTodayStats(firebaseUser.uid);

      if (todayStats.cardsStudied >= dailyGoal) {
        // Check if this session pushed us over the goal
        const previousTotal = todayStats.cardsStudied - cardsStudiedThisSession;
        if (previousTotal < dailyGoal) {
          toast.success('🎉 Daily Goal Reached!', {
            description: `You studied ${todayStats.cardsStudied} cards today!`,
          });
        }
      }

      // Show streak milestone notifications
      if (newStreak > currentStreak && newStreak % 7 === 0) {
        toast.success(`🔥 ${newStreak} Day Streak!`, {
          description: 'Keep up the great work!',
        });
      }

      // Check and unlock achievements
      const newlyUnlocked = await checkAndUnlockAchievements(firebaseUser.uid);

      // Show toast for each newly unlocked achievement
      newlyUnlocked.forEach((achievement) => {
        toast.success(`🏆 Achievement Unlocked!`, {
          description: `${achievement.icon} ${achievement.name}`,
        });
      });

      return newlyUnlocked;
    } catch (err) {
      console.error('Failed to save study session:', err);
      return [];
    }
  };

  const resetSession = () => {
    setCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionStartTime(null);
    setStats({
      total: 0,
      correct: 0,
      incorrect: 0,
      remaining: 0,
    });
  };

  return {
    cards,
    currentCard,
    currentIndex,
    isFlipped,
    isComplete,
    loading,
    stats,
    startStudySession,
    flipCard,
    answerCard,
    endSession,
    resetSession,
  };
}
