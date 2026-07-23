/*
 * Daily "100 Things" field note for the Home (Wobbles Today) tab.
 * Deterministic pick seeded by the date so everyone in the household sees the
 * same fact, rotating to a new one every other day (48-hour cadence).
 * A multiplicative hash shuffles the visit order so consecutive periods jump
 * around the list instead of walking through it category by category.
 */
import { HUNDRED } from "@/content/hundredThings";

export interface DailyFact {
  n: number; // global 1..100 number, matches the 100 Things page numbering
  text: string;
  catTitle: string;
  catEmoji: string;
}

interface FlatFact {
  text: string;
  catTitle: string;
  catEmoji: string;
}

const FLAT: FlatFact[] = HUNDRED.flatMap((cat) =>
  cat.items.map((text) => ({ text, catTitle: cat.title, catEmoji: cat.emoji })),
);

/** Rotation period in days — a new fact every other day, as requested. */
export const FACT_PERIOD_DAYS = 2;

export function dailyFact(now: Date = new Date()): DailyFact {
  const daysSinceEpoch = Math.floor(now.getTime() / 86_400_000);
  const period = Math.floor(daysSinceEpoch / FACT_PERIOD_DAYS);
  // 63 is coprime with 100, so (period * 63) mod 100 visits every item exactly
  // once per 100 periods, in a scattered, non-sequential order.
  const idx = ((period * 63) % FLAT.length + FLAT.length) % FLAT.length;
  const f = FLAT[idx];
  return { n: idx + 1, text: f.text, catTitle: f.catTitle, catEmoji: f.catEmoji };
}
