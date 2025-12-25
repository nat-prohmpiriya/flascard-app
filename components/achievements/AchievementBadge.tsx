'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, ArrowRight } from 'lucide-react';
import { AchievementWithStatus } from '@/types';
import { TIER_COLORS } from '@/data/achievements';

interface AchievementBadgeProps {
  totalUnlocked: number;
  totalAchievements: number;
  recentUnlock?: AchievementWithStatus;
}

export function AchievementBadge({
  totalUnlocked,
  totalAchievements,
  recentUnlock,
}: AchievementBadgeProps) {
  const progressPercent = Math.round(
    (totalUnlocked / totalAchievements) * 100
  );

  return (
    <Link href="/achievements">
      <Card className="hover:border-primary transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="font-semibold">Achievements</p>
                <p className="text-sm text-muted-foreground">
                  {totalUnlocked} / {totalAchievements} unlocked
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-lg font-bold">
              {progressPercent}%
            </Badge>
          </div>

          {recentUnlock && (
            <div
              className={`flex items-center gap-2 p-2 rounded-lg ${
                TIER_COLORS[recentUnlock.tier].bg
              }`}
            >
              <span className="text-xl">{recentUnlock.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  Latest: {recentUnlock.name}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          )}

          {!recentUnlock && (
            <div className="flex items-center justify-center gap-2 p-2 text-sm text-muted-foreground">
              <span>View all achievements</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
