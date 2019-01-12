
self.addEventListener("fetch", function(event) {
  event.respondWith(
    return fetch(event.request);
  );
});
