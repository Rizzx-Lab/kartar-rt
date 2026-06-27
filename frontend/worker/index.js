// Custom service worker for Web Push Notifications
// Handles push events and notification clicks for the admin panel

// Push event — show system notification
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = {
      title: 'Notifikasi Baru',
      body: event.data.text(),
    };
  }

  const options = {
    body: data.body || '',
    icon: '/admin/icons/icon-192.png',
    badge: '/admin/icons/icon-192.png',
    data: data.data || {},
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Admin Panel', options)
  );
});

// Notification click — open URL from notification data
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/admin';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus an existing window first
      for (const client of clientList) {
        if (client.url.includes('/admin') && 'focus' in client) {
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            url: urlToOpen,
          });
          return;
        }
      }
      // Open a new window if no existing one found
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close (optional: for analytics or cleanup)
self.addEventListener('notificationclose', (event) => {
  // Future: track notification dismissal analytics here
});
