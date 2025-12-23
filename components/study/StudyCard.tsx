'use client';

import { Card, ReviewQuality } from '@/types';
import { FlashCard } from '@/components/flashcard/FlashCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { XCircle, HelpCircle, ThumbsUp, CheckCircle } from 'lucide-react';

interface StudyCardProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
  onAnswer: (quality: ReviewQuality) => void;
  stats: {
    total: number;
    correct: number;
    incorrect: number;
    remaining: number;
  };
}

export function StudyCard({ card, isFlipped, onFlip, onAnswer, stats }: StudyCardProps) {
  const progress = ((stats.total - stats.remaining) / stats.total) * 100;

  const answerButtons: { quality: ReviewQuality; label: string; icon: React.ReactNode; variant: 'destructive' | 'secondary' | 'default' | 'outline' }[] = [
    { quality: 0, label: 'Again', icon: <XCircle className="h-4 w-4" />, variant: 'destructive' },
    { quality: 2, label: 'Hard', icon: <HelpCircle className="h-4 w-4" />, variant: 'secondary' },
    { quality: 3, label: 'Good', icon: <ThumbsUp className="h-4 w-4" />, variant: 'outline' },
    { quality: 5, label: 'Easy', icon: <CheckCircle className="h-4 w-4" />, variant: 'default' },
  ];

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{stats.total - stats.remaining} / {stats.total}</span>
          <span>
            <span className="text-green-500">{stats.correct}</span>
            {' / '}
            <span className="text-red-500">{stats.incorrect}</span>
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Card */}
      <FlashCard card={card} isFlipped={isFlipped} onFlip={onFlip} showAudio />

      {/* Answer Buttons */}
      {isFlipped && (
        <div className="grid grid-cols-4 gap-2">
          {answerButtons.map((btn) => (
            <Button
              key={btn.quality}
              variant={btn.variant}
              className="flex flex-col gap-1 h-auto py-3"
              onClick={() => onAnswer(btn.quality)}
            >
              {btn.icon}
              <span className="text-xs">{btn.label}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Flip instruction */}
      {!isFlipped && (
        <p className="text-center text-muted-foreground text-sm">
          Think of the answer, then click the card to reveal
        </p>
      )}
    </div>
  );
}
