'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDecks } from '@/hooks/useDecks';
import { useGoals } from '@/hooks/useGoals';
import { useLearningPaths } from '@/hooks/useLearningPaths';
import { useAchievements } from '@/hooks/useAchievements';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationPermissionBanner } from '@/components/notifications/NotificationPermissionBanner';
import { AchievementBadge } from '@/components/achievements/AchievementBadge';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { DeckCard } from '@/components/deck/DeckCard';
import { DeckForm } from '@/components/deck/DeckForm';
import { ProgressChart } from '@/components/progress/ProgressChart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Deck, DeckFormData, DailyProgress } from '@/types';
import { getTodayStats, getDailyProgress } from '@/services/progress';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, BookOpen, Target, TrendingUp, Flame, Zap, Keyboard, ArrowRight, Route, Calendar, Play } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function DashboardPage() {
  const { firebaseUser, user } = useAuth();
  const { decks, loading, addDeck, editDeck, removeDeck } = useDecks();
  const { goals: activeGoals } = useGoals(true);
  const { paths: learningPaths } = useLearningPaths();
  const activePaths = learningPaths.filter((p) => p.status === 'active');
  const { summary: achievementSummary } = useAchievements();
  const { permission: notificationPermission, requestPermission } = useNotifications();

  const [showDeckForm, setShowDeckForm] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [deletingDeck, setDeletingDeck] = useState<Deck | null>(null);

  const [todayStats, setTodayStats] = useState({ cardsStudied: 0, correctCount: 0, incorrectCount: 0 });
  const [weeklyProgress, setWeeklyProgress] = useState<DailyProgress[]>([]);

  useEffect(() => {
    if (firebaseUser) {
      getTodayStats(firebaseUser.uid).then(setTodayStats);
      getDailyProgress(firebaseUser.uid, 7).then(setWeeklyProgress);
    }
  }, [firebaseUser]);

  const handleCreateDeck = async (data: DeckFormData) => {
    const deck = await addDeck(data);
    if (deck) {
      toast.success('Deck created successfully!');
    }
  };

  const handleEditDeck = async (data: DeckFormData) => {
    if (!editingDeck) return;
    const success = await editDeck(editingDeck.id, data);
    if (success) {
      toast.success('Deck updated successfully!');
      setEditingDeck(null);
    }
  };

  const handleDeleteDeck = async () => {
    if (!deletingDeck) return;
    const success = await removeDeck(deletingDeck.id);
    if (success) {
      toast.success('Deck deleted successfully!');
      setDeletingDeck(null);
    }
  };

  const totalCards = decks.reduce((sum, deck) => sum + deck.cardCount, 0);
  const todayAccuracy = todayStats.cardsStudied > 0
    ? Math.round((todayStats.correctCount / todayStats.cardsStudied) * 100)
    : 0;
  const dailyGoal = user?.settings?.dailyGoal || 20;
  const goalProgress = Math.min((todayStats.cardsStudied / dailyGoal) * 100, 100);

  // Get current active path and stage
  const currentPath = activePaths[0];
  const currentStage = currentPath?.stages.find((s) => s.status === 'active');

  // Recent decks (last 4 by updatedAt)
  const recentDecks = useMemo(() => {
    return [...decks]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 4);
  }, [decks]);

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Welcome - Compact */}
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Continue your learning journey
          </p>
        </div>

        {/* Notification Permission Banner */}
        <NotificationPermissionBanner
          permission={notificationPermission}
          onRequestPermission={requestPermission}
        />

        {/* Quick Study Section - Main Focus */}
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Quick Study
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentPath && currentStage ? (
              // Has active learning path
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{currentPath.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Current: {currentStage.deckName}
                    </p>
                  </div>
                  <Link href={`/study/${currentStage.deckId}`}>
                    <Button size="lg">
                      <Play className="mr-2 h-5 w-5" />
                      Continue
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-4">
                  <Progress
                    value={Math.round((currentPath.stages.filter(s => s.status === 'completed').length / currentPath.stages.length) * 100)}
                    className="flex-1 h-2"
                  />
                  <span className="text-sm text-muted-foreground">
                    {currentPath.stages.filter(s => s.status === 'completed').length}/{currentPath.stages.length} stages
                  </span>
                </div>
              </div>
            ) : decks.length > 0 ? (
              // No learning path, but has decks
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Start studying your decks</p>
                  <p className="text-sm text-muted-foreground">
                    {totalCards} cards across {decks.length} decks
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/planning/paths">
                      <Route className="mr-2 h-4 w-4" />
                      Create Path
                    </Link>
                  </Button>
                  {decks[0] && (
                    <Link href={`/study/${decks[0].id}`}>
                      <Button>
                        <Play className="mr-2 h-4 w-4" />
                        Study Now
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              // No decks at all
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  Create your first deck to start learning
                </p>
                <Button onClick={() => setShowDeckForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Deck
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Stats - Compact Row */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{todayStats.cardsStudied}</p>
                  <p className="text-xs text-muted-foreground">Studied Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{todayAccuracy}%</p>
                  <p className="text-xs text-muted-foreground">Accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{user?.settings?.streak || 0}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Daily Goal</span>
                  </div>
                  <span className="text-sm font-bold">{todayStats.cardsStudied}/{dailyGoal}</span>
                </div>
                <Progress value={goalProgress} className="h-2" />
                {goalProgress >= 100 && (
                  <p className="text-xs text-green-500">Goal reached!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Plan Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Learning Plan</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/planning">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-3 mb-4">
            <Link href="/planning/goals">
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">Goals</p>
                      <p className="text-xs text-muted-foreground">{activeGoals.length} active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/planning/paths">
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <Route className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">Learning Paths</p>
                      <p className="text-xs text-muted-foreground">{activePaths.length} active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/planning/calendar">
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">Calendar</p>
                      <p className="text-xs text-muted-foreground">View schedule</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Active Goals Preview */}
          {activeGoals.length > 0 && (
            <div className="grid gap-2 md:grid-cols-3 mb-3">
              {activeGoals.slice(0, 3).map((goal) => {
                const cardProgress = Math.min(
                  (goal.progress.cardsStudied / goal.targets.cardsToStudy) * 100,
                  100
                );
                return (
                  <Card key={goal.id} className="bg-muted/30">
                    <CardContent className="p-2">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-xs h-5">
                          {goal.type === 'weekly' ? 'Weekly' : 'Monthly'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {goal.progress.cardsStudied}/{goal.targets.cardsToStudy}
                        </span>
                      </div>
                      <Progress value={cardProgress} className="h-1" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Active Paths Preview */}
          {activePaths.length > 1 && (
            <div className="grid gap-2 md:grid-cols-3">
              {activePaths.slice(0, 3).map((path) => {
                const completedStages = path.stages.filter((s) => s.status === 'completed').length;
                const overallProgress = path.stages.length > 0
                  ? Math.round((completedStages / path.stages.length) * 100)
                  : 0;
                return (
                  <Card key={path.id} className="bg-muted/30">
                    <CardContent className="p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-xs truncate">{path.name}</span>
                        <Badge variant="outline" className="text-xs h-5">
                          {completedStages}/{path.stages.length}
                        </Badge>
                      </div>
                      <Progress value={overallProgress} className="h-1" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Weekly Progress Chart */}
        {weeklyProgress.length > 0 && (
          <ProgressChart data={weeklyProgress} />
        )}

        {/* Achievements Badge */}
        <AchievementBadge
          totalUnlocked={achievementSummary.totalUnlocked}
          totalAchievements={achievementSummary.totalAchievements}
          recentUnlock={achievementSummary.recentUnlock}
        />

        {/* Quick Links Row */}
        <div className="grid gap-3 grid-cols-2">
          <Link href="/typing">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Keyboard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Typing Practice</p>
                    <p className="text-xs text-muted-foreground">Practice code typing</p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/decks">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">All Decks</p>
                    <p className="text-xs text-muted-foreground">{decks.length} decks · {totalCards} cards</p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Decks - Limited to 4 */}
        {recentDecks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Recent Decks</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowDeckForm(true)}>
                  <Plus className="mr-1 h-4 w-4" />
                  New
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/decks">
                    View All
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {recentDecks.map((deck) => (
                  <DeckCard
                    key={deck.id}
                    deck={deck}
                    onEdit={(d) => setEditingDeck(d)}
                    onDelete={(d) => setDeletingDeck(d)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty state if no decks */}
        {decks.length === 0 && !loading && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No decks yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first deck to start learning
              </p>
              <Button onClick={() => setShowDeckForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Deck
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Deck Form */}
        <DeckForm
          open={showDeckForm}
          onClose={() => setShowDeckForm(false)}
          onSubmit={handleCreateDeck}
        />

        {/* Edit Deck Form */}
        {editingDeck && (
          <DeckForm
            open={!!editingDeck}
            onClose={() => setEditingDeck(null)}
            onSubmit={handleEditDeck}
            initialData={editingDeck}
          />
        )}

        {/* Delete Confirmation */}
        <Dialog open={!!deletingDeck} onOpenChange={() => setDeletingDeck(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Deck</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{deletingDeck?.name}&quot;? This will also delete all cards in this deck. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingDeck(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteDeck}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
