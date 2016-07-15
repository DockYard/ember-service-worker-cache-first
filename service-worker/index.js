import { addFetchListener } from 'ember-service-workers/service-worker';

addFetchListener(function(event) {
  return caches.open('esw-cache-first').then(function(cache) {
    return cache.match(event.request).then(function(response) {
      return response || fetch(event.request).then(function(response) {
        cache.put(event.request, response.clone());
        return response;
      });
    });
  });
});
