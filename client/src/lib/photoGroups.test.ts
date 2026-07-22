/*
 * Tests for the photo journal month grouping helpers.
 * WOBBLES.dob is 2026-06-26, so ages below are computed against that date.
 */
import { describe, expect, it } from "vitest";
import { groupPhotosByMonth, monthAgeLabel } from "./photoGroups";

const p = (id: number, date: string) => ({ id, date });

describe("groupPhotosByMonth", () => {
  it("returns no groups for an empty album", () => {
    expect(groupPhotosByMonth([])).toEqual([]);
  });

  it("groups photos into month buckets preserving newest-first order", () => {
    const photos = [
      p(4, "2026-08-02"),
      p(3, "2026-08-01"),
      p(2, "2026-07-20"),
      p(1, "2026-07-05"),
    ];
    const groups = groupPhotosByMonth(photos);
    expect(groups.map((g) => g.key)).toEqual(["2026-08", "2026-07"]);
    expect(groups[0].label).toBe("August 2026");
    expect(groups[1].label).toBe("July 2026");
    expect(groups[0].photos.map((x) => x.id)).toEqual([4, 3]);
    expect(groups[1].photos.map((x) => x.id)).toEqual([2, 1]);
  });

  it("keeps within-month order exactly as given", () => {
    const photos = [p(9, "2026-07-31"), p(8, "2026-07-01"), p(7, "2026-07-15")];
    const groups = groupPhotosByMonth(photos);
    expect(groups).toHaveLength(1);
    expect(groups[0].photos.map((x) => x.id)).toEqual([9, 8, 7]);
  });

  it("puts malformed dates into a trailing Undated bucket", () => {
    const photos = [p(2, "2026-07-10"), p(1, "not-a-date")];
    const groups = groupPhotosByMonth(photos);
    expect(groups.map((g) => g.key)).toEqual(["2026-07", "undated"]);
    expect(groups[1].label).toBe("Undated");
    expect(groups[1].ageLabel).toBe("");
    expect(groups[1].photos.map((x) => x.id)).toEqual([1]);
  });

  it("spans year boundaries with correct labels", () => {
    const photos = [p(2, "2027-01-03"), p(1, "2026-12-28")];
    const groups = groupPhotosByMonth(photos);
    expect(groups.map((g) => g.label)).toEqual(["January 2027", "December 2026"]);
  });
});

describe("monthAgeLabel", () => {
  it("returns empty string for no dates", () => {
    expect(monthAgeLabel([])).toBe("");
  });

  it("shows a single age when all photos share a week", () => {
    // 2026-07-10 is exactly 2w0d after dob 2026-06-26 → week 2
    expect(monthAgeLabel(["2026-07-10", "2026-07-11"])).toBe("2w old");
  });

  it("shows a range when photos span several weeks", () => {
    // 2026-07-03 → week 1; 2026-07-31 → week 5
    expect(monthAgeLabel(["2026-07-31", "2026-07-03"])).toBe("1w–5w old");
  });

  it("clamps pre-birth dates to 0w when mixed with post-birth dates", () => {
    // 2026-06-20 is before dob (negative week); 2026-06-28 → week 0
    expect(monthAgeLabel(["2026-06-28", "2026-06-20"])).toBe("0w old");
  });

  it("labels months entirely before birth", () => {
    expect(monthAgeLabel(["2026-05-01"])).toBe("before Wobbles was born");
  });

  it("switches to years+weeks format after the first birthday", () => {
    // 2027-07-02 is 53 weeks and 1 day after 2026-06-26 → week 53 → 1y 1w
    expect(monthAgeLabel(["2027-07-02"])).toBe("1y 1w old");
  });
});
