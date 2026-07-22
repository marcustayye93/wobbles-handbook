/*
 * Synced household data layer — replaces on-device localStorage with the
 * family-shared server API (tRPC). Every logged-in family member reads and
 * writes the SAME data.
 *
 * - useTrackerFeed(): the single trackers.list query + row→TrackerEntry adapter
 * - useTrackerEntries(id): entries for one tracker (server-backed)
 * - useAddTrackerEntry / useRemoveTrackerEntry: optimistic mutations
 * - useSharedState<T>(key, initial): generic synced key/value map state
 *   (checklists, 100-things, reading progress) with optimistic updates
 * - runLegacyImportOnce(): one-time migration of old on-device data
 */
import { useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { TrackerEntry } from "@/lib/trackers";
import { TRACKERS } from "@/lib/trackers";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/** Server row shape (see drizzle/schema.ts trackerEntries). */
export interface TrackerRow {
  id: number;
  trackerId: string;
  date: string;
  time: string | null;
  option: string | null;
  value: string | null;
  note: string | null;
  createdBy: number | null;
  createdByName: string | null;
  createdAt: Date;
}

/** Client entry enriched with who logged it. */
export interface SyncedEntry extends TrackerEntry {
  createdByName?: string;
}

/** Convert a server row to the client TrackerEntry shape used by all UI. */
export function rowToEntry(row: TrackerRow): SyncedEntry {
  return {
    id: String(row.id),
    date: row.date,
    time: row.time ?? undefined,
    value: row.value != null && row.value !== "" ? parseFloat(row.value) : undefined,
    option: row.option ?? undefined,
    note: row.note ?? undefined,
    createdByName: row.createdByName ?? undefined,
  };
}

/* ------------------------------------------------------------------ */
/* Tracker feed                                                        */
/* ------------------------------------------------------------------ */

/**
 * The single household tracker feed (all trackers, newest first).
 * One query shared by every page via react-query's cache.
 */
export function useTrackerFeed() {
  const query = trpc.trackers.list.useQuery(
    {}, // server default limit (2000 newest entries)
    {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
    },
  );
  const rows: TrackerRow[] = query.data ?? [];
  return { ...query, rows };
}

/** Entries for one tracker, newest first (server-backed, family-shared). */
export function useTrackerEntries(trackerId: string) {
  const { rows, isLoading } = useTrackerFeed();
  const entries = useMemo(
    () => rows.filter((r) => r.trackerId === trackerId).map(rowToEntry),
    [rows, trackerId],
  );
  return { entries, isLoading };
}

/** Add-entry mutation with optimistic insert into the shared list cache. */
export function useAddTrackerEntry() {
  const utils = trpc.useUtils();
  return trpc.trackers.add.useMutation({
    onMutate: async (input) => {
      await utils.trackers.list.cancel();
      const previous = utils.trackers.list.getData({});
      const optimistic: TrackerRow = {
        id: -Date.now(), // temp negative id until server confirms
        trackerId: input.trackerId,
        date: input.date,
        time: input.time ?? null,
        option: input.option ?? null,
        value: input.value ?? null,
        note: input.note ?? null,
        createdBy: null,
        createdByName: null,
        createdAt: new Date(),
      };
      utils.trackers.list.setData({}, (old) =>
        [optimistic, ...(old ?? [])].sort((a, b) =>
          (b.date + (b.time ?? "")).localeCompare(a.date + (a.time ?? "")),
        ),
      );
      return { previous };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previous) utils.trackers.list.setData({}, ctx.previous);
      toast.error("Couldn't save — check your connection and try again");
    },
    onSettled: () => utils.trackers.list.invalidate(),
  });
}

/** Remove-entry mutation with optimistic removal. */
export function useRemoveTrackerEntry() {
  const utils = trpc.useUtils();
  return trpc.trackers.remove.useMutation({
    onMutate: async ({ id }) => {
      await utils.trackers.list.cancel();
      const previous = utils.trackers.list.getData({});
      utils.trackers.list.setData({}, (old) => (old ?? []).filter((r) => r.id !== id));
      return { previous };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previous) utils.trackers.list.setData({}, ctx.previous);
      toast.error("Couldn't delete — try again");
    },
    onSettled: () => utils.trackers.list.invalidate(),
  });
}

/* ------------------------------------------------------------------ */
/* Shared key/value state                                              */
/* ------------------------------------------------------------------ */

/**
 * Generic synced state — replaces useLocalStorage for family-shared maps
 * (checklists ticks, 100-things learned set, reading progress).
 * Backed by ONE sharedState.all query; setter is optimistic and supports
 * functional updates like the old hook.
 */
export function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Shallow-diff two maps into { entries (added/changed), deletes (removed) }. */
export function diffMaps(
  prev: Record<string, unknown>,
  next: Record<string, unknown>,
): { entries: Record<string, unknown>; deletes: string[] } {
  const entries: Record<string, unknown> = {};
  const deletes: string[] = [];
  for (const [k, v] of Object.entries(next)) {
    if (!(k in prev) || JSON.stringify(prev[k]) !== JSON.stringify(v)) entries[k] = v;
  }
  for (const k of Object.keys(prev)) {
    if (!(k in next)) deletes.push(k);
  }
  return { entries, deletes };
}

