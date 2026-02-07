/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkFirst,
  Serwist,
  StaleWhileRevalidate,
} from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST:
    | (
        | string
        | {
            url: string;
            revision?: string | null;
            integrity?: string;
          }
      )[]
    | undefined;
};

const runtimeCaching = [
  ...defaultCache,
  {
    matcher: ({ request, url }: { request: Request; url: URL }) =>
      request.mode === "navigate" && url.pathname.startsWith("/subjects"),
    handler: new NetworkFirst({
      cacheName: "subjects-pages-cache",
      networkTimeoutSeconds: 4,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 40,
          maxAgeSeconds: 60 * 60 * 24 * 7,
        }),
      ],
    }),
  },
  {
    matcher: ({ url }: { request: Request; url: URL }) =>
      url.pathname.startsWith("/api/subjects/search"),
    handler: new NetworkFirst({
      cacheName: "subjects-search-cache",
      networkTimeoutSeconds: 3,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 60 * 30,
        }),
      ],
    }),
  },
  {
    matcher: ({ request, url }: { request: Request; url: URL }) =>
      request.destination === "image" &&
      (url.origin === self.location.origin || /supabase\.co$/i.test(url.hostname)),
    handler: new StaleWhileRevalidate({
      cacheName: "subjects-images-cache",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 180,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        }),
      ],
    }),
  },
  {
    matcher: ({ request, url }: { request: Request; url: URL }) =>
      request.destination === "font" && url.origin === self.location.origin,
    handler: new CacheFirst({
      cacheName: "local-fonts-cache",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365,
        }),
      ],
    }),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    cleanupOutdatedCaches: true,
  },
  runtimeCaching,
});

serwist.addEventListeners();
