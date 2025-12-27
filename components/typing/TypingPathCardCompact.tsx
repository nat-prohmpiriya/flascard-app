'use client';

import { TypingPath } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Keyboard, Pin, PinOff, Play } from 'lucide-react';
import { usePinnedTypingPaths } from '@/hooks/usePinnedPaths';
import Link from 'next/link';
import { toast } from 'sonner';

interface TypingPathCardCompactProps {
  path: TypingPath;
}

export function TypingPathCardCompact({ path }: TypingPathCardCompactProps) {
  const { isPinned, togglePin, canPinMore } = usePinnedTypingPaths();
  const pathIsPinned = isPinned(path.id);

  const completedCount = path.stages.filter((s) => s.status === 'completed').length;
  const overallProgress = path.stages.length > 0
    ? Math.round((completedCount / path.stages.length) * 100)
    : 0;
  const activeStage = path.stages.find((s) => s.status === 'active');

  const statusColors = {
    active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };

  const handlePinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!pathIsPinned && !canPinMore) {
      toast.error('Maximum 6 pinned typing paths');
      return;
    }
    togglePin(path.id);
  };

  return (
    <Card className="hover:border-primary transition-colors group">
      <CardContent className="p-4">
        {/* Header: Icon + Name + Pin */}
        <div className="flex items-start gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Keyboard className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-sm truncate">{path.name}</h3>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 ${pathIsPinned ? 'text-primary' : 'opacity-0 group-hover:opacity-100'}`}
                  onClick={handlePinClick}
                >
                  {pathIsPinned ? (
                    <PinOff className="h-3.5 w-3.5" />
                  ) : (
                    <Pin className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Badge className={`text-xs ${statusColors[path.status]}`}>
                  {path.status}
                </Badge>
              </div>
            </div>
            {path.description && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {path.description}
              </p>
            )}
          </div>
        </div>

        {/* Current Stage */}
        {activeStage && (
          <div className="mb-3 p-2 rounded-md bg-muted/50">
            <p className="text-xs text-muted-foreground">Currently practicing:</p>
            <p className="text-sm font-medium truncate">{activeStage.snippetTitle}</p>
          </div>
        )}

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-1.5" />
        </div>

        {/* Footer: Stages count + Practice button */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {completedCount}/{path.stages.length} snippets
          </span>
          <Link href={`/typing/paths/${path.id}`}>
            <Button size="sm" variant="default" className="h-7 text-xs">
              <Play className="h-3 w-3 mr-1" />
              {activeStage ? 'Practice' : 'View'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
