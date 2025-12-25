'use client';

import { Goal } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { formatPeriodLabel } from '@/services/goal';
import {
  Target,
  TrendingUp,
  Flame,
  Calendar,
  MoreVertical,
  RefreshCw,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
  onRefresh: (goalId: string) => void;
}

export function GoalCard({ goal, onEdit, onDelete, onRefresh }: GoalCardProps) {
  // Calculate progress percentages
  const cardProgress = Math.min(
    (goal.progress.cardsStudied / goal.targets.cardsToStudy) * 100,
    100
  );
  const accuracyProgress = goal.targets.accuracy
    ? Math.min((goal.progress.accuracy / goal.targets.accuracy) * 100, 100)
    : 100;
  const streakProgress = goal.targets.streakDays
    ? Math.min((goal.progress.currentStreak / goal.targets.streakDays) * 100, 100)
    : 100;

  const overallProgress = Math.round(
    (cardProgress + accuracyProgress + streakProgress) / 3
  );

  const statusConfig = {
    active: { icon: Clock, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'Active' },
    completed: { icon: CheckCircle, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Completed' },
    failed: { icon: XCircle, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'Failed' },
  };

  const { icon: StatusIcon, color, label } = statusConfig[goal.status];

  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <Badge variant="outline" className="mb-2">
              {goal.type === 'weekly' ? 'Weekly' : 'Monthly'}
            </Badge>
            <CardTitle className="text-lg">
              {formatPeriodLabel(goal.type, goal.period)}
            </CardTitle>
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
                <DropdownMenuItem onClick={() => onRefresh(goal.id)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(goal)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(goal)}
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

        {/* Individual Targets */}
        <div className="space-y-3">
          {/* Cards Target */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-sm">
                <span>Cards Studied</span>
                <span className="font-medium">
                  {goal.progress.cardsStudied} / {goal.targets.cardsToStudy}
                </span>
              </div>
              <Progress value={cardProgress} className="h-1.5 mt-1" />
            </div>
          </div>

          {/* Accuracy Target */}
          {goal.targets.accuracy && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm">
                  <span>Accuracy</span>
                  <span className="font-medium">
                    {goal.progress.accuracy}% / {goal.targets.accuracy}%
                  </span>
                </div>
                <Progress value={accuracyProgress} className="h-1.5 mt-1" />
              </div>
            </div>
          )}

          {/* Streak Target */}
          {goal.targets.streakDays && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm">
                  <span>Streak Days</span>
                  <span className="font-medium">
                    {goal.progress.currentStreak} / {goal.targets.streakDays}
                  </span>
                </div>
                <Progress value={streakProgress} className="h-1.5 mt-1" />
              </div>
            </div>
          )}

          {/* Days with Study */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-sm">
                <span>Days Studied</span>
                <span className="font-medium">{goal.progress.daysWithStudy} days</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
