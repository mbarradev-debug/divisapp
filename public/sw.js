/**
 * Service Worker for Web Push Notifications
 *
 * Handles push events and displays notifications.
 * Minimal implementation - no caching or offline support.
 *
 * PAYLOAD FORMAT (from send-push Edge Function):
 * {
 *   title: string,
 *   body: string,
 *   actionUrl?: string,
 *   data?: Record<string, any>,
 *   timestamp: number
 * }
 */

// Push event - show notification when push message received
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received');

  if (!event.data) {
    console.log('[SW] No data in push event');
    return;
  }

  console.log('[SW] Push data (text):', event.data.text());

  let payload;
  try {
    payload = event.data.json();
    console.log('[SW] Parsed payload:', payload);
  } catch (e) {
    console.log('[SW] Failed to parse JSON:', e);
    // Fallback for text-only messages
    payload = {
      title: 'DivisApp',
      body: event.data.text(),
    };
  }

  const title = payload.title || 'DivisApp';
  const options = {
    body: payload.body || '',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    // Use eventId or timestamp for deduplication
    tag: payload.data?.eventId || `divisapp-${payload.timestamp || Date.now()}`,
    renotify: true,
    data: {
      url: payload.actionUrl || '/',
      ...payload.data,
    },
    // Vibration pattern for mobile
    vibrate: [100, 50, 100],
    // Auto-close after 30 seconds
    requireInteraction: false,
  };

  console.log('[SW] Showing notification:', title, options);
  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => console.log('[SW] Notification shown'))
      .catch((err) => console.error('[SW] Failed to show notification:', err))
  );
});

// Notification click - open the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';
  const urlToOpen = new URL(url, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus an existing window at the same URL
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }

      // Try to navigate an existing window
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'navigate' in client) {
          return client.navigate(urlToOpen).then((c) => c?.focus());
        }
      }

      // Open a new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Push subscription change - handle token refresh
self.addEventListener('pushsubscriptionchange', (event) => {
  // The subscription has expired or been revoked
  // The client will detect this and resubscribe if needed
  console.log('[SW] Push subscription changed:', event);
});

// Service worker lifecycle
self.addEventListener('install', () => {
  console.log('[SW] Installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating');
  event.waitUntil(self.clients.claim());
});
