/*
 * autoUpdate — keeps the installed PWA fresh without manual hard-refreshes.
 *
 * How it works:
 * 1. The build stamps a unique id into the bundle (__APP_BUILD_ID__) and also
 *    emits /version.json with the same id (served Cache-Control: no-store and
 *    explicitly bypassed by the service worker).
 * 2. On launch, whenever the app returns to the foreground, when the network
 *    reconnects, and on a slow interval, we fetch /version.json (network-only).
 * 3. If the server's buildId differs from the one baked into the running
 *    bundle, a new deployment exists: we ask the service worker to update,
 *    clear the stale SW caches, and reload the page once — automatically.
 *
 * Safety rails:
 * - Only ever reloads once per detected version (sessionStorage guard) so a
 *   misbehaving server can never cause a reload loop.
 * - Never interrupts user input: waits until the tab is visible and defers if
 *   a text field is focused (retries shortly after).
 */

declare const __APP_BUILD_ID__: string;

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // slow background poll: 5 minutes
const RELOADED_KEY = "wobbles-reloaded-for";

function currentBuildId(): string {
  try {
    return __APP_BUILD_ID__;
  } catch {
    return "dev";
  }
}

async function fetchServerBuildId(): Promise<string | null> {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { buildId?: string };
    return typeof data.buildId === "string" ? data.buildId : null;
  } catch {
    return null; // offline or transient error — try again later
  }
}

function userIsTyping(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || (el as HTMLElement).isContentEditable;
}

async function applyUpdate(newBuildId: string) {
  // Reload-loop guard: only reload once per server build id.
  try {
    if (sessionStorage.getItem(RELOADED_KEY) === newBuildId) return;
    sessionStorage.setItem(RELOADED_KEY, newBuildId);
  } catch {
    /* sessionStorage unavailable — still proceed, worst case one extra reload */
  }

  // Nudge the service worker to fetch the new sw.js, then drop stale caches so
  // the reload pulls the fresh shell from the network.
  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      await reg?.update();
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
    /* best effort — the network-first SW strategy will still fetch fresh HTML */
  }

  window.location.reload();
}

let checking = false;

async function checkForUpdate() {
  if (checking) return;
  if (document.visibilityState !== "visible") return;
  checking = true;
  try {
    const serverId = await fetchServerBuildId();
    if (!serverId || serverId === currentBuildId()) return;
    if (userIsTyping()) {
      // Don't yank the page out from under someone mid-log; retry soon.
      setTimeout(() => {
        checking = false;
        void checkForUpdate();
      }, 30_000);
      return;
    }
    await applyUpdate(serverId);
  } finally {
    checking = false;
  }
}

/** Wire up all the update triggers. Call once from main.tsx (production only). */
export function startAutoUpdate() {
  // On launch (small delay so it never competes with first paint).
  setTimeout(() => void checkForUpdate(), 3_000);

  // When the app returns to the foreground (the common "stale PWA" moment).
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void checkForUpdate();
  });

  // When connectivity returns.
  window.addEventListener("online", () => void checkForUpdate());

  // Slow background poll while the tab stays open.
  setInterval(() => void checkForUpdate(), CHECK_INTERVAL_MS);
}
