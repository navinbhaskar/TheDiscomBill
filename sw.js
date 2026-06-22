// sw.js — service worker for offline support.
// Strategy: NETWORK-FIRST for same-origin GETs. While online the user always gets the freshest
// code/data (no stale-asset traps), and every successful response is cached so the app still works
// fully offline afterwards. Cross-origin requests (e.g. Google Fonts) bypass the worker.

const CACHE = 'discombill-v1';
const CORE = [
  './', './index.html', './css/styles.css', './js/main.js',
  './manifest.webmanifest', './icon.svg',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(CORE).catch(() => {}))   // best-effort precache of the shell
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;   // let the network handle CDN assets

  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
  );
});
