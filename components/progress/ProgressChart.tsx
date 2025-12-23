'use client';

import { DailyProgress } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProgressChartProps {
  data: DailyProgress[];
}

export function ProgressChart({ data }: ProgressChartProps) {
  const maxCards = Math.max(...data.map((d) => d.cardsStudied), 1);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Weekly Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2 h-32">
          {data.map((day, index) => {
            const height = (day.cardsStudied / maxCards) * 100;
            const accuracy =
              day.cardsStudied > 0
                ? Math.round((day.correctCount / day.cardsStudied) * 100)
                : 0;

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full relative" style={{ height: '100px' }}>
                  <div
                    className="absolute bottom-0 w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${day.cardsStudied} cards (${accuracy}% accuracy)`}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(day.date)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between mt-4 text-sm text-muted-foreground">
          <span>
            Total:{' '}
            <span className="font-medium text-foreground">
              {data.reduce((sum, d) => sum + d.cardsStudied, 0)} cards
            </span>
          </span>
          <span>
            Avg accuracy:{' '}
            <span className="font-medium text-foreground">
              {Math.round(
                data.reduce((sum, d) => sum + (d.cardsStudied > 0 ? d.correctCount / d.cardsStudied : 0), 0) /
                  data.filter((d) => d.cardsStudied > 0).length * 100 || 0
              )}%
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
