/*
 * Client-side tests for the synced-data layer (Grok audit item):
 *  - diffMaps: the shallow diff that powers conflict-safe sharedState.patch
 *    (only changed entries + explicit deletes go over the wire)
 *  - isPlainObject: the guard that decides patch (map) vs whole-value set
 *  - readLegacyTrackerEntries + MIGRATED_FLAG: the one-time legacy import
 *    guard behaviour (sanitisation, malformed data, size cap, local flag)
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  diffMaps,
  isPlainObject,
  readLegacyTrackerEntries,
  MIGRATED_FLAG,
  rowToEntry,
  type TrackerRow,
} from "./useSyncedData";

/* ------------------------------------------------------------------ */
/* localStorage stub (vitest runs in a node environment)               */
/* ------------------------------------------------------------------ */

class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  key(index: number) {
    return [...this.store.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
}

beforeEach(() => {
  (globalThis as { localStorage?: Storage }).localStorage = new MemoryStorage();
});

afterEach(() => {
  delete (globalThis as { localStorage?: Storage }).localStorage;
});

/* ------------------------------------------------------------------ */
/* diffMaps — the heart of the conflict-safe useSharedState patch      */
/* ------------------------------------------------------------------ */

describe("diffMaps (useSharedState conflict-safe delta)", () => {
  it("returns only added/changed entries, not untouched ones", () => {
    const prev = { "daily:0": true, "daily:1": true };
    const next = { "daily:0": true, "daily:1": false, "daily:2": true };
    const { entries, deletes } = diffMaps(prev, next);
    expect(entries).toEqual({ "daily:1": false, "daily:2": true });
    expect(deletes).toEqual([]);
  });

  it("lists removed keys as deletes", () => {
    const prev = { "daily:0": true, "daily:1": true };
    const next = { "daily:0": true };
    const { entries, deletes } = diffMaps(prev, next);
    expect(entries).toEqual({});
    expect(deletes).toEqual(["daily:1"]);
  });

  it("produces an empty delta for identical maps (no-op patch is skipped)", () => {
    const prev = { a: { deep: [1, 2] }, b: true };
    const next = { a: { deep: [1, 2] }, b: true };
    const { entries, deletes } = diffMaps(prev, next);
    expect(Object.keys(entries)).toHaveLength(0);
    expect(deletes).toHaveLength(0);
  });

  it("detects deep-value changes within an entry", () => {
    const prev = { progress: { read: 2 } };
    const next = { progress: { read: 3 } };
    const { entries } = diffMaps(prev, next);
    expect(entries).toEqual({ progress: { read: 3 } });
  });

  it("never touches the other spouse's concurrent keys", () => {
    // Spouse A's local next-map doesn't know about spouse B's tick; the
    // delta must not include or delete keys A didn't change... only keys
    // absent from A's map are deletes, so the hook always diffs against
    // the freshest cache — this asserts the diff itself stays minimal.
    const prev = { "a:tick": true };
    const next = { "a:tick": true, "a:new": true };
    const { entries, deletes } = diffMaps(prev, next);
    expect(entries).toEqual({ "a:new": true });
    expect(deletes).toEqual([]);
  });
});

describe("isPlainObject (patch vs set routing)", () => {
  it("routes maps to patch and everything else to set", () => {
    expect(isPlainObject({ a: 1 })).toBe(true);
    expect(isPlainObject([])).toBe(false); // arrays use whole-value set
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject("string")).toBe(false);
    expect(isPlainObject(42)).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/* Legacy import guard                                                 */
/* ------------------------------------------------------------------ */

describe("readLegacyTrackerEntries (legacy import sanitisation)", () => {
  it("reads valid legacy entries from localStorage", () => {
    localStorage.setItem(
      "wobbles:tracker:feeding",
      JSON.stringify([{ id: "1", date: "2026-07-20", time: "08:00", option: "Breakfast" }]),
    );
    const entries = readLegacyTrackerEntries();
    expect(entries).toEqual([
      { trackerId: "feeding", date: "2026-07-20", time: "08:00", option: "Breakfast", value: undefined, note: undefined },
    ]);
  });

  it("drops entries with malformed dates or times", () => {
    localStorage.setItem(
      "wobbles:tracker:toilet",
      JSON.stringify([
        { id: "1", date: "20/07/2026", option: "Wee" }, // bad date → dropped
        { id: "2", date: "2026-07-20", time: "8am", option: "Wee" }, // bad time → time stripped
      ]),
    );
    const entries = readLegacyTrackerEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ trackerId: "toilet", date: "2026-07-20", time: undefined });
  });

  it("ignores malformed JSON instead of throwing", () => {
    localStorage.setItem("wobbles:tracker:weight", "{not json");
    expect(() => readLegacyTrackerEntries()).not.toThrow();
    expect(readLegacyTrackerEntries()).toEqual([]);
  });

  it("caps the import at 2000 entries to match the server-side zod limit", () => {
    const big = Array.from({ length: 2500 }, (_, i) => ({
      id: String(i),
      date: "2026-07-20",
      option: "Meal",
    }));
    localStorage.setItem("wobbles:tracker:feeding", JSON.stringify(big));
    expect(readLegacyTrackerEntries().length).toBeLessThanOrEqual(2000);
  });

  it("truncates oversized text fields before sending to the server", () => {
    localStorage.setItem(
      "wobbles:tracker:feeding",
      JSON.stringify([{ id: "1", date: "2026-07-20", note: "x".repeat(5000), option: "y".repeat(200) }]),
    );
    const [entry] = readLegacyTrackerEntries();
    expect(entry.note!.length).toBeLessThanOrEqual(2000);
    expect(entry.option!.length).toBeLessThanOrEqual(64);
  });

  it("exposes the migrated flag key used to guard re-imports on this device", () => {
    // useLegacyImport() returns early when this flag is set; assert the
    // contract so a rename can't silently disable the guard.
    expect(MIGRATED_FLAG).toBe("wobbles:migrated");
    localStorage.setItem(MIGRATED_FLAG, new Date().toISOString());
    expect(localStorage.getItem(MIGRATED_FLAG)).toBeTruthy();
  });
});

/* ------------------------------------------------------------------ */
/* Row adapter                                                         */
/* ------------------------------------------------------------------ */

describe("rowToEntry (server row → client entry)", () => {
  it("converts nullable server fields to the client's optional shape", () => {
    const row: TrackerRow = {
      id: 7,
      trackerId: "weight",
      date: "2026-07-21",
      time: null,
      option: null,
      value: "2.35",
      note: null,
      createdBy: 1,
      createdByName: "Marcus",
      createdAt: new Date(),
    };
    expect(rowToEntry(row)).toEqual({
      id: "7",
      date: "2026-07-21",
      time: undefined,
      option: undefined,
      value: 2.35,
      note: undefined,
      createdByName: "Marcus",
    });
  });

  it("treats an empty-string value as no value (not NaN)", () => {
    const row: TrackerRow = {
      id: 8,
      trackerId: "weight",
      date: "2026-07-21",
      time: "09:00",
      option: "Morning",
      value: "",
      note: "after breakfast",
      createdBy: null,
      createdByName: null,
      createdAt: new Date(),
    };
    const entry = rowToEntry(row);
    expect(entry.value).toBeUndefined();
    expect(entry.createdByName).toBeUndefined();
  });
});
