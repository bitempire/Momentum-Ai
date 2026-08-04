// Momentum AI service worker.
// PUSH ONLY. This file deliberately does NOT cache anything and does NOT
// intercept fetch. If a caching layer is ever added here it will start
// serving customers a stale copy of app_mobile.html and every deploy will
// have to fight it. Leave it alone.

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
  var data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Momentum AI', body: event.data ? event.data.text() : '' };
  }

  var title = data.title || 'Momentum AI';
  var options = {
    body: data.body || '',
    icon: '/logo.png',
    badge: '/logo.png',
    tag: data.tag || 'mmai-signal',
    renotify: true,
    data: { url: data.url || '/app_mobile.html' }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var target = (event.notification.data && event.notification.data.url) || '/app_mobile.html';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.indexOf('app_mobile.html') !== -1 && 'focus' in list[i]) {
          return list[i].focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});
