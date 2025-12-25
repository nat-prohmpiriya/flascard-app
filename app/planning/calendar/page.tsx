'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useCalendar } from '@/hooks/useCalendar';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { CalendarHeatmap } from '@/components/planning/CalendarHeatmap';
import { CalendarDayDetail } from '@/components/planning/CalendarDayDetail';
import { StatsCard } from '@/components/progress/StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calendar,
  Target,
  BookOpen,
  TrendingUp,
  Flame,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';

export default function CalendarPage() {
  const { user } = useAuth();
  const {
    calendarMonths,
    selectedDay,
    setSelectedDay,
    getSessionsForDay,
    stats,
    loading,
    refresh,
  } = useCalendar(6);

  const selectedSessions = selectedDay
    ? getSessionsForDay(selectedDay.date)
    : [];

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calendar className="h-8 w-8" />
              Study Calendar
            </h1>
            <p className="text-muted-foreground">
              Track your daily study activity
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/planning/goals">
                <Target className="mr-2 h-4 w-4" />
                Goals
              </Link>
            </Button>
            <Button variant="outline" onClick={refresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatsCard
            title="Total Cards"
            value={stats.totalCards}
            icon={BookOpen}
          />
          <StatsCard
            title="Study Days"
            value={`${stats.studyDays} / ${stats.totalDays}`}
            subtitle={`${stats.studyRate}% consistency`}
            icon={Calendar}
          />
          <StatsCard
            title="Avg Accuracy"
            value={`${stats.averageAccuracy}%`}
            icon={TrendingUp}
          />
          <StatsCard
            title="Longest Streak"
            value={`${stats.longestStreak} days`}
            icon={BarChart3}
          />
          <StatsCard
            title="Current Streak"
            value={`${user?.settings?.streak || 0} days`}
            icon={Flame}
          />
        </div>

        {/* Calendar Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : calendarMonths.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                No study data available yet. Start studying to see your activity!
              </p>
            ) : (
              <CalendarHeatmap
                months={calendarMonths}
                onDayClick={setSelectedDay}
                selectedDate={selectedDay?.date}
              />
            )}
          </CardContent>
        </Card>

        {/* Day Detail */}
        <CalendarDayDetail day={selectedDay} sessions={selectedSessions} />
      </div>
    </ProtectedRoute>
  );
}
