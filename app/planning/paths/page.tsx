'use client';

import { useState, useEffect } from 'react';
import { useLearningPaths } from '@/hooks/useLearningPaths';
import { useDecks } from '@/hooks/useDecks';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { LearningPathCard } from '@/components/planning/LearningPathCard';
import { LearningPathForm } from '@/components/planning/LearningPathForm';
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
import { LearningPath, LearningPathFormData, Deck } from '@/types';
import { toast } from 'sonner';
import { Plus, Route, RefreshCw, Target, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function LearningPathsPage() {
  const {
    paths,
    loading,
    addPath,
    removePath,
    pausePath,
    resumePath,
    refreshPathProgress,
    refreshAllPaths,
  } = useLearningPaths();

  const { decks } = useDecks();

  const [showPathForm, setShowPathForm] = useState(false);
  const [editingPath, setEditingPath] = useState<LearningPath | null>(null);
  const [deletingPath, setDeletingPath] = useState<LearningPath | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('all');

  // Auto-refresh on mount
  useEffect(() => {
    if (paths.length > 0) {
      refreshAllPaths();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreatePath = async (data: LearningPathFormData, selectedDecks: Deck[]) => {
    const path = await addPath(data, selectedDecks);
    if (path) {
      toast.success('Learning path created successfully!');
    }
  };

  const handleDeletePath = async () => {
    if (!deletingPath) return;
    const success = await removePath(deletingPath.id);
    if (success) {
      toast.success('Learning path deleted successfully!');
      setDeletingPath(null);
    }
  };

  const handleRefreshPath = async (pathId: string) => {
    const path = await refreshPathProgress(pathId);
    if (path) {
      toast.success('Progress refreshed!');
    }
  };

  const handlePausePath = async (pathId: string) => {
    const success = await pausePath(pathId);
    if (success) {
      toast.success('Learning path paused');
    }
  };

  const handleResumePath = async (pathId: string) => {
    const success = await resumePath(pathId);
    if (success) {
      toast.success('Learning path resumed');
    }
  };

  const handleRefreshAll = async () => {
    setRefreshing(true);
    await refreshAllPaths();
    setRefreshing(false);
    toast.success('All paths refreshed!');
  };

  const filteredPaths = paths.filter((path) => {
    if (filter === 'all') return true;
    return path.status === filter;
  });

  const activePaths = paths.filter((p) => p.status === 'active');
  const completedPaths = paths.filter((p) => p.status === 'completed');

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Route className="h-8 w-8" />
              Learning Paths
            </h1>
            <p className="text-muted-foreground">
              Create structured learning paths from your decks
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/planning/goals">
                <Target className="mr-2 h-4 w-4" />
                Goals
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
              disabled={refreshing || paths.length === 0}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
              />
              Refresh All
            </Button>
            <Button onClick={() => setShowPathForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Path
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950">
            <p className="text-sm text-muted-foreground">Active Paths</p>
            <p className="text-2xl font-bold">{activePaths.length}</p>
          </div>
          <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold">{completedPaths.length}</p>
          </div>
          <div className="p-4 rounded-lg border bg-purple-50 dark:bg-purple-950">
            <p className="text-sm text-muted-foreground">Total Stages</p>
            <p className="text-2xl font-bold">
              {paths.reduce((sum, p) => sum + p.stages.length, 0)}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">All ({paths.length})</TabsTrigger>
            <TabsTrigger value="active">
              Active ({paths.filter((p) => p.status === 'active').length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({paths.filter((p) => p.status === 'completed').length})
            </TabsTrigger>
            <TabsTrigger value="paused">
              Paused ({paths.filter((p) => p.status === 'paused').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Paths List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredPaths.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Route className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No learning paths yet</h3>
            <p className="text-muted-foreground mb-4">
              Create a learning path to organize your decks in order
            </p>
            <Button onClick={() => setShowPathForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Path
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPaths.map((path) => (
              <LearningPathCard
                key={path.id}
                path={path}
                onEdit={(p) => setEditingPath(p)}
                onDelete={(p) => setDeletingPath(p)}
                onRefresh={handleRefreshPath}
                onPause={handlePausePath}
                onResume={handleResumePath}
              />
            ))}
          </div>
        )}

        {/* Create Path Form */}
        <LearningPathForm
          open={showPathForm}
          onClose={() => setShowPathForm(false)}
          onSubmit={handleCreatePath}
          decks={decks}
        />

        {/* Edit Path Form */}
        {editingPath && (
          <LearningPathForm
            open={!!editingPath}
            onClose={() => setEditingPath(null)}
            onSubmit={async () => {
              setEditingPath(null);
              toast.info('Edit path in a future update');
            }}
            decks={decks}
            initialData={editingPath}
          />
        )}

        {/* Delete Confirmation */}
        <Dialog open={!!deletingPath} onOpenChange={(open) => !open && setDeletingPath(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Learning Path</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{deletingPath?.name}&quot;? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingPath(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeletePath}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
