// @ts-nocheck — compiled by Serwist's webpack plugin, not Next.js tsc
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: [
    {
      matcher: /^https:\/\/fonts\.googleapis\.com/,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-stylesheets",
        expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
    {
      matcher: /^https:\/\/fonts\.gstatic\.com/,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-webfonts",
        expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
    {
      matcher: /^https:\/\/.*\.supabase\.co\/storage/,
      handler: "CacheFirst",
      options: {
        cacheName: "supabase-images",
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
      },
    },
    {
      matcher: ({ request }) => request.destination === "image",
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        networkTimeoutSeconds: 10,
      },
    },
  ],
});

serwist.addEventListeners();
