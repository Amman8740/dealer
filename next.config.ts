// next.config.ts
import type { NextConfig } from 'next';
import nextPWA from 'next-pwa';

const withPWA = nextPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,

  // 👇 don’t run SW in dev (avoids confusing stale caches during development)
  disable: process.env.NODE_ENV === 'development',

  // 👇 shown when a page isn’t cached yet
  fallbacks: { document: '/offline' },

  // allow larger JSON payloads to be cached
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,

  runtimeCaching: [
    // HTML navigations
    {
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        networkTimeoutSeconds: 3,
        expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },

    // GET /api/*
    {
      urlPattern: ({ url, request }) =>
        request.method === 'GET' && url.origin === self.location.origin && url.pathname.startsWith('/api/'),
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api-get',
        expiration: { maxEntries: 300, maxAgeSeconds: 24 * 60 * 60 },
      },
    },

    // Queue writes while offline (Background Sync)
    {
      urlPattern: ({ url, request }) =>
        request.method === 'POST' && url.origin === self.location.origin && url.pathname.startsWith('/api/'),
      handler: 'NetworkOnly',
      options: {
        backgroundSync: { name: 'api-post-queue', options: { maxRetentionTime: 24 * 60 } },
      },
    },
    {
      urlPattern: ({ url, request }) =>
        request.method === 'PATCH' && url.origin === self.location.origin && url.pathname.startsWith('/api/'),
      handler: 'NetworkOnly',
      options: {
        backgroundSync: { name: 'api-patch-queue', options: { maxRetentionTime: 24 * 60 } },
      },
    },
    {
      urlPattern: ({ url, request }) =>
        request.method === 'DELETE' && url.origin === self.location.origin && url.pathname.startsWith('/api/'),
      handler: 'NetworkOnly',
      options: {
        backgroundSync: { name: 'api-delete-queue', options: { maxRetentionTime: 24 * 60 } },
      },
    },

    // Next static & assets
    { urlPattern: /^\/_next\/static\/.*/i, handler: 'StaleWhileRevalidate', options: { cacheName: 'next-static' } },
    {
      urlPattern: ({ url }) => /\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|eot)$/.test(url.pathname),
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'assets' },
    },
  ],
}) as (config: NextConfig) => NextConfig;

const baseConfig: NextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default withPWA(baseConfig);
