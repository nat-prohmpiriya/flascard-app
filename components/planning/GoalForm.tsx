'use client';

import { useState } from 'react';
import { Goal, GoalFormData, GoalType, GoalTargets } from '@/types';
import { GOAL_PRESETS } from '@/models/goal';
import { getCurrentPeriod, formatPeriodLabel } from '@/services/goal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface GoalFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: GoalFormData) => Promise<void>;
  initialData?: Goal;
}

export function GoalForm({ open, onClose, onSubmit, initialData }: GoalFormProps) {
  const [type, setType] = useState<GoalType>(initialData?.type || 'weekly');
  const [cardsToStudy, setCardsToStudy] = useState(
    initialData?.targets.cardsToStudy || 100
  );
  const [hasAccuracyTarget, setHasAccuracyTarget] = useState(
    !!initialData?.targets.accuracy
  );
  const [accuracy, setAccuracy] = useState(initialData?.targets.accuracy || 70);
  const [hasStreakTarget, setHasStreakTarget] = useState(
    !!initialData?.targets.streakDays
  );
  const [streakDays, setStreakDays] = useState(initialData?.targets.streakDays || 5);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targets: GoalTargets = {
      cardsToStudy,
      ...(hasAccuracyTarget && { accuracy }),
      ...(hasStreakTarget && { streakDays }),
    };

    setLoading(true);
    try {
      await onSubmit({
        type,
        period: getCurrentPeriod(type),
        targets,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (level: 'beginner' | 'intermediate' | 'advanced') => {
    const preset = GOAL_PRESETS[type][level];
    setCardsToStudy(preset.cardsToStudy);
    setAccuracy(preset.accuracy);
    setStreakDays(preset.streakDays);
    setHasAccuracyTarget(true);
    setHasStreakTarget(true);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Goal' : 'Create New Goal'}
          </DialogTitle>
          <DialogDescription>
            {initialData ? 'Update your learning goal.' : 'Set a new learning goal to track your progress.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Goal Type Tabs */}
            <Tabs value={type} onValueChange={(v) => setType(v as GoalType)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="weekly">Weekly Goal</TabsTrigger>
                <TabsTrigger value="monthly">Monthly Goal</TabsTrigger>
              </TabsList>
              <TabsContent value="weekly" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Set targets for: {formatPeriodLabel('weekly', getCurrentPeriod('weekly'))}
                </p>
              </TabsContent>
              <TabsContent value="monthly" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Set targets for: {formatPeriodLabel('monthly', getCurrentPeriod('monthly'))}
                </p>
              </TabsContent>
            </Tabs>

            {/* Presets */}
            <div>
              <Label className="mb-2 block">Quick Presets</Label>
              <div className="flex gap-2">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-green-100 dark:hover:bg-green-900"
                  onClick={() => applyPreset('beginner')}
                >
                  Beginner
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900"
                  onClick={() => applyPreset('intermediate')}
                >
                  Intermediate
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900"
                  onClick={() => applyPreset('advanced')}
                >
                  Advanced
                </Badge>
              </div>
            </div>

            {/* Cards Target (Required) */}
            <div className="space-y-2">
              <Label htmlFor="cardsToStudy">Cards to Study (Required)</Label>
              <Input
                id="cardsToStudy"
                type="number"
                min={1}
                value={cardsToStudy}
                onChange={(e) => setCardsToStudy(parseInt(e.target.value) || 1)}
                required
              />
            </div>

            {/* Accuracy Target (Optional) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="accuracy">Accuracy Target</Label>
                <Switch
                  checked={hasAccuracyTarget}
                  onCheckedChange={setHasAccuracyTarget}
                />
              </div>
              {hasAccuracyTarget && (
                <div className="flex items-center gap-2">
                  <Input
                    id="accuracy"
                    type="number"
                    min={1}
                    max={100}
                    value={accuracy}
                    onChange={(e) =>
                      setAccuracy(Math.min(100, parseInt(e.target.value) || 1))
                    }
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              )}
            </div>

            {/* Streak Target (Optional) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="streakDays">Streak Days Target</Label>
                <Switch
                  checked={hasStreakTarget}
                  onCheckedChange={setHasStreakTarget}
                />
              </div>
              {hasStreakTarget && (
                <div className="flex items-center gap-2">
                  <Input
                    id="streakDays"
                    type="number"
                    min={1}
                    max={type === 'weekly' ? 7 : 31}
                    value={streakDays}
                    onChange={(e) => setStreakDays(parseInt(e.target.value) || 1)}
                  />
                  <span className="text-muted-foreground">days</span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : initialData ? 'Update Goal' : 'Create Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
