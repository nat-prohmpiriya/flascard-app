'use client';

import { StudyPattern } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface StudyPatternChartProps {
  patterns: StudyPattern | null;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = [
  '12am',
  '',
  '',
  '3am',
  '',
  '',
  '6am',
  '',
  '',
  '9am',
  '',
  '',
  '12pm',
  '',
  '',
  '3pm',
  '',
  '',
  '6pm',
  '',
  '',
  '9pm',
  '',
  '',
];

export function StudyPatternChart({ patterns }: StudyPatternChartProps) {
  if (!patterns) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Study Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Not enough data to show patterns
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxHour = Math.max(...patterns.hourOfDay, 1);
  const maxDay = Math.max(...patterns.dayOfWeek, 1);

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Study Patterns
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Best Time Summary */}
        <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Best Hour</p>
            <p className="text-lg font-semibold">
              {formatHour(patterns.bestHour)}
            </p>
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Best Day</p>
            <p className="text-lg font-semibold">{DAYS[patterns.bestDay]}</p>
          </div>
        </div>

        {/* Hour of Day Chart */}
        <div>
          <p className="text-sm font-medium mb-3">Hour of Day</p>
          <div className="flex items-end gap-0.5 h-24">
            {patterns.hourOfDay.map((count, hour) => {
              const height = (count / maxHour) * 100;
              const isBest = hour === patterns.bestHour;

              return (
                <div
                  key={hour}
                  className="flex-1 flex flex-col items-center group relative"
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-1 hidden group-hover:block z-10">
                    <div className="bg-popover text-popover-foreground text-xs rounded px-2 py-1 shadow-md whitespace-nowrap">
                      {formatHour(hour)}: {count} cards
                    </div>
                  </div>

                  <div
                    className={`w-full rounded-t transition-all ${
                      isBest
                        ? 'bg-primary'
                        : count > 0
                        ? 'bg-primary/40 hover:bg-primary/60'
                        : 'bg-muted'
                    }`}
                    style={{
                      height: `${Math.max(height, 2)}%`,
                      minHeight: count > 0 ? '4px' : '2px',
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            {HOURS.map((label, i) => (
              <span key={i} className="w-4 text-center">
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Day of Week Chart */}
        <div>
          <p className="text-sm font-medium mb-3">Day of Week</p>
          <div className="flex gap-2">
            {patterns.dayOfWeek.map((count, day) => {
              const height = (count / maxDay) * 100;
              const isBest = day === patterns.bestDay;

              return (
                <div key={day} className="flex-1 flex flex-col items-center">
                  <div className="w-full h-16 flex items-end justify-center">
                    <div
                      className={`w-full max-w-12 rounded-t transition-all ${
                        isBest
                          ? 'bg-primary'
                          : count > 0
                          ? 'bg-primary/40'
                          : 'bg-muted'
                      }`}
                      style={{
                        height: `${Math.max(height, 5)}%`,
                        minHeight: count > 0 ? '4px' : '2px',
                      }}
                    />
                  </div>
                  <span
                    className={`text-xs mt-2 ${
                      isBest ? 'font-semibold text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {DAYS[day]}
                  </span>
                  <span className="text-xs text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
