/*
 * Growth band — unit tests for the pure functions behind the weight chart's
 * expected toy-Cavoodle corridor and the on-track verdict card.
 */
import { describe, expect, it } from "vitest";
import {
  GROWTH_BAND,
  expectedBandAt,
  ageWeeksOn,
  growthVerdict,
  bandSeriesFor,
} from "../client/src/lib/growthBand";

const DOB = "2026-06-26"; // Wobbles' actual date of birth

describe("GROWTH_BAND anchors", () => {
  it("is sorted by weeks and min < max everywhere", () => {
    for (let i = 0; i < GROWTH_BAND.length; i++) {
      expect(GROWTH_BAND[i].min).toBeLessThan(GROWTH_BAND[i].max);
      if (i > 0) expect(GROWTH_BAND[i].weeks).toBeGreaterThan(GROWTH_BAND[i - 1].weeks);
    }
  });

  it("tops out at the 5–8 kg toy Cavoodle adult range", () => {
    const last = GROWTH_BAND[GROWTH_BAND.length - 1];
    expect(last.min).toBe(5.0);
    expect(last.max).toBe(8.0);
  });
});

describe("expectedBandAt", () => {
  it("clamps below the first anchor", () => {
    expect(expectedBandAt(4)).toEqual({ min: 1.0, max: 2.0 });
  });

  it("clamps above the last anchor", () => {
    expect(expectedBandAt(120)).toEqual({ min: 5.0, max: 8.0 });
  });

  it("returns exact values at anchors", () => {
    expect(expectedBandAt(16)).toEqual({ min: 2.2, max: 4.0 });
  });

  it("interpolates linearly between anchors", () => {
    // halfway between wk8 (1.0–2.0) and wk12 (1.6–3.0) → wk10 = 1.3–2.5
    const b = expectedBandAt(10);
    expect(b.min).toBeCloseTo(1.3, 5);
    expect(b.max).toBeCloseTo(2.5, 5);
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
    const v = growthVerdict([{ date: at(12), value: 2.2 }], DOB);
    expect(v?.status).toBe("on-track");
    expect(v?.text).toContain("on track");
  });

  it("says below when clearly under the band", () => {
    const v = growthVerdict([{ date: at(12), value: 1.0 }], DOB);
    expect(v?.status).toBe("below");
  });

  it("says above when clearly over the band", () => {
    const v = growthVerdict([{ date: at(12), value: 4.5 }], DOB);
    expect(v?.status).toBe("above");
  });

  it("gives borderline readings the grace margin (no flapping)", () => {
    // wk12 band is 1.6–3.0, width 1.4 → grace ≈ 0.105; 1.55 is within grace of 1.6
    const v = growthVerdict([{ date: at(12), value: 1.55 }], DOB);
    expect(v?.status).toBe("on-track");
  });

  it("uses the most recent weigh-in", () => {
    const v = growthVerdict(
      [
        { date: at(10), value: 1.0 }, // older, low
        { date: at(14), value: 2.6 }, // latest, mid-band (wk14 ≈ 1.9–3.5)
      ],
      DOB,
    );
    expect(v?.status).toBe("on-track");
    expect(v?.kg).toBe(2.6);
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
