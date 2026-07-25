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

/* ============================== U6 additions ============================== */

import {
  filterPhotos,
  groupPhotosByYear,
  photoMatches,
  photoYears,
  yearStageLabel,
} from "./photoGroups";

const sp = (id: number, date: string, caption?: string | null) => ({ id, date, caption });

describe("yearStageLabel", () => {
  it("labels the birth year as the puppy year", () => {
    expect(yearStageLabel(2026)).toBe("The puppy year");
  });

  it("labels the first birthday year as adolescence", () => {
    expect(yearStageLabel(2027)).toBe("Turning 1 — adolescence");
  });

  it("maps later years to the daily engine's stage bands", () => {
    expect(yearStageLabel(2029)).toBe("Turning 3 — young adult");
    expect(yearStageLabel(2031)).toBe("Turning 5 — prime years");
    expect(yearStageLabel(2035)).toBe("Turning 9 — senior years");
    expect(yearStageLabel(2039)).toBe("Turning 13 — golden twilight");
  });

  it("labels pre-birth years", () => {
    expect(yearStageLabel(2025)).toBe("Before Wobbles");
  });
});

describe("groupPhotosByYear", () => {
  it("returns no chapters for an empty album", () => {
    expect(groupPhotosByYear([])).toEqual([]);
  });

  it("nests month groups inside year chapters, newest year first", () => {
    const photos = [
      p(4, "2027-01-03"),
      p(3, "2026-12-28"),
      p(2, "2026-07-20"),
      p(1, "2026-07-05"),
    ];
    const chapters = groupPhotosByYear(photos);
    expect(chapters.map((c) => c.key)).toEqual(["2027", "2026"]);
    expect(chapters[0].stageLabel).toBe("Turning 1 — adolescence");
    expect(chapters[0].count).toBe(1);
    expect(chapters[1].count).toBe(3);
    expect(chapters[1].months.map((m) => m.key)).toEqual(["2026-12", "2026-07"]);
  });

  it("collects undated photos in a trailing chapter with no stage label", () => {
    const chapters = groupPhotosByYear([p(2, "2026-07-10"), p(1, "bad-date")]);
    expect(chapters.map((c) => c.key)).toEqual(["2026", "undated"]);
    expect(chapters[1].year).toBe("Undated");
    expect(chapters[1].stageLabel).toBe("");
    expect(chapters[1].count).toBe(1);
  });
});

describe("photoMatches", () => {
  it("matches everything on an empty or whitespace query", () => {
    expect(photoMatches(sp(1, "2026-07-10", "Beach day"), "")).toBe(true);
    expect(photoMatches(sp(1, "2026-07-10", null), "   ")).toBe(true);
  });

  it("matches caption substrings case-insensitively", () => {
    const photo = sp(1, "2026-07-10", "First Beach Day");
    expect(photoMatches(photo, "beach")).toBe(true);
    expect(photoMatches(photo, "BEACH DAY")).toBe(true);
    expect(photoMatches(photo, "mountain")).toBe(false);
  });

  it("matches ISO date fragments", () => {
    const photo = sp(1, "2027-03-14", null);
    expect(photoMatches(photo, "2027-03")).toBe(true);
    expect(photoMatches(photo, "03-14")).toBe(true);
    expect(photoMatches(photo, "2028")).toBe(false);
  });

  it("matches month-name prefixes and pretty dates", () => {
    const photo = sp(1, "2026-12-25", null);
    expect(photoMatches(photo, "dec")).toBe(true);
    expect(photoMatches(photo, "december")).toBe(true);
    expect(photoMatches(photo, "25 december 2026")).toBe(true);
    expect(photoMatches(photo, "january")).toBe(false);
  });

  it("handles photos with no caption safely", () => {
    expect(photoMatches(sp(1, "2026-07-10"), "anything")).toBe(false);
  });
});

describe("filterPhotos", () => {
  const album = [
    sp(3, "2027-01-03", "New year walk"),
    sp(2, "2026-12-28", "Christmas beach trip"),
    sp(1, "2026-07-05", "Tiny pup"),
  ];

  it("filters by year chip alone", () => {
    expect(filterPhotos(album, "", "2026").map((x) => x.id)).toEqual([2, 1]);
  });

  it("combines query AND year chip", () => {
    expect(filterPhotos(album, "beach", "2026").map((x) => x.id)).toEqual([2]);
    expect(filterPhotos(album, "beach", "2027")).toEqual([]);
  });

  it("returns everything with no query and no year", () => {
    expect(filterPhotos(album, "", null)).toHaveLength(3);
  });
});

describe("photoYears", () => {
  it("returns distinct years newest first, skipping malformed dates", () => {
    const years = photoYears([
      p(1, "2026-07-05"),
      p(2, "2027-01-03"),
      p(3, "2026-12-28"),
      p(4, "oops"),
    ]);
    expect(years).toEqual(["2027", "2026"]);
  });

  it("returns empty for an empty album", () => {
    expect(photoYears([])).toEqual([]);
  });
});
