'use client';

import Link from 'next/link';
import { TypingPath } from '@/types';
import {
  calculateOverallProgress,
  getCompletedStagesCount,
  getAverageWpm,
  getAverageAccuracy,
} from '@/services/typingPath';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Route,
  Play,
  Pause,
  MoreVertical,
  Trash2,
  Keyboard,
  Target,
  Gauge,
} from 'lucide-react';

interface TypingPathCardProps {
  path: TypingPath;
  onDelete: (path: TypingPath) => void;
  onPause: (pathId: string) => void;
  onResume: (pathId: string) => void;
}

export function TypingPathCard({
  path,
  onDelete,
  onPause,
  onResume,
}: TypingPathCardProps) {
  const progress = calculateOverallProgress(path);
  const completedStages = getCompletedStagesCount(path);
  const avgWpm = getAverageWpm(path);
  const avgAccuracy = getAverageAccuracy(path);
  const currentStage = path.stages.find((s) => s.status === 'active');

  const statusColor = {
    active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Route className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{path.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusColor[path.status]}>{path.status}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {path.status === 'active' ? (
                  <DropdownMenuItem onClick={() => onPause(path.id)}>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </DropdownMenuItem>
                ) : path.status === 'paused' ? (
                  <DropdownMenuItem onClick={() => onResume(path.id)}>
                    <Play className="mr-2 h-4 w-4" />
                    Resume
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(path)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {path.description && (
          <CardDescription className="line-clamp-2">{path.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {completedStages}/{path.stages.length} stages
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Avg WPM:</span>
            <span className="font-medium">{avgWpm || '-'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Avg Acc:</span>
            <span className="font-medium">{avgAccuracy ? `${avgAccuracy}%` : '-'}</span>
          </div>
        </div>

        {/* Current Stage */}
        {currentStage && path.status === 'active' && (
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Current Stage</p>
            <p className="font-medium text-sm">{currentStage.snippetTitle}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {currentStage.languageName}
              </Badge>
              <Badge
                variant="outline"
                className={`text-xs ${
                  currentStage.difficulty === 'easy'
                    ? 'text-green-600'
                    : currentStage.difficulty === 'medium'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {currentStage.difficulty}
              </Badge>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button asChild className="w-full" disabled={path.status === 'completed'}>
          <Link href={`/typing/paths/${path.id}`}>
            <Keyboard className="mr-2 h-4 w-4" />
            {path.status === 'completed' ? 'Completed' : 'Continue Practice'}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
