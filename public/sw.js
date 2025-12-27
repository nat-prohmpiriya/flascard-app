// FlashCard App Service Worker
// Handles push notifications and caching

const CACHE_NAME = 'flashcard-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(clients.claim());
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  let data = {
    title: 'FlashCard',
    body: 'Time to study!',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    tag: 'flashcard-notification',
    url: '/',
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (e) {
    console.error('[SW] Error parsing push data:', e);
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-72.png',
    tag: data.tag || 'flashcard-notification',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
    },
    actions: [
      {
        action: 'study',
        title: 'Study Now',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);

  event.notification.close();

  const action = event.action;
  const url = event.notification.data?.url || '/';

  if (action === 'dismiss') {
    return;
  }

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already an open window
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            if (action === 'study') {
              client.navigate('/dashboard');
            }
            return;
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(action === 'study' ? '/dashboard' : url);
        }
      })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event);
});

// Message event (for communication with main app)
self.addEventListener('message', (event) => {

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag, url } = event.data.payload;

    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-72.png',
      tag: tag || 'flashcard-local',
      data: { url: url || '/' },
      vibrate: [100, 50, 100],
    });
  }
});

// Periodic sync for scheduled notifications (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);

  if (event.tag === 'study-reminder') {
    event.waitUntil(checkAndSendReminder());
  }
});

// Check and send reminder based on stored settings
async function checkAndSendReminder() {
  try {
    // Get notification settings from IndexedDB or send message to client
    // For now, this is a placeholder - actual implementation would
    // check user settings and last study time

    const now = new Date();
    const hour = now.getHours();

    // Default: remind at 9 AM if not studied
    if (hour === 9) {
      self.registration.showNotification('Time to Study!', {
        body: 'Start your day with some flashcards',
        icon: '/icon-192.png',
        badge: '/icon-72.png',
        tag: 'study-reminder',
        data: { url: '/dashboard' },
      });
    }
  } catch (error) {
    console.error('[SW] Error in checkAndSendReminder:', error);
  }
}
