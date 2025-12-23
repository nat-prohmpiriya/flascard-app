'use client';

import { useState, useCallback } from 'react';
import { Card, ReviewQuality } from '@/types';
import { getCardsForReview, reviewCard } from '@/services/card';
import { createStudySession } from '@/services/progress';
import { useAuth } from '@/contexts/AuthContext';

interface StudyStats {
  total: number;
  correct: number;
  incorrect: number;
  remaining: number;
}

export function useStudy(deckId?: string) {
  const { firebaseUser } = useAuth();
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

  const endSession = async () => {
    if (!firebaseUser || !sessionStartTime || !deckId) return;

    const duration = Math.round((new Date().getTime() - sessionStartTime.getTime()) / 1000);

    try {
      await createStudySession(
        firebaseUser.uid,
        deckId,
        stats.total - stats.remaining,
        stats.correct,
        stats.incorrect,
        duration
      );
    } catch (err) {
      console.error('Failed to save study session:', err);
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
