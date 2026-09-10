// HabitOS service worker — caches the app shell so the installed app opens offline.
// Data itself never goes through here: it lives in localStorage / IndexedDB on the device.
var CACHE = 'habitos-shell-v1';
var SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './js/app.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './icons/favicon-16.png',
  './assets/insignia/A-light.png', './assets/insignia/A-dark.png',
  './assets/insignia/B-light.png', './assets/insignia/B-dark.png',
  './assets/insignia/C-light.png', './assets/insignia/C-dark.png',
  './assets/insignia/D-light.png', './assets/insignia/D-dark.png',
  './assets/insignia/E-light.png', './assets/insignia/E-dark.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) { return cache.addAll(SHELL); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches['delete'](k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);

  if (url.origin === self.location.origin) {
    // app shell: cache-first, refresh in the background
    event.respondWith(
      caches.match(req).then(function (cached) {
        var fetchPromise = fetch(req).then(function (res) {
          if (res && res.status === 200) caches.open(CACHE).then(function (c) { c.put(req, res.clone()); });
          return res;
        })['catch'](function () { return cached; });
        return cached || fetchPromise;
      })
    );
  } else {
    // cross-origin (Google Fonts, etc): network-first, fall back to cache when offline
    event.respondWith(
      fetch(req).then(function (res) {
        caches.open(CACHE).then(function (c) { c.put(req, res.clone()); });
        return res;
      })['catch'](function () { return caches.match(req); })
    );
  }
});
