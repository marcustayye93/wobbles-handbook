import { describe, expect, it } from "vitest";
import { dailyFact, FACT_PERIOD_DAYS } from "../client/src/lib/dailyFact";
import { HUNDRED_TOTAL } from "../client/src/content/hundredThings";

const DAY_MS = 86_400_000;

describe("dailyFact — rotating 100 Things field note", () => {
  it("returns a valid fact with global numbering", () => {
    const f = dailyFact(new Date("2026-07-23T10:00:00Z"));
    expect(f.n).toBeGreaterThanOrEqual(1);
    expect(f.n).toBeLessThanOrEqual(HUNDRED_TOTAL);
    expect(f.text.length).toBeGreaterThan(10);
    expect(f.catTitle.length).toBeGreaterThan(0);
  });

  it("is stable within the same 2-day period (whole household sees the same fact)", () => {
    // Pick a base date aligned to the start of a period so +1 day stays inside it.
    const daysSinceEpoch = Math.floor(Date.UTC(2026, 6, 20) / DAY_MS);
    const alignedDays = daysSinceEpoch - (daysSinceEpoch % FACT_PERIOD_DAYS);
    const base = new Date(alignedDays * DAY_MS + 12 * 3_600_000); // midday day 1
    const nextDay = new Date(base.getTime() + DAY_MS); // midday day 2, same period
    expect(dailyFact(base).n).toBe(dailyFact(nextDay).n);
  });

  it("changes to a different fact in the next 2-day period", () => {
    const base = new Date("2026-07-20T12:00:00Z");
    const nextPeriod = new Date(base.getTime() + FACT_PERIOD_DAYS * DAY_MS);
    expect(dailyFact(base).n).not.toBe(dailyFact(nextPeriod).n);
  });

  it("visits every one of the 100 facts across 100 consecutive periods", () => {
    const base = new Date("2026-01-01T12:00:00Z");
    const seen = new Set<number>();
    for (let p = 0; p < HUNDRED_TOTAL; p++) {
      seen.add(dailyFact(new Date(base.getTime() + p * FACT_PERIOD_DAYS * DAY_MS)).n);
    }
    expect(seen.size).toBe(HUNDRED_TOTAL);
  });

  it("scatters consecutive picks instead of walking the list in order", () => {
    const base = new Date("2026-01-01T12:00:00Z");
    const a = dailyFact(base).n;
    const b = dailyFact(new Date(base.getTime() + FACT_PERIOD_DAYS * DAY_MS)).n;
    expect(Math.abs(b - a)).toBeGreaterThan(1);
  });
});
