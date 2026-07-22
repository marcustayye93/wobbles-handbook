/*
 * Household settings engine tests — schedule overrides, one-off reminders,
 * normalisation of untrusted shared-state data, and integration with the
 * daily brief / nudges.
 */
import { describe, expect, it } from "vitest";
import {
  SETTINGS_KEY,
  defaultSettings,
  normalizeSettings,
  scheduleIsCustom,
  dayPlanWithSettings,
  remindersFor,
  upcomingReminders,
  pastReminders,
  type HouseholdSettings,
  type OneOffReminder,
} from "../client/src/lib/householdSettings";
import { todaysBrief, todaysNudges } from "../client/src/lib/wobblesToday";

/** Local date helper — builds a Date at local noon to dodge TZ edges. */
const d = (iso: string) => new Date(`${iso}T12:00:00`);
const iso = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

const reminder = (partial: Partial<OneOffReminder> & { id: string; date: string }): OneOffReminder => ({
  text: "Vet reminder",
  ...partial,
});

describe("defaultSettings / normalizeSettings", () => {
  it("default schedule matches the built-in week (Marcus office Tue-Thu, home otherwise)", () => {
    const s = defaultSettings();
    // arrays are Sun..Sat
    expect(s.schedule.marcus).toEqual([
      "home", "home", "office", "office", "office", "home", "home",
    ]);
    expect(s.schedule.chesa).toEqual([
      "home", "home", "maybe-office", "home", "maybe-office", "home", "home",
    ]);
    expect(Object.keys(s.reminders)).toHaveLength(0);
    expect(scheduleIsCustom(s)).toBe(false);
  });

  it("normalizeSettings survives garbage input", () => {
    expect(normalizeSettings(undefined)).toEqual(defaultSettings());
    expect(normalizeSettings(null as unknown as HouseholdSettings)).toEqual(defaultSettings());
    expect(normalizeSettings("junk" as unknown as HouseholdSettings)).toEqual(defaultSettings());
    const partial = normalizeSettings({
      schedule: { marcus: ["office"], chesa: "nope" },
      reminders: { a: { id: "a", date: "2026-08-30", text: "Puppy class", person: "marcus" }, b: "junk" },
    } as unknown as HouseholdSettings);
    // per-slot merge: valid slots kept, invalid/missing slots fall back to defaults
    expect(partial.schedule.marcus[0]).toBe("office"); // valid slot kept
    expect(partial.schedule.marcus.slice(1)).toEqual(defaultSettings().schedule.marcus.slice(1));
    expect(partial.schedule.chesa).toEqual(defaultSettings().schedule.chesa); // non-array -> defaults
    // valid reminder kept, junk dropped
    expect(Object.keys(partial.reminders)).toEqual(["a"]);
  });

  it("normalizeSettings keeps a valid custom schedule and sanitises bad slots", () => {
    const s = normalizeSettings({
      schedule: {
        marcus: ["home", "office", "office", "office", "office", "office", "home"],
        chesa: ["home", "home", "home", "banana", "home", "home", "home"],
      },
      reminders: {},
    } as unknown as HouseholdSettings);
    expect(s.schedule.marcus[1]).toBe("office"); // Monday now office
    expect(s.schedule.chesa[3]).toBe(defaultSettings().schedule.chesa[3]); // bad slot -> default
    expect(scheduleIsCustom(s)).toBe(true);
  });
});

describe("dayPlanWithSettings", () => {
  it("uses the custom schedule for who's home", () => {
    const s = defaultSettings();
    // Make Monday an office day for Marcus (index 1)
    s.schedule.marcus[1] = "office";
    s.schedule.chesa[1] = "office";
    const monday = d("2026-09-07"); // a Monday
    const plan = dayPlanWithSettings(monday, s);
    expect(plan.marcus).toBe("office");
    expect(plan.chesa).toBe("office");
  });

  it("falls back to the built-in plan notes for the day type", () => {
    const s = defaultSettings();
    const tuesday = d("2026-09-08");
    const plan = dayPlanWithSettings(tuesday, s);
    expect(plan.marcus).toBe("office");
    expect(typeof plan.note).toBe("string");
    expect(plan.note.length).toBeGreaterThan(0);
  });
});

describe("reminders", () => {
  const s: HouseholdSettings = {
    ...defaultSettings(),
    reminders: {
      r1: reminder({ id: "r1", date: "2026-09-10", text: "Vet booster", person: "marcus" }),
      r2: reminder({ id: "r2", date: "2026-09-10", text: "Buy pads" }),
      r3: reminder({ id: "r3", date: "2026-09-12", text: "Puppy class", person: "chesa" }),
      r4: reminder({ id: "r4", date: "2026-09-01", text: "Old one" }),
    },
  };

  it("remindersFor returns only that date's reminders, family-wide first", () => {
    const rs = remindersFor(d("2026-09-10"), s);
    // sorted with family-wide (no person) first, then by person/text
    expect(rs.map((r) => r.id).sort()).toEqual(["r1", "r2"]);
    expect(rs[0].id).toBe("r2"); // family-wide "Buy pads" sorts before Marcus's
    expect(remindersFor(d("2026-09-11"), s)).toHaveLength(0);
  });

  it("upcoming/past split around today (today counts as upcoming)", () => {
    const now = d("2026-09-10");
    const up = upcomingReminders(s, now);
    expect(up.map((r) => r.id).sort()).toEqual(["r1", "r2", "r3"]);
    expect(up[2].id).toBe("r3"); // later date sorts last
    expect(pastReminders(s, now).map((r) => r.id)).toEqual(["r4"]);
  });
});

describe("todaysBrief + todaysNudges with settings", () => {
  it("brief reflects schedule override and includes today's reminders", () => {
    const s = defaultSettings();
    // Friday (index 5): send both to office
    s.schedule.marcus[5] = "office";
    s.schedule.chesa[5] = "office";
    const friday = d("2026-09-11");
    s.reminders = {
      x: reminder({ id: "x", date: iso(friday), text: "Groomer 3pm", person: "chesa" }),
    };
    const brief = todaysBrief(friday, s);
    expect(brief.plan.marcus).toBe("office");
    expect(brief.plan.chesa).toBe("office");
    expect(brief.reminders.map((r) => r.text)).toEqual(["Groomer 3pm"]);
  });

  it("reminder nudges appear first and survive the nudge cap", () => {
    const now = d("2026-09-11");
    const s = defaultSettings();
    s.reminders = {
      a: reminder({ id: "a", date: iso(now), text: "Vet booster", person: "marcus" }),
      b: reminder({ id: "b", date: iso(now), text: "Buy pads" }),
    };
    const nudges = todaysNudges(() => [], {}, now, s);
    const reminderNudges = nudges.filter((n) => n.id.startsWith("reminder-"));
    expect(reminderNudges).toHaveLength(2);
    // family-wide reminder sorts first, then Marcus's; both precede rule nudges
    expect(nudges[0].id).toBe("reminder-b");
    expect(nudges[0].person).toBeUndefined();
    expect(nudges[0].link).toBe("");
    expect(nudges[1].id).toBe("reminder-a");
    expect(nudges[1].person).toBe("Marcus");
  });

  it("no settings behaves like before (no reminders array crash)", () => {
    const brief = todaysBrief(d("2026-09-11"));
    expect(brief.reminders).toEqual([]);
  });
});

describe("settings key", () => {
  it("is a stable shared-state key", () => {
    expect(SETTINGS_KEY).toBe("householdSettings");
  });
});