export function useSharedState<T>(key: string, initial: T) {
  const utils = trpc.useUtils();
  const query = trpc.sharedState.all.useQuery(undefined, {
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
  const onSyncError = () => {
    utils.sharedState.all.invalidate();
    toast.error("Couldn't sync — check your connection");
  };
  const setMutation = trpc.sharedState.set.useMutation({
    onError: onSyncError,
    onSettled: () => utils.sharedState.all.invalidate(),
  });
  const patchMutation = trpc.sharedState.patch.useMutation({
    onError: onSyncError,
    onSettled: () => utils.sharedState.all.invalidate(),
  });

  const map = query.data;
  const value: T = map && key in map ? (map[key] as T) : initial;

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const current = utils.sharedState.all.getData();
      const prev: T = current && key in current ? (current[key] as T) : initial;
      const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      // optimistic cache write so the UI answers instantly
      utils.sharedState.all.setData(undefined, { ...(current ?? {}), [key]: v });
      // Conflict safety: for map values, send only the delta so the server
      // merges changes instead of replacing the whole map (two phones
      // ticking different boxes at once both keep their ticks).
      if (isPlainObject(prev) && isPlainObject(v)) {
        const { entries, deletes } = diffMaps(prev, v);
        if (Object.keys(entries).length === 0 && deletes.length === 0) return;
        patchMutation.mutate({ key, entries, deletes });
      } else {
        setMutation.mutate({ key, value: v });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, utils],
  );

  return [value, set, { isLoading: query.isLoading }] as const;
}

/* ------------------------------------------------------------------ */
/* Legacy one-time import                                              */
/* ------------------------------------------------------------------ */

export const MIGRATED_FLAG = "wobbles:migrated";
const LEGACY_KV_KEYS = ["checklists", "hundred", "readProgress"] as const;

export function readLegacyTrackerEntries(): {
  trackerId: string;
  date: string;
  time?: string;
  option?: string;
  value?: string;
  note?: string;
}[] {
  const out: ReturnType<typeof readLegacyTrackerEntries> = [];
  for (const t of TRACKERS) {
    try {
      const raw = localStorage.getItem(`wobbles:tracker:${t.id}`);
      if (!raw) continue;
      const arr = JSON.parse(raw) as TrackerEntry[];
      for (const e of arr) {
        if (!e?.date || !/^\d{4}-\d{2}-\d{2}$/.test(e.date)) continue;
        out.push({
          trackerId: t.id,
          date: e.date,
          time: e.time && /^\d{2}:\d{2}$/.test(e.time) ? e.time : undefined,
          option: e.option ? String(e.option).slice(0, 64) : undefined,
          value: e.value != null ? String(e.value).slice(0, 32) : undefined,
          note: e.note ? String(e.note).slice(0, 2000) : undefined,
        });
      }
    } catch {
      /* ignore malformed storage */
    }
  }
  return out.slice(0, 2000);
}

/**
 * Hook that returns a runner for the one-time on-device → server migration.
 * Safe to call repeatedly: guarded by a local flag AND the server refuses
 * a second import once any entries exist.
 */
export function useLegacyImport() {
  const utils = trpc.useUtils();
  const importMutation = trpc.trackers.importLegacy.useMutation();
  const setState = trpc.sharedState.set.useMutation();

  return useCallback(async () => {
    try {
      if (localStorage.getItem(MIGRATED_FLAG)) return;
    } catch {
      return;
    }

    let didAnything = false;

    // 1) tracker entries (server skips if household already has data)
    const entries = readLegacyTrackerEntries();
    if (entries.length > 0) {
      try {
        const res = await importMutation.mutateAsync({ entries });
        if (!res.skipped && res.imported > 0) {
          didAnything = true;
          utils.trackers.list.invalidate();
        }
      } catch {
        return; // network hiccup — retry next launch (flag not set)
      }
    }

    // 2) key/value maps — only push if the server doesn't have the key yet
    try {
      const serverMap =
        (utils.sharedState.all.getData() as Record<string, unknown> | undefined) ??
        (await utils.sharedState.all.fetch());
      for (const key of LEGACY_KV_KEYS) {
        if (serverMap && key in serverMap) continue;
        const raw = localStorage.getItem(`wobbles:${key}`);
        if (!raw) continue;
        const parsed = JSON.parse(raw) as unknown;
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
          await setState.mutateAsync({ key, value: parsed });
          didAnything = true;
        }
      }
      utils.sharedState.all.invalidate();
    } catch {
      return; // retry next launch
    }

    try {
      localStorage.setItem(MIGRATED_FLAG, new Date().toISOString());
    } catch {
      /* ignore */
    }
    if (didAnything) {
      toast.success("Moved this phone's logs into the shared family journal");
    }
  }, [importMutation, setState, utils]);
}
