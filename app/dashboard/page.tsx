'use client';

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDecks } from '@/hooks/useDecks';
import { useGoals } from '@/hooks/useGoals';
import { useLearningPaths } from '@/hooks/useLearningPaths';
import { useTypingPaths } from '@/hooks/useTypingPaths';
import { useTypingSnippets } from '@/hooks/useTypingSnippets';
import { usePinnedPaths, usePinnedTypingPaths } from '@/hooks/usePinnedPaths';
import { useCalendar } from '@/hooks/useCalendar';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { CalendarHeatmap } from '@/components/planning/CalendarHeatmap';
import { LearningPathCardCompact } from '@/components/planning/LearningPathCardCompact';
import { TypingPathCardCompact } from '@/components/typing/TypingPathCardCompact';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getLanguageById } from '@/models/typingSnippet';
import {
  BookOpen,
  Target,
  Flame,
  Keyboard,
  ArrowRight,
  Route,
  Play,
  Plus,
  Calendar,
  TrendingUp,
  Clock,
  Zap,
  Code,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { decks } = useDecks();
  const { goals } = useGoals(true); // active only
  const { paths: learningPaths } = useLearningPaths();
  const { paths: typingPaths } = useTypingPaths();
  const { popularSnippets } = useTypingSnippets();
  const { pinnedPaths } = usePinnedPaths();
  const { pinnedTypingPaths } = usePinnedTypingPaths();
  const { calendarMonths, stats: calendarStats } = useCalendar(2); // 2 months for mini view

  // Display learning paths: pinned first, then active, max 6
  const displayLearningPaths = useMemo(() => {
    const pinned = learningPaths.filter((p) => pinnedPaths.includes(p.id));
    const active = learningPaths.filter((p) => p.status === 'active' && !pinnedPaths.includes(p.id));
    return [...pinned, ...active].slice(0, 6);
  }, [learningPaths, pinnedPaths]);

  // Display typing paths: pinned first, then active, max 6
  const displayTypingPaths = useMemo(() => {
    const pinned = typingPaths.filter((p) => pinnedTypingPaths.includes(p.id));
    const active = typingPaths.filter((p) => p.status === 'active' && !pinnedTypingPaths.includes(p.id));
    return [...pinned, ...active].slice(0, 6);
  }, [typingPaths, pinnedTypingPaths]);

  // Popular decks (by card count)
  const popularDecks = useMemo(
    () => [...decks].sort((a, b) => b.cardCount - a.cardCount).slice(0, 3),
    [decks]
  );

  // Calculate weekly stats from calendar
  const weeklyStats = useMemo(() => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    const allDays = calendarMonths.flatMap((m) => m.days);
    const lastWeekDays = allDays.filter((d) => d.date >= weekAgoStr);

    const totalCards = lastWeekDays.reduce((sum, d) => sum + d.cardsStudied, 0);
    const totalCorrect = lastWeekDays.reduce((sum, d) => sum + d.correctCount, 0);
    const totalAnswers = lastWeekDays.reduce(
      (sum, d) => sum + d.correctCount + d.incorrectCount,
      0
    );
    const accuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;
    const studyDays = lastWeekDays.filter((d) => d.cardsStudied > 0).length;

    return { totalCards, accuracy, studyDays };
  }, [calendarMonths]);

  const streak = user?.settings?.streak || 0;

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-sm text-muted-foreground">Continue your learning journey</p>
          </div>
          <div className="flex items-center gap-2 text-orange-500">
            <Flame className="h-6 w-6" />
            <span className="text-xl font-bold">{streak}</span>
            <span className="text-sm text-muted-foreground">day streak</span>
          </div>
        </div>

        {/* Flashcard Paths Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Flashcard Paths
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/planning/paths">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {displayLearningPaths.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-3">
              {displayLearningPaths.map((path) => (
                <LearningPathCardCompact key={path.id} path={path} />
              ))}
              {displayLearningPaths.length < 6 && (
                <Card className="border-dashed hover:border-primary transition-colors">
                  <CardContent className="p-4 flex items-center justify-center h-full min-h-[140px]">
                    <Button variant="ghost" asChild>
                      <Link href="/planning/paths">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Path
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <Route className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  Create a learning path to structure your study
                </p>
                <Button size="sm" asChild>
                  <Link href="/planning/paths">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Path
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Typing Paths Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Typing Paths
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/typing/paths">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {displayTypingPaths.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-3">
              {displayTypingPaths.map((path) => (
                <TypingPathCardCompact key={path.id} path={path} />
              ))}
              {displayTypingPaths.length < 6 && (
                <Card className="border-dashed hover:border-primary transition-colors">
                  <CardContent className="p-4 flex items-center justify-center h-full min-h-[140px]">
                    <Button variant="ghost" asChild>
                      <Link href="/typing/paths">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Path
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <Keyboard className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  Create a typing path to practice code typing
                </p>
                <Button size="sm" asChild>
                  <Link href="/typing/paths">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Path
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* This Week Stats */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{weeklyStats.totalCards}</p>
                  <p className="text-xs text-muted-foreground">Cards this week</p>
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
                  <p className="text-2xl font-bold">{weeklyStats.accuracy}%</p>
                  <p className="text-xs text-muted-foreground">Accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{weeklyStats.studyDays}</p>
                  <p className="text-xs text-muted-foreground">Study days</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{calendarStats.longestStreak}</p>
                  <p className="text-xs text-muted-foreground">Best streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goals & Calendar Row */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Goals Section */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Goals
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/planning/goals">
                    <Plus className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {goals.length > 0 ? (
                <div className="space-y-3">
                  {goals.slice(0, 3).map((goal) => {
                    const cardProgress = Math.min(
                      (goal.progress.cardsStudied / goal.targets.cardsToStudy) * 100,
                      100
                    );
                    return (
                      <div key={goal.id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">
                            {goal.type === 'weekly' ? 'Weekly' : 'Monthly'} Goal
                          </span>
                          <span className="text-muted-foreground">
                            {goal.progress.cardsStudied}/{goal.targets.cardsToStudy}
                          </span>
                        </div>
                        <Progress value={cardProgress} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">No active goals</p>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/planning/goals">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Goal
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calendar Heatmap Section */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Activity
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/planning/calendar">
                    View All <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {calendarMonths.length > 0 ? (
                <CalendarHeatmap
                  months={calendarMonths}
                  onDayClick={() => {}}
                />
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    Start studying to see your activity
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Popular Decks & Snippets Row */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Popular Decks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Popular Decks
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/decks">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {popularDecks.length > 0 ? (
              <div className="space-y-2">
                {popularDecks.map((deck) => (
                  <Card key={deck.id} className="hover:border-primary transition-colors">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate text-sm">{deck.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {deck.cardCount} cards
                          </p>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/study/${deck.id}`}>
                            <Play className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">No decks yet</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Popular Snippets */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Code className="h-5 w-5" />
                Popular Snippets
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/typing/snippets">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {popularSnippets.length > 0 ? (
              <div className="space-y-2">
                {popularSnippets.slice(0, 3).map((snippet) => {
                  const lang = getLanguageById(snippet.language);
                  return (
                    <Card key={snippet.id} className="hover:border-primary transition-colors">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate text-sm">{snippet.title}</h3>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="text-xs h-5"
                                style={{ borderColor: lang?.color, color: lang?.color }}
                              >
                                {snippet.languageName}
                              </Badge>
                              <span className="text-xs text-muted-foreground capitalize">
                                {snippet.difficulty}
                              </span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/typing/code/${snippet.language}?snippet=${snippet.id}`}>
                              <Play className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">No snippets yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid gap-3 grid-cols-2">
          <Link href="/typing">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Keyboard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Quick Type</p>
                    <p className="text-xs text-muted-foreground">Practice without path</p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/analytics">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Analytics</p>
                    <p className="text-xs text-muted-foreground">View detailed stats</p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}
