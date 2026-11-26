const CACHE_NAME = 'ai-quiz-offline-v1';

const PRECACHE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  // Achievement illustrations
  '/images/achievements/explorer.jpg',
  '/images/achievements/beginner.jpg',
  '/images/achievements/learner.jpg',
  '/images/achievements/enthusiast.jpg',
  '/images/achievements/expert.jpg',
  '/images/achievements/champion.jpg',
  // CAPTCHA photos
  '/images/captcha/calculator.jpg',
  '/images/captcha/email-spam.jpg',
  '/images/captcha/face-id.jpg',
  '/images/captcha/maps.jpg',
  '/images/captcha/netflix.jpg',
  '/images/captcha/seq-collect.jpg',
  '/images/captcha/seq-evaluate.jpg',
  '/images/captcha/seq-prepare.jpg',
  '/images/captcha/seq-train.jpg',
  '/images/captcha/tv-remote.jpg',
  '/images/captcha/usb-drive.jpg',
  '/images/captcha/voice-assistant.jpg',
  '/images/captcha/wall-clock.jpg',
  // AI & Company SVG logos
  '/images/logos/anthropic.svg',
  '/images/logos/chatgpt.svg',
  '/images/logos/claude.svg',
  '/images/logos/deepseek.svg',
  '/images/logos/excel.svg',
  '/images/logos/gemini.svg',
  '/images/logos/google.svg',
  '/images/logos/llama.svg',
  '/images/logos/meta.svg',
  '/images/logos/midjourney.svg',
  '/images/logos/openai.svg',
  '/images/logos/powerpoint.svg',
  '/images/logos/vlc.svg',
  '/images/logos/windows.svg',
];

async function precacheAppShellAndBundles() {
  const cache = await caches.open(CACHE_NAME);

  // Cache known static assets & images
  await Promise.allSettled(
    PRECACHE_ASSETS.map((url) =>
      cache.add(new Request(url, { cache: 'reload' })).catch(() => undefined)
    )
  );

  // Inspect root HTML to also precache Next.js JS/CSS chunks immediately
  try {
    const res = await fetch('/', { cache: 'reload' });
    if (res && res.ok) {
      await cache.put('/', res.clone());
      const html = await res.text();
      const matches = html.match(/\/_next\/static\/[^"'\s<>)]+/g) || [];
      const uniqueUrls = Array.from(new Set(matches));
      await Promise.allSettled(
        uniqueUrls.map((assetUrl) =>
          cache.add(new Request(assetUrl, { cache: 'reload' })).catch(() => undefined)
        )
      );
    }
  } catch {
    // Ignore errors during offline install
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    precacheAppShellAndBundles().then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((oldKey) => caches.delete(oldKey))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  // Navigation requests: Network-first with cached '/' fallback for offline boot
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkRes) => {
          if (networkRes && networkRes.ok) {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkRes;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;
          const cachedRoot = await caches.match('/');
          return cachedRoot || Response.error();
        })
    );
    return;
  }

  // Static Next.js assets, images, icons, and manifest: Cache-first + silent background update
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
