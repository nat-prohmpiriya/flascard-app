'use client';

import { useEffect, useState } from 'react';
import { AchievementWithStatus } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { TIER_COLORS } from '@/data/achievements';
import { Trophy, X } from 'lucide-react';

interface AchievementPopupProps {
  achievements: AchievementWithStatus[];
  onDismiss: (achievementId: string) => void;
  onDismissAll: () => void;
}

export function AchievementPopup({
  achievements,
  onDismiss,
  onDismissAll,
}: AchievementPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (achievements.length > 0) {
      setIsOpen(true);
      setCurrentIndex(0);
    } else {
      setIsOpen(false);
    }
  }, [achievements]);

  if (achievements.length === 0) return null;

  const current = achievements[currentIndex];
  if (!current) return null;

  const tierColors = TIER_COLORS[current.tier];

  const handleNext = () => {
    onDismiss(current.id);
    if (currentIndex < achievements.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsOpen(false);
    }
  };

  const handleDismissAll = () => {
    onDismissAll();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismissAll()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 relative">
            {/* Glow effect */}
            <div
              className={`absolute inset-0 blur-xl opacity-50 bg-gradient-to-br ${tierColors.gradient}`}
            />
            <div
              className={`relative w-24 h-24 rounded-2xl flex items-center justify-center text-5xl bg-gradient-to-br ${tierColors.gradient} shadow-xl`}
            >
              {current.icon}
            </div>
          </div>
          <DialogTitle className="text-xl flex items-center justify-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievement Unlocked!
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <p className="text-lg font-semibold text-foreground">
              {current.name}
            </p>
            <p>{current.description}</p>
            <Badge
              variant="outline"
              className={`capitalize ${tierColors.text} ${tierColors.bg}`}
            >
              {current.tier}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button onClick={handleNext} className="w-full">
            {currentIndex < achievements.length - 1 ? (
              <>
                Next ({currentIndex + 1}/{achievements.length})
              </>
            ) : (
              'Awesome!'
            )}
          </Button>
          {achievements.length > 1 && currentIndex < achievements.length - 1 && (
            <Button
              variant="ghost"
              onClick={handleDismissAll}
              className="w-full"
            >
              <X className="mr-2 h-4 w-4" />
              Dismiss All
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
