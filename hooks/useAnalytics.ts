'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  OverallStats,
  TimeStats,
  DeckStats,
  StudyPattern,
  LearningInsights,
  AnalyticsPeriod,
} from '@/types';
import { getAllAnalytics } from '@/services/analytics';

interface AnalyticsState {
  overall: OverallStats | null;
  timeStats: TimeStats[];
  deckStats: DeckStats[];
  patterns: StudyPattern | null;
  insights: LearningInsights | null;
}

export function useAnalytics(initialPeriod: AnalyticsPeriod = 'week') {
  const { firebaseUser } = useAuth();
  const [period, setPeriod] = useState<AnalyticsPeriod>(initialPeriod);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsState>({
    overall: null,
    timeStats: [],
    deckStats: [],
    patterns: null,
    insights: null,
  });

  const fetchAnalytics = useCallback(async () => {
    if (!firebaseUser) {
      setData({
        overall: null,
        timeStats: [],
        deckStats: [],
        patterns: null,
        insights: null,
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await getAllAnalytics(firebaseUser.uid, period);
      setData({
        overall: result.overall,
        timeStats: result.timeStats,
        deckStats: result.deckStats,
        patterns: result.patterns,
        insights: result.insights,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser, period]);

  // Fetch on mount and when period changes
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Change period and refetch
  const changePeriod = useCallback((newPeriod: AnalyticsPeriod) => {
    setPeriod(newPeriod);
  }, []);

  return {
    period,
    loading,
    overall: data.overall,
    timeStats: data.timeStats,
    deckStats: data.deckStats,
    patterns: data.patterns,
    insights: data.insights,
    changePeriod,
    refresh: fetchAnalytics,
  };
}
