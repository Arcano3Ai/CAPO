const CACHE_NAME = 'capo-store-v8';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './admin.html',
    './styles.css',
    './script.js',
    './manifest.json',
    './data/products.json',
    './data/sync-service.js',
    './assets/modo-patron-activado.mp3',
    './assets/og-capo-store.jpg',
    './assets/og-capo-square.jpg',
    './assets/Gemini_Generated_Image_bnc88lbnc88lbnc8.webp',
    './assets/mockup (5).webp',
    './assets/mockup (6).webp',
    './assets/48be2ed7-cfb4-465b-826a-cc669465221e.webp',
    './assets/b3409bb5-63e0-483f-8dbc-20c7f2c33384.webp',
    './assets/ChatGPT Image 13 feb 2026, 21_44_18.webp',
    './assets/ChatGPT Image 13 feb 2026, 21_50_19.webp',
    './assets/ChatGPT Image 13 feb 2026, 21_39_47.webp',
    './assets/Gemini_Generated_Image_9us3ks9us3ks9us3.webp',
    './assets/capo-hoodie-black.webp',
    './assets/capo-tee-vintage.webp',
    './assets/capo-chain-gold.webp',
    './assets/capo-trucker-retro.webp',
    './assets/capo-trucker-syndicate.webp',
    './assets/capo-snapback-the-don.webp',
    './assets/capo-beanie-noir.webp',
    './assets/capo-hoodie-boss-m2580.webp',
    './assets/capo-tee-shaka-wear.webp',
    './assets/capo-jacket-champion.webp',
    './assets/capo-backpack-tactical.webp',
    './assets/capo-tumbler-gold-cipher.webp'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // Only cache GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                return networkResponse;
            }).catch(() => {
                // Fallback for offline mode
                if (event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('./index.html');
                }
            });
        })
    );
});

