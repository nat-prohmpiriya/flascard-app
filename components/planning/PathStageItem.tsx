'use client';

import { PathStage } from '@/types';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  Circle,
  Lock,
  Play,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';

interface PathStageItemProps {
  stage: PathStage;
  isLast: boolean;
}

export function PathStageItem({ stage, isLast }: PathStageItemProps) {
  const progressPercent =
    stage.progress.totalCards > 0
      ? Math.min(
          (stage.progress.cardsStudied / stage.progress.totalCards) * 100,
          100
        )
      : 0;

  const statusConfig = {
    locked: {
      icon: Lock,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      label: 'Locked',
    },
    active: {
      icon: Circle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      label: 'In Progress',
    },
    completed: {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900',
      label: 'Completed',
    },
  };

  const { icon: StatusIcon, color, bgColor, label } = statusConfig[stage.status];

  return (
    <div className="flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div
          className={`h-10 w-10 rounded-full ${bgColor} flex items-center justify-center`}
        >
          <StatusIcon className={`h-5 w-5 ${color}`} />
        </div>
        {!isLast && (
          <div className="w-0.5 h-full bg-border min-h-[60px]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {stage.deckName}
            </h4>
            <Badge variant="outline" className="mt-1">
              {label}
            </Badge>
          </div>

          {stage.status === 'active' && (
            <Button size="sm" asChild>
              <Link href={`/study/${stage.deckId}`}>
                <Play className="mr-1 h-3 w-3" />
                Study
              </Link>
            </Button>
          )}
        </div>

        {/* Progress */}
        {stage.status !== 'locked' && (
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span>
                {stage.progress.cardsStudied} / {stage.progress.totalCards} cards
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Accuracy: {stage.progress.accuracy}%
              </span>
              <span className="text-muted-foreground">
                Target: {stage.targetAccuracy}%
              </span>
            </div>

            {stage.progress.completedAt && (
              <p className="text-xs text-green-500">
                Completed on{' '}
                {stage.progress.completedAt.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
