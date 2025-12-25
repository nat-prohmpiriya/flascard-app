'use client';

import { CalendarDay, StudySession } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CheckCircle, XCircle, Clock } from 'lucide-react';

interface CalendarDayDetailProps {
  day: CalendarDay | null;
  sessions: StudySession[];
}

export function CalendarDayDetail({ day, sessions }: CalendarDayDetailProps) {
  if (!day) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Click on a day to see details
        </CardContent>
      </Card>
    );
  }

  const accuracy =
    day.correctCount + day.incorrectCount > 0
      ? Math.round(
          (day.correctCount / (day.correctCount + day.incorrectCount)) * 100
        )
      : 0;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{formatDate(day.date)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Cards</p>
              <p className="font-medium">{day.cardsStudied}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Correct</p>
              <p className="font-medium">{day.correctCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Incorrect</p>
              <p className="font-medium">{day.incorrectCount}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Accuracy</p>
            <p className="font-medium">{accuracy}%</p>
          </div>
        </div>

        {/* Sessions List */}
        {sessions.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Sessions ({sessions.length})</h4>
            <div className="space-y-2">
              {sessions.map((session) => {
                const sessionAccuracy =
                  session.correctCount + session.incorrectCount > 0
                    ? Math.round(
                        (session.correctCount /
                          (session.correctCount + session.incorrectCount)) *
                          100
                      )
                    : 0;

                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {formatTime(session.completedAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="secondary">
                        {session.cardsStudied} cards
                      </Badge>
                      <span className="text-muted-foreground">
                        {formatDuration(session.duration)}
                      </span>
                      <span
                        className={
                          sessionAccuracy >= 70
                            ? 'text-green-500'
                            : 'text-red-500'
                        }
                      >
                        {sessionAccuracy}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {day.cardsStudied === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No study sessions on this day
          </p>
        )}
      </CardContent>
    </Card>
  );
}
