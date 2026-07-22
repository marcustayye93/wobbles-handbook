/*
 * Household settings — the family-editable layer over the daily engine.
 * Stored in shared_state under the key "householdSettings" as a PLAIN OBJECT
 * so the server's conflict-safe patch merge applies (see server/db.ts
 * patchSharedState): top-level keys are "schedule" and "reminders".
 *
 * - schedule: per-person presence for each weekday (overrides WEEK_PLAN)
 * - reminders: one-off dated reminders keyed by id (map, not array, so two
 *   phones adding at once both keep their reminder)
 */
import { WEEK_PLAN, type DayPlan, type Presence } from "@/content/household";

export const SETTINGS_KEY = "householdSettings";

export interface OneOffReminder {
  id: string;
  /** ISO date yyyy-mm-dd */
  date: string;
  text: string;
  /** who it's for; undefined = whole family */
  person?: "marcus" | "chesa";
  /** ticked off on the daily plan card */
  done?: boolean;
}

export interface HouseholdSettings {
  /** presence per day-of-week, index 0=Sun..6=Sat */
  schedule: {
    marcus: Presence[];
    chesa: Presence[];
  };
  /** one-off reminders keyed by id */
  reminders: Record<string, OneOffReminder>;
}

/** Defaults mirror the built-in WEEK_PLAN so first open shows the real week. */
export function defaultSettings(): HouseholdSettings {
  return {
    schedule: {
      marcus: WEEK_PLAN.map((d) => d.marcus),
      chesa: WEEK_PLAN.map((d) => d.chesa),
    },
    reminders: {},
  };
}

/** Harden whatever came back from shared state into a usable settings object. */
export function normalizeSettings(raw: unknown): HouseholdSettings {
  const base = defaultSettings();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return base;
  const r = raw as Partial<HouseholdSettings>;
  const okPresence = (p: unknown): p is Presence =>
    p === "home" || p === "office" || p === "maybe-office";
  const mergeWeek = (fallback: Presence[], arr: unknown): Presence[] => {
    if (!Array.isArray(arr)) return fallback;
    return fallback.map((f, i) => (okPresence(arr[i]) ? arr[i] : f));
  };
  const schedule = {
    marcus: mergeWeek(base.schedule.marcus, r.schedule?.marcus),
    chesa: mergeWeek(base.schedule.chesa, r.schedule?.chesa),
  };
  const reminders: Record<string, OneOffReminder> = {};
  if (r.reminders && typeof r.reminders === "object" && !Array.isArray(r.reminders)) {
    for (const [id, rem] of Object.entries(r.reminders)) {
      if (
        rem &&
        typeof rem === "object" &&
        typeof (rem as OneOffReminder).date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test((rem as OneOffReminder).date) &&
        typeof (rem as OneOffReminder).text === "string" &&
        (rem as OneOffReminder).text.trim() !== ""
      ) {
        const p = (rem as OneOffReminder).person;
        reminders[id] = {
          id,
          date: (rem as OneOffReminder).date,
          text: (rem as OneOffReminder).text.slice(0, 200),
          person: p === "marcus" || p === "chesa" ? p : undefined,
          done: (rem as OneOffReminder).done === true,
        };
      }
    }
  }
  return { schedule, reminders };
}

/** True when the family has changed any weekday away from the built-ins. */
export function scheduleIsCustom(s: HouseholdSettings): boolean {
  return WEEK_PLAN.some(
    (d, i) => s.schedule.marcus[i] !== d.marcus || s.schedule.chesa[i] !== d.chesa,
  );
}

/**
 * A DayPlan for the date with the family's saved presences applied.
 * The built-in note is kept when the day still matches the defaults;
 * otherwise a neutral note is generated from who's home.
 */
export function dayPlanWithSettings(date: Date, s: HouseholdSettings): DayPlan {
  const base = WEEK_PLAN[date.getDay()];
  const marcus = s.schedule.marcus[base.dow];
  const chesa = s.schedule.chesa[base.dow];
  if (marcus === base.marcus && chesa === base.chesa) return base;
  const bothHome = marcus === "home" && chesa === "home";
  const bothOut = marcus === "office" && chesa === "office";
  const note = bothHome
    ? "Both home today — a good day for together-games, grooming practice and unhurried training."
    : bothOut
      ? "Emptier flat today — set up enrichment before leaving and keep departures low-key."
      : "Mixed day — whoever's home owns the midday play session and alone-time practice.";
  return { ...base, marcus, chesa, note };
}

/** Reminders that land on the given local date, family-wide first. */
export function remindersFor(date: Date, s: HouseholdSettings): OneOffReminder[] {
  const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
  return Object.values(s.reminders)
    .filter((r) => r.date === iso)
    .sort((a, b) => (a.person ?? "").localeCompare(b.person ?? "") || a.text.localeCompare(b.text));
}

/** Reminders today or later, soonest first (for the settings list). */
export function upcomingReminders(s: HouseholdSettings, now: Date = new Date()): OneOffReminder[] {
  const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  return Object.values(s.reminders)
    .filter((r) => r.date >= iso)
    .sort((a, b) => a.date.localeCompare(b.date) || a.text.localeCompare(b.text));
}

/** True when the date has at least one reminder and every one is ticked. */
export function allRemindersDone(date: Date, s: HouseholdSettings): boolean {
  const rs = remindersFor(date, s);
  return rs.length > 0 && rs.every((r) => r.done === true);
}

/** Reminders strictly before today (kept visible so nothing silently vanishes). */
export function pastReminders(s: HouseholdSettings, now: Date = new Date()): OneOffReminder[] {
  const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  return Object.values(s.reminders)
    .filter((r) => r.date < iso)
    .sort((a, b) => b.date.localeCompare(a.date));
}
