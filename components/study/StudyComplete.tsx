'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, RotateCcw, Home, TrendingUp } from 'lucide-react';

interface StudyCompleteProps {
  stats: {
    total: number;
    correct: number;
    incorrect: number;
  };
  onRestart: () => void;
  deckId?: string;
}

export function StudyComplete({ stats, onRestart, deckId }: StudyCompleteProps) {
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  const getMessage = () => {
    if (accuracy >= 90) return { text: 'Excellent!', emoji: '🎉' };
    if (accuracy >= 70) return { text: 'Good job!', emoji: '👍' };
    if (accuracy >= 50) return { text: 'Keep practicing!', emoji: '💪' };
    return { text: 'Don\'t give up!', emoji: '📚' };
  };

  const message = getMessage();

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {message.emoji} {message.text}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Cards</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">{stats.correct}</p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">{stats.incorrect}</p>
              <p className="text-sm text-muted-foreground">Incorrect</p>
            </div>
          </div>

          {/* Accuracy */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-medium">Accuracy</span>
            </div>
            <p className="text-3xl font-bold">{accuracy}%</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button onClick={onRestart} className="w-full">
              <RotateCcw className="mr-2 h-4 w-4" />
              Study Again
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
