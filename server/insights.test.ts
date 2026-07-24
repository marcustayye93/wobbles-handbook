/*
 * Vitest specs for the logbook intelligence engine
 * (client/src/lib/insights.ts — pure functions, safe to test in node).
 */
import { describe, it, expect } from "vitest";
import {
  toMinutes,
  fmtTime,
  circularMeanMinutes,
  mealToToiletGaps,
  toiletIntelligence,
  feedingIntelligence,
  nextToiletWindow,
} from "../client/src/lib/insights";
import type { TrackerEntry } from "../client/src/lib/trackers";

/* ---------- helpers ---------- */

let seq = 0;
const entry = (
  date: string,
  time: string | undefined,
  option?: string,
  value?: number,
): TrackerEntry => ({
  id: String(++seq),
  date,
  ...(time ? { time } : {}),
  ...(option ? { option } : {}),
  ...(value != null ? { value } : {}),
});

/** now = 2026-10-05 06:30 local */
const NOW = new Date(2026, 9, 5, 6, 30);
const d = (offset: number) => {
  const dt = new Date(NOW);
  dt.setDate(dt.getDate() - offset);
  return dt.toISOString().slice(0, 10);
};

/* ---------- time utilities ---------- */

describe("time utilities", () => {
  it("parses HH:MM into minutes and rejects garbage", () => {
    expect(toMinutes("07:05")).toBe(425);
    expect(toMinutes("23:59")).toBe(1439);
    expect(toMinutes("25:00")).toBeNull();
    expect(toMinutes("nope")).toBeNull();
    expect(toMinutes(undefined)).toBeNull();
  });

  it("formats minutes as 12h times", () => {
    expect(fmtTime(425)).toBe("7:05am");
    expect(fmtTime(0)).toBe("12:00am");
    expect(fmtTime(750)).toBe("12:30pm");
    expect(fmtTime(1439)).toBe("11:59pm");
  });

  it("circular mean handles the midnight wrap", () => {
    // 23:50 and 00:10 must average to midnight, not noon
    const { mean } = circularMeanMinutes([1430, 10]);
    expect(Math.min(mean, 1440 - mean)).toBeLessThan(2);
  });

  it("circular mean of a tight cluster has small spread and high r", () => {
    const { mean, spreadMin, r } = circularMeanMinutes([420, 425, 430, 418, 427]);
    expect(Math.round(mean)).toBeGreaterThanOrEqual(422);
    expect(Math.round(mean)).toBeLessThanOrEqual(426);
    expect(spreadMin).toBeLessThan(15);
    expect(r).toBeGreaterThan(0.95);
  });
});

/* ---------- toilet intelligence ---------- */

const morningRoutine = (): TrackerEntry[] => [
  entry(d(1), "07:00", "Wee on pad ✅"),
  entry(d(2), "07:10", "Wee on pad ✅"),
  entry(d(3), "06:55", "Wee outside ✅"),
  entry(d(4), "07:05", "Wee on pad ✅"),
  entry(d(5), "07:02", "Wee on pad ✅"),
];

