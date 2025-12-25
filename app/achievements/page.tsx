'use client';

import { useState } from 'react';
import { useAchievements } from '@/hooks/useAchievements';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { AchievementList } from '@/components/achievements/AchievementList';
import { AchievementPopup } from '@/components/achievements/AchievementPopup';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AchievementCategory } from '@/types';
import { CATEGORY_LABELS, TIER_COLORS } from '@/data/achievements';
import { Trophy, RefreshCw, Filter } from 'lucide-react';

type FilterType = 'all' | 'unlocked' | 'locked';

export default function AchievementsPage() {
  const {
    achievements,
    loading,
    unnotified,
    summary,
    checkAchievements,
    dismissNotification,
    dismissAllNotifications,
  } = useAchievements();

  const [filter, setFilter] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState<AchievementCategory | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await checkAchievements();
    setRefreshing(false);
  };

  // Filter achievements
  const filteredAchievements = achievements.filter((a) => {
    // Status filter
    if (filter === 'unlocked' && !a.unlocked) return false;
    if (filter === 'locked' && a.unlocked) return false;

    // Category filter
    if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;

    return true;
  });

  // Stats
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const progressPercent = achievements.length > 0
    ? Math.round((unlockedCount / achievements.length) * 100)
    : 0;

  // Count by tier
  const tierCounts = {
    bronze: achievements.filter((a) => a.tier === 'bronze' && a.unlocked).length,
    silver: achievements.filter((a) => a.tier === 'silver' && a.unlocked).length,
    gold: achievements.filter((a) => a.tier === 'gold' && a.unlocked).length,
    platinum: achievements.filter((a) => a.tier === 'platinum' && a.unlocked).length,
  };

  const categories = Object.keys(CATEGORY_LABELS) as AchievementCategory[];

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Achievement Popup */}
        <AchievementPopup
          achievements={unnotified}
          onDismiss={dismissNotification}
          onDismissAll={dismissAllNotifications}
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              Achievements
            </h1>
            <p className="text-muted-foreground">
              Track your learning milestones and accomplishments
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
            Check Progress
          </Button>
        </div>

        {/* Overall Progress */}
        <div className="p-6 rounded-lg border bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">Overall Progress</h2>
              <p className="text-muted-foreground">
                {unlockedCount} of {achievements.length} achievements unlocked
              </p>
            </div>
            <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
              {progressPercent}%
            </div>
          </div>
          <Progress value={progressPercent} className="h-3 mb-4" />

          {/* Tier breakdown */}
          <div className="flex flex-wrap gap-3">
            {(['bronze', 'silver', 'gold', 'platinum'] as const).map((tier) => (
              <Badge
                key={tier}
                variant="outline"
                className={`${TIER_COLORS[tier].bg} ${TIER_COLORS[tier].text} capitalize`}
              >
                {tier}: {tierCounts[tier]}
              </Badge>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as FilterType)}
          >
            <TabsList>
              <TabsTrigger value="all">
                All ({achievements.length})
              </TabsTrigger>
              <TabsTrigger value="unlocked">
                Unlocked ({unlockedCount})
              </TabsTrigger>
              <TabsTrigger value="locked">
                Locked ({achievements.length - unlockedCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Badge
              variant={categoryFilter === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setCategoryFilter('all')}
            >
              All Categories
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={categoryFilter === cat ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setCategoryFilter(cat)}
              >
                {CATEGORY_LABELS[cat].icon} {CATEGORY_LABELS[cat].label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Achievements List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <AchievementList
            achievements={filteredAchievements}
            groupByCategory={categoryFilter === 'all'}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
