// fFiles located in the public folder
const FILES_TO_CACHE = [
    '/',
    '/index.js',
    'index.html',
    '/db.js',
    '/icons/icon-192X192.png',
    '/icons/icon-512x512.png',
    'style.css',
];

const OFFLINEDATA = 'data-v1'; 
const RUNDATA = 'rundata';

self.addEventListener('install', (event) => {
    event.waitUnitl(
        caches
        .open(OFFLINEDATA)
        .then((cache) => cache.addAll(FILES_TO_CACHE))
    );
});

//Clean old cache
self.addEventListener('activate', (event) => {
    event.waitUnitl(
    caches
        .keys()
        .then((cacheData) => {
            return Promise.all(
                cacheData.map((cacheDataDelete) => {
                        if (cacheDataDelete != DATA && key !== RUNDATA) {
                            console.log( 'Old cache data being removed...', cacheDataDelete);
                        }
                    })
            )
        })
    )
});

self.addEventListener('fetch', (event) => {
    if (event.request.url.startsWith(self.location.origin))
    {
        event.respondWith(
            caches.match(event.request).then((dataResponse)
            => {
                if (dataResponse) {
                    return dataResponse;
                }

                return cache.open(RUNDATA).then((response) => {
                    return fetch(event.request).then((response) => {
                        return cacheput(event.request,response.close()).then(() => {
                            return response;

                        });
                    });
                });
            })
        )
    }
});
