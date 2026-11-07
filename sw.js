const CACHE_NAME = 'capo-store-v30';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './admin.html',
    './styles.css',
    './script.js',
    './manifest.json',
    './favicon.ico',
    './assets/favicon-32x32.png',
    './assets/favicon-16x16.png',
    './assets/apple-touch-icon.png',
    './assets/capo-pwa-icon-192.png',
    './assets/capo-pwa-icon-512.png',
    './assets/capo-pwa-icon-192.webp',
    './assets/capo-pwa-icon-512.webp',
    './data/products.json',
    './data/sync-service.js',
    './assets/fondo-1-poster.webp',
    './assets/fondo-2-poster.webp',
    './assets/fondo-3-poster.webp',
    './assets/capo-showcase-poster.webp',
    './assets/capo-showcase-2-poster.webp',
    './assets/capo-showcase-3-poster.webp',
    './assets/campfire-footer-poster.webp',
    './assets/capo-joggers-heritage.webp',
    './assets/capo-leggings-femme.webp',
    './assets/capo-crop-top-femme.webp',
    './assets/capo-biker-femme.webp',
    './assets/capo-crop-hoodie-femme.webp',
    './assets/capo-sports-bra-femme.webp',
    './assets/capo-blusa-relaxed-femme.webp',
    './assets/og-capo-whatsapp.jpg',
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

    // Bypass Service Worker cache for media files (audio / video) and range requests
    // to allow native HTTP 206 Partial Content, streaming, and unhindered mobile playback
    const url = new URL(event.request.url);
    if (
        url.pathname.endsWith('.mp3') ||
        url.pathname.endsWith('.mp4') ||
        url.pathname.endsWith('.webm') ||
        event.request.headers.has('range')
    ) {
        return;
    }

    // Network-First para código, scripts, estilos y catálogo para garantizar que cualquier celular
    // reciba inmediatamente la versión actualizada sin quedarse atrapado en cachés antiguas
    const isCodeOrDoc = 
        event.request.mode === 'navigate' ||
        url.pathname.endsWith('.html') ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.json');

    if (isCodeOrDoc) {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
                    }
                    return networkResponse;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

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
            });
        })
    );
});

