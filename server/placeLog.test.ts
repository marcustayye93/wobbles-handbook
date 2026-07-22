/*
 * Place log (Wobbles' Map) — engine tests.
 * Covers tolerant normalization of the shared "placeLog" map, distinct-day
 * visit counting, last-visit lookup, per-place sorting, and entry creation.
 */
import { describe, expect, it } from "vitest";
import {
  entriesForPlace,
  hasVisited,
  journalForPlace,
  lastVisit,
  makeEntry,
  normalizePlaceLog,
  visitCount,
  type PlaceLogMap,
} from "../client/src/lib/placeLog";

const entry = (
  id: string,
  placeId: string,
  kind: "visit" | "journal",
  date: string,
  extra: Partial<{ text: string; by: string; createdAt: number }> = {},
) => ({ id, placeId, kind, date, createdAt: 0, ...extra });

describe("normalizePlaceLog", () => {
  it("returns empty map for garbage roots", () => {
    expect(normalizePlaceLog(null)).toEqual({});
    expect(normalizePlaceLog(undefined)).toEqual({});
    expect(normalizePlaceLog("nope")).toEqual({});
    expect(normalizePlaceLog([1, 2])).toEqual({});
    expect(normalizePlaceLog(42)).toEqual({});
  });

  it("drops malformed entries but keeps valid ones", () => {
    const raw = {
      good: { placeId: "waterfront", kind: "visit", date: "2026-07-20", createdAt: 5 },
      noPlace: { kind: "visit", date: "2026-07-20" },
      badDate: { placeId: "waterfront", kind: "visit", date: "20 July" },
      notObject: "hi",
      arr: [1, 2],
    };
    const log = normalizePlaceLog(raw);
    expect(Object.keys(log)).toEqual(["good"]);
    expect(log.good.placeId).toBe("waterfront");
    expect(log.good.createdAt).toBe(5);
  });

  it("coerces unknown kind to visit and trims/caps text and by", () => {
    const raw = {
      a: {
        placeId: "admiralty",
        kind: "party",
        date: "2026-07-21",
        text: "  zoomies!  ",
        by: "  Marcus  ",
      },
    };
    const log = normalizePlaceLog(raw);
    expect(log.a.kind).toBe("visit");
    expect(log.a.text).toBe("zoomies!");
    expect(log.a.by).toBe("Marcus");
    expect(log.a.createdAt).toBe(0);
  });
});

describe("visit helpers", () => {
  const log: PlaceLogMap = {
    v1: entry("v1", "waterfront", "visit", "2026-07-18"),
    v2: entry("v2", "waterfront", "visit", "2026-07-18", { createdAt: 9 }), // same day dup
    v3: entry("v3", "waterfront", "visit", "2026-07-20"),
    j1: entry("j1", "waterfront", "journal", "2026-07-21", { text: "big zoomies" }),
    o1: entry("o1", "admiralty", "visit", "2026-07-19"),
  };

  it("visitCount counts distinct days only, per place", () => {
    expect(visitCount(log, "waterfront")).toBe(2);
    expect(visitCount(log, "admiralty")).toBe(1);
    expect(visitCount(log, "sembawang")).toBe(0);
  });

  it("lastVisit returns most recent visit date, ignoring journals", () => {
    expect(lastVisit(log, "waterfront")).toBe("2026-07-20");
    expect(lastVisit(log, "sembawang")).toBeUndefined();
  });

  it("hasVisited is true only when a visit exists", () => {
    expect(hasVisited(log, "waterfront")).toBe(true);
    expect(hasVisited(log, "sembawang")).toBe(false);
    // journal alone does not count as a visit
    const journalOnly: PlaceLogMap = {
      j: entry("j", "blockpark", "journal", "2026-07-20", { text: "note" }),
    };
    expect(hasVisited(journalOnly, "blockpark")).toBe(false);
  });

  it("entriesForPlace sorts newest first, createdAt breaking date ties", () => {
    const ids = entriesForPlace(log, "waterfront").map((e) => e.id);
    expect(ids).toEqual(["j1", "v3", "v2", "v1"]);
  });

  it("journalForPlace returns only journal entries", () => {
    const ids = journalForPlace(log, "waterfront").map((e) => e.id);
    expect(ids).toEqual(["j1"]);
  });
});

describe("makeEntry", () => {
  it("builds a well-formed entry with trimmed fields and unique ids", () => {
    const a = makeEntry({ placeId: "waterfront", kind: "journal", date: "2026-07-22", text: " hi ", by: " Chesa " });
    const b = makeEntry({ placeId: "waterfront", kind: "visit", date: "2026-07-22" });
    expect(a.text).toBe("hi");
    expect(a.by).toBe("Chesa");
    expect(b.text).toBeUndefined();
    expect(a.id).not.toBe(b.id);
    expect(a.createdAt).toBeGreaterThan(0);
    // round-trips through normalization untouched
    const log = normalizePlaceLog({ [a.id]: a, [b.id]: b });
    expect(Object.keys(log)).toHaveLength(2);
    expect(log[a.id].kind).toBe("journal");
  });
});
