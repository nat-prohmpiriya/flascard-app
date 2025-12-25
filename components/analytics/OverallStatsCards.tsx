'use client';

import { OverallStats } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { formatStudyTime } from '@/services/analytics';
import {
  BookOpen,
  Clock,
  Target,
  Flame,
  Trophy,
  GraduationCap,
  BookMarked,
  Sparkles,
} from 'lucide-react';

interface OverallStatsCardsProps {
  stats: OverallStats | null;
}

export function OverallStatsCards({ stats }: OverallStatsCardsProps) {
  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                <div className="h-8 bg-muted rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Cards Studied',
      value: stats.totalCardsStudied.toLocaleString(),
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      title: 'Study Time',
      value: formatStudyTime(stats.totalStudyTime),
      icon: Clock,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
    },
    {
      title: 'Accuracy',
      value: `${stats.averageAccuracy}%`,
      icon: Target,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900',
    },
    {
      title: 'Current Streak',
      value: `${stats.currentStreak} days`,
      subtitle: `Best: ${stats.bestStreak} days`,
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
    },
  ];

  const cardStats = [
    {
      title: 'Mastered',
      value: stats.cardsMastered,
      icon: Trophy,
      color: 'text-yellow-500',
    },
    {
      title: 'Learning',
      value: stats.cardsLearning,
      icon: GraduationCap,
      color: 'text-blue-500',
    },
    {
      title: 'New',
      value: stats.cardsNew,
      icon: Sparkles,
      color: 'text-gray-500',
    },
    {
      title: 'Sessions',
      value: stats.totalSessions,
      icon: BookMarked,
      color: 'text-indigo-500',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  {stat.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.subtitle}
                    </p>
                  )}
                </div>
                <div
                  className={`h-12 w-12 rounded-full ${stat.bgColor} flex items-center justify-center`}
                >
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Card Progress Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {cardStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-lg font-semibold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
