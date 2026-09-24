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
import {
  socialMissionFor,
  PRECLEAR_MISSIONS,
  ALL_GROUND_MISSIONS,
  missionCategoriesIn,
} from "../client/src/content/socialMissions";

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
  it("is silent before homecoming — no teeth/nails/bath while he is in Queensland", () => {
    expect(careTasksFor(d("2026-09-19"))).toEqual([]);
    expect(careTasksFor(d("2026-09-22"))).toEqual([]);
  });

  it("puts bath on alternate Mondays anchored to 2026-10-05, not day 5", () => {
    expect(careTasksFor(d("2026-09-28")).map((t) => t.id)).not.toContain("bath");
    expect(careTasksFor(d("2026-10-05")).map((t) => t.id)).toContain("bath");
    expect(careTasksFor(d("2026-10-12")).map((t) => t.id)).not.toContain("bath");
    expect(careTasksFor(d("2026-10-19")).map((t) => t.id)).toContain("bath");
  });

  it("always includes nails + ears on Mondays after landing, never on other days", () => {
    const mon = careTasksFor(d("2026-10-05")).map((t) => t.id);
    expect(mon).toEqual(expect.arrayContaining(["nails", "ears"]));
    expect(careTasksFor(d("2026-10-06")).map((t) => t.id)).not.toContain("nails");
  });

  it("fires the parasite dose on the 24th of any month after landing", () => {
    expect(careTasksFor(d("2026-10-24")).map((t) => t.id)).toContain("parasite");
    expect(careTasksFor(d("2026-11-24")).map((t) => t.id)).toContain("parasite");
    expect(careTasksFor(d("2026-10-18")).map((t) => t.id)).not.toContain("parasite");
    expect(careTasksFor(d("2026-08-24")).map((t) => t.id)).not.toContain("parasite");
  });

  it("puts the booked SingVet visit on Friday 2 Oct 2026 only", () => {
    const visit = careTasksFor(d("2026-10-02")).find((t) => t.id === "singvet-first");
    expect(visit?.label).toMatch(/4pm/);
    expect(visit?.detail).toMatch(/not the 16 Oct core/i);
    expect(careTasksFor(d("2026-10-01")).map((t) => t.id)).not.toContain("singvet-first");
    expect(careTasksFor(d("2026-10-03")).map((t) => t.id)).not.toContain("singvet-first");
  });

  it("ramps alone time from 24 Sep (day 1) and stops after 7 Oct", () => {
    expect(careTasksFor(d("2026-09-23")).map((t) => t.id)).not.toContain("alone-ramp");
    expect(careTasksFor(d("2026-09-24")).find((t) => t.id === "alone-ramp")?.label).toBe(
      "Alone time: 5 to 10 minutes",
    );
    expect(careTasksFor(d("2026-09-25")).find((t) => t.id === "alone-ramp")?.label).toBe(
      "Alone time: 5 to 10 minutes",
    );
    expect(careTasksFor(d("2026-09-26")).find((t) => t.id === "alone-ramp")?.detail).toMatch(
      /Coffee-run/,
    );
    expect(careTasksFor(d("2026-09-28")).find((t) => t.id === "alone-ramp")?.detail).toMatch(
      /working from home/,
    );
    expect(careTasksFor(d("2026-09-29")).find((t) => t.id === "alone-ramp")?.label).toBe(
      "Alone time: 1 to 1.5 hours",
    );
    expect(careTasksFor(d("2026-10-02")).find((t) => t.id === "alone-ramp")?.label).toBe(
      "Alone time: 1.5 to 2 hours",
    );
    expect(careTasksFor(d("2026-10-03")).find((t) => t.id === "alone-ramp")?.label).toBe(
      "Alone time: 2.5 to 3 hours",
    );
    expect(careTasksFor(d("2026-10-07")).find((t) => t.id === "alone-ramp")?.label).toBe(
      "Alone time: 2.5 to 3 hours",
    );
    expect(careTasksFor(d("2026-10-08")).map((t) => t.id)).not.toContain("alone-ramp");
    const today = careTasksFor(d("2026-09-24")).find((t) => t.id === "alone-ramp");
    expect(today?.detail).toMatch(/2 to 3 reps/);
    expect(today?.detail).toMatch(/frozen Kong/);
    expect(today?.detail).toMatch(/do not come back mid-cry/i);
    expect(careTasksFor(d("2026-09-28")).find((t) => t.id === "alone-ramp")?.detail).toMatch(
      /2 to 3 reps/,
    );
    const tuesday = careTasksFor(d("2026-09-29")).find((t) => t.id === "alone-ramp");
    expect(tuesday?.detail).toMatch(/One absence today/);
    expect(tuesday?.detail).not.toMatch(/2 to 3 reps/);
    expect(careTasksFor(d("2026-10-07")).find((t) => t.id === "alone-ramp")?.detail).toMatch(
      /One absence today/,
    );
  });

  it("repeats yesterday's alone duration when a rep was a cry", () => {
    const logs = [{ date: "2026-09-26", option: "Barked / cried" }];
    const held = careTasksFor(d("2026-09-27"), { aloneLogs: logs }).find((t) => t.id === "alone-ramp");
    expect(held?.label).toBe("Alone time: 15 to 20 minutes");
    expect(held?.detail).toMatch(/Do not move up/);
    const calm = careTasksFor(d("2026-09-27"), {
      aloneLogs: [{ date: "2026-09-26", option: "Calm the whole time 😌" }],
    }).find((t) => t.id === "alone-ramp");
    expect(calm?.label).toBe("Alone time: 30 to 45 minutes");
    const heldShort = careTasksFor(d("2026-09-29"), {
      aloneLogs: [{ date: "2026-09-28", option: "Barked / cried" }],
    }).find((t) => t.id === "alone-ramp");
    expect(heldShort?.label).toBe("Alone time: 30 to 45 minutes");
    expect(heldShort?.detail).toMatch(/2 to 3 reps/);
    expect(heldShort?.detail).not.toMatch(/One absence today/);
  });

  it("schedules teeth on Tue/Thu/Sat after landing", () => {
    expect(careTasksFor(d("2026-09-29")).map((t) => t.id)).toContain("teeth"); // Tue
    expect(careTasksFor(d("2026-10-01")).map((t) => t.id)).toContain("teeth"); // Thu
    expect(careTasksFor(d("2026-10-03")).map((t) => t.id)).toContain("teeth"); // Sat
    expect(careTasksFor(d("2026-09-30")).map((t) => t.id)).not.toContain("teeth"); // Wed
  });

  it("fires the 16-week core reminder the week before 16 Oct 2026, not as an annual booster", () => {
    expect(careTasksFor(d("2026-10-09")).map((t) => t.id)).toContain("core-16w");
    expect(careTasksFor(d("2026-10-15")).map((t) => t.id)).toContain("core-16w");
    expect(careTasksFor(d("2026-10-08")).map((t) => t.id)).not.toContain("core-16w");
    expect(careTasksFor(d("2026-10-16")).map((t) => t.id)).not.toContain("core-16w");
    expect(careTasksFor(d("2026-10-10")).map((t) => t.id)).not.toContain("annual-booster");
  });

  it("fires the annual C3 booster in Oct 2027 and Oct 2028 but not Oct 2026", () => {
    expect(careTasksFor(d("2026-10-05")).map((t) => t.id)).not.toContain("annual-booster");
    expect(careTasksFor(d("2027-10-01")).map((t) => t.id)).toContain("annual-booster");
    expect(careTasksFor(d("2027-10-31")).map((t) => t.id)).toContain("annual-booster");
    expect(careTasksFor(d("2028-10-15")).map((t) => t.id)).toContain("annual-booster");
    expect(careTasksFor(d("2027-09-30")).map((t) => t.id)).not.toContain("annual-booster");
  });

  it("fires blood panels in Jun 2027, and Jun+Dec 2034, but not Jun 2026", () => {
    expect(careTasksFor(d("2026-06-26")).map((t) => t.id)).not.toContain("blood-annual");
    expect(careTasksFor(d("2027-06-01")).map((t) => t.id)).toContain("blood-annual");
    expect(careTasksFor(d("2027-06-01")).find((t) => t.id === "blood-annual")?.detail).toMatch(
      /Full blood count \+ biochemistry/,
    );
    expect(careTasksFor(d("2033-12-01")).map((t) => t.id)).not.toContain("blood-senior");
    expect(careTasksFor(d("2034-06-15")).map((t) => t.id)).toContain("blood-senior");
    expect(careTasksFor(d("2034-12-01")).map((t) => t.id)).toContain("blood-senior");
  });

  it("fires the neutering discussion in Dec 2026", () => {
    expect(careTasksFor(d("2026-12-01")).map((t) => t.id)).toContain("neuter-discuss");
    expect(careTasksFor(d("2026-12-26")).map((t) => t.id)).toContain("neuter-discuss");
    expect(careTasksFor(d("2026-11-30")).map((t) => t.id)).not.toContain("neuter-discuss");
  });

  it("stops neutering follow-ups once a Desexing entry exists", () => {
    expect(careTasksFor(d("2027-01-01")).map((t) => t.id)).toContain("neuter-followup");
    expect(careTasksFor(d("2027-01-01"), { desexed: true }).map((t) => t.id)).not.toContain(
      "neuter-followup",
    );
    expect(careTasksFor(d("2026-12-01"), { desexed: true }).map((t) => t.id)).not.toContain(
      "neuter-discuss",
    );
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

  it("serves prep ideas pre-homecoming, never a big-park day", () => {
    const idea = activityFor(d("2026-08-01"), true);
    expect([
      "Prep mission",
      "Puppy-proof patrol",
      "Chapter night",
      "Cue-word summit",
      "Den dry-run",
      "Scout the route",
    ]).toContain(idea.title);
    expect(idea.title).not.toMatch(/park|dog-run/i);
  });

  it("weekend ideas before 16 Oct are carry/indoor, not dog-run", () => {
    const sat = activityFor(d("2026-09-26"), false); // first Saturday home
    expect(["Carry-adventure", "Milestone photo shoot", "Frozen KONG craft", "Hide-and-seek", "Settle-on-mat practice", "Café training mission"]).toContain(sat.title);
    expect(sat.title).not.toBe("Big-park expedition");
    expect(sat.title).not.toBe("Dog-run morning");
  });

  it("weekend ideas stay carry-only through the 16 Oct core until the nod window (30 Oct)", () => {
    const sat = activityFor(d("2026-10-17"), false);
    expect(sat.title).not.toBe("Big-park expedition");
    expect(sat.title).not.toBe("Dog-run morning");
    expect(sat.text.toLowerCase()).not.toMatch(/dog run|off-leash|public grass/);
  });

  it("office lobby-bench never suggests an evening walk on the ground", () => {
    const tue = activityFor(d("2026-09-29"), false); // Tuesday after landing
    if (tue.title === "Lobby-bench social") {
      expect(tue.text).toMatch(/Paws stay off the ground/);
      expect(tue.text).not.toMatch(/evening walk/);
    }
  });

  it("bonus idea differs from the main idea", () => {
    const date = d("2026-09-09");
    expect(bonusActivityFor(date, false).title).not.toBe(activityFor(date, false).title);
  });
});

