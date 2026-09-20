/*
 * Photo journal month grouping — pure helpers, unit-tested in
 * client/src/lib/photoGroups.test.ts.
 *
 * Photos arrive newest-first from trpc.photos.list. We group them under
 * "Month Year" headers and annotate each group with Paddington's age during
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
  /** e.g. "3–7 weeks old" or "5 weeks old" — Paddington's age span that month */
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
  if (max < 0) return "before Paddington was born";
  const wk = (w: number) => `${w} wk${w === 1 ? "" : "s"}`;
  const fmt = (w: number) => (w >= 52 ? `${Math.floor(w / 52)}y ${wk(w % 52)}` : wk(w));
  const lo = Math.max(0, min);
  return lo === max ? `${fmt(max)} old` : `${fmt(lo)}–${fmt(max)} old`;
}

/**
 * Group photos newest-first by month. Dates within a month are sorted
 * newest first (then by id). Malformed dates fall into an "Undated" bucket
 * at the end.
 */
export function groupPhotosByMonth<T extends GroupablePhoto>(photos: T[]): PhotoMonthGroup<T>[] {
  const buckets = new Map<string, T[]>();
  const undated: T[] = [];

  const sorted = [...photos].sort((a, b) => {
    const ad = a.date ?? "";
    const bd = b.date ?? "";
    if (ad !== bd) return bd.localeCompare(ad);
    return b.id - a.id;
  });

  for (const p of sorted) {
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

  const keys = [...buckets.keys()].sort((a, b) => b.localeCompare(a));
  const groups: PhotoMonthGroup<T>[] = keys.map((key) => {
    const list = buckets.get(key)!;
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
