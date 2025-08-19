// next.config.ts
import type { NextConfig } from 'next';
import nextPWA from 'next-pwa';

const withPWA = nextPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, // we'll test in production build (see step 4)
  fallbacks: {
    document: '/offline', // 👈 serve this when a page isn't cached yet
  },
  runtimeCaching: [
    // Cache HTML/page navigations so refresh/deep-links work offline
    {
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        networkTimeoutSeconds: 3,
        expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    // Cache GET /api/* (your data)
    {
      urlPattern: ({ url, request }) =>
        request.method === 'GET' && url.pathname.startsWith('/api/'),
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api-get',
        expiration: { maxEntries: 300, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    // Queue writes while offline
    {
      urlPattern: ({ url, request }) =>
        request.method === 'POST' && url.pathname.startsWith('/api/'),
      handler: 'NetworkOnly',
      options: {
        backgroundSync: { name: 'api-post-queue', options: { maxRetentionTime: 24 * 60 } },
      },
    },
    {
      urlPattern: ({ url, request }) =>
        request.method === 'PATCH' && url.pathname.startsWith('/api/'),
      handler: 'NetworkOnly',
      options: {
        backgroundSync: { name: 'api-patch-queue', options: { maxRetentionTime: 24 * 60 } },
      },
    },
    {
      urlPattern: ({ url, request }) =>
        request.method === 'DELETE' && url.pathname.startsWith('/api/'),
      handler: 'NetworkOnly',
      options: {
        backgroundSync: { name: 'api-delete-queue', options: { maxRetentionTime: 24 * 60 } },
      },
    },
    // Nice to have: Next static & assets
    { urlPattern: /^\/_next\/static\/.*/i, handler: 'StaleWhileRevalidate', options: { cacheName: 'next-static' } },
    {
      urlPattern: ({ url }) =>
        /\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|eot)$/.test(url.pathname),
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'assets' },
    },
  ],
}) as (config: NextConfig) => NextConfig;

const baseConfig: NextConfig = {
  reactStrictMode: true,

  // ✅ Ignore TS errors at build time
  typescript: { ignoreBuildErrors: true },

  // ✅ Ignore ESLint errors at build time
  eslint: { ignoreDuringBuilds: true },
};
export default withPWA(baseConfig);