describe("park night rhythm", () => {
  it("does not start on 25 Sep (decompression day 3)", () => {
    expect(isParkNight(d("2026-09-25"))).toBe(false);
    expect(isParkNight(d("2026-09-23"))).toBe(false);
    expect(isParkNight(d("2026-10-16"))).toBe(false);
  });

  it("alternates days from 30 Oct (after 16-week core plus vet nod)", () => {
    expect(isParkNight(d("2026-10-30"))).toBe(true);
    expect(isParkNight(d("2026-10-31"))).toBe(false);
    expect(isParkNight(d("2026-11-01"))).toBe(true);
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

describe("daily socialisation missions", () => {
  it("is absent before homecoming and present every day from 23 Sep until the core", () => {
    expect(socialMissionFor(d("2026-09-22"))).toBeNull();
    for (let i = 0; i < 24; i++) {
      const day = new Date("2026-09-23T09:00:00");
      day.setDate(day.getDate() + i);
      expect(socialMissionFor(day), day.toISOString()).not.toBeNull();
    }
  });

  it("is deterministic: the same date always returns the same mission", () => {
    const a = socialMissionFor(d("2026-09-27"));
    const b = socialMissionFor(d("2026-09-27"));
    expect(a?.id).toBe(b?.id);
    expect(a?.title).toBe(b?.title);
  });

  it("covers all five pre-clearance categories in the pool", () => {
    const cats = missionCategoriesIn(PRECLEAR_MISSIONS);
    expect(cats).toEqual(expect.arrayContaining(["carry", "people", "noise", "car", "handling"]));
  });

  it("gives every pre-clearance mission a duration, bring-list, numbered steps, and safety with whys", () => {
    for (const m of PRECLEAR_MISSIONS) {
      expect(m.minutes).toBeGreaterThanOrEqual(5);
      expect(m.bring.length).toBeGreaterThan(0);
      expect(m.steps.length).toBeGreaterThanOrEqual(3);
      const safety = m.safety.join(" ");
      expect(safety).toMatch(/parvo/i);
      expect(safety).toMatch(/strange dogs/i);
      expect(safety).toMatch(/pee spots/i);
      expect(safety).toMatch(/circle of hands/i);
      expect(safety).toMatch(/two seconds/i);
    }
  });

  it("switches to ground-based missions on/after 16 Oct, still labelled as needing the nod", () => {
    const m = socialMissionFor(d("2026-10-16"));
    expect(m).not.toBeNull();
    expect(m!.category).toBe("ground");
    expect(m!.safety.join(" ")).toMatch(/SingVet nod/);
    for (const g of ALL_GROUND_MISSIONS) {
      expect(g.category).toBe("ground");
      expect(g.safety.join(" ")).toMatch(/SingVet nod/);
    }
  });

  it("attaches today's mission to the daily brief after landing", () => {
    expect(todaysBrief(d("2026-09-22")).mission).toBeNull();
    expect(todaysBrief(d("2026-09-26")).mission?.title.length).toBeGreaterThan(0);
  });
});
