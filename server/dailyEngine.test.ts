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
  it("puts bath on alternate Mondays anchored to 2026-09-28", () => {
    expect(careTasksFor(d("2026-09-28")).map((t) => t.id)).toContain("bath");
    expect(careTasksFor(d("2026-10-05")).map((t) => t.id)).not.toContain("bath");
    expect(careTasksFor(d("2026-10-12")).map((t) => t.id)).toContain("bath");
  });

  it("always includes nails + ears on Mondays, never on other days", () => {
    const mon = careTasksFor(d("2026-09-28")).map((t) => t.id);
    expect(mon).toEqual(expect.arrayContaining(["nails", "ears"]));
    expect(careTasksFor(d("2026-09-02")).map((t) => t.id)).not.toContain("nails");
  });

  it("fires the parasite dose on the 24th of any month (homecoming-day anchor)", () => {
    expect(careTasksFor(d("2026-10-24")).map((t) => t.id)).toContain("parasite");
    expect(careTasksFor(d("2026-11-24")).map((t) => t.id)).toContain("parasite");
    expect(careTasksFor(d("2026-10-18")).map((t) => t.id)).not.toContain("parasite");
  });

  it("schedules teeth on Tue/Thu/Sat", () => {
    expect(careTasksFor(d("2026-09-01")).map((t) => t.id)).toContain("teeth"); // Tue
    expect(careTasksFor(d("2026-09-03")).map((t) => t.id)).toContain("teeth"); // Thu
    expect(careTasksFor(d("2026-09-05")).map((t) => t.id)).toContain("teeth"); // Sat
    expect(careTasksFor(d("2026-09-02")).map((t) => t.id)).not.toContain("teeth"); // Wed
  });

  it("runs nail grinder sessions 2 & 3 on Wed/Sat, not other days", () => {
    expect(careTasksFor(d("2026-09-30")).map((t) => t.id)).toContain("nails-grind"); // Wed
    expect(careTasksFor(d("2026-10-03")).map((t) => t.id)).toContain("nails-grind"); // Sat
    expect(careTasksFor(d("2026-10-01")).map((t) => t.id)).not.toContain("nails-grind"); // Thu
  });

  it("adds sanitary check + training review on Wednesdays", () => {
    const wed = careTasksFor(d("2026-09-30")).map((t) => t.id);
    expect(wed).toEqual(expect.arrayContaining(["sanitary", "training-review"]));
    expect(careTasksFor(d("2026-10-01")).map((t) => t.id)).not.toContain("sanitary");
  });

  it("adds food review + human jobs on Fridays", () => {
    const fri = careTasksFor(d("2026-10-02")).map((t) => t.id);
    expect(fri).toEqual(expect.arrayContaining(["food-review", "human-jobs"]));
    expect(careTasksFor(d("2026-10-01")).map((t) => t.id)).not.toContain("food-review");
  });

  it("adds crate clean + toy audit on Saturdays and the photo prompt on Sundays", () => {
    const sat = careTasksFor(d("2026-10-03")).map((t) => t.id);
    expect(sat).toEqual(expect.arrayContaining(["crate-clean", "toy-audit"]));
    const sun = careTasksFor(d("2026-10-04")).map((t) => t.id);
    expect(sun).toContain("photo-prompt");
    expect(careTasksFor(d("2026-10-05")).map((t) => t.id)).not.toContain("photo-prompt");
  });

  it("includes the two daily anchors every day, flagged daily and pushed last", () => {
    for (const iso of ["2026-09-28", "2026-09-30", "2026-10-02", "2026-10-04"]) {
      const tasks = careTasksFor(d(iso));
      const ids = tasks.map((t) => t.id);
      expect(ids).toEqual(expect.arrayContaining(["hydration", "paw-check"]));
      const daily = tasks.filter((t) => t.daily).map((t) => t.id);
      expect(daily.sort()).toEqual(["hydration", "paw-check"]);
      // Date-anchored jobs come first; daily anchors sit at the bottom
      expect(ids.slice(-2).sort()).toEqual(["hydration", "paw-check"]);
    }
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
  it("alternates days anchored to 2026-09-25", () => {
    expect(isParkNight(d("2026-09-25"))).toBe(true);
    expect(isParkNight(d("2026-09-26"))).toBe(false);
    expect(isParkNight(d("2026-09-27"))).toBe(true);
    expect(isParkNight(d("2026-09-23"))).toBe(false); // before anchor
  });
});

describe("todaysBrief", () => {
  it("assembles plan, care, activity and park flag for a date", () => {
    const brief = todaysBrief(d("2027-05-24")); // Monday + 24th
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
    const nudges = todaysNudges(noEntries, {}, d("2026-09-28")); // bath Monday
    expect(nudges.length).toBeGreaterThan(0);
    expect(nudges[0].id).toContain("care-");
    const nails = nudges.find((n) => n.id === "care-nails");
    if (nails) expect(nails.person).toBe("Marcus");
  });

  it("caps at three nudges", () => {
    expect(todaysNudges(noEntries, {}, d("2026-10-24")).length).toBeLessThanOrEqual(3);
  });

  it("never spends nudge slots on the daily anchors (hydration / paw check)", () => {
    for (const iso of ["2026-09-28", "2026-09-30", "2026-10-02", "2026-10-04"]) {
      const ids = todaysNudges(noEntries, {}, d(iso)).map((n) => n.id);
      expect(ids).not.toContain("care-hydration");
      expect(ids).not.toContain("care-paw-check");
    }
  });

  it("surfaces the new weekly rota jobs as owned nudges on their days", () => {
    const wed = todaysNudges(noEntries, {}, d("2026-09-30")).map((n) => n.id);
    expect(wed.some((id) => id.startsWith("care-"))).toBe(true);
    const sun = todaysNudges(noEntries, {}, d("2026-10-04"));
    expect(sun.find((n) => n.id === "care-photo-prompt")).toBeDefined();
  });

  it("never emits the retired reading nudge, even with partial read progress", () => {
    const nudges = todaysNudges(noEntries, { "first-day": 0.5 }, d("2026-08-01"));
    expect(nudges.find((n) => n.id === "resume")).toBeUndefined();
  });
});

