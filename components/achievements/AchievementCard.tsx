'use client';

import { AchievementWithStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TIER_COLORS } from '@/data/achievements';
import { Lock, CheckCircle } from 'lucide-react';

interface AchievementCardProps {
  achievement: AchievementWithStatus;
  compact?: boolean;
}

export function AchievementCard({ achievement, compact = false }: AchievementCardProps) {
  const tierColors = TIER_COLORS[achievement.tier];
  const progressPercent = Math.min(
    (achievement.progress / achievement.maxProgress) * 100,
    100
  );

  if (compact) {
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border ${
          achievement.unlocked
            ? `${tierColors.bg} ${tierColors.border} border-2`
            : 'bg-muted/30 opacity-60'
        }`}
      >
        <span className="text-2xl">{achievement.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{achievement.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {achievement.description}
          </p>
        </div>
        {achievement.unlocked ? (
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
        ) : (
          <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
      </div>
    );
  }

  return (
    <Card
      className={`overflow-hidden transition-all ${
        achievement.unlocked
          ? `${tierColors.border} border-2 shadow-lg`
          : 'opacity-70'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
              achievement.unlocked
                ? `bg-gradient-to-br ${tierColors.gradient} shadow-md`
                : 'bg-muted'
            }`}
          >
            {achievement.unlocked ? (
              achievement.icon
            ) : (
              <Lock className="h-6 w-6 text-muted-foreground" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{achievement.name}</h3>
              <Badge
                variant="outline"
                className={`text-xs capitalize ${tierColors.text} ${tierColors.bg}`}
              >
                {achievement.tier}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {achievement.description}
            </p>

            {/* Progress */}
            {!achievement.unlocked && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>
                    {achievement.progress} / {achievement.maxProgress}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            )}

            {/* Unlocked date */}
            {achievement.unlocked && achievement.unlockedAt && (
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Unlocked{' '}
                {achievement.unlockedAt.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
