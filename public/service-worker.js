// fFiles located in the public folder
const FILES_TO_CACHE = [
    "/",
    "/service-worker.js",
    "manifest.webmanifest",
    "/index.js",
    "index.html",
    "/db.js",
    "/assets/background_image.png",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "style.css",
    
    
];

const CACHE_NAME = "static-cache-v1"; 
const DATA_CACHE_NAME = "data-cache-v1";

self.addEventListener('install', function (evnt) {
    evnt.waitUnitl(
        caches
        .open(CACHE_NAME)
        .then((cache) => {
            return cache.addAll(FILES_TO_CACHE);
        })
);
self.skipWaiting();
});

//Clean old cache
self.addEventListener('activate', function (evnt) {
    evnt.waitUnitl(
    caches
        .keys()
        .then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                        if (key != CACHE_NAME && key !== DATA_CACHE_NAME) {
                            console.log( 'Old cache data being removed...', key);
                            return caches.delete(key);
                        }
                    })
            );
        })
    )
        self.clients.claim();
});


self.addEventListener('fetch', function (evnt) {
    if (evnt.request.url.include('/api'))
    {
        evnt.respondWith(
            caches.open(DATA_CACHE_NAME).then((cache)=> {
                    return fetch(evnt.request).then((response) => { 
                        if (response.status === 200) {
                        cache.put(evnt.request.url, response.clone());
                    }
                    return response;
                    })
                    .catch((err) => {
                        return cache.match(evnt.request);
                    });
                })
                .catch((err) => console.log(err))
        );

        return;
            }

    evnt.respondWith(
        caches.match(evnt.request).then(function (response) {
          return response || fetch(evnt.request);
        })
      );
    });
