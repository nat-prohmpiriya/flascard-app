'use client';

import { TimeStats } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface TimeChartProps {
  data: TimeStats[];
  title?: string;
}

export function TimeChart({ data, title = 'Cards Studied Over Time' }: TimeChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No data available for this period
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCards = Math.max(...data.map((d) => d.cardsStudied), 1);
  const totalCards = data.reduce((sum, d) => sum + d.cardsStudied, 0);
  const avgCards = Math.round(totalCards / data.length);
  const avgAccuracy =
    data.filter((d) => d.cardsStudied > 0).length > 0
      ? Math.round(
          data
            .filter((d) => d.cardsStudied > 0)
            .reduce((sum, d) => sum + d.accuracy, 0) /
            data.filter((d) => d.cardsStudied > 0).length
        )
      : 0;

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {title}
          </CardTitle>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total: </span>
              <span className="font-semibold">{totalCards} cards</span>
            </div>
            <div>
              <span className="text-muted-foreground">Avg: </span>
              <span className="font-semibold">{avgCards}/day</span>
            </div>
            <div>
              <span className="text-muted-foreground">Accuracy: </span>
              <span className="font-semibold">{avgAccuracy}%</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Bar Chart */}
        <div className="flex items-end gap-1 h-48">
          {data.map((day, index) => {
            const height = (day.cardsStudied / maxCards) * 100;
            const isToday = index === data.length - 1;

            return (
              <div
                key={day.period}
                className="flex-1 flex flex-col items-center group relative"
              >
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                  <div className="bg-popover text-popover-foreground text-xs rounded-md px-2 py-1 shadow-md whitespace-nowrap">
                    <div className="font-medium">{formatDate(day.period)}</div>
                    <div>{day.cardsStudied} cards</div>
                    {day.cardsStudied > 0 && (
                      <div>{day.accuracy}% accuracy</div>
                    )}
                  </div>
                </div>

                {/* Bar */}
                <div
                  className={`w-full rounded-t transition-all ${
                    isToday
                      ? 'bg-primary'
                      : day.cardsStudied > 0
                      ? 'bg-primary/60 hover:bg-primary/80'
                      : 'bg-muted'
                  }`}
                  style={{
                    height: `${Math.max(height, 2)}%`,
                    minHeight: '4px',
                  }}
                />

                {/* Date label (show every few days) */}
                {(index === 0 ||
                  index === data.length - 1 ||
                  index % Math.ceil(data.length / 7) === 0) && (
                  <span className="text-xs text-muted-foreground mt-2 truncate w-full text-center">
                    {formatDate(day.period)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
