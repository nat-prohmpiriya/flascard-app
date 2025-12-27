'use client';

import { useState } from 'react';
import { useTypingPaths } from '@/hooks/useTypingPaths';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { TypingPathCard } from '@/components/typing/TypingPathCard';
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
import { TypingPath } from '@/types';
import { toast } from 'sonner';
import { Route, Keyboard, ArrowLeft, Gauge, Target } from 'lucide-react';
import Link from 'next/link';

export default function TypingPathsPage() {
  const {
    paths,
    loading,
    removePath,
    pausePath,
    resumePath,
  } = useTypingPaths();

  const [deletingPath, setDeletingPath] = useState<TypingPath | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('all');

  const handleDeletePath = async () => {
    if (!deletingPath) return;
    const success = await removePath(deletingPath.id);
    if (success) {
      toast.success('Typing path deleted successfully!');
      setDeletingPath(null);
    }
  };

  const handlePausePath = async (pathId: string) => {
    const success = await pausePath(pathId);
    if (success) {
      toast.success('Typing path paused');
    }
  };

  const handleResumePath = async (pathId: string) => {
    const success = await resumePath(pathId);
    if (success) {
      toast.success('Typing path resumed');
    }
  };

  const filteredPaths = paths.filter((path) => {
    if (filter === 'all') return true;
    return path.status === filter;
  });

  const activePaths = paths.filter((p) => p.status === 'active');
  const completedPaths = paths.filter((p) => p.status === 'completed');

  // Calculate overall stats
  const totalStages = paths.reduce((sum, p) => sum + p.stages.length, 0);
  const completedStages = paths.reduce(
    (sum, p) => sum + p.stages.filter((s) => s.status === 'completed').length,
    0
  );

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/typing">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Route className="h-8 w-8" />
                Typing Paths
              </h1>
            </div>
            <p className="text-muted-foreground">
              Practice typing with structured learning paths
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950">
            <div className="flex items-center gap-2 mb-1">
              <Route className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-muted-foreground">Active Paths</p>
            </div>
            <p className="text-2xl font-bold">{activePaths.length}</p>
          </div>
          <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-green-600" />
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <p className="text-2xl font-bold">{completedPaths.length}</p>
          </div>
          <div className="p-4 rounded-lg border bg-purple-50 dark:bg-purple-950">
            <div className="flex items-center gap-2 mb-1">
              <Keyboard className="h-4 w-4 text-purple-600" />
              <p className="text-sm text-muted-foreground">Total Stages</p>
            </div>
            <p className="text-2xl font-bold">{totalStages}</p>
          </div>
          <div className="p-4 rounded-lg border bg-orange-50 dark:bg-orange-950">
            <div className="flex items-center gap-2 mb-1">
              <Gauge className="h-4 w-4 text-orange-600" />
              <p className="text-sm text-muted-foreground">Stages Done</p>
            </div>
            <p className="text-2xl font-bold">{completedStages}</p>
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
            <h3 className="text-lg font-medium mb-2">No typing paths yet</h3>
            <p className="text-muted-foreground mb-4">
              Typing paths help you practice code snippets in a structured way
            </p>
            <Button asChild>
              <Link href="/typing">
                <Keyboard className="mr-2 h-4 w-4" />
                Browse Snippets
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPaths.map((path) => (
              <TypingPathCard
                key={path.id}
                path={path}
                onDelete={(p) => setDeletingPath(p)}
                onPause={handlePausePath}
                onResume={handleResumePath}
              />
            ))}
          </div>
        )}

        {/* Delete Confirmation */}
        <Dialog open={!!deletingPath} onOpenChange={(open) => !open && setDeletingPath(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Typing Path</DialogTitle>
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
