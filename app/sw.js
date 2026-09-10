// HabitOS service worker — caches the app shell so the installed app opens offline.
// Data itself never goes through here: it lives in localStorage / IndexedDB on the device.
//
// IMPORTANT: bump CACHE (e.g. v2 -> v3) whenever shipping a fix, even if this file's own logic
// doesn't change. The browser only re-installs a service worker when sw.js's bytes differ from
// the one it already has — if only css/js/html changed, this file must change too or the old
// worker keeps serving its stale cache forever (cache-first assets included).
var CACHE = 'habitos-shell-v3';
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
// requests matching these get network-first (always try to fetch the latest code first,
// falling back to cache only when offline) — anything code-shaped that we might fix again.
var NETWORK_FIRST = /\.(html|css|js|webmanifest)$/;

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

self.addEventListener('message', function (event) {
  if (event.data === 'skip-waiting') self.skipWaiting();
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  var isNavigation = req.mode === 'navigate';

  if (url.origin === self.location.origin && (isNavigation || NETWORK_FIRST.test(url.pathname))) {
    // app code (html/css/js/manifest): network-first, so a fix is visible on the very next
    // load instead of waiting for a stale cache-first response to be replaced in the background.
    event.respondWith(
      fetch(req).then(function (res) {
        if (res && res.status === 200) caches.open(CACHE).then(function (c) { c.put(req, res.clone()); });
        return res;
      })['catch'](function () { return caches.match(req).then(function (c) { return c || caches.match('./index.html'); }); })
    );
  } else if (url.origin === self.location.origin) {
    // static binary assets (icons, badge images): cache-first, refresh in the background
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
