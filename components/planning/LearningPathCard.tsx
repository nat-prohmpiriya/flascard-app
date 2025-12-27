'use client';

import { useState } from 'react';
import { LearningPath } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { PathStageList } from './PathStageList';
import {
  calculateOverallProgress,
  getCompletedStagesCount,
} from '@/services/learningPath';
import {
  MoreVertical,
  RefreshCw,
  Edit,
  Trash2,
  Pause,
  Play,
  ChevronDown,
  ChevronUp,
  Route,
  CheckCircle,
  Clock,
  Pin,
  PinOff,
} from 'lucide-react';
import { usePinnedPaths } from '@/hooks/usePinnedPaths';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface LearningPathCardProps {
  path: LearningPath;
  onEdit: (path: LearningPath) => void;
  onDelete: (path: LearningPath) => void;
  onRefresh: (pathId: string) => void;
  onPause: (pathId: string) => void;
  onResume: (pathId: string) => void;
}

export function LearningPathCard({
  path,
  onEdit,
  onDelete,
  onRefresh,
  onPause,
  onResume,
}: LearningPathCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isPinned, togglePin, canPinMore } = usePinnedPaths();
  const pathIsPinned = isPinned(path.id);

  const overallProgress = calculateOverallProgress(path);
  const completedCount = getCompletedStagesCount(path);

  const statusConfig = {
    active: {
      icon: Clock,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      label: 'Active',
    },
    completed: {
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      label: 'Completed',
    },
    paused: {
      icon: Pause,
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      label: 'Paused',
    },
  };

  const { icon: StatusIcon, color, label } = statusConfig[path.status];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Route className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{path.name}</CardTitle>
              {path.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {path.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {label}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onRefresh(path.id)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Progress
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => togglePin(path.id)}
                  disabled={!pathIsPinned && !canPinMore}
                >
                  {pathIsPinned ? (
                    <>
                      <PinOff className="mr-2 h-4 w-4" />
                      Unpin from Dashboard
                    </>
                  ) : (
                    <>
                      <Pin className="mr-2 h-4 w-4" />
                      Pin to Dashboard
                    </>
                  )}
                </DropdownMenuItem>
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
                <DropdownMenuItem onClick={() => onEdit(path)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(path)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Stages Summary */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {completedCount} / {path.stages.length} stages completed
          </span>
          <span className="text-muted-foreground">
            Target: {path.stages[0]?.targetAccuracy || 70}% accuracy
          </span>
        </div>

        {/* Expandable Stages */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <span>View Stages</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <PathStageList stages={path.stages} />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
