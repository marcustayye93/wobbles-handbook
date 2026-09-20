/*
 * Birth date + Singapore calendar helpers — the Home/Ask/Photos drift
 * (26 July vs 26 June, 12w1d vs 12w2d) is a timezone parsing bug.
 */
import { describe, expect, it } from "vitest";
import {
  WOBBLES,
  calendarDaysSince,
  formatDate,
  formatDateLong,
  wobblesAge,
  ymdSingapore,
} from "./wobbles";

describe("WOBBLES.dob is the single source of truth", () => {
  it("is 26 June 2026", () => {
    expect(WOBBLES.dob).toBe("2026-06-26");
    expect(formatDate(WOBBLES.dob)).toBe("26 Jun 2026");
    expect(formatDateLong(WOBBLES.dob)).toBe("26 June 2026");
  });

  it("does not drift to July via Date parsing", () => {
    expect(formatDateLong("2026-06-26")).not.toMatch(/July/);
    expect(formatDate("2026-06-26")).not.toMatch(/Jul[^n]/);
  });
});

describe("Singapore calendar age", () => {
  it("counts whole calendar days in Asia/Singapore, not the host TZ", () => {
    // 20 Sep 2026 00:30 SGT = 19 Sep 16:30 UTC. UTC-day math would be 12w 1d.
    const justAfterMidnightSgt = new Date("2026-09-19T16:30:00.000Z");
    expect(ymdSingapore(justAfterMidnightSgt)).toEqual({ y: 2026, m: 9, d: 20 });
    expect(calendarDaysSince("2026-06-26", justAfterMidnightSgt)).toBe(86);
    const age = wobblesAge(justAfterMidnightSgt);
    expect(age).toMatchObject({ born: true, weeks: 12, remDays: 2 });
  });
});
