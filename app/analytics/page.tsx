'use client';

import { useAnalytics } from '@/hooks/useAnalytics';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { OverallStatsCards } from '@/components/analytics/OverallStatsCards';
import { TimeChart } from '@/components/analytics/TimeChart';
import { DeckStatsTable } from '@/components/analytics/DeckStatsTable';
import { StudyPatternChart } from '@/components/analytics/StudyPatternChart';
import { InsightsPanel } from '@/components/analytics/InsightsPanel';
import { CardDistribution } from '@/components/analytics/CardDistribution';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsPeriod } from '@/types';
import { BarChart3, RefreshCw } from 'lucide-react';

export default function AnalyticsPage() {
  const {
    period,
    loading,
    overall,
    timeStats,
    deckStats,
    patterns,
    insights,
    changePeriod,
    refresh,
  } = useAnalytics();

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8" />
              Analytics
            </h1>
            <p className="text-muted-foreground">
              Track your learning progress and patterns
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Period Selector */}
            <Tabs
              value={period}
              onValueChange={(v) => changePeriod(v as AnalyticsPeriod)}
            >
              <TabsList>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
                <TabsTrigger value="all">All Time</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button variant="outline" onClick={refresh} disabled={loading}>
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && !overall && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Overall Stats */}
        <OverallStatsCards stats={overall} />

        {/* Time Chart */}
        <TimeChart data={timeStats} />

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Card Distribution */}
          <CardDistribution stats={overall} />

          {/* Study Patterns */}
          <StudyPatternChart patterns={patterns} />
        </div>

        {/* Learning Insights */}
        <InsightsPanel insights={insights} patterns={patterns} />

        {/* Deck Statistics */}
        <DeckStatsTable decks={deckStats} />
      </div>
    </ProtectedRoute>
  );
}
