/*
 * Tests for the household daily engine (client/src/content/household.ts and
 * lib/wobblesToday.ts daily layer). Pure functions, deterministic by date.
 */
import { describe, expect, it } from "vitest";
import {
  dayPlanFor,
  careTasksFor,
  activityFor,
  bonusActivityFor,
  isParkNight,
  WEEK_PLAN,
} from "../client/src/content/household";
import { todaysBrief, todaysNudges, wobblesToday } from "../client/src/lib/wobblesToday";

const d = (iso: string) => new Date(iso + "T09:00:00");

describe("weekly household schedule", () => {
  it("has all 7 days with correct presences", () => {
    expect(WEEK_PLAN).toHaveLength(7);
    expect(dayPlanFor(d("2026-11-02")).marcus).toBe("home"); // Monday WFH
    expect(dayPlanFor(d("2026-11-03")).marcus).toBe("office"); // Tuesday
    expect(dayPlanFor(d("2026-11-03")).chesa).toBe("maybe-office");
    expect(dayPlanFor(d("2026-11-04")).chesa).toBe("home"); // Wednesday
    expect(dayPlanFor(d("2026-11-06")).marcus).toBe("home"); // Friday WFH
    expect(dayPlanFor(d("2026-11-08")).note).toContain("focus day"); // Sunday
  });
});

describe("care rota", () => {
  it("puts bath on alternate Mondays anchored to 2026-09-21", () => {
    expect(careTasksFor(d("2026-09-21")).map((t) => t.id)).toContain("bath");
    expect(careTasksFor(d("2026-09-28")).map((t) => t.id)).not.toContain("bath");
    expect(careTasksFor(d("2026-10-05")).map((t) => t.id)).toContain("bath");
  });

  it("always includes nails + ears on Mondays, never on other days", () => {
    const mon = careTasksFor(d("2026-09-28")).map((t) => t.id);
    expect(mon).toEqual(expect.arrayContaining(["nails", "ears"]));
    expect(careTasksFor(d("2026-09-02")).map((t) => t.id)).not.toContain("nails");
  });

  it("fires the parasite dose on the 18th of any month", () => {
    expect(careTasksFor(d("2026-09-18")).map((t) => t.id)).toContain("parasite");
    expect(careTasksFor(d("2026-10-18")).map((t) => t.id)).toContain("parasite");
    expect(careTasksFor(d("2026-09-17")).map((t) => t.id)).not.toContain("parasite");
  });

  it("schedules teeth on Tue/Thu/Sat", () => {
    expect(careTasksFor(d("2026-09-01")).map((t) => t.id)).toContain("teeth"); // Tue
    expect(careTasksFor(d("2026-09-03")).map((t) => t.id)).toContain("teeth"); // Thu
    expect(careTasksFor(d("2026-09-05")).map((t) => t.id)).toContain("teeth"); // Sat
    expect(careTasksFor(d("2026-09-02")).map((t) => t.id)).not.toContain("teeth"); // Wed
  });
});

describe("rotating activity ideas", () => {
  it("is deterministic for a given date", () => {
    expect(activityFor(d("2026-09-02"), false)).toEqual(activityFor(d("2026-09-02"), false));
  });

  it("varies across a week", () => {
    const week = [
      "2026-09-07",
      "2026-09-08",
      "2026-09-09",
      "2026-09-10",
      "2026-09-11",
      "2026-09-12",
      "2026-09-13",
    ];
    const titles = week.map((iso) => activityFor(d(iso), false).title);
    expect(new Set(titles).size).toBeGreaterThanOrEqual(5);
  });

  it("serves prep ideas pre-homecoming", () => {
    const idea = activityFor(d("2026-08-01"), true);
    expect([
      "Prep mission",
      "Puppy-proof patrol",
      "Chapter night",
      "Cue-word summit",
      "Den dry-run",
      "Scout the route",
    ]).toContain(idea.title);
  });

  it("bonus idea differs from the main idea", () => {
    const date = d("2026-09-09");
    expect(bonusActivityFor(date, false).title).not.toBe(activityFor(date, false).title);
  });
});

describe("park night rhythm", () => {
  it("alternates days anchored to 2026-09-19", () => {
    expect(isParkNight(d("2026-09-19"))).toBe(true);
    expect(isParkNight(d("2026-09-20"))).toBe(false);
    expect(isParkNight(d("2026-09-21"))).toBe(true);
    expect(isParkNight(d("2026-09-17"))).toBe(false); // before anchor
  });
});

describe("todaysBrief", () => {
  it("assembles plan, care, activity and park flag for a date", () => {
    const brief = todaysBrief(d("2027-01-18")); // Monday + 18th
    expect(brief.plan.label).toBe("Monday");
    expect(brief.whoHome).toBe("Everyone home"); // Monday: Marcus WFH + Chesa home
    expect(brief.care.map((c) => c.id)).toEqual(
      expect.arrayContaining(["nails", "ears", "parasite"]),
    );
    expect(brief.activity.title.length).toBeGreaterThan(0);
    expect(typeof brief.parkNight).toBe("boolean");
  });

  it("labels weekends as everyone home", () => {
    expect(todaysBrief(d("2026-09-06")).whoHome).toBe("Everyone home");
  });
});

describe("todaysNudges with person tags", () => {
  const noEntries = () => [] as never[];

  it("prioritises care-rota nudges with owners on Mondays post-homecoming", () => {
    const nudges = todaysNudges(noEntries, {}, d("2026-09-21")); // bath Monday
    expect(nudges.length).toBeGreaterThan(0);
    expect(nudges[0].id).toContain("care-");
    const nails = nudges.find((n) => n.id === "care-nails");
    if (nails) expect(nails.person).toBe("Marcus");
  });

  it("caps at three nudges", () => {
    expect(todaysNudges(noEntries, {}, d("2026-10-18")).length).toBeLessThanOrEqual(3);
  });

  it("still returns only the reading nudge pre-homecoming", () => {
    const nudges = todaysNudges(noEntries, { "first-day": 0.5 }, d("2026-08-01"));
    expect(nudges.map((n) => n.id)).toEqual(["resume"]);
  });
});

describe("wobblesToday stage layer accepts a date", () => {
  it("returns litter stage early August, breeder export prep late August, junior in December", () => {
    expect(wobblesToday(d("2026-08-01")).stage.toLowerCase()).toContain("litter"); // 5w old
    expect(wobblesToday(d("2026-08-25")).stage.toLowerCase()).toContain("breeder"); // ~8.5w old
    expect(wobblesToday(d("2026-12-01")).stage).toContain("Junior");
  });
});
