// service-worker.js

const CACHE_NAME = 'token-analyzer-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/client.js',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install service worker
self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
  // For API requests, use network first, then offline fallback
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Check if the response is valid
          if (!response || response.status !== 200) {
            throw new Error('API request failed');
          }
          return response;
        })
        .catch(error => {
          console.error('API request failed:', error);
          // Return a structured error response for API requests
          return new Response(JSON.stringify({
            error: 'API unavailable',
            message: 'The service is currently unavailable. Please try again later.',
            offline: true
          }), {
            status: 503,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        })
    );
  } else {
    // For static assets, use cache first, then network
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Cache hit - return response
          if (response) {
            return response;
          }
          
          // Clone the request because it's a one-time use stream
          const fetchRequest = event.request.clone();
          
          return fetch(fetchRequest)
            .then(response => {
              // Check if we received a valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // Clone the response because it's a one-time use stream
              const responseToCache = response.clone();
              
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
                
              return response;
            })
            .catch(() => {
              // If both cache and network fail, show offline page
              if (event.request.headers.get('accept').includes('text/html')) {
                return caches.match('/offline.html');
              }
            });
        })
    );
  }
});

// Update cache and delete old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle offline fallback
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