describe("toiletIntelligence", () => {
  it("is fully pending with no data", () => {
    const out = toiletIntelligence([], NOW);
    expect(out.allPending).toBe(true);
    expect(out.insights).toHaveLength(0);
    expect(out.pending.length).toBeGreaterThanOrEqual(3);
  });

  it("pending states say exactly how many more logs unlock each trend", () => {
    const out = toiletIntelligence([entry(d(1), "07:00", "Wee on pad ✅")], NOW);
    const anchor = out.pending.find((p) => p.id === "toilet-morning-anchor");
    expect(anchor?.needs).toContain("4 more");
    expect(anchor?.needs).toContain("1/5");
  });

  it("unlocks the morning anchor at 5 timed morning wees across 3+ days", () => {
    const out = toiletIntelligence(morningRoutine(), NOW);
    const anchor = out.insights.find((i) => i.id === "toilet-morning-anchor");
    expect(anchor).toBeDefined();
    expect(anchor!.title).toMatch(/7:0\dam/);
    expect(anchor!.recommendation).toBeTruthy();
    expect(out.allPending).toBe(false);
  });

  it("does not count accidents or afternoon wees toward the morning anchor", () => {
    const entries = [
      entry(d(1), "07:00", "Wee accident"),
      entry(d(2), "07:10", "Wee accident"),
      entry(d(3), "14:55", "Wee on pad ✅"),
      entry(d(4), "15:05", "Wee on pad ✅"),
      entry(d(5), "07:02", "Wee on pad ✅"),
    ];
    const out = toiletIntelligence(entries, NOW);
    expect(out.insights.find((i) => i.id === "toilet-morning-anchor")).toBeUndefined();
  });

  it("computes success rate and flags a slipping trend", () => {
    const entries = [
      // older half: clean
      entry(d(6), "07:00", "Wee on pad ✅"),
      entry(d(6), "12:00", "Poo on pad ✅"),
      entry(d(5), "07:00", "Wee on pad ✅"),
      entry(d(5), "18:00", "Wee on pad ✅"),
      // newer half: accidents creep in
      entry(d(2), "07:00", "Wee accident"),
      entry(d(2), "12:00", "Wee accident"),
      entry(d(1), "07:00", "Wee accident"),
      entry(d(1), "18:00", "Wee on pad ✅"),
    ];
    const out = toiletIntelligence(entries, NOW);
    const rate = out.insights.find((i) => i.id === "toilet-success");
    expect(rate).toBeDefined();
    expect(rate!.title).toContain("slipping");
    expect(rate!.tone).toBe("action");
  });

  it("detects an accident hotspot window", () => {
    const entries = [
      ...morningRoutine(),
      entry(d(1), "18:10", "Wee accident"),
      entry(d(2), "17:45", "Wee accident"),
      entry(d(3), "19:20", "Poo accident"),
    ];
    const out = toiletIntelligence(entries, NOW);
    const cluster = out.insights.find((i) => i.id === "toilet-accident-cluster");
    expect(cluster).toBeDefined();
    expect(cluster!.title.toLowerCase()).toContain("evening");
    expect(cluster!.tone).toBe("action");
  });

  it("celebrates zero accidents once there is enough data", () => {
    const out = toiletIntelligence(morningRoutine(), NOW);
    const praise = out.insights.find((i) => i.id === "toilet-accident-low");
    expect(praise).toBeDefined();
    expect(praise!.tone).toBe("good");
  });

  it("unlocks the meal→toilet gap with 5 timed pairs", () => {
    const feeding: TrackerEntry[] = [];
    const toilet: TrackerEntry[] = [];
    for (let i = 1; i <= 5; i++) {
      feeding.push(entry(d(i), "08:00", "Breakfast", 60));
      toilet.push(entry(d(i), "08:25", "Poo on pad ✅"));
    }
    const out = toiletIntelligence(toilet, NOW, feeding);
    const gap = out.insights.find((i) => i.id === "toilet-meal-gap");
    expect(gap).toBeDefined();
    expect(gap!.title).toContain("25 min");
  });
});

/* ---------- mealToToiletGaps ---------- */

describe("mealToToiletGaps", () => {
  it("pairs each meal with the first toilet event within 2h and skips snacks", () => {
    const feeding = [
      entry(d(1), "08:00", "Breakfast", 60),
      entry(d(1), "10:00", "Snack / training treats", 5),
      entry(d(1), "18:00", "Dinner", 60),
    ];
    const toilet = [
      entry(d(1), "08:30", "Wee on pad ✅"),
      entry(d(1), "10:15", "Wee on pad ✅"),
      entry(d(1), "21:00", "Wee on pad ✅"), // >2h after dinner: no pair
    ];
    expect(mealToToiletGaps(feeding, toilet)).toEqual([30]);
  });
});

/* ---------- feeding intelligence ---------- */

