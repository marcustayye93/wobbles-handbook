/*
 * Growth band — unit tests for the pure functions behind the weight chart's
 * expected toy-Cavoodle corridor and the on-track verdict card.
 */
import { describe, expect, it } from "vitest";
import {
  GROWTH_BAND,
  expectedBandAt,
  expectedWeightAt,
  ageWeeksOn,
  growthVerdict,
  bandSeriesFor,
  growthCurveSeries,
} from "../client/src/lib/growthBand";

const DOB = "2026-06-26"; // Wobbles' actual date of birth

describe("GROWTH_BAND anchors", () => {
  it("is sorted by weeks and min < max everywhere", () => {
    for (let i = 0; i < GROWTH_BAND.length; i++) {
      expect(GROWTH_BAND[i].min).toBeLessThan(GROWTH_BAND[i].max);
      if (i > 0) expect(GROWTH_BAND[i].weeks).toBeGreaterThan(GROWTH_BAND[i - 1].weeks);
    }
  });

  it("tops out around the ≈6 kg expected adult weight", () => {
    const last = GROWTH_BAND[GROWTH_BAND.length - 1];
    expect(last.min).toBe(4.5);
    expect(last.max).toBe(6.3);
    // 6 kg peak sits inside the adult band
    expect(last.min).toBeLessThanOrEqual(6);
    expect(last.max).toBeGreaterThanOrEqual(6);
  });
});

describe("expectedBandAt", () => {
  it("clamps below the first anchor", () => {
    expect(expectedBandAt(4)).toEqual({ min: 0.9, max: 1.6 });
  });

  it("clamps above the last anchor", () => {
    expect(expectedBandAt(120)).toEqual({ min: 4.5, max: 6.3 });
  });

  it("returns exact values at anchors", () => {
    expect(expectedBandAt(16)).toEqual({ min: 1.9, max: 3.2 });
  });

  it("interpolates linearly between anchors", () => {
    // halfway between wk8 (0.9–1.6) and wk12 (1.4–2.4) → wk10 = 1.15–2.0
    const b = expectedBandAt(10);
    expect(b.min).toBeCloseTo(1.15, 5);
    expect(b.max).toBeCloseTo(2.0, 5);
  });
});

describe("expectedWeightAt", () => {
  it("is the band midline", () => {
    // wk16 band 1.9–3.2 → midline 2.55
    expect(expectedWeightAt(16)).toBeCloseTo(2.55, 5);
  });

  it("approaches ≈5.4 kg midline as an adult (6 kg peak inside band)", () => {
    expect(expectedWeightAt(60)).toBeCloseTo(5.4, 5);
  });
});

describe("ageWeeksOn", () => {
  it("is 0 on the day of birth", () => {
    expect(ageWeeksOn(DOB, DOB)).toBe(0);
  });

  it("is exactly 8 weeks 56 days later", () => {
    expect(ageWeeksOn("2026-08-21", DOB)).toBeCloseTo(8, 5);
  });

  it("clamps negative (pre-birth) ages to 0", () => {
    expect(ageWeeksOn("2026-06-01", DOB)).toBe(0);
  });
});

describe("growthVerdict", () => {
  const at = (weeksAfterBirth: number) => {
    const d = new Date(DOB + "T00:00:00");
    d.setDate(d.getDate() + Math.round(weeksAfterBirth * 7));
    return d.toISOString().slice(0, 10);
  };

  it("returns null with no weigh-ins", () => {
    expect(growthVerdict([], DOB)).toBeNull();
  });

  it("returns null when the pup is too young for the chart", () => {
    // 4 weeks old — well before the 8-week first anchor (minus 2wk grace)
    expect(growthVerdict([{ date: at(4), value: 0.8 }], DOB)).toBeNull();
  });

  it("says on-track for a mid-band weight", () => {
    // wk12 band is 1.4–2.4 → 1.9 is mid-band
    const v = growthVerdict([{ date: at(12), value: 1.9 }], DOB);
    expect(v?.status).toBe("on-track");
    expect(v?.text).toContain("on track");
  });

  it("says below when clearly under the band", () => {
    const v = growthVerdict([{ date: at(12), value: 0.9 }], DOB);
    expect(v?.status).toBe("below");
  });

  it("says above when clearly over the band", () => {
    const v = growthVerdict([{ date: at(12), value: 4.0 }], DOB);
    expect(v?.status).toBe("above");
  });

  it("gives borderline readings the grace margin (no flapping)", () => {
    // wk12 band is 1.4–2.4, width 1.0 → grace 0.1; 1.35 is within grace of 1.4
    const v = growthVerdict([{ date: at(12), value: 1.35 }], DOB);
    expect(v?.status).toBe("on-track");
  });

  it("uses the most recent weigh-in", () => {
    const v = growthVerdict(
      [
        { date: at(10), value: 0.8 }, // older, low
        { date: at(14), value: 2.3 }, // latest, mid-band (wk14 ≈ 1.65–2.8)
      ],
      DOB,
    );
    expect(v?.status).toBe("on-track");
    expect(v?.kg).toBe(2.3);
  });

  it("ignores entries without a numeric value", () => {
    expect(growthVerdict([{ date: at(12) }], DOB)).toBeNull();
  });
});

