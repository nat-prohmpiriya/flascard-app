'use client';

import { useState, useEffect, useCallback } from 'react';
import { Goal, GoalFormData } from '@/types';
import {
  getUserGoals,
  getActiveGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  syncGoalProgress,
} from '@/services/goal';
import { useAuth } from '@/contexts/AuthContext';

export function useGoals(activeOnly: boolean = false) {
  const { firebaseUser } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    if (!firebaseUser) {
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userGoals = activeOnly
        ? await getActiveGoals(firebaseUser.uid)
        : await getUserGoals(firebaseUser.uid);
      setGoals(userGoals);
      setError(null);
    } catch (err) {
      setError('Failed to fetch goals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser, activeOnly]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = async (data: GoalFormData): Promise<Goal | null> => {
    if (!firebaseUser) return null;

    try {
      const newGoal = await createGoal(firebaseUser.uid, data);
      setGoals((prev) => [newGoal, ...prev]);
      return newGoal;
    } catch (err) {
      setError('Failed to create goal');
      console.error(err);
      return null;
    }
  };

  const editGoal = async (
    goalId: string,
    data: Partial<GoalFormData>
  ): Promise<boolean> => {
    try {
      await updateGoal(goalId, data);
      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === goalId
            ? { ...goal, ...data, updatedAt: new Date() }
            : goal
        )
      );
      return true;
    } catch (err) {
      setError('Failed to update goal');
      console.error(err);
      return false;
    }
  };

  const removeGoal = async (goalId: string): Promise<boolean> => {
    try {
      await deleteGoal(goalId);
      setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
      return true;
    } catch (err) {
      setError('Failed to delete goal');
      console.error(err);
      return false;
    }
  };

  const refreshGoalProgress = async (goalId: string): Promise<Goal | null> => {
    if (!firebaseUser) return null;

    try {
      const updatedGoal = await syncGoalProgress(firebaseUser.uid, goalId);
      setGoals((prev) =>
        prev.map((goal) => (goal.id === goalId ? updatedGoal : goal))
      );
      return updatedGoal;
    } catch (err) {
      setError('Failed to refresh goal progress');
      console.error(err);
      return null;
    }
  };

  const refreshAllGoals = async (): Promise<void> => {
    if (!firebaseUser) return;

    try {
      const activeGoalsList = goals.filter((g) => g.status === 'active');
      const refreshPromises = activeGoalsList.map((goal) =>
        syncGoalProgress(firebaseUser.uid, goal.id)
      );
      const updatedGoals = await Promise.all(refreshPromises);

      setGoals((prev) =>
        prev.map((goal) => {
          const updated = updatedGoals.find((g) => g.id === goal.id);
          return updated || goal;
        })
      );
    } catch (err) {
      setError('Failed to refresh goals');
      console.error(err);
    }
  };

  return {
    goals,
    loading,
    error,
    fetchGoals,
    addGoal,
    editGoal,
    removeGoal,
    refreshGoalProgress,
    refreshAllGoals,
  };
}
