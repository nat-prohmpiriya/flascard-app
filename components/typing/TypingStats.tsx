'use client';

import { TypingStats as Stats } from '@/hooks/useTypingGame';
import { Card, CardContent } from '@/components/ui/card';
import { Gauge, Target, Clock, Keyboard } from 'lucide-react';

interface TypingStatsProps {
  stats: Stats;
  showDetailed?: boolean;
}

export function TypingStats({ stats, showDetailed = false }: TypingStatsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`grid gap-4 ${showDetailed ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-4'}`}>
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-full bg-blue-500/10">
            <Gauge className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">WPM</p>
            <p className="text-2xl font-bold">{stats.wpm}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-full bg-green-500/10">
            <Target className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Accuracy</p>
            <p className="text-2xl font-bold">{stats.accuracy}%</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-full bg-orange-500/10">
            <Clock className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Time</p>
            <p className="text-2xl font-bold">{formatTime(stats.elapsedTime)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-full bg-purple-500/10">
            <Keyboard className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Characters</p>
            <p className="text-2xl font-bold">{stats.totalChars}</p>
          </div>
        </CardContent>
      </Card>

      {showDetailed && (
        <>
          <Card className="col-span-2">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-2">Correct / Incorrect</p>
              <div className="flex items-center gap-4">
                <span className="text-green-500 font-bold text-xl">
                  {stats.correctChars} correct
                </span>
                <span className="text-muted-foreground">/</span>
                <span className="text-red-500 font-bold text-xl">
                  {stats.incorrectChars} errors
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-2">Performance</p>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${stats.accuracy}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
