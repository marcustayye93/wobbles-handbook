/*
 * Coat Length Check helpers — series building, age/gap labels,
 * default comparison pair, and the since-last-check nudge.
 */
import { describe, expect, it } from "vitest";
import {
  COAT_CHECK_CATEGORY,
  ageLabelAt,
  coatCheckSeries,
  daysBetweenISO,
  defaultComparePair,
  sinceLastCheckLabel,
} from "./coatCheck";

const DOB = "2026-07-01";

const photo = (
  id: number,
  date: string,
  category: string | null = COAT_CHECK_CATEGORY,
) => ({ id, url: `u${id}`, date, category });

describe("daysBetweenISO", () => {
  it("computes whole-day gaps", () => {
    expect(daysBetweenISO("2026-10-12", "2026-10-26")).toBe(14);
    expect(daysBetweenISO("2026-10-26", "2026-10-26")).toBe(0);
  });
});

describe("ageLabelAt", () => {
  it("uses weeks under ~6 months", () => {
    expect(ageLabelAt(DOB, "2026-10-12")).toBe("14w 5d");
  });
  it("uses months from 26 weeks and years past 12 months", () => {
    expect(ageLabelAt(DOB, "2027-02-01")).toBe("7 months");
    expect(ageLabelAt(DOB, "2027-10-01")).toBe("1y 3m");
  });
});

describe("coatCheckSeries", () => {
  it("filters to coat-check photos, sorts oldest first, labels gaps", () => {
    const series = coatCheckSeries(
      [
        photo(3, "2026-11-09"),
        photo(1, "2026-10-12"),
        photo(9, "2026-10-20", null), // ordinary album photo — excluded
        photo(2, "2026-10-26"),
      ],
      DOB,
    );
    expect(series.map((s) => s.id)).toEqual([1, 2, 3]);
    expect(series[0].daysSincePrev).toBeNull();
    expect(series[1].daysSincePrev).toBe(14);
    expect(series[2].daysSincePrev).toBe(14);
    expect(series[0].ageLabel).toBe("14w 5d");
  });

  it("breaks same-date ties by id so the order is stable", () => {
    const series = coatCheckSeries(
      [photo(5, "2026-10-12"), photo(4, "2026-10-12")],
      DOB,
    );
    expect(series.map((s) => s.id)).toEqual([4, 5]);
  });
});

describe("defaultComparePair", () => {
  it("returns null on empty, duplicates a single photo, else latest vs previous", () => {
    expect(defaultComparePair([])).toBeNull();
    const one = defaultComparePair([{ id: 1 }]);
    expect(one?.left.id).toBe(1);
    expect(one?.right.id).toBe(1);
    const pair = defaultComparePair([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(pair?.left.id).toBe(2);
    expect(pair?.right.id).toBe(3);
  });
});

describe("sinceLastCheckLabel", () => {
  it("is null with no checks and friendly for fresh ones", () => {
    expect(sinceLastCheckLabel([], "2026-10-26")).toBeNull();
    expect(sinceLastCheckLabel([{ date: "2026-10-26" }], "2026-10-26")).toBe(
      "Updated today",
    );
    expect(sinceLastCheckLabel([{ date: "2026-10-25" }], "2026-10-26")).toBe(
      "1 day since the last check",
    );
  });
  it("flags overdue past three weeks (a missed fortnightly bath)", () => {
    expect(sinceLastCheckLabel([{ date: "2026-10-01" }], "2026-10-26")).toBe(
      "25 days since the last check — overdue for a bath + trim photo",
    );
  });
});
