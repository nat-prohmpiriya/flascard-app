'use client';

import { PathStage } from '@/types';
import { PathStageItem } from './PathStageItem';

interface PathStageListProps {
  stages: PathStage[];
}

export function PathStageList({ stages }: PathStageListProps) {
  if (stages.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4">
        No stages in this path
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {stages.map((stage, index) => (
        <PathStageItem
          key={`${stage.deckId}-${stage.order}`}
          stage={stage}
          isLast={index === stages.length - 1}
        />
      ))}
    </div>
  );
}
