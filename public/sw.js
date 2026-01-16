/**
 * Service Worker for Web Push Notifications
 *
 * Handles push events and displays notifications.
 * Minimal implementation - no caching or offline support.
 */

// Push event - show notification when push message received
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch {
    // Fallback for text-only messages
    data = {
      title: 'DivisApp',
      body: event.data.text(),
    };
  }

  const title = data.title || 'DivisApp';
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: data.tag || 'divisapp-notification',
    data: {
      url: data.actionUrl || '/',
    },
    // Vibration pattern for mobile
    vibrate: [100, 50, 100],
    // Auto-close after 30 seconds
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click - open the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus an existing window
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open a new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Push subscription change - handle token refresh
self.addEventListener('pushsubscriptionchange', (event) => {
  // The subscription has expired or been revoked
  // The client will detect this and resubscribe if needed
  console.log('Push subscription changed:', event);
});
