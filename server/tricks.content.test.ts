/*
 * Tests for the Journey trick library content and practice-count matching.
 */
import { describe, expect, it } from "vitest";
import {
  TRICKS,
  getTrick,
  practiceCount,
  entryMatchesTrick,
  type PracticeEntry,
} from "../client/src/content/tricks";

describe("trick library content", () => {
  it("has 12 tricks with unique ids", () => {
    expect(TRICKS.length).toBe(12);
    const ids = new Set(TRICKS.map((t) => t.id));
    expect(ids.size).toBe(TRICKS.length);
  });

  it("every trick has an illustration under /manus-storage/", () => {
    for (const t of TRICKS) {
      expect(t.image).toMatch(/^\/manus-storage\/trick-/);
    }
  });

  it("every trick has at least 3 steps with titles and details", () => {
    for (const t of TRICKS) {
      expect(t.steps.length).toBeGreaterThanOrEqual(3);
      for (const s of t.steps) {
        expect(s.title.length).toBeGreaterThan(0);
        expect(s.detail.length).toBeGreaterThan(20);
      }
    }
  });

  it("covers all three levels", () => {
    const levels = new Set(TRICKS.map((t) => t.level));
    expect(levels).toEqual(new Set(["foundation", "core", "party"]));
  });

  it("the big three foundations are present", () => {
    expect(getTrick("sit")).toBeDefined();
    expect(getTrick("down")).toBeDefined();
    expect(getTrick("recall")).toBeDefined();
  });

  it("getTrick returns undefined for unknown ids", () => {
    expect(getTrick("backflip")).toBeUndefined();
  });

  it("keywords are lowercase for case-insensitive matching", () => {
    for (const t of TRICKS) {
      for (const k of t.keywords) {
        expect(k).toBe(k.toLowerCase());
      }
    }
  });
});

describe("practice counting", () => {
  const sit = getTrick("sit")!;
  const recall = getTrick("recall")!;
  const spin = getTrick("spin")!;

  it("matches by exact training option", () => {
    const e: PracticeEntry = { option: "Sit / down", note: null };
    expect(entryMatchesTrick(sit, e)).toBe(true);
  });

  it("matches by note keyword, case-insensitive", () => {
    const e: PracticeEntry = { option: "Other", note: "Practised SIT before dinner" };
    expect(entryMatchesTrick(sit, e)).toBe(true);
  });

  it("does not match unrelated entries", () => {
    const e: PracticeEntry = { option: "Crate games", note: "loved the crate" };
    expect(entryMatchesTrick(recall, e)).toBe(false);
  });

  it("counts each entry at most once even when option and note both match", () => {
    const entries: PracticeEntry[] = [
      { option: "Recall ('come')", note: "recall in hallway" },
      { option: "Recall ('come')", note: null },
      { option: null, note: "come when called went well" },
    ];
    expect(practiceCount(recall, entries)).toBe(3);
  });

  it("party tricks match the shared Tricks / fun option", () => {
    const e: PracticeEntry = { option: "Tricks / fun", note: null };
    expect(entryMatchesTrick(spin, e)).toBe(true);
  });

  it("returns zero for empty logs", () => {
    expect(practiceCount(sit, [])).toBe(0);
  });
});
