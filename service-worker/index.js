import { addFetchListener, PROJECT_REVISION } from 'ember-service-workers/service-worker';

const CACHE_KEY_PREFIX = 'esw-cache-first-';
const CACHE_NAME = `${CACHE_KEY_PREFIX}${PROJECT_REVISION}`;

addFetchListener(function(event) {
  if (event.request.method !== 'GET') { return Promise.resolve(undefined); }

  return caches.open(CACHE_NAME).then(function(cache) {
    return cache.match(event.request).then(function(response) {
      if (response) { return response; }

      return fetch(event.request)
        .then(function(response) {
          cache.put(event.request, response.clone());
          return response;
        });
    });
  });
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      cacheNames.forEach(function(cacheName) {
        if (cacheName.indexOf(CACHE_KEY_PREFIX) === 0 && cacheName !== CACHE_NAME) {
          caches.delete(cacheName);
        }
      });
    })
  );
});
