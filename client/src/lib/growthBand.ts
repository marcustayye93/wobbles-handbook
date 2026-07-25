/*
 * Growth band — expected weight range (kg) by age for a toy Cavoodle
 * trending toward a 5–8 kg adult (Wobbles is predicted ≈8 kg, so likely the
 * upper half of the band). Points compiled from toy Cavoodle / toy-poodle-cross
 * growth charts; interpolated linearly between anchors.
 *
 * Pure functions only — unit-tested in server/growthBand.test.ts.
 */
import { WOBBLES } from "@/content/wobbles";

export interface BandPoint {
  weeks: number;
  min: number; // kg
  max: number; // kg
}

/** Expected weight band (kg) by age in weeks for a 5–8 kg-adult toy Cavoodle. */
export const GROWTH_BAND: BandPoint[] = [
  { weeks: 8, min: 1.0, max: 2.0 },
  { weeks: 12, min: 1.6, max: 3.0 },
  { weeks: 16, min: 2.2, max: 4.0 },
  { weeks: 20, min: 2.8, max: 4.9 },
  { weeks: 26, min: 3.5, max: 6.0 },
  { weeks: 34, min: 4.2, max: 7.0 },
  { weeks: 42, min: 4.6, max: 7.6 },
  { weeks: 52, min: 5.0, max: 8.0 },
  { weeks: 60, min: 5.0, max: 8.0 },
];

/** Linear interpolation of the band at an exact age in weeks (clamped at ends). */
export function expectedBandAt(weeks: number): { min: number; max: number } {
  const pts = GROWTH_BAND;
  if (weeks <= pts[0].weeks) return { min: pts[0].min, max: pts[0].max };
  const last = pts[pts.length - 1];
  if (weeks >= last.weeks) return { min: last.min, max: last.max };
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (weeks >= a.weeks && weeks <= b.weeks) {
      const t = (weeks - a.weeks) / (b.weeks - a.weeks);
      return { min: a.min + t * (b.min - a.min), max: a.max + t * (b.max - a.max) };
    }
  }
  return { min: last.min, max: last.max };
}

/** Age in (fractional) weeks on a given date. Negative before birth → clamped 0. */
export function ageWeeksOn(dateISO: string, dob: string = WOBBLES.dob): number {
  const born = new Date(dob + "T00:00:00");
  const on = new Date(dateISO + "T00:00:00");
  return Math.max(0, (on.getTime() - born.getTime()) / (7 * 24 * 3600 * 1000));
}

export type GrowthStatus = "on-track" | "above" | "below";

export interface GrowthVerdict {
  status: GrowthStatus;
  /** Latest weigh-in used for the verdict */
  kg: number;
  dateISO: string;
  band: { min: number; max: number };
  /** Friendly one-liner for the card */
  text: string;
}

/**
 * Verdict from the most recent weigh-in: compares it to the expected band at
 * that day's age. A small grace margin (7.5% of band width, min 0.1 kg) keeps
 * borderline readings from flapping between states.
 */
export function growthVerdict(
  entries: { date: string; value?: number }[],
  dob: string = WOBBLES.dob,
): GrowthVerdict | null {
  const weighed = entries
    .filter((e) => typeof e.value === "number" && e.value > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
  const latest = weighed[weighed.length - 1];
  if (!latest) return null;
  const weeks = ageWeeksOn(latest.date, dob);
  if (weeks < GROWTH_BAND[0].weeks - 2) return null; // too young for the chart to mean much
  const band = expectedBandAt(weeks);
  const grace = Math.max(0.1, (band.max - band.min) * 0.075);
  const kg = latest.value as number;

  let status: GrowthStatus = "on-track";
  if (kg < band.min - grace) status = "below";
  else if (kg > band.max + grace) status = "above";

  const bandLabel = `${band.min.toFixed(1)}–${band.max.toFixed(1)} kg`;
  const text =
    status === "on-track"
      ? `${kg.toFixed(2)} kg sits inside the expected ${bandLabel} for his age — on track for a toy Cavoodle heading to ≈8 kg.`
      : status === "below"
        ? `${kg.toFixed(2)} kg is under the expected ${bandLabel} for his age. One light reading isn't a panic — but if the next weigh-in is also low, mention it to the vet.`
        : `${kg.toFixed(2)} kg is above the expected ${bandLabel} for his age. Recount daily calories including training treats, and check body condition (ribs easy to feel).`;

  return { status, kg, dateISO: latest.date, band, text };
}

/**
 * Chart series: for each weigh-in date, the expected band on that date —
 * lets recharts draw a shaded corridor under the actual weight line.
 */
export function bandSeriesFor(
  entries: { date: string; time?: string; value?: number }[],
  dob: string = WOBBLES.dob,
): { label: string; value: number | undefined; bandMin: number; bandMax: number }[] {
  return [...entries]
    .filter((e) => typeof e.value === "number")
    .sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")))
    .map((e) => {
      const band = expectedBandAt(ageWeeksOn(e.date, dob));
      return {
        label: e.date.slice(5).split("-").reverse().join("/"),
        value: e.value,
        bandMin: Number(band.min.toFixed(2)),
        bandMax: Number(band.max.toFixed(2)),
      };
    });
}
