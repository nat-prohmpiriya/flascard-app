import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NotificationSettings, DEFAULT_NOTIFICATION_SETTINGS } from '@/types';

// Check if notifications are supported
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

// Check if service worker is supported
export function isServiceWorkerSupported(): boolean {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
}

// Get current permission status
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    throw new Error('Notifications are not supported in this browser');
  }

  const permission = await Notification.requestPermission();
  return permission;
}

// Register service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    console.warn('Service workers are not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service worker registered:', registration.scope);

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;

    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}

// Get service worker registration
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    return registration;
  } catch (error) {
    console.error('Error getting service worker registration:', error);
    return null;
  }
}

// Show a local notification via service worker
export async function showNotification(
  title: string,
  body: string,
  options?: {
    tag?: string;
    url?: string;
    icon?: string;
  }
): Promise<boolean> {
  if (getNotificationPermission() !== 'granted') {
    console.warn('Notification permission not granted');
    return false;
  }

  const registration = await getServiceWorkerRegistration();

  if (!registration) {
    // Fallback to Notification API directly
    try {
      new Notification(title, {
        body,
        icon: options?.icon || '/icon-192.png',
        tag: options?.tag,
      });
      return true;
    } catch (error) {
      console.error('Error showing notification:', error);
      return false;
    }
  }

  // Send message to service worker to show notification
  if (registration.active) {
    registration.active.postMessage({
      type: 'SHOW_NOTIFICATION',
      payload: {
        title,
        body,
        tag: options?.tag,
        url: options?.url,
      },
    });
    return true;
  }

  return false;
}

// Get notification settings from Firestore
export async function getNotificationSettings(
  userId: string
): Promise<NotificationSettings> {
  if (!db) return DEFAULT_NOTIFICATION_SETTINGS;

  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();

    if (userData?.notificationSettings) {
      return {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        ...userData.notificationSettings,
      };
    }

    return DEFAULT_NOTIFICATION_SETTINGS;
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

// Save notification settings to Firestore
export async function saveNotificationSettings(
  userId: string,
  settings: NotificationSettings
): Promise<boolean> {
  if (!db) return false;

  try {
    await updateDoc(doc(db, 'users', userId), {
      notificationSettings: settings,
    });
    return true;
  } catch (error) {
    console.error('Error saving notification settings:', error);
    return false;
  }
}

// Schedule a study reminder (using setTimeout for in-app)
let studyReminderTimeout: NodeJS.Timeout | null = null;
let streakReminderTimeout: NodeJS.Timeout | null = null;

export function scheduleStudyReminder(
  time: string, // "HH:mm" format
  callback: () => void
): void {
  // Clear existing timeout
  if (studyReminderTimeout) {
    clearTimeout(studyReminderTimeout);
  }

  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const scheduledTime = new Date();

  scheduledTime.setHours(hours, minutes, 0, 0);

  // If time has passed today, schedule for tomorrow
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const delay = scheduledTime.getTime() - now.getTime();

  studyReminderTimeout = setTimeout(() => {
    callback();
    // Reschedule for next day
    scheduleStudyReminder(time, callback);
  }, delay);
}

export function scheduleStreakReminder(
  time: string,
  hasStudiedToday: boolean,
  callback: () => void
): void {
  // Clear existing timeout
  if (streakReminderTimeout) {
    clearTimeout(streakReminderTimeout);
  }

  // Only schedule if hasn't studied today
  if (hasStudiedToday) return;

  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const scheduledTime = new Date();

  scheduledTime.setHours(hours, minutes, 0, 0);

  // Only schedule if time hasn't passed
  if (scheduledTime > now) {
    const delay = scheduledTime.getTime() - now.getTime();

    streakReminderTimeout = setTimeout(callback, delay);
  }
}

export function clearScheduledReminders(): void {
  if (studyReminderTimeout) {
    clearTimeout(studyReminderTimeout);
    studyReminderTimeout = null;
  }
  if (streakReminderTimeout) {
    clearTimeout(streakReminderTimeout);
    streakReminderTimeout = null;
  }
}

// Send a test notification
export async function sendTestNotification(): Promise<boolean> {
  return showNotification(
    'FlashCard Test',
    'Notifications are working! Keep up the great learning!',
    { tag: 'test-notification', url: '/dashboard' }
  );
}

// Notification messages
export const NOTIFICATION_MESSAGES = {
  studyReminder: {
    title: 'Time to Study!',
    body: 'Start your learning session and keep your knowledge growing!',
  },
  streakAlert: (streak: number) => ({
    title: `Don't Break Your ${streak}-Day Streak!`,
    body: 'Study now to maintain your progress. Just a few cards will do!',
  }),
  goalProgress: (progress: number, goal: number) => ({
    title: 'Weekly Goal Update',
    body: `You've studied ${progress}/${goal} cards this week. ${
      progress >= goal ? 'Goal achieved!' : 'Keep going!'
    }`,
  }),
  achievementUnlocked: (name: string) => ({
    title: 'Achievement Unlocked!',
    body: `You earned: ${name}`,
  }),
};
