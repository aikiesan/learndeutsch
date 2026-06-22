/**
 * LearnDeutsch Service Worker
 * Makes the app fully usable offline — essential when travelling with patchy signal.
 * Bump CACHE_VERSION whenever assets change to force clients to update.
 */
const CACHE_VERSION = 'learndeutsch-v2';

// Core assets to pre-cache on install. Paths are relative to the SW scope (repo root).
const CORE_ASSETS = [
    './',
    'index.html',
    'manifest.json',
    'icons/icon.svg',
    'css/main.css',
    'css/components.css',
    'css/themes.css',
    'css/animations.css',
    'css/landing.css',
    'css/cozy.css',
    'css/mobile.css',
    'css/phrasebook.css',
    'css/patterns.css',
    'js/utils.js',
    'js/storage.js',
    'js/gamification.js',
    'js/vocabulary.js',
    'js/exercises.js',
    'js/sounds.js',
    'js/interactive.js',
    'js/progress.js',
    'js/progress-map.js',
    'js/analytics.js',
    'js/fun-utils.js',
    'js/phrasebook.js',
    'js/patterns.js',
    'js/app.js',
    'data/phrasebook.json',
    'data/patterns.json',
    'data/fill-the-gap.json',
    'data/vocabulary/a1.json',
    'data/vocabulary/a2.json',
    'data/vocabulary/b1.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then((cache) => cache.addAll(CORE_ASSETS))
            .then(() => self.skipWaiting())
            .catch((err) => console.warn('[SW] Pre-cache failed:', err))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((key) => key !== CACHE_VERSION)
                    .map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Only handle GET requests
    if (request.method !== 'GET') return;

    // For page navigations, fall back to the cached app shell when offline
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => caches.match('index.html'))
        );
        return;
    }

    // Cache-first for everything else (app assets, data, fonts)
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;

            return fetch(request).then((response) => {
                // Runtime-cache successful same-origin and font responses for next time
                if (response && response.status === 200 &&
                    (request.url.startsWith(self.location.origin) ||
                     request.url.includes('fonts.googleapis.com') ||
                     request.url.includes('fonts.gstatic.com'))) {
                    const copy = response.clone();
                    caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
                }
                return response;
            }).catch(() => cached);
        })
    );
});
