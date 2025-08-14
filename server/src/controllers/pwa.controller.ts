import { Request, Response } from 'express';
import { TranslationService } from '../services/translation.service';
import { OfflineSyncService } from '../services/offlineSync.service';
import { logger } from '../index';

export class PWAController {
  /**
   * Get PWA manifest
   * GET /api/pwa/manifest
   */
  static async getPWAManifest(req: Request, res: Response) {
    try {
      const language = req.language || 'en';
      
      const manifest = {
        name: TranslationService.translate('welcome', language),
        short_name: "GroChain",
        description: "Digital Agricultural Platform - Revolutionizing Nigeria's Agriculture",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#4CAF50",
        orientation: "portrait-primary",
        scope: "/",
        lang: language,
        dir: "ltr",
        categories: ["business", "productivity", "utilities"],
        icons: [
          {
            src: "/icons/icon-72x72.png",
            sizes: "72x72",
            type: "image/png",
            purpose: "maskable any"
          },
          {
            src: "/icons/icon-96x96.png",
            sizes: "96x96",
            type: "image/png",
            purpose: "maskable any"
          },
          {
            src: "/icons/icon-128x128.png",
            sizes: "128x128",
            type: "image/png",
            purpose: "maskable any"
          },
          {
            src: "/icons/icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
            purpose: "maskable any"
          },
          {
            src: "/icons/icon-152x152.png",
            sizes: "152x152",
            type: "image/png",
            purpose: "maskable any"
          },
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable any"
          },
          {
            src: "/icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
            purpose: "maskable any"
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable any"
          }
        ],
        screenshots: [
          {
            src: "/screenshots/desktop.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide"
          },
          {
            src: "/screenshots/mobile.png",
            sizes: "390x844",
            type: "image/png",
            form_factor: "narrow"
          }
        ],
        shortcuts: [
          {
            name: TranslationService.translate('harvest', language),
            short_name: TranslationService.translate('harvest', language),
            description: "Log your harvest",
            url: "/harvest",
            icons: [
              {
                src: "/icons/harvest-96x96.png",
                sizes: "96x96"
              }
            ]
          },
          {
            name: TranslationService.translate('marketplace', language),
            short_name: TranslationService.translate('marketplace', language),
            description: "Browse marketplace",
            url: "/marketplace",
            icons: [
              {
                src: "/icons/marketplace-96x96.png",
                sizes: "96x96"
              }
            ]
          }
        ],
        related_applications: [],
        prefer_related_applications: false,
        edge_side_panel: {
          preferred_width: 400
        },
        launch_handler: {
          client_mode: "navigate-existing"
        },
        handle_links: "preferred",
        protocol_handlers: [
          {
            protocol: "web+grochain",
            url: "/?action=%s"
          }
        ]
      };

      res.setHeader('Content-Type', 'application/manifest+json');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.json(manifest);

    } catch (error) {
      logger.error('Failed to generate PWA manifest: %s', (error as Error).message);
      res.status(500).json({
        status: 'error',
        message: 'Failed to generate PWA manifest'
      });
    }
  }

  /**
   * Get service worker script
   * GET /api/pwa/service-worker
   */
  static async getServiceWorker(req: Request, res: Response) {
    try {
      const language = req.language || 'en';
      
      const serviceWorkerScript = `
// GroChain Service Worker
// Version: 1.0.0
// Language: ${language}

const CACHE_NAME = 'grochain-v1.0.0';
const OFFLINE_CACHE_NAME = 'grochain-offline-v1.0.0';

// Files to cache for offline functionality
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/offline.html'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('All resources cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Cache installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip non-HTTP(S) requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the response
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        });
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      syncOfflineData()
    );
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'explore',
          title: 'View',
          icon: '/icons/checkmark.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icons/xmark.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sync offline data function
async function syncOfflineData() {
  try {
    // Get offline data from IndexedDB
    const offlineData = await getOfflineData();
    
    if (offlineData.length === 0) {
      return;
    }

    // Sync each item
    for (const item of offlineData) {
      try {
        await syncDataItem(item);
        await removeOfflineData(item.id);
      } catch (error) {
        console.error('Failed to sync item:', error);
      }
    }

    // Show success message
    self.registration.showNotification('GroChain', {
      body: 'Offline data synced successfully',
      icon: '/icons/icon-192x192.png'
    });

  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Helper function to get offline data (placeholder)
async function getOfflineData() {
  // In a real implementation, this would read from IndexedDB
  return [];
}

// Helper function to sync data item (placeholder)
async function syncDataItem(item) {
  // In a real implementation, this would make API calls
  return fetch('/api/sync/offline-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(item)
  });
}

// Helper function to remove synced offline data (placeholder)
async function removeOfflineData(id) {
  // In a real implementation, this would remove from IndexedDB
  return Promise.resolve();
}

console.log('GroChain Service Worker loaded successfully');
      `;

      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('Service-Worker-Allowed', '/');
      res.send(serviceWorkerScript);

    } catch (error) {
      logger.error('Failed to generate service worker: %s', (error as Error).message);
      res.status(500).json({
        status: 'error',
        message: 'Failed to generate service worker'
      });
    }
  }

  /**
   * Get offline page
   * GET /api/pwa/offline
   */
  static async getOfflinePage(req: Request, res: Response) {
    try {
      const language = req.language || 'en';
      
      const offlineHtml = `
<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GroChain - Offline</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            max-width: 500px;
        }
        .icon {
            font-size: 80px;
            margin-bottom: 20px;
        }
        h1 {
            font-size: 2.5em;
            margin-bottom: 20px;
        }
        p {
            font-size: 1.2em;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .btn {
            background: white;
            color: #4CAF50;
            padding: 15px 30px;
            border: none;
            border-radius: 25px;
            font-size: 1.1em;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .features {
            margin-top: 40px;
            text-align: left;
        }
        .feature {
            margin-bottom: 15px;
            padding-left: 20px;
        }
        .feature:before {
            content: "✓";
            margin-right: 10px;
            color: #4CAF50;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">📱</div>
        <h1>${TranslationService.translate('offline_mode', language)}</h1>
        <p>You're currently offline, but GroChain still works! Your data is being saved locally and will sync when you're back online.</p>
        
        <div class="features">
            <div class="feature">Log harvests offline</div>
            <div class="feature">Create marketplace listings</div>
            <div class="feature">View cached data</div>
            <div class="feature">Automatic sync when online</div>
        </div>
        
        <a href="/" class="btn">Continue Using GroChain</a>
    </div>
</body>
</html>
      `;

      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
      res.send(offlineHtml);

    } catch (error) {
      logger.error('Failed to generate offline page: %s', (error as Error).message);
      res.status(500).json({
        status: 'error',
        message: 'Failed to generate offline page'
      });
    }
  }

  /**
   * Get PWA installation instructions
   * GET /api/pwa/install
   */
  static async getInstallInstructions(req: Request, res: Response) {
    try {
      const language = req.language || 'en';
      
      const instructions = {
        title: "Install GroChain App",
        description: "Install GroChain as a native app on your device",
        steps: [
          {
            platform: "Android (Chrome)",
            instructions: [
              "Open GroChain in Chrome",
              "Tap the menu (⋮) button",
              "Select 'Add to Home screen'",
              "Tap 'Add' to install"
            ]
          },
          {
            platform: "iOS (Safari)",
            instructions: [
              "Open GroChain in Safari",
              "Tap the Share button (□↑)",
              "Select 'Add to Home Screen'",
              "Tap 'Add' to install"
            ]
          },
          {
            platform: "Desktop (Chrome/Edge)",
            instructions: [
              "Open GroChain in Chrome/Edge",
              "Click the install icon (↓) in address bar",
              "Click 'Install' to add to desktop"
            ]
          }
        ],
        benefits: [
          "Works offline",
          "Faster loading",
          "Native app experience",
          "Push notifications",
          "Easy access from home screen"
        ]
      };

      res.json({
        status: 'success',
        data: instructions
      });

    } catch (error) {
      logger.error('Failed to get install instructions: %s', (error as Error).message);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get install instructions'
      });
    }
  }
}

