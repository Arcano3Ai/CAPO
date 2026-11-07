const CACHE_NAME = 'capo-store-v14';
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
    './assets/fondo-1-poster.webp',
    './assets/fondo-2-poster.webp',
    './assets/fondo-3-poster.webp',
    './assets/capo-showcase-poster.webp',
    './assets/capo-showcase-2-poster.webp',
    './assets/capo-joggers-heritage.webp',
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
    './assets/capo-trucker-retro.webp',
    './assets/capo-trucker-syndicate.webp',
    './assets/capo-snapback-the-don.webp',
    './assets/capo-beanie-noir.webp',
    './assets/capo-hoodie-boss-m2580.webp',
    './assets/capo-tee-shaka-wear.webp',
    './assets/capo-jacket-champion.webp',
    './assets/capo-backpack-tactical.webp',
    './assets/capo-tumbler-gold-cipher.webp',
    './assets/capo-hoodie-micro-gold.webp',
    './assets/capo-hoodie-arch-heritage.webp',
    './assets/capo-hoodie-sleeves-gold.webp',
    './assets/capo-hoodie-giant-chest.webp',
    './assets/capo-pulsera-sodalita.webp',
    './assets/capo-pulsera-pirita.webp',
    './assets/capo-pulsera-lapislazuli.webp',
    './assets/capo-pulsera-onix-mate.webp',
    './assets/capo-pulsera-obsidiana.webp',
    './assets/capo-pulsera-ojo-de-tigre.webp',
    './assets/capo-pulsera-lava-volcanica.webp',
    './assets/capo-pulsera-malaquita.webp',
    './assets/capo-pulsera-hematita.webp',
    './assets/capo-pulsera-jaspe-rojo.webp',
    './assets/capo-pulsera-cuarzo-rosa.webp',
    './assets/capo-pulsera-cuarzo-ahumado.webp',
    './assets/capo-pulsera-amatista.webp',
    './assets/capo-pulsera-labradorita.webp',
    './assets/capo-pulsera-howlita-blanca.webp',
    './assets/capo-pulsera-turquesa-africana.webp',
    './assets/capo-pulsera-jaspe-paisaje.webp',
    './assets/capo-pulsera-unakita.webp',
    './assets/capo-pulsera-ojo-de-halcon.webp',
    './assets/capo-pulsera-piedra-de-luna.webp'
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

