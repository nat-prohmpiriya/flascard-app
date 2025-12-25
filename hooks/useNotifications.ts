'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationSettings, DEFAULT_NOTIFICATION_SETTINGS } from '@/types';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  registerServiceWorker,
  getNotificationSettings,
  saveNotificationSettings,
  scheduleStudyReminder,
  scheduleStreakReminder,
  clearScheduledReminders,
  showNotification,
  sendTestNotification,
  NOTIFICATION_MESSAGES,
} from '@/services/notification';
import { toast } from 'sonner';

export function useNotifications() {
  const { firebaseUser, user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [isSupported, setIsSupported] = useState(false);

  // Check support and permission on mount
  useEffect(() => {
    const supported = isNotificationSupported();
    setIsSupported(supported);

    if (supported) {
      setPermission(getNotificationPermission());
    } else {
      setPermission('unsupported');
    }
  }, []);

  // Load settings when user is available
  useEffect(() => {
    if (!firebaseUser) {
      setSettings(DEFAULT_NOTIFICATION_SETTINGS);
      setLoading(false);
      return;
    }

    const loadSettings = async () => {
      try {
        setLoading(true);
        const userSettings = await getNotificationSettings(firebaseUser.uid);
        setSettings(userSettings);
      } catch (error) {
        console.error('Error loading notification settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [firebaseUser]);

  // Register service worker and set up reminders when settings change
  useEffect(() => {
    if (permission !== 'granted' || !settings.enabled) {
      clearScheduledReminders();
      return;
    }

    // Register service worker
    registerServiceWorker();

    // Set up study reminder
    if (settings.studyReminder.enabled) {
      const today = new Date().getDay();
      if (settings.studyReminder.days.includes(today)) {
        scheduleStudyReminder(settings.studyReminder.time, () => {
          showNotification(
            NOTIFICATION_MESSAGES.studyReminder.title,
            NOTIFICATION_MESSAGES.studyReminder.body,
            { tag: 'study-reminder', url: '/dashboard' }
          );
        });
      }
    }

    // Set up streak reminder
    if (settings.streakReminder.enabled && user?.settings?.streak && user.settings.streak > 0) {
      const hasStudiedToday =
        user.settings.lastStudyDate === new Date().toISOString().split('T')[0];

      scheduleStreakReminder(
        settings.streakReminder.time,
        hasStudiedToday,
        () => {
          const messages = NOTIFICATION_MESSAGES.streakAlert(user.settings.streak);
          showNotification(messages.title, messages.body, {
            tag: 'streak-reminder',
            url: '/dashboard',
          });
        }
      );
    }

    return () => {
      clearScheduledReminders();
    };
  }, [permission, settings, user?.settings?.streak, user?.settings?.lastStudyDate]);

  // Request permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Notifications are not supported in this browser');
      return false;
    }

    try {
      const result = await requestNotificationPermission();
      setPermission(result);

      if (result === 'granted') {
        // Register service worker
        await registerServiceWorker();

        // Enable notifications in settings
        if (firebaseUser) {
          const newSettings = { ...settings, enabled: true };
          await saveNotificationSettings(firebaseUser.uid, newSettings);
          setSettings(newSettings);
        }

        toast.success('Notifications enabled!');
        return true;
      } else if (result === 'denied') {
        toast.error('Notification permission denied');
        return false;
      }

      return false;
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast.error('Failed to request notification permission');
      return false;
    }
  }, [isSupported, firebaseUser, settings]);

  // Update settings
  const updateSettings = useCallback(
    async (newSettings: Partial<NotificationSettings>): Promise<boolean> => {
      if (!firebaseUser) return false;

      try {
        const updatedSettings = { ...settings, ...newSettings };
        const success = await saveNotificationSettings(firebaseUser.uid, updatedSettings);

        if (success) {
          setSettings(updatedSettings);
          toast.success('Settings saved');
          return true;
        }

        toast.error('Failed to save settings');
        return false;
      } catch (error) {
        console.error('Error updating settings:', error);
        toast.error('Failed to save settings');
        return false;
      }
    },
    [firebaseUser, settings]
  );

  // Test notification
  const testNotification = useCallback(async (): Promise<boolean> => {
    if (permission !== 'granted') {
      toast.error('Please enable notifications first');
      return false;
    }

    const success = await sendTestNotification();

    if (success) {
      toast.success('Test notification sent!');
    } else {
      toast.error('Failed to send test notification');
    }

    return success;
  }, [permission]);

  // Send a custom notification
  const sendNotification = useCallback(
    async (title: string, body: string, options?: { tag?: string; url?: string }) => {
      if (permission !== 'granted') return false;
      return showNotification(title, body, options);
    },
    [permission]
  );

  return {
    isSupported,
    permission,
    settings,
    loading,
    requestPermission,
    updateSettings,
    testNotification,
    sendNotification,
  };
}