describe("feedingIntelligence", () => {
  it("is fully pending with no data", () => {
    const out = feedingIntelligence([], NOW);
    expect(out.allPending).toBe(true);
    expect(out.pending.length).toBeGreaterThanOrEqual(3);
  });

  it("flags steady meal times when spread is tight", () => {
    const entries = [
      entry(d(1), "08:00", "Breakfast", 60),
      entry(d(2), "08:05", "Breakfast", 60),
      entry(d(3), "07:58", "Breakfast", 60),
      entry(d(1), "18:00", "Dinner", 60),
      entry(d(2), "18:10", "Dinner", 60),
      entry(d(3), "17:55", "Dinner", 60),
    ];
    const out = feedingIntelligence(entries, NOW);
    const reg = out.insights.find((i) => i.id === "feeding-regularity");
    expect(reg).toBeDefined();
    expect(reg!.title).toContain("steady");
    expect(reg!.tone).toBe("good");
  });

  it("flags drifting meal times", () => {
    const entries = [
      entry(d(1), "07:00", "Breakfast", 60),
      entry(d(2), "10:30", "Breakfast", 60),
      entry(d(3), "08:45", "Breakfast", 60),
      entry(d(4), "06:15", "Breakfast", 60),
      entry(d(5), "11:00", "Breakfast", 60),
      entry(d(6), "09:20", "Breakfast", 60),
    ];
    const out = feedingIntelligence(entries, NOW);
    const reg = out.insights.find((i) => i.id === "feeding-regularity");
    expect(reg).toBeDefined();
    expect(reg!.title).toContain("drifting");
    expect(reg!.tone).toBe("action");
  });

  it("detects an appetite drop vs baseline", () => {
    const entries = [
      // baseline: 120 g/day for 4 days
      entry(d(7), "08:00", "Breakfast", 60), entry(d(7), "18:00", "Dinner", 60),
      entry(d(6), "08:00", "Breakfast", 60), entry(d(6), "18:00", "Dinner", 60),
      entry(d(5), "08:00", "Breakfast", 60), entry(d(5), "18:00", "Dinner", 60),
      entry(d(4), "08:00", "Breakfast", 60), entry(d(4), "18:00", "Dinner", 60),
      // recent 3 days: ~60 g/day
      entry(d(3), "08:00", "Breakfast", 30), entry(d(3), "18:00", "Dinner", 30),
      entry(d(2), "08:00", "Breakfast", 30), entry(d(2), "18:00", "Dinner", 30),
      entry(d(1), "08:00", "Breakfast", 60),
    ];
    const out = feedingIntelligence(entries, NOW);
    const app = out.insights.find((i) => i.id === "feeding-appetite");
    expect(app).toBeDefined();
    expect(app!.title).toMatch(/down \d+%/);
    expect(app!.tone).toBe("action");
    expect(app!.recommendation).toMatch(/vet/i);
  });

  it("reports the daily rhythm when logging is consistent", () => {
    const entries = [
      entry(d(3), "08:00", "Breakfast", 60), entry(d(3), "18:00", "Dinner", 60),
      entry(d(2), "08:00", "Breakfast", 60), entry(d(2), "18:00", "Dinner", 60),
      entry(d(1), "08:00", "Breakfast", 60), entry(d(1), "18:00", "Dinner", 60),
      entry(d(0), "08:00", "Breakfast", 60),
    ];
    const out = feedingIntelligence(entries, NOW);
    const rhythm = out.insights.find((i) => i.id === "feeding-rhythm" || i.id === "feeding-missed");
    expect(rhythm).toBeDefined();
  });
});

/* ---------- next toilet window prediction ---------- */

describe("nextToiletWindow", () => {
  it("returns null without enough data", () => {
    expect(nextToiletWindow([], [], NOW)).toBeNull();
  });

  it("predicts the morning window before the anchor time", () => {
    const pred = nextToiletWindow(morningRoutine(), [], NOW); // 06:30, anchor ~07:02
    expect(pred).not.toBeNull();
    expect(pred!.label).toMatch(/Morning wee expected/);
    expect(pred!.atMinutes).toBeGreaterThan(415);
    expect(pred!.atMinutes).toBeLessThan(435);
  });

  it("predicts from today's last meal using the median gap", () => {
    const feeding: TrackerEntry[] = [];
    const toilet: TrackerEntry[] = [];
    for (let i = 1; i <= 5; i++) {
      feeding.push(entry(d(i), "08:00", "Breakfast", 60));
      toilet.push(entry(d(i), "08:30", "Poo on pad ✅"));
    }
    // today 06:20 meal, now 06:30 → prediction 06:50
    feeding.push(entry(d(0), "06:20", "Breakfast", 60));
    const pred = nextToiletWindow(toilet, feeding, NOW);
    expect(pred).not.toBeNull();
    expect(pred!.label).toContain("6:50am");
  });

  it("does not predict a window already in the past", () => {
    const lateNow = new Date(2026, 9, 5, 13, 0); // 1pm, anchor long gone, no meals today
    const pred = nextToiletWindow(morningRoutine(), [], lateNow);
    expect(pred).toBeNull();
  });
});
