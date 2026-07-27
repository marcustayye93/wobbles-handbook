import { startAutoUpdate } from "@/lib/autoUpdate";
import { trpc } from "@/lib/trpc";
import { COOKIE_NAME } from '@shared/const';
import { readProfile } from "@/hooks/useProfile";
import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { httpBatchLink } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Offline resilience: keep cached data alive for 7 days so the app can
      // render from the persisted cache when the network is down.
      gcTime: 1000 * 60 * 60 * 24 * 7,
      retry: 2,
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * Offline cache persistence — the last good server snapshot (trackers,
 * checklists, reading progress, photos metadata) is stored on-device and
 * restored on launch, so the handbook still opens and shows data offline.
 * Writes still need the network (a clear offline banner tells the family
 * when logging is paused — see <OfflineBanner /> in App.tsx).
 */
const persister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
  key: "wobbles:query-cache",
  serialize: (client) => superjson.stringify(client),
  deserialize: (cached) => superjson.parse(cached),
});

// No login in this app (family-private by URL): errors are logged, never
// redirected to an OAuth portal.
queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    console.error("[API Query Error]", event.query.state.error);
  }
});
queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    console.error("[API Mutation Error]", event.mutation.state.error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        // Attribution without login: the device-remembered profile (Marcus /
        // Chesa / Caretaker) rides along on every request so the server can
        // stamp who logged what. Falls back to "Family" server-side.
        const headers: Record<string, string> = {};
        const profile = readProfile();
        if (profile) headers["x-wobbles-profile"] = profile;
        // Legacy preview fallback: forward a mirrored session token if present
        // (harmless now that no procedure requires it).
        try {
          const raw = sessionStorage.getItem("manus-cookie");
          if (raw) {
            const prefix = `${COOKIE_NAME}=`;
            const pair = raw.split(";").find(s => s.trim().startsWith(prefix));
            const token = pair?.trim().slice(prefix.length);
            if (token) headers.Authorization = `Bearer ${token}`;
          }
        } catch {
          // sessionStorage unavailable
        }
        return headers;
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        buster: "v1",
        dehydrateOptions: {
          // Never persist the photo upload payloads or auth state; keep the
          // cache focused on renderable household data.
          shouldDehydrateQuery: (query) => query.state.status === "success",
        },
      }}
      onSuccess={() => {
        // After the persisted cache is restored, refresh anything stale.
        queryClient.resumePausedMutations().then(() => {
          queryClient.invalidateQueries();
        });
      }}
    >
      <App />
    </PersistQueryClientProvider>
  </trpc.Provider>
);

// PWA: register service worker for offline support (production only), and
// start the auto-update watcher so new deployments load without a manual
// hard-refresh (see client/src/lib/autoUpdate.ts).
if (import.meta.env.PROD) {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .catch(() => {});
    });
  }
  startAutoUpdate();
}
