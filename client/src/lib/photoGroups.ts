/*
 * Photo journal month grouping — pure helpers, unit-tested in
 * client/src/lib/photoGroups.test.ts.
 *
 * Photos arrive newest-first from trpc.photos.list. We group them under
 * "Month Year" headers and annotate each group with Wobbles' age during
 * that month so the album reads like a growth story.
 */
import { WOBBLES } from "@/content/wobbles";

export interface GroupablePhoto {
  id: number;
  date: string; // YYYY-MM-DD
}

export interface PhotoMonthGroup<T extends GroupablePhoto> {
  /** "2026-07" — stable key */
  key: string;
  /** "July 2026" */
  label: string;
  /** e.g. "3–7 weeks old" or "5 weeks old" — Wobbles' age span that month */
  ageLabel: string;
  photos: T[];
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function ageWeeksAt(iso: string): number {
  const ms = new Date(iso + "T00:00:00").getTime() - new Date(WOBBLES.dob + "T00:00:00").getTime();
  return Math.floor(ms / (7 * 86_400_000));
}

/** Human age label for a set of photo dates within one month. */
export function monthAgeLabel(dates: string[]): string {
  if (dates.length === 0) return "";
  const weeks = dates.map(ageWeeksAt);
  const min = Math.min(...weeks);
  const max = Math.max(...weeks);
  if (max < 0) return "before Wobbles was born";
  const fmt = (w: number) => (w >= 52 ? `${Math.floor(w / 52)}y ${w % 52}w` : `${w}w`);
  const lo = Math.max(0, min);
  return lo === max ? `${fmt(max)} old` : `${fmt(lo)}–${fmt(max)} old`;
}

/**
 * Group photos (assumed roughly newest-first) into month buckets, preserving
 * order within each bucket. Output order follows first appearance, so the
 * newest month comes first. Malformed dates fall into an "Undated" bucket at
 * the end.
 */
export function groupPhotosByMonth<T extends GroupablePhoto>(photos: T[]): PhotoMonthGroup<T>[] {
  return groupByMonthInternal(photos);
}

function groupByMonthInternal<T extends GroupablePhoto>(photos: T[]): PhotoMonthGroup<T>[] {
  const buckets = new Map<string, T[]>();
  const undated: T[] = [];

  for (const p of photos) {
    const m = /^(\d{4})-(\d{2})/.exec(p.date ?? "");
    if (!m) {
      undated.push(p);
      continue;
    }
    const key = `${m[1]}-${m[2]}`;
    const list = buckets.get(key);
    if (list) list.push(p);
    else buckets.set(key, [p]);
  }

  const groups: PhotoMonthGroup<T>[] = Array.from(buckets.entries()).map(([key, list]: [string, T[]]) => {
    const [y, mo] = key.split("-").map(Number);
    return {
      key,
      label: `${MONTHS[mo - 1]} ${y}`,
      ageLabel: monthAgeLabel(list.map((p: T) => p.date)),
      photos: list,
    };
  });

  if (undated.length > 0) {
    groups.push({ key: "undated", label: "Undated", ageLabel: "", photos: undated });
  }
  return groups;
}

/* ============================== U6 additions ============================== */

export interface SearchablePhoto extends GroupablePhoto {
  caption?: string | null;
}

export interface PhotoYearChapter<T extends GroupablePhoto> {
  /** "2026" or "undated" — stable key */
  key: string;
  /** "2026" */
  year: string;
  /** Keepsake subtitle, e.g. "The puppy year" or "Turning 3 — young adult" */
  stageLabel: string;
  /** Total photos across the chapter's months */
  count: number;
  months: PhotoMonthGroup<T>[];
}

const BIRTH_YEAR = Number(WOBBLES.dob.slice(0, 4)); // 2026

/**
 * Keepsake label for a calendar year of Wobbles' life. Uses the age he TURNS
 * that year (birthday 26 Jun) and the same stage bands as the daily engine.
 */
export function yearStageLabel(year: number): string {
  if (year < BIRTH_YEAR) return "Before Wobbles";
  if (year === BIRTH_YEAR) return "The puppy year";
  const turns = year - BIRTH_YEAR;
  if (turns === 1) return "Turning 1 — adolescence";
  const stage =
    turns < 4 ? "young adult" :
    turns < 8 ? "prime years" :
    turns < 12 ? "senior years" :
    "golden twilight";
  return `Turning ${turns} — ${stage}`;
}

/**
 * Group photos (newest-first) into year chapters, each holding its month
 * groups. Order follows first appearance (newest year first); undated photos
 * form a final "undated" chapter.
 */
export function groupPhotosByYear<T extends GroupablePhoto>(photos: T[]): PhotoYearChapter<T>[] {
  const months = groupByMonthInternal(photos);
  const chapters: PhotoYearChapter<T>[] = [];
  const byYear = new Map<string, PhotoYearChapter<T>>();

  for (const m of months) {
    const key = m.key === "undated" ? "undated" : m.key.slice(0, 4);
    let ch = byYear.get(key);
    if (!ch) {
      ch = {
        key,
        year: key === "undated" ? "Undated" : key,
        stageLabel: key === "undated" ? "" : yearStageLabel(Number(key)),
        count: 0,
        months: [],
      };
      byYear.set(key, ch);
      chapters.push(ch);
    }
    ch.months.push(m);
    ch.count += m.photos.length;
  }
  return chapters;
}

const MONTH_NAMES_LOWER = MONTHS.map((m) => m.toLowerCase());

/**
 * Case-insensitive photo search over caption text and date fragments.
 * Matches: caption substrings, ISO date substrings ("2027-03", "03-14"),
 * month names ("december"/"dec"), the year, and formatted dates.
 * Empty/whitespace query matches everything.
 */
export function photoMatches(photo: SearchablePhoto, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const caption = (photo.caption ?? "").toLowerCase();
  if (caption.includes(q)) return true;
  const date = photo.date ?? "";
  if (date.toLowerCase().includes(q)) return true;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (m) {
    const monthIdx = Number(m[2]) - 1;
    const monthName = MONTH_NAMES_LOWER[monthIdx] ?? "";
    // "dec", "december", "14 dec", "dec 2027", "14 december 2027"…
    const pretty = `${Number(m[3])} ${monthName} ${m[1]}`;
    if (monthName.startsWith(q) || pretty.includes(q)) return true;
  }
  return false;
}

/** Combined filter: free-text query AND optional year chip ("2026" | null). */
export function filterPhotos<T extends SearchablePhoto>(
  photos: T[],
  query: string,
  year: string | null,
): T[] {
  return photos.filter((p) => {
    if (year && !(p.date ?? "").startsWith(year)) return false;
    return photoMatches(p, query);
  });
}

/** Distinct years present in the photo set, newest first (for filter chips). */
export function photoYears(photos: GroupablePhoto[]): string[] {
  const years = new Set<string>();
  for (const p of photos) {
    const m = /^(\d{4})-/.exec(p.date ?? "");
    if (m) years.add(m[1]);
  }
  return Array.from(years).sort((a, b) => b.localeCompare(a));
}
