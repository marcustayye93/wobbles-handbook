/*
 * U7 — Quality-of-life (HHHHHMM) scoring specs.
 * Covers band maths, total clamping, note encoding, and the qol tracker meta.
 */
import { describe, expect, it } from "vitest";
import {
  QOL_DIMENSIONS,
  QOL_MAX,
  qolBand,
  qolBandCopy,
  qolTotal,
  encodeQolNote,
} from "../client/src/lib/qol";
import { TRACKERS } from "../client/src/lib/trackers";

describe("U7 · QoL dimensions", () => {
  it("has exactly seven HHHHHMM dimensions with anchors", () => {
    expect(QOL_DIMENSIONS).toHaveLength(7);
    const labels = QOL_DIMENSIONS.map((d) => d.label);
    expect(labels).toEqual([
      "Hurt",
      "Hunger",
      "Hydration",
      "Hygiene",
      "Happiness",
      "Mobility",
      "More good days than bad",
    ]);
    for (const d of QOL_DIMENSIONS) {
      expect(d.high.length).toBeGreaterThan(5);
      expect(d.low.length).toBeGreaterThan(5);
    }
  });

  it("QOL_MAX is 35 (7 × 5)", () => {
    expect(QOL_MAX).toBe(35);
  });
});

describe("U7 · qolTotal", () => {
  it("sums scores", () => {
    expect(qolTotal([5, 5, 5, 5, 5, 5, 5])).toBe(35);
    expect(qolTotal([4, 4, 4, 4, 4, 4, 4])).toBe(28);
    expect(qolTotal([0, 0, 0, 0, 0, 0, 0])).toBe(0);
  });

  it("clamps out-of-range values to 0–5", () => {
    expect(qolTotal([9, -3, 5])).toBe(10); // 5 + 0 + 5
  });

  it("rounds fractional scores", () => {
    expect(qolTotal([4.4, 4.6])).toBe(9); // 4 + 5
  });
});

describe("U7 · qolBand", () => {
  it("above 28 is comfortable", () => {
    expect(qolBand(35)).toBe("comfortable");
    expect(qolBand(29)).toBe("comfortable");
  });

  it("21–28 inclusive is watch", () => {
    expect(qolBand(28)).toBe("watch");
    expect(qolBand(24)).toBe("watch");
    expect(qolBand(21)).toBe("watch");
  });

  it("below 21 is vet", () => {
    expect(qolBand(20)).toBe("vet");
    expect(qolBand(0)).toBe("vet");
  });

  it("every band has label + guidance copy", () => {
    for (const band of ["comfortable", "watch", "vet"] as const) {
      const copy = qolBandCopy(band);
      expect(copy.label.length).toBeGreaterThan(3);
      expect(copy.text.length).toBeGreaterThan(20);
    }
  });
});

describe("U7 · encodeQolNote", () => {
  it("encodes all seven dimensions with scores", () => {
    const note = encodeQolNote([4, 5, 5, 4, 4, 3, 4]);
    expect(note).toBe(
      "Hurt 4 · Hunger 5 · Hydration 5 · Hygiene 4 · Happiness 4 · Mobility 3 · More good days than bad 4",
    );
  });

  it("fills missing scores with 0", () => {
    const note = encodeQolNote([5]);
    expect(note).toContain("Hurt 5");
    expect(note).toContain("Hunger 0");
  });
});

describe("U7 · qol tracker meta", () => {
  const qol = TRACKERS.find((t) => t.id === "qol");

  it("exists in the health group with a /35 chart", () => {
    expect(qol).toBeDefined();
    expect(qol!.group).toBe("health");
    expect(qol!.chart).toBeDefined();
    expect(qol!.chart!.unit).toBe("/35");
  });

  it("value field spans the full 0–35 range", () => {
    expect(qol!.fields.value).toBeDefined();
    expect(qol!.fields.value!.min).toBe(0);
    expect(qol!.fields.value!.max).toBe(35);
  });

  it("carries interpretation guidance in its tips", () => {
    expect(qol!.tips.join(" ")).toContain("28");
    expect(qol!.tips.join(" ")).toContain("21");
  });
});
