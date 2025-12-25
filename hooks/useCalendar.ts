'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { CalendarDay, CalendarMonth, StudySession } from '@/types';
import { getUserStudySessions } from '@/services/progress';
import { useAuth } from '@/contexts/AuthContext';

export function useCalendar(months: number = 6) {
  const { firebaseUser } = useAuth();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!firebaseUser) {
      setSessions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const allSessions = await getUserStudySessions(firebaseUser.uid, 1000);
      setSessions(allSessions);
      setError(null);
    } catch (err) {
      setError('Failed to fetch study sessions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Generate calendar data from sessions
  const calendarData = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);

    // Group sessions by date
    const sessionsByDate = new Map<string, StudySession[]>();
    sessions.forEach((session) => {
      const dateKey = session.completedAt.toISOString().split('T')[0];
      const existing = sessionsByDate.get(dateKey) || [];
      sessionsByDate.set(dateKey, [...existing, session]);
    });

    // Calculate max cards for intensity scaling
    let maxCards = 0;
    sessionsByDate.forEach((daySessions) => {
      const total = daySessions.reduce((sum, s) => sum + s.cardsStudied, 0);
      if (total > maxCards) maxCards = total;
    });

    // Generate calendar days
    const days: CalendarDay[] = [];
    const current = new Date(startDate);

    while (current <= today) {
      const dateKey = current.toISOString().split('T')[0];
      const daySessions = sessionsByDate.get(dateKey) || [];

      const cardsStudied = daySessions.reduce((sum, s) => sum + s.cardsStudied, 0);
      const correctCount = daySessions.reduce((sum, s) => sum + s.correctCount, 0);
      const incorrectCount = daySessions.reduce((sum, s) => sum + s.incorrectCount, 0);

      // Calculate intensity (0-4)
      let intensity: 0 | 1 | 2 | 3 | 4 = 0;
      if (cardsStudied > 0 && maxCards > 0) {
        const ratio = cardsStudied / maxCards;
        if (ratio > 0.75) intensity = 4;
        else if (ratio > 0.5) intensity = 3;
        else if (ratio > 0.25) intensity = 2;
        else intensity = 1;
      }

      days.push({
        date: dateKey,
        cardsStudied,
        correctCount,
        incorrectCount,
        sessionsCount: daySessions.length,
        intensity,
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [sessions, months]);

  // Group by month for display
  const calendarMonths = useMemo((): CalendarMonth[] => {
    const monthsMap = new Map<string, CalendarDay[]>();

    calendarData.forEach((day) => {
      const [year, month] = day.date.split('-');
      const key = `${year}-${month}`;
      const existing = monthsMap.get(key) || [];
      monthsMap.set(key, [...existing, day]);
    });

    return Array.from(monthsMap.entries())
      .map(([key, days]) => {
        const [year, month] = key.split('-').map(Number);
        return { year, month, days };
      })
      .sort((a, b) => a.year - b.year || a.month - b.month);
  }, [calendarData]);

  // Get sessions for a specific day
  const getSessionsForDay = useCallback(
    (date: string): StudySession[] => {
      return sessions.filter(
        (s) => s.completedAt.toISOString().split('T')[0] === date
      );
    },
    [sessions]
  );

  // Statistics
  const stats = useMemo(() => {
    const totalDays = calendarData.length;
    const studyDays = calendarData.filter((d) => d.cardsStudied > 0).length;
    const totalCards = calendarData.reduce((sum, d) => sum + d.cardsStudied, 0);
    const totalCorrect = calendarData.reduce((sum, d) => sum + d.correctCount, 0);
    const totalIncorrect = calendarData.reduce((sum, d) => sum + d.incorrectCount, 0);
    const totalAnswers = totalCorrect + totalIncorrect;
    const averageAccuracy =
      totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

    // Calculate longest streak
    let longestStreak = 0;
    let currentStreak = 0;
    calendarData.forEach((day) => {
      if (day.cardsStudied > 0) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    return {
      totalDays,
      studyDays,
      totalCards,
      averageAccuracy,
      longestStreak,
      studyRate: totalDays > 0 ? Math.round((studyDays / totalDays) * 100) : 0,
    };
  }, [calendarData]);

  return {
    calendarData,
    calendarMonths,
    selectedDay,
    setSelectedDay,
    getSessionsForDay,
    stats,
    loading,
    error,
    refresh: fetchSessions,
  };
}
