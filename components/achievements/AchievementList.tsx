'use client';

import { AchievementWithStatus, AchievementCategory } from '@/types';
import { AchievementCard } from './AchievementCard';
import { CATEGORY_LABELS } from '@/data/achievements';

interface AchievementListProps {
  achievements: AchievementWithStatus[];
  groupByCategory?: boolean;
  compact?: boolean;
}

export function AchievementList({
  achievements,
  groupByCategory = false,
  compact = false,
}: AchievementListProps) {
  if (achievements.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No achievements to display
      </div>
    );
  }

  if (!groupByCategory) {
    return (
      <div
        className={`grid gap-4 ${
          compact
            ? 'grid-cols-1'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {achievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            compact={compact}
          />
        ))}
      </div>
    );
  }

  // Group by category
  const categories = Array.from(
    new Set(achievements.map((a) => a.category))
  ) as AchievementCategory[];

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const categoryAchievements = achievements.filter(
          (a) => a.category === category
        );
        const { label, icon } = CATEGORY_LABELS[category];
        const unlockedCount = categoryAchievements.filter(
          (a) => a.unlocked
        ).length;

        return (
          <div key={category}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{icon}</span>
              <h3 className="text-lg font-semibold">{label}</h3>
              <span className="text-sm text-muted-foreground">
                ({unlockedCount}/{categoryAchievements.length})
              </span>
            </div>
            <div
              className={`grid gap-4 ${
                compact
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {categoryAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  compact={compact}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
