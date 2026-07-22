/*
 * Weekly digest — composes a Sunday summary of Wobbles' week from the
 * household tracker feed and photo journal, delivered to the project owner
 * via notifyOwner(). Called by the /api/scheduled/weeklyDigest Heartbeat
 * handler (see server/scheduled.ts).
 *
 * Pure composition logic lives in composeDigest() so it can be unit-tested
 * without a database.
 */
import { listTrackerEntries, listPhotos } from "./db";

/* ------------------------------------------------------------------ */
/* Types (matching drizzle rows, kept structural for testability)      */
/* ------------------------------------------------------------------ */

export interface DigestTrackerRow {
  trackerId: string;
  date: string; // YYYY-MM-DD
  time: string | null;
  option: string | null;
  value: string | null;
  note: string | null;
  createdByName: string | null;
}

export interface DigestPhotoRow {
  date: string; // YYYY-MM-DD
}

/* ------------------------------------------------------------------ */
/* Date helpers                                                        */
/* ------------------------------------------------------------------ */

const WOBBLES_DOB = "2026-06-26";

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** ISO dates for the 7-day window ending at `end` (inclusive). */
export function weekWindow(end = new Date()): { startISO: string; endISO: string } {
  const endISO = toISODate(end);
  const start = new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000);
  return { startISO: toISODate(start), endISO };
}

function ageAt(dateISO: string): { weeks: number; days: number } {
  const ms = new Date(dateISO + "T00:00:00Z").getTime() - new Date(WOBBLES_DOB + "T00:00:00Z").getTime();
  const totalDays = Math.max(0, Math.floor(ms / 86_400_000));
  return { weeks: Math.floor(totalDays / 7), days: totalDays % 7 };
}

/* ------------------------------------------------------------------ */
/* Composition (pure, unit-testable)                                   */
/* ------------------------------------------------------------------ */

export interface WeeklyDigest {
  title: string;
  content: string;
  /** counts used by tests and the handler's response body */
  stats: {
    totalEntries: number;
    weight: { latest?: number; delta?: number; count: number };
    toilet: { successes: number; accidents: number; count: number };
    meals: number;
    training: number;
    social: number;
    grooming: number;
    health: number;
    stool: number;
    photos: number;
  };
}

const inWindow = (date: string, startISO: string, endISO: string) =>
  date >= startISO && date <= endISO;

export function composeDigest(
  rows: DigestTrackerRow[],
  photos: DigestPhotoRow[],
  window: { startISO: string; endISO: string },
): WeeklyDigest {
  const { startISO, endISO } = window;
  const week = rows.filter((r) => inWindow(r.date, startISO, endISO));
  const by = (id: string) => week.filter((r) => r.trackerId === id);

  /* Weight: latest in week + delta vs most recent weigh-in BEFORE the week */
  const weightRowsAll = rows
    .filter((r) => r.trackerId === "weight" && r.value != null && r.value !== "")
    .sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")));
  const weightInWeek = weightRowsAll.filter((r) => inWindow(r.date, startISO, endISO));
  const latestWeight = weightInWeek.length
    ? parseFloat(weightInWeek[weightInWeek.length - 1].value!)
    : undefined;
  const prevWeightRow = weightRowsAll.filter((r) => r.date < startISO).pop();
  const prevWeight = prevWeightRow ? parseFloat(prevWeightRow.value!) : undefined;
  const baseline =
    weightInWeek.length >= 2 ? parseFloat(weightInWeek[0].value!) : prevWeight;
  const delta =
    latestWeight !== undefined && baseline !== undefined
      ? Math.round((latestWeight - baseline) * 100) / 100
      : undefined;

  /* Toilet: successes vs accidents (options contain ✅ for successes) */
  const toilet = by("toilet");
  const successes = toilet.filter((r) => (r.option ?? "").includes("✅")).length;
  const accidents = toilet.length - successes;

  const meals = by("feeding").length;
  const training = by("training").length;
  const social = by("social").length;
  const grooming = by("grooming").length;
  const health = by("vaccines").length;
  const stool = by("stool").length;
  const photosThisWeek = photos.filter((p) => inWindow(p.date, startISO, endISO)).length;

  const age = ageAt(endISO);

  /* ---- Compose the message ---- */
  const lines: string[] = [];
  lines.push(`Wobbles is now ${age.weeks}w ${age.days}d old. Here's his week (${startISO} → ${endISO}):`);
  lines.push("");

  if (week.length === 0 && photosThisWeek === 0) {
    lines.push("No logs this week — a quiet one! Open the handbook to catch up, or just enjoy the puppy.");
  } else {
    if (latestWeight !== undefined) {
      const deltaTxt =
        delta !== undefined
          ? delta > 0
            ? ` (up ${delta} kg — growing well)`
            : delta < 0
              ? ` (down ${Math.abs(delta)} kg — worth watching; a losing puppy is a vet call)`
              : " (steady)"
          : "";
      lines.push(`⚖️ Weight: ${latestWeight} kg${deltaTxt}`);
    }
    if (toilet.length > 0) {
      const rate = Math.round((successes / toilet.length) * 100);
      lines.push(`🚽 Toilet: ${successes}/${toilet.length} outside (${rate}% success, ${accidents} accident${accidents === 1 ? "" : "s"})`);
    }
    if (meals > 0) lines.push(`🍽️ Feeding: ${meals} meal${meals === 1 ? "" : "s"} logged`);
    if (training > 0) lines.push(`🎓 Training: ${training} session${training === 1 ? "" : "s"}`);
    if (social > 0) lines.push(`🌏 Socialisation: ${social} new experience${social === 1 ? "" : "s"}`);
    if (grooming > 0) lines.push(`✂️ Grooming: ${grooming} session${grooming === 1 ? "" : "s"}`);
    if (stool > 0) lines.push(`💩 Poo quality: ${stool} score${stool === 1 ? "" : "s"} logged`);
    if (health > 0) lines.push(`💉 Health & vaccines: ${health} event${health === 1 ? "" : "s"} logged`);
    if (photosThisWeek > 0) lines.push(`📷 Photos: ${photosThisWeek} new memor${photosThisWeek === 1 ? "y" : "ies"} in the journal`);
  }

  lines.push("");
  lines.push("Open Wobbles' Handbook → Trackers for the full picture.");

  return {
    title: `Wobbles' week in review (${age.weeks}w ${age.days}d)`,
    content: lines.join("\n"),
    stats: {
      totalEntries: week.length,
      weight: { latest: latestWeight, delta, count: weightInWeek.length },
      toilet: { successes, accidents, count: toilet.length },
      meals,
      training,
      social,
      grooming,
      health,
      stool,
      photos: photosThisWeek,
    },
  };
}

/* ------------------------------------------------------------------ */
/* DB-backed builder used by the scheduled handler                     */
/* ------------------------------------------------------------------ */

export async function buildWeeklyDigest(now = new Date()): Promise<WeeklyDigest> {
  const [rows, photos] = await Promise.all([listTrackerEntries(2000), listPhotos()]);
  return composeDigest(
    rows as unknown as DigestTrackerRow[],
    photos as unknown as DigestPhotoRow[],
    weekWindow(now),
  );
}
