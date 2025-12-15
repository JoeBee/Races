/* Service Worker for offline caching (no frameworks) */
'use strict';

const CACHE_NAME = 'races-v1';

// Keep this list small: don't precache the entire marathonPix folder.
const PRECACHE_URLS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './pwa.js',
  './manifest.json',
  './favicon.ico',
  './races.json',
  './assets/refresh-icon.png',
  './components/imageViewer.css',
  './components/imageViewer.js',
  './components/imageViewer.html',
  './icons/icon-192.svg',
  './icons/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

function isMarathonPixRequest(request) {
  try {
    const url = new URL(request.url);
    return url.pathname.includes('/marathonPix/');
  } catch {
    return false;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Runtime cache for marathon images (cache-first)
  if (isMarathonPixRequest(request)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        });
      })
    );
    return;
  }

  // App shell: cache-first, network fallback
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});


