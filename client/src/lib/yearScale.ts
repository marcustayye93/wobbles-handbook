/*
 * U4 — Year-scale helpers. Pure and deterministic so they can be unit-tested
 * (server/yearScale.test.ts) and reused by TrackersHub (month rollups), Home
 * (On This Day) and the /growth/year/:year annual report.
 */
import { TRACKERS } from "@/lib/trackers";
import { WOBBLES } from "@/content/wobbles";

/** Minimal entry shape shared by TrackerRow / SyncedEntry consumers. */
export interface RollupEntry {
  trackerId: string;
  date: string; // YYYY-MM-DD
  option?: string | null;
  value?: string | number | null;
  time?: string | null;
  note?: string | null;
}

export interface PhotoLike {
  id: number;
  date: string; // YYYY-MM-DD
  url: string;
  caption?: string | null;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2026-07" → "July 2026" */
export function monthKeyLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  if (!y || !m || m < 1 || m > 12) return key;
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

const num = (v: string | number | null | undefined): number | null => {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

/* ------------------------------------------------------------------ */
/* Month rollups (TrackersHub "Months" mode)                            */
/* ------------------------------------------------------------------ */

export interface MonthRollup {
  key: string; // "2026-07"
  label: string; // "July 2026"
  total: number;
  /** entry counts per tracker group id (daily/health/growing) */
  groupCounts: Record<string, number>;
  walks: number;
  meals: number;
  /** average weight that month, 1 dp, or null */
  avgWeight: number | null;
  /** toilet success percentage 0–100, or null when no toilet logs */
  toiletSuccess: number | null;
  trainingSessions: number;
  activeDays: number;
}

const GROUP_OF: Record<string, string> = Object.fromEntries(
  TRACKERS.map((t) => [t.id, t.group]),
);

/** Success = any toilet option containing the ✅ marker (pad + outside). */
export const isToiletSuccess = (option?: string | null): boolean =>
  !!option && option.includes("✅");

/** Aggregate entries (any order) into per-month rollups, newest month first. */
export function buildMonthRollups(entries: RollupEntry[]): MonthRollup[] {
  const byMonth = new Map<string, RollupEntry[]>();
  for (const e of entries) {
    if (!e.date || e.date.length < 7) continue;
    const key = e.date.slice(0, 7);
    const list = byMonth.get(key);
    if (list) list.push(e);
    else byMonth.set(key, [e]);
  }

  const rollups: MonthRollup[] = [];
  for (const [key, list] of Array.from(byMonth.entries())) {
    const groupCounts: Record<string, number> = {};
    const days = new Set<string>();
    let walks = 0;
    let meals = 0;
    let training = 0;
    let toiletOk = 0;
    let toiletAll = 0;
    let weightSum = 0;
    let weightN = 0;

    for (const e of list) {
      const g = GROUP_OF[e.trackerId];
      if (g) groupCounts[g] = (groupCounts[g] ?? 0) + 1;
      days.add(e.date);
      if (e.trackerId === "walk") walks++;
      if (e.trackerId === "feeding") meals++;
      if (e.trackerId === "training") training++;
      if (e.trackerId === "toilet") {
        toiletAll++;
        if (isToiletSuccess(e.option)) toiletOk++;
      }
      if (e.trackerId === "weight") {
        const v = num(e.value);
        if (v != null) {
          weightSum += v;
          weightN++;
        }
      }
    }

    rollups.push({
      key,
      label: monthKeyLabel(key),
      total: list.length,
      groupCounts,
      walks,
      meals,
      avgWeight: weightN ? Math.round((weightSum / weightN) * 10) / 10 : null,
      toiletSuccess: toiletAll ? Math.round((toiletOk / toiletAll) * 100) : null,
      trainingSessions: training,
      activeDays: days.size,
    });
  }

  return rollups.sort((a, b) => b.key.localeCompare(a.key));
}

/* ------------------------------------------------------------------ */
/* On This Day (Home)                                                  */
/* ------------------------------------------------------------------ */

export interface OnThisDayMatch {
  /** full years ago (1 = last year) */
  yearsAgo: number;
  year: number;
  photo: PhotoLike | null;
  entries: RollupEntry[]; // up to 2, most interesting first
}

/** Entries/photos from the same MM-DD in previous years (never the current year). */
export function findOnThisDay(
  todayISO: string,
  photos: PhotoLike[],
  entries: RollupEntry[],
): OnThisDayMatch | null {
  const mmdd = todayISO.slice(5);
  const thisYear = Number(todayISO.slice(0, 4));

  // walk backwards year by year; nearest past year with content wins
  const years = new Set<number>();
  for (const p of photos) if (p.date.slice(5) === mmdd) years.add(Number(p.date.slice(0, 4)));
  for (const e of entries) if (e.date.slice(5) === mmdd) years.add(Number(e.date.slice(0, 4)));

  const candidates = Array.from(years).filter((y) => y < thisYear).sort((a, b) => b - a);
  if (candidates.length === 0) return null;
  const year = candidates[0];
  const dateISO = `${year}-${mmdd}`;

  const photo = photos.find((p) => p.date === dateISO) ?? null;
  // Prefer "story" entries (milestone-ish trackers) over routine ones
  const weight: Record<string, number> = {
    training: 0, social: 1, vaccines: 2, symptom: 3, weight: 4,
    grooming: 5, walk: 6, feeding: 7, toilet: 8, sleep: 9,
  };
  const dayEntries = entries
    .filter((e) => e.date === dateISO)
    .sort((a, b) => (weight[a.trackerId] ?? 99) - (weight[b.trackerId] ?? 99))
    .slice(0, 2);

  if (!photo && dayEntries.length === 0) return null;
  return { yearsAgo: thisYear - year, year, photo, entries: dayEntries };
}

/* ------------------------------------------------------------------ */
/* Year in Review (/growth/year/:year)                                 */
/* ------------------------------------------------------------------ */

export interface YearReport {
  year: number;
  /** e.g. "8 weeks – 6 months old" */
  ageSpan: string;
  weightStart: number | null;
  weightEnd: number | null;
  totals: {
    entries: number;
    walks: number;
    meals: number;
    toiletSuccess: number | null;
    trainingSessions: number;
    groomSessions: number;
    socialOutings: number;
    photos: number;
    activeDays: number;
  };
  /** distinct months (keys) that have data, ascending */
  months: string[];
}

function ageLabelAt(iso: string): string {
  const dob = new Date(WOBBLES.dob + "T00:00:00").getTime();
  const at = new Date(iso + "T00:00:00").getTime();
  if (at < dob) return "before he was born";
  const days = Math.floor((at - dob) / 86_400_000);
  const weeks = Math.floor(days / 7);
  if (weeks < 16) return `${weeks} weeks old`;
  const months = Math.floor(days / 30.44);
  if (months < 24) return `${months} months old`;
  const years = Math.floor(days / 365.25);
  return `${years} years old`;
}

/** Compose a year's keepsake report from entries + photos. Pure. */
export function buildYearReport(
  year: number,
  entries: RollupEntry[],
  photos: PhotoLike[],
): YearReport {
  const inYear = (d: string) => d.startsWith(`${year}-`);
  const list = entries.filter((e) => inYear(e.date));
  const pics = photos.filter((p) => inYear(p.date));

  let walks = 0, meals = 0, training = 0, groom = 0, social = 0;
  let toiletOk = 0, toiletAll = 0;
  const days = new Set<string>();
  const months = new Set<string>();
  const weights: { date: string; v: number }[] = [];

  for (const e of list) {
    days.add(e.date);
    months.add(e.date.slice(0, 7));
    if (e.trackerId === "walk") walks++;
    if (e.trackerId === "feeding") meals++;
    if (e.trackerId === "training") training++;
    if (e.trackerId === "grooming") groom++;
    if (e.trackerId === "social") social++;
    if (e.trackerId === "toilet") {
      toiletAll++;
      if (isToiletSuccess(e.option)) toiletOk++;
    }
    if (e.trackerId === "weight") {
      const v = num(e.value);
      if (v != null) weights.push({ date: e.date, v });
    }
  }
  for (const p of pics) months.add(p.date.slice(0, 7));

  weights.sort((a, b) => a.date.localeCompare(b.date));

  // Age span across the year (clamped to data that exists, else calendar year)
  const firstDate = list.length || pics.length
    ? [...list.map((e) => e.date), ...pics.map((p) => p.date)].sort()[0]
    : `${year}-01-01`;
  const lastDate = list.length || pics.length
    ? [...list.map((e) => e.date), ...pics.map((p) => p.date)].sort().slice(-1)[0]
    : `${year}-12-31`;
  const startLabel = ageLabelAt(firstDate);
  const endLabel = ageLabelAt(lastDate);
  const ageSpan = startLabel === endLabel ? startLabel : `${startLabel} → ${endLabel}`;

  return {
    year,
    ageSpan,
    weightStart: weights.length ? weights[0].v : null,
    weightEnd: weights.length ? weights[weights.length - 1].v : null,
    totals: {
      entries: list.length,
      walks,
      meals,
      toiletSuccess: toiletAll ? Math.round((toiletOk / toiletAll) * 100) : null,
      trainingSessions: training,
      groomSessions: groom,
      socialOutings: social,
      photos: pics.length,
      activeDays: days.size,
    },
    months: Array.from(months).sort(),
  };
}

/** Years (descending) that have any data — drives Growth's year cards. */
export function yearsWithData(entries: RollupEntry[], photos: PhotoLike[]): number[] {
  const ys = new Set<number>();
  for (const e of entries) ys.add(Number(e.date.slice(0, 4)));
  for (const p of photos) ys.add(Number(p.date.slice(0, 4)));
  return Array.from(ys).filter((y) => Number.isFinite(y) && y > 2000).sort((a, b) => b - a);
}
