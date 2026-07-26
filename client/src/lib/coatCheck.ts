/*
 * Coat Length Check — pure helpers.
 * A "coat check" is a same-pose photo taken after each fortnightly bath +
 * basic trim (category = "coat-check" on the photos table). These helpers
 * turn the flat photo list into a chronological series with age and
 * days-since-previous labels, and pick sensible defaults for the
 * side-by-side comparison (latest vs previous).
 */

export const COAT_CHECK_CATEGORY = "coat-check";

export interface CoatCheckSource {
  id: number;
  url: string;
  date: string; // YYYY-MM-DD
  caption?: string | null;
  category?: string | null;
  createdByName?: string | null;
}

export interface CoatCheckEntry extends CoatCheckSource {
  /** Wobbles' age at the photo, e.g. "14w 3d" or "1y 2m" */
  ageLabel: string;
  /** Days since the previous coat check (null for the first) */
  daysSincePrev: number | null;
}

const MS_DAY = 86_400_000;

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function daysBetweenISO(a: string, b: string): number {
  return Math.round((parseISO(b).getTime() - parseISO(a).getTime()) / MS_DAY);
}

/** Age label at a given date relative to a date of birth (both ISO). */
export function ageLabelAt(dobISO: string, dateISO: string): string {
  const days = daysBetweenISO(dobISO, dateISO);
  if (days < 0) return "before Wobbles";
  const weeks = Math.floor(days / 7);
  if (weeks < 26) return `${weeks}w ${days % 7}d`;
  const months = Math.floor(days / 30.44);
  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  return remMonths > 0 ? `${years}y ${remMonths}m` : `${years} years`;
}

/** Filter to coat-check photos only, oldest → newest, with gap + age labels. */
export function coatCheckSeries<T extends CoatCheckSource>(
  photos: T[],
  dobISO: string,
): (T & CoatCheckEntry)[] {
  const sorted = photos
    .filter((p) => p.category === COAT_CHECK_CATEGORY)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
  return sorted.map((p, i) => ({
    ...p,
    ageLabel: ageLabelAt(dobISO, p.date),
    daysSincePrev: i === 0 ? null : daysBetweenISO(sorted[i - 1].date, p.date),
  }));
}

/**
 * Default comparison pair: latest vs the one before it.
 * With a single photo both sides show it; empty series returns null.
 */
export function defaultComparePair<T extends { id: number }>(
  series: T[],
): { left: T; right: T } | null {
  if (series.length === 0) return null;
  const right = series[series.length - 1];
  const left = series.length > 1 ? series[series.length - 2] : right;
  return { left, right };
}

/**
 * Human nudge for the header: how long since the last coat check.
 * Returns null when the series is empty.
 */
export function sinceLastCheckLabel(
  series: { date: string }[],
  todayISOStr: string,
): string | null {
  if (series.length === 0) return null;
  const days = daysBetweenISO(series[series.length - 1].date, todayISOStr);
  if (days <= 0) return "Updated today";
  if (days === 1) return "1 day since the last check";
  if (days <= 21) return `${days} days since the last check`;
  return `${days} days since the last check — overdue for a bath + trim photo`;
}