describe("wobblesToday stage layer accepts a date", () => {
  it("returns litter stage early August, breeder export prep late August, junior in December", () => {
    expect(wobblesToday(d("2026-08-01")).stage.toLowerCase()).toContain("litter"); // 5w old
    expect(wobblesToday(d("2026-08-25")).stage.toLowerCase()).toContain("breeder"); // ~8.5w old
    expect(wobblesToday(d("2026-12-01")).stage).toContain("Junior");
  });
});

/* ---------------- U1: lifetime stage engine ---------------- */
import { nextBirthday } from "../client/src/lib/wobblesToday";
import { LIFETIME_SECTIONS, SECTIONS, getSection } from "../client/src/content/handbookSections";

describe("lifetime stages (U1)", () => {
  it("covers every age from adolescence to twilight", () => {
    expect(wobblesToday(d("2027-08-01")).stage).toContain("Adolescence"); // ~13 mo
    expect(wobblesToday(d("2028-06-01")).stage).toContain("Young adult"); // ~23 mo
    expect(wobblesToday(d("2031-06-01")).stage).toContain("Prime"); // ~5 yr
    expect(wobblesToday(d("2035-06-01")).stage).toContain("Senior"); // ~9 yr
    expect(wobblesToday(d("2039-06-01")).stage).toContain("twilight"); // ~13 yr
  });

  it("links each lifetime stage to its handbook chapter", () => {
    const links = [
      wobblesToday(d("2027-08-01")).link,
      wobblesToday(d("2028-06-01")).link,
      wobblesToday(d("2031-06-01")).link,
      wobblesToday(d("2035-06-01")).link,
      wobblesToday(d("2039-06-01")).link,
    ];
    expect(links).toEqual([
      "/handbook/adolescence",
      "/handbook/adult-rhythm",
      "/handbook/prime-years",
      "/handbook/golden-years",
      "/handbook/twilight-care",
    ]);
    for (const link of links) {
      expect(getSection(link.replace("/handbook/", ""))).toBeDefined();
    }
  });
});

describe("nextBirthday (U1)", () => {
  it("computes the upcoming birthday and the age he turns", () => {
    expect(nextBirthday(d("2027-06-01"))).toEqual({ iso: "2027-06-26", turning: 1 });
    expect(nextBirthday(d("2027-06-26"))).toEqual({ iso: "2027-06-26", turning: 1 }); // on the day
    expect(nextBirthday(d("2027-06-27"))).toEqual({ iso: "2028-06-26", turning: 2 });
    expect(nextBirthday(d("2033-12-31"))).toEqual({ iso: "2034-06-26", turning: 8 });
  });
});

describe("lifetime nudges (U1)", () => {
  const none = () => [] as never[];

  it("emits the monthly adult weigh-in when the log is stale", () => {
    // Tuesday: teeth is the only rota job (excluded from nudges), so the
    // data-driven weigh-in fits inside the 3-nudge cap.
    const nudges = todaysNudges(none, {}, d("2028-03-14"));
    expect(nudges.find((n) => n.id === "weigh-monthly")).toBeDefined();
    expect(nudges.find((n) => n.id === "weigh")).toBeUndefined(); // puppy weekly nudge retired
  });

  it("emits senior vet + QoL nudges from age 8", () => {
    const senior = todaysNudges(none, {}, d("2035-03-15")); // ~8.7 yr
    const ids = senior.map((n) => n.id);
    expect(ids).toContain("senior-vet");
    expect(ids.length).toBeLessThanOrEqual(3);
    const adult = todaysNudges(none, {}, d("2028-03-15"));
    expect(adult.find((n) => n.id === "senior-vet")).toBeUndefined();
  });

  it("announces the birthday inside the 14-day window", () => {
    const before = todaysNudges(none, {}, d("2027-06-15"));
    expect(before.find((n) => n.id === "birthday")?.text).toContain("turns 1");
    const onDay = todaysNudges(none, {}, d("2027-06-26"));
    expect(onDay.find((n) => n.id === "birthday")?.text).toContain("happy birthday");
    const farOff = todaysNudges(none, {}, d("2027-03-01"));
    expect(farOff.find((n) => n.id === "birthday")).toBeUndefined();
  });
});

describe("lifetime handbook chapters (U1)", () => {
  it("registers five stage chapters with unique slugs and ascending unlock ages", () => {
    expect(LIFETIME_SECTIONS).toHaveLength(5);
    const slugs = LIFETIME_SECTIONS.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(5);
    const unlocks = LIFETIME_SECTIONS.map((s) => s.unlockMonths ?? -1);
    expect(unlocks).toEqual([...unlocks].sort((a, b) => a - b));
    expect(unlocks[0]).toBe(12);
    expect(unlocks[4]).toBe(144);
  });

  it("keeps lifetime chapters searchable through the combined SECTIONS export", () => {
    for (const s of LIFETIME_SECTIONS) {
      expect(SECTIONS.find((x) => x.slug === s.slug)).toBeDefined();
      expect(s.stage).toBeTruthy();
      expect(s.blocks.length).toBeGreaterThanOrEqual(5);
    }
  });
});
