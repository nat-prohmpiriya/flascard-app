'use client';

import { CalendarMonth, CalendarDay } from '@/types';
import { cn } from '@/lib/utils';

interface CalendarHeatmapProps {
  months: CalendarMonth[];
  onDayClick: (day: CalendarDay) => void;
  selectedDate?: string;
}

export function CalendarHeatmap({
  months,
  onDayClick,
  selectedDate,
}: CalendarHeatmapProps) {
  const intensityColors = {
    0: 'bg-muted',
    1: 'bg-green-200 dark:bg-green-900',
    2: 'bg-green-400 dark:bg-green-700',
    3: 'bg-green-600 dark:bg-green-500',
    4: 'bg-green-800 dark:bg-green-300',
  };

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-end gap-2 text-sm">
        <span className="text-muted-foreground">Less</span>
        {([0, 1, 2, 3, 4] as const).map((level) => (
          <div
            key={level}
            className={cn('w-3 h-3 rounded-sm', intensityColors[level])}
          />
        ))}
        <span className="text-muted-foreground">More</span>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex gap-6">
          {months.map((month) => {
            // Calculate empty cells before first day
            const firstDayOfMonth = month.days.length > 0
              ? new Date(month.days[0].date).getDay()
              : 0;

            return (
              <div key={`${month.year}-${month.month}`} className="space-y-2">
                {/* Month Label */}
                <h4 className="text-sm font-medium text-center">
                  {new Date(month.year, month.month - 1).toLocaleDateString(
                    'en-US',
                    { month: 'short' }
                  )}
                </h4>

                {/* Week Headers */}
                <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground">
                  {weekDays.map((day, i) => (
                    <div key={`${month.year}-${month.month}-header-${i}`} className="w-4 h-4 text-center">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for days before first day of month */}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${month.year}-${month.month}-${i}`} className="w-4 h-4" />
                  ))}

                  {/* Actual days */}
                  {month.days.map((day) => (
                    <button
                      key={day.date}
                      onClick={() => onDayClick(day)}
                      className={cn(
                        'w-4 h-4 rounded-sm transition-all hover:ring-2 hover:ring-primary hover:ring-offset-1',
                        intensityColors[day.intensity],
                        selectedDate === day.date && 'ring-2 ring-primary ring-offset-1'
                      )}
                      title={`${day.date}: ${day.cardsStudied} cards`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
