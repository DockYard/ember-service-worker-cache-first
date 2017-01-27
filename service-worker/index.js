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

/*
 * Deletes all caches that start with the `CACHE_KEY_PREFIX`, except for the
 * cache defined by `CACHE_NAME`
 */
const DELETE_STALE_CACHES = () => {
  return caches.keys().then((cacheNames) => {
    cacheNames.forEach((cacheName) => {
      let isOwnCache = cacheName.indexOf(CACHE_KEY_PREFIX) === 0;
      let isNotCurrentCache = cacheName !== CACHE_NAME;

      if (isOwnCache && isNotCurrentCache) {
        caches.delete(cacheName);
      }
    });
  });
};

self.addEventListener('activate', (event) => {
  event.waitUntil(DELETE_STALE_CACHES());
});
