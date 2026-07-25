/*
 * U4 — Year-scale helper specs: month rollups, on-this-day matcher,
 * year report builder, and years-with-data. Pure functions, no DB.
 */
import { describe, expect, it } from "vitest";
import {
  buildMonthRollups,
  findOnThisDay,
  buildYearReport,
  yearsWithData,
  monthKeyLabel,
  isToiletSuccess,
  type RollupEntry,
  type PhotoLike,
} from "../client/src/lib/yearScale";

const e = (
  date: string,
  trackerId: string,
  option?: string,
  value?: number | string,
): RollupEntry => ({ date, trackerId, option: option ?? null, value: value ?? null, note: null });

const p = (id: number, date: string, caption?: string): PhotoLike => ({
  id,
  date,
  url: `https://x.test/${id}.jpg`,
  caption: caption ?? null,
});

describe("monthKeyLabel", () => {
  it("formats YYYY-MM into a readable label", () => {
    expect(monthKeyLabel("2026-07")).toMatch(/July 2026/);
    expect(monthKeyLabel("2027-01")).toMatch(/January 2027/);
  });
});

describe("isToiletSuccess", () => {
  it("treats outdoor/pad/success options as wins", () => {
    expect(isToiletSuccess("Grass ✅")).toBe(true);
    expect(isToiletSuccess("Pee pad ✅")).toBe(true);
    expect(isToiletSuccess("Accident indoors")).toBe(false);
    expect(isToiletSuccess(null)).toBe(false);
  });
});

describe("buildMonthRollups", () => {
  const entries = [
    e("2026-07-01", "walk"),
    e("2026-07-01", "feeding"),
    e("2026-07-02", "toilet", "Grass ✅"),
    e("2026-07-02", "toilet", "Accident indoors"),
    e("2026-07-03", "weight", undefined, 2.4),
    e("2026-07-15", "weight", undefined, 2.8),
    e("2026-08-01", "training"),
  ];

  it("groups entries by month, newest month first", () => {
    const r = buildMonthRollups(entries);
    expect(r).toHaveLength(2);
    expect(r[0].key).toBe("2026-08");
    expect(r[1].key).toBe("2026-07");
  });

  it("computes counts, toilet success and average weight", () => {
    const jul = buildMonthRollups(entries).find((m) => m.key === "2026-07")!;
    expect(jul.walks).toBe(1);
    expect(jul.meals).toBe(1);
    expect(jul.toiletSuccess).toBe(50);
    expect(jul.avgWeight).toBeCloseTo(2.6, 5);
    expect(jul.total).toBe(6);
    expect(jul.activeDays).toBe(4);
  });

  it("returns null toiletSuccess / avgWeight when no such logs", () => {
    const aug = buildMonthRollups(entries).find((m) => m.key === "2026-08")!;
    expect(aug.toiletSuccess).toBeNull();
    expect(aug.avgWeight).toBeNull();
    expect(aug.trainingSessions).toBe(1);
  });

  it("handles empty input", () => {
    expect(buildMonthRollups([])).toEqual([]);
  });
});

describe("findOnThisDay", () => {
  it("returns null when nothing matches the MM-DD in a past year", () => {
    expect(findOnThisDay("2026-07-26", [p(1, "2026-07-26")], [e("2026-07-26", "walk")])).toBeNull();
  });

  it("finds the nearest past year with content", () => {
    const m = findOnThisDay(
      "2028-07-26",
      [p(1, "2026-07-26", "Beach day"), p(2, "2027-07-26", "Cafe trip")],
      [],
    );
    expect(m).not.toBeNull();
    expect(m!.year).toBe(2027);
    expect(m!.yearsAgo).toBe(1);
    expect(m!.photo?.caption).toBe("Cafe trip");
  });

  it("prefers story-ish trackers and caps entries at 2", () => {
    const m = findOnThisDay(
      "2027-03-10",
      [],
      [
        e("2026-03-10", "toilet", "Grass ✅"),
        e("2026-03-10", "training", "Sit"),
        e("2026-03-10", "feeding"),
        e("2026-03-10", "social", "Dog run"),
      ],
    );
    expect(m).not.toBeNull();
    expect(m!.entries).toHaveLength(2);
    expect(m!.entries[0].trackerId).toBe("training");
    expect(m!.entries[1].trackerId).toBe("social");
  });
});

describe("buildYearReport", () => {
  const entries = [
    e("2026-07-20", "weight", undefined, 2.2),
    e("2026-11-05", "weight", undefined, 5.1),
    e("2026-07-21", "walk"),
    e("2026-07-21", "feeding"),
    e("2026-08-02", "toilet", "Grass ✅"),
    e("2027-01-01", "walk"), // other year — excluded
  ];
  const photos = [p(1, "2026-09-09", "First groom"), p(2, "2027-02-02")];

  it("computes totals only from the requested year", () => {
    const r = buildYearReport(2026, entries, photos);
    expect(r.totals.entries).toBe(5);
    expect(r.totals.walks).toBe(1);
    expect(r.totals.meals).toBe(1);
    expect(r.totals.photos).toBe(1);
    expect(r.totals.toiletSuccess).toBe(100);
  });

  it("tracks first and last weigh-in of the year", () => {
    const r = buildYearReport(2026, entries, photos);
    expect(r.weightStart).toBe(2.2);
    expect(r.weightEnd).toBe(5.1);
  });

  it("lists distinct data months ascending", () => {
    const r = buildYearReport(2026, entries, photos);
    expect(r.months).toEqual(["2026-07", "2026-08", "2026-09", "2026-11"]);
  });

  it("produces an age span label", () => {
    const r = buildYearReport(2026, entries, photos);
    expect(r.ageSpan.length).toBeGreaterThan(0);
  });

  it("handles an empty year gracefully", () => {
    const r = buildYearReport(2031, entries, photos);
    expect(r.totals.entries).toBe(0);
    expect(r.weightStart).toBeNull();
    expect(r.totals.toiletSuccess).toBeNull();
  });
});

describe("yearsWithData", () => {
  it("returns descending distinct years from entries and photos", () => {
    const ys = yearsWithData(
      [e("2026-07-20", "walk"), e("2027-01-01", "walk")],
      [p(1, "2028-05-05")],
    );
    expect(ys).toEqual([2028, 2027, 2026]);
  });

  it("returns empty for no data", () => {
    expect(yearsWithData([], [])).toEqual([]);
  });
});
