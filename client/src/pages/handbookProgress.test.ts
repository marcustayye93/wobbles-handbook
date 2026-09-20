import { describe, expect, it } from "vitest";
import { sanitizeReadProgress } from "./HandbookIndex";

const SLUGS = ["first-day", "parenting", "coat-science"];

describe("sanitizeReadProgress", () => {
  it("defaults missing chapters to unread", () => {
    expect(sanitizeReadProgress({}, SLUGS)).toEqual({});
    expect(sanitizeReadProgress(undefined, SLUGS)).toEqual({});
  });

  it("wipes the all-100% unopened-mount bug", () => {
    expect(
      sanitizeReadProgress({ "first-day": 1, parenting: 1, "coat-science": 1 }, SLUGS),
    ).toEqual({});
  });

  it("keeps mixed real progress", () => {
    const mixed = { "first-day": 0.4, parenting: 1 };
    expect(sanitizeReadProgress(mixed, SLUGS)).toEqual(mixed);
  });
});
