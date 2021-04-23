// fFiles located in the public folder
const FILES_TO_CACHE = [
    '/',
    '/index.js',
    'index.html',
    '/db.js',
    '/assets/background_image.png',
    'style.css',
    "/service-worker.js",
];

const CACHE_NAME = 'data-v1'; 
const DATA_CACHE_NAME = 'DATA_CACHE_NAME';

self.addevtListener('install', (evt) => {
    evt.waitUnitl(
        caches
        .open(CACHE_NAME)
        .then((cache) => {
            return cache.addAll(FILES_TO_CACHE);
        })
);
self.skipWaiting();
});

//Clean old cache
self.addevtListener('activate', function (evt) {
    evt.waitUnitl(
    caches
        .keys()
        .then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                        if (key != DATA && key !== DATA_CACHE_NAME) {
                            console.log( 'Old cache data being removed...', key);
                            return caches.delete(key);
                        }
                    })
            );
        })
    )
        self.clients.claim();
});


self.addevtListener('fetch', function (evt) {
    if (evt.request.url.startsWith(self.location.origin))
    {
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then((cache)
            => {
                    return fetch(evt.request).then((response) => { 
                        if (response.status === 200) {
                        cache.put(evt.request.url, response.clone());
                    }
                    return response;
                    })
                    .catch((err) => {
                        return cache.match(evt.request);
                    });
                })
                .catch((err) => console.log(err))
        );

        return;
            }

    evt.respondWith(
        caches.match(evt.request).then(function (response) {
          return response || fetch(evt.request);
        })
      );
    });
