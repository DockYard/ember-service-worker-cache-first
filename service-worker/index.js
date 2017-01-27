import { PATTERNS, VERSION } from 'ember-service-worker-cache-first/service-worker/config';

const CACHE_KEY_PREFIX = 'esw-cache-first';
const CACHE_NAME = `${CACHE_KEY_PREFIX}-${VERSION}`;

const PATTERN_REGEX = PATTERNS.map((pattern) => {
  let normalized = new URL(pattern, self.location).toString();
  return new RegExp(`^${normalized}$`);
});

const MATCH = (key) => {
  return !!PATTERN_REGEX.find((pattern) => pattern.test(key));
};

self.addEventListener('fetch', (event) => {
  let request = event.request;
  if (request.method !== 'GET' || !/^https?/.test(request.url)) {
    return;
  }

  if (MATCH(request.url)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            return response;
          }

          return fetch(request).then((response) => {
            cache.put(request, response.clone());
            return response;
          });
        })
      })
    );
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(cleanupCaches(CACHE_KEY_PREFIX, CACHE_NAME));
});
