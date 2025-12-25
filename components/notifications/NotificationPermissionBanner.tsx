'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';

interface NotificationPermissionBannerProps {
  permission: NotificationPermission | 'unsupported';
  onRequestPermission: () => Promise<boolean>;
}

export function NotificationPermissionBanner({
  permission,
  onRequestPermission,
}: NotificationPermissionBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Don't show if already granted, denied, unsupported, or dismissed
  if (
    permission === 'granted' ||
    permission === 'denied' ||
    permission === 'unsupported' ||
    dismissed
  ) {
    return null;
  }

  const handleEnable = async () => {
    setLoading(true);
    await onRequestPermission();
    setLoading(false);
  };

  return (
    <div className="relative p-4 mb-4 rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted/50 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="flex items-center gap-4 pr-8">
        <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
          <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold">Stay on Track with Reminders</h3>
          <p className="text-sm text-muted-foreground">
            Enable notifications to get daily study reminders and streak alerts
          </p>
        </div>

        <Button onClick={handleEnable} disabled={loading}>
          {loading ? 'Enabling...' : 'Enable'}
        </Button>
      </div>
    </div>
  );
}
