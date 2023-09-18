const CACHE = "offline-fallback3";
self.addEventListener("install", function (evt) {
    evt.waitUntil(precache().then(function () {
        return self.skipWaiting();
    }));
});

self.addEventListener("activate", function (evt) {
    evt.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheName !== CACHE) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function () {
            return self.clients.claim();
        })
    );
});

self.addEventListener("fetch", function (evt) {
    evt.respondWith(networkOrCache(evt.request));
    //     .catch(function () {
    //     return useFallback();
    // }));
});


function networkOrCache(request) {
    return fetch(request).then(function (response) {
        return response.ok ? response : fromCache(request);
    })
        .catch(function () {
            return fromCache(request);
        });
}

//function useFallback() {
//    return caches.open(CACHE).then(function (cache) {
//        return cache.match("./");
//    });
//}

function fromCache(request) {
    return caches.open(CACHE).then(function (cache) {
        return cache.match(request, {ignoreSearch: true}).then(function (matching) {
            return matching || Promise.reject("request-not-in-cache");
        });
    });
}

function precache() {
    return caches.open(CACHE).then(function (cache) {
        return cache.addAll([
            "./",
            "./index.html",
            "./manifest.json",
            "./images/sand-clock-svgrepo-com.svg",
            "./styles/beepbeep.mp3",
            "./styles/beepbeep.ogg",
            "./scripts/Timer.js",
            "./styles/timer.css"
        ]);
    });
}
