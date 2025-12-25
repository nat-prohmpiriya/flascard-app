'use client';

import { OverallStats } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from 'lucide-react';

interface CardDistributionProps {
  stats: OverallStats | null;
}

export function CardDistribution({ stats }: CardDistributionProps) {
  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Card Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-48 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const total = stats.cardsMastered + stats.cardsLearning + stats.cardsNew;

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Card Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No cards in your collection
          </div>
        </CardContent>
      </Card>
    );
  }

  const masteredPercent = Math.round((stats.cardsMastered / total) * 100);
  const learningPercent = Math.round((stats.cardsLearning / total) * 100);
  const newPercent = Math.round((stats.cardsNew / total) * 100);

  // Calculate stroke dasharray for donut chart
  const circumference = 2 * Math.PI * 40; // radius = 40

  const segments = [
    {
      label: 'Mastered',
      count: stats.cardsMastered,
      percent: masteredPercent,
      color: 'text-green-500',
      strokeColor: '#22c55e',
    },
    {
      label: 'Learning',
      count: stats.cardsLearning,
      percent: learningPercent,
      color: 'text-blue-500',
      strokeColor: '#3b82f6',
    },
    {
      label: 'New',
      count: stats.cardsNew,
      percent: newPercent,
      color: 'text-gray-400',
      strokeColor: '#9ca3af',
    },
  ];

  // Calculate offsets for each segment
  let currentOffset = 0;
  const segmentsWithOffset = segments.map((segment) => {
    const dashArray = (segment.percent / 100) * circumference;
    const offset = currentOffset;
    currentOffset += dashArray;
    return { ...segment, dashArray, offset };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Card Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Donut Chart */}
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                className="text-muted"
              />
              {/* Segments */}
              {segmentsWithOffset.map((segment, index) => (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={segment.strokeColor}
                  strokeWidth="12"
                  strokeDasharray={`${segment.dashArray} ${circumference}`}
                  strokeDashoffset={-segment.offset}
                  className="transition-all duration-500"
                />
              ))}
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{total}</span>
              <span className="text-xs text-muted-foreground">cards</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-3">
            {segments.map((segment) => (
              <div key={segment.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: segment.strokeColor }}
                  />
                  <span className="text-sm">{segment.label}</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{segment.count}</span>
                  <span className="text-muted-foreground text-sm ml-1">
                    ({segment.percent}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress bars alternative view */}
        <div className="mt-6 space-y-2">
          {segments.map((segment) => (
            <div key={segment.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className={segment.color}>{segment.label}</span>
                <span className="text-muted-foreground">{segment.percent}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${segment.percent}%`,
                    backgroundColor: segment.strokeColor,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
