'use client';

import { useState, useEffect } from 'react';
import { useGoals } from '@/hooks/useGoals';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { GoalCard } from '@/components/planning/GoalCard';
import { GoalForm } from '@/components/planning/GoalForm';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Goal, GoalFormData } from '@/types';
import { toast } from 'sonner';
import { Plus, Target, RefreshCw, Calendar, Route } from 'lucide-react';
import Link from 'next/link';

export default function GoalsPage() {
  const {
    goals,
    loading,
    addGoal,
    removeGoal,
    refreshGoalProgress,
    refreshAllGoals,
  } = useGoals();

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'failed'>('all');

  // Auto-refresh on mount
  useEffect(() => {
    if (goals.length > 0) {
      refreshAllGoals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateGoal = async (data: GoalFormData) => {
    const goal = await addGoal(data);
    if (goal) {
      toast.success('Goal created successfully!');
    }
  };

  const handleDeleteGoal = async () => {
    if (!deletingGoal) return;
    const success = await removeGoal(deletingGoal.id);
    if (success) {
      toast.success('Goal deleted successfully!');
      setDeletingGoal(null);
    }
  };

  const handleRefreshGoal = async (goalId: string) => {
    const goal = await refreshGoalProgress(goalId);
    if (goal) {
      toast.success('Progress refreshed!');
    }
  };

  const handleRefreshAll = async () => {
    setRefreshing(true);
    await refreshAllGoals();
    setRefreshing(false);
    toast.success('All goals refreshed!');
  };

  const filteredGoals = goals.filter((goal) => {
    if (filter === 'all') return true;
    return goal.status === filter;
  });

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Target className="h-8 w-8" />
              Goals
            </h1>
            <p className="text-muted-foreground">
              Set and track your learning goals
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/planning/paths">
                <Route className="mr-2 h-4 w-4" />
                Paths
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/planning/calendar">
                <Calendar className="mr-2 h-4 w-4" />
                Calendar
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={handleRefreshAll}
              disabled={refreshing || goals.length === 0}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
              />
              Refresh All
            </Button>
            <Button onClick={() => setShowGoalForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Goal
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950">
            <p className="text-sm text-muted-foreground">Active Goals</p>
            <p className="text-2xl font-bold">{activeGoals.length}</p>
          </div>
          <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold">{completedGoals.length}</p>
          </div>
          <div className="p-4 rounded-lg border bg-orange-50 dark:bg-orange-950">
            <p className="text-sm text-muted-foreground">Success Rate</p>
            <p className="text-2xl font-bold">
              {goals.length > 0
                ? Math.round((completedGoals.length / goals.length) * 100)
                : 0}
              %
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">All ({goals.length})</TabsTrigger>
            <TabsTrigger value="active">
              Active ({goals.filter((g) => g.status === 'active').length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({goals.filter((g) => g.status === 'completed').length})
            </TabsTrigger>
            <TabsTrigger value="failed">
              Failed ({goals.filter((g) => g.status === 'failed').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Goals Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredGoals.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No goals yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first goal to start tracking your progress
            </p>
            <Button onClick={() => setShowGoalForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Goal
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={(g) => setEditingGoal(g)}
                onDelete={(g) => setDeletingGoal(g)}
                onRefresh={handleRefreshGoal}
              />
            ))}
          </div>
        )}

        {/* Create Goal Form */}
        <GoalForm
          open={showGoalForm}
          onClose={() => setShowGoalForm(false)}
          onSubmit={handleCreateGoal}
        />

        {/* Edit Goal Form */}
        {editingGoal && (
          <GoalForm
            open={!!editingGoal}
            onClose={() => setEditingGoal(null)}
            onSubmit={async (data) => {
              // For now, just close the modal
              // Edit functionality can be implemented later if needed
              setEditingGoal(null);
              toast.info('Edit goal targets in a future update');
            }}
            initialData={editingGoal}
          />
        )}

        {/* Delete Confirmation */}
        <Dialog open={!!deletingGoal} onOpenChange={() => setDeletingGoal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Goal</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this goal? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingGoal(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteGoal}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