describe("bandSeriesFor", () => {
  it("emits one point per weigh-in, sorted, with band bounds", () => {
    const rows = bandSeriesFor(
      [
        { date: "2026-09-18", value: 2.0 }, // later entry listed first
        { date: "2026-08-21", value: 1.5 },
      ],
      DOB,
    );
    expect(rows).toHaveLength(2);
    expect(rows[0].label).toBe("21/08"); // sorted ascending
    expect(rows[0].bandMin).toBeLessThan(rows[0].bandMax);
    // band grows with age
    expect(rows[1].bandMax).toBeGreaterThan(rows[0].bandMax);
  });

  it("filters out non-numeric entries", () => {
    expect(bandSeriesFor([{ date: "2026-09-18" }], DOB)).toHaveLength(0);
  });
});

describe("growthCurveSeries", () => {
  it("spans 8→60 weeks in 2-week steps with expected midline + band", () => {
    const pts = growthCurveSeries([], DOB);
    expect(pts[0].weeks).toBe(8);
    expect(pts[pts.length - 1].weeks).toBe(60);
    expect(pts).toHaveLength(27);
    for (const p of pts) {
      expect(p.bandMin).toBeLessThan(p.bandMax);
      expect(p.expected).toBeGreaterThan(p.bandMin);
      expect(p.expected).toBeLessThan(p.bandMax);
      expect(p.actual).toBeUndefined();
    }
  });

  it("expected midline rises monotonically", () => {
    const pts = growthCurveSeries([], DOB);
    for (let i = 1; i < pts.length; i++) {
      expect(pts[i].expected).toBeGreaterThanOrEqual(pts[i - 1].expected);
    }
  });

  it("snaps actual weigh-ins onto their week", () => {
    // 2026-08-21 is exactly 8 weeks after DOB
    const pts = growthCurveSeries([{ date: "2026-08-21", value: 1.2 }], DOB);
    const wk8 = pts.find((p) => p.weeks === 8);
    expect(wk8?.actual).toBe(1.2);
  });

  it("latest weigh-in in a week wins", () => {
    const pts = growthCurveSeries(
      [
        { date: "2026-08-20", value: 1.1 },
        { date: "2026-08-21", value: 1.25 },
      ],
      DOB,
    );
    const wk8 = pts.find((p) => p.weeks === 8);
    expect(wk8?.actual).toBe(1.25);
  });

  it("odd-week weigh-ins appear on the adjacent even step", () => {
    // 9 weeks after DOB → rounds to week 9, surfaces on the wk8 point (w+1 lookup)
    const d = new Date(DOB + "T00:00:00");
    d.setDate(d.getDate() + 63);
    const iso = d.toISOString().slice(0, 10);
    const pts = growthCurveSeries([{ date: iso, value: 1.4 }], DOB);
    expect(pts.some((p) => p.actual === 1.4)).toBe(true);
  });

  it("ignores non-numeric and zero values", () => {
    const pts = growthCurveSeries([{ date: "2026-08-21" }, { date: "2026-08-22", value: 0 }], DOB);
    expect(pts.every((p) => p.actual === undefined)).toBe(true);
  });
});
