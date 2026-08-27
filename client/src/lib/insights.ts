/*
 * Logbook Intelligence — deterministic trend engine for the feeding and
 * toilet trackers. Turns raw entries into interpreted patterns, predictions
 * and actionable recommendations ("so what?" instead of stale data points).
 *
 * Design principles:
 *  - Pure functions, no AI calls: identical output for identical data, fully
 *    unit-testable, instant, and works offline from the react-query cache.
 *  - Per-insight statistical minimums (not a blanket n=5): each insight
 *    declares the smallest sample it can honestly interpret and reports a
 *    "pending" state with exactly how many more logs unlock it.
 *  - Circular statistics for time-of-day: times live on a 24h circle, so we
 *    average with vectors (a 23:50 and a 00:10 wee average to midnight, not
 *    noon). Spread comes from the resultant vector length.
 *  - Everything returns structured objects the UI can render as cards, and
 *    todaysNudges() can lift the top prediction into Paddington Today.
 */
import type { TrackerEntry } from "@/lib/trackers";

/* ================= shared plumbing ================= */

export type InsightTone = "good" | "watch" | "action" | "info";

export interface Insight {
  id: string;
  emoji: string;
  /** short headline, e.g. "Morning wee: 7:05am ± 20 min" */
  title: string;
  /** the interpretation — what the pattern means */
  body: string;
  /** the "so what" — what to do about it (optional for pure-info insights) */
  recommendation?: string;
  tone: InsightTone;
}

export interface PendingInsight {
  id: string;
  emoji: string;
  title: string;
  /** e.g. "2 more toilet logs with times unlock this trend" */
  needs: string;
}

export interface TrackerIntelligence {
  /** unlocked, interpreted trends */
  insights: Insight[];
  /** trends still waiting for data, with exact unlock requirements */
  pending: PendingInsight[];
  /** true when nothing is unlocked yet (render the big pending card) */
  allPending: boolean;
}

/** minutes since midnight from "HH:MM"; null if absent/garbage */
export function toMinutes(time?: string): number | null {
  if (!time) return null;
  const m = /^(\d{1,2}):(\d{2})/.exec(time);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

export function fmtTime(minutes: number): string {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const h24 = Math.floor(m / 60);
  const mm = m % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const ap = h24 < 12 ? "am" : "pm";
  return `${h12}:${String(mm).padStart(2, "0")}${ap}`;
}

/**
 * Circular mean + spread of times-of-day.
 * Returns mean minutes since midnight and a robust "± spread" in minutes
 * derived from the circular standard deviation. Concentration r ∈ [0,1]:
 * 1 = every event at the same minute, 0 = uniformly scattered.
 */
export function circularMeanMinutes(minutesList: number[]): {
  mean: number;
  spreadMin: number;
  r: number;
} {
  const n = minutesList.length;
  let sx = 0;
  let sy = 0;
  for (const m of minutesList) {
    const a = (m / 1440) * 2 * Math.PI;
    sx += Math.cos(a);
    sy += Math.sin(a);
  }
  const rx = sx / n;
  const ry = sy / n;
  const r = Math.sqrt(rx * rx + ry * ry);
  let angle = Math.atan2(ry, rx);
  if (angle < 0) angle += 2 * Math.PI;
  const mean = (angle / (2 * Math.PI)) * 1440;
  // circular std dev in radians -> minutes; clamp r to avoid log(0)
  const sd = Math.sqrt(-2 * Math.log(Math.max(r, 1e-6)));
  const spreadMin = Math.min(720, (sd / (2 * Math.PI)) * 1440);
  return { mean, spreadMin, r };
}

/** distinct dates covered by a set of entries */
function distinctDates(entries: TrackerEntry[]): string[] {
  return Array.from(new Set(entries.map((e) => e.date))).sort();
}

/** entries from the last `days` days (inclusive of today) */
function lastDays(entries: TrackerEntry[], days: number, now: Date): TrackerEntry[] {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - (days - 1));
  const cutoffISO = cutoff.toISOString().slice(0, 10);
  return entries.filter((e) => e.date >= cutoffISO);
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/* ================= TOILET intelligence ================= */

const isAccident = (o?: string) => !!o && /accident/i.test(o);
const isWee = (o?: string) => !!o && /wee/i.test(o);
const isPoo = (o?: string) => !!o && /poo/i.test(o);
const isSuccess = (o?: string) => !!o && !isAccident(o);

/** Morning window: 04:00–11:00 */
const MORNING = { from: 4 * 60, to: 11 * 60 };

interface TimeCluster {
  label: string;
  from: number;
  to: number;
}
const DAY_WINDOWS: TimeCluster[] = [
  { label: "early morning", from: 4 * 60, to: 8 * 60 },
  { label: "morning", from: 8 * 60, to: 12 * 60 },
  { label: "afternoon", from: 12 * 60, to: 17 * 60 },
  { label: "evening", from: 17 * 60, to: 21 * 60 },
  { label: "night", from: 21 * 60, to: 28 * 60 }, // wraps past midnight
];

function windowFor(min: number): TimeCluster {
  const m = min < 4 * 60 ? min + 1440 : min;
  return DAY_WINDOWS.find((w) => m >= w.from && m < w.to) ?? DAY_WINDOWS[4];
}

/**
 * Toilet intelligence. Minimum samples per insight:
 *  - routine anchor (morning wee time): ≥5 timed morning wees across ≥3 days
 *    (5 timed points give a usable circular mean; 3 days proves it's a
 *    routine, not one busy morning)
 *  - success rate + trend: ≥8 entries across ≥3 days (a rate on fewer than
 *    8 Bernoulli trials swings ±35% per event — not interpretable)
 *  - accident clustering: ≥3 accidents (you can't cluster fewer)
 *  - next-window prediction: unlocked with the routine anchor
 */
export function toiletIntelligence(
  entries: TrackerEntry[],
  now: Date = new Date(),
  feedingEntries: TrackerEntry[] = [],
): TrackerIntelligence {
  const insights: Insight[] = [];
  const pending: PendingInsight[] = [];
  const recent = lastDays(entries, 14, now); // patterns from the last fortnight
  const dates = distinctDates(recent);

  /* ---- 1. Morning routine anchor + tomorrow's prediction ---- */
  const morningWees = recent.filter((e) => {
    const m = toMinutes(e.time);
    return m != null && m >= MORNING.from && m < MORNING.to && isWee(e.option) && isSuccess(e.option);
  });
  const morningDates = distinctDates(morningWees);
  const MIN_MORNING = 5;
  const MIN_MORNING_DAYS = 3;
  if (morningWees.length >= MIN_MORNING && morningDates.length >= MIN_MORNING_DAYS) {
    const mins = morningWees.map((e) => toMinutes(e.time)!) as number[];
    const { mean, spreadMin, r } = circularMeanMinutes(mins);
    const tight = spreadMin <= 25;
    // days in range that have NO morning wee logged = misses
    const missDays = dates.filter(
      (d) => !morningWees.some((e) => e.date === d),
    ).length;
    const missNote =
      missDays > 0
        ? ` He missed the morning wee on ${plural(missDays, "logged day")} — on those days, expect the bladder pressure to land mid-morning instead.`
        : "";
    insights.push({
      id: "toilet-morning-anchor",
      emoji: "🌅",
      title: `Morning wee anchor: ${fmtTime(mean)} ± ${Math.round(spreadMin)} min`,
      body: `Across ${plural(morningWees.length, "morning")} on ${plural(morningDates.length, "day")}, his first wee clusters around ${fmtTime(mean)}${tight ? " — a tight, reliable routine" : " — but the timing is loose"}.${missNote}`,
      recommendation: tight
        ? `Tomorrow, be at the pad or grass by ${fmtTime(mean - spreadMin)} — carry him straight there from the crate with no floor time.`
        : `Anchor it: same wake time, straight from crate to toilet spot every day this week, and the ± ${Math.round(spreadMin)} min scatter will tighten.`,
      tone: r >= 0.9 ? "good" : "watch",
    });
  } else {
    const needCount = Math.max(0, MIN_MORNING - morningWees.length);
    const needDays = Math.max(0, MIN_MORNING_DAYS - morningDates.length);
    pending.push({
      id: "toilet-morning-anchor",
      emoji: "🌅",
      title: "Morning routine anchor & next-morning prediction",
      needs:
        needCount > 0
          ? `${plural(needCount, "more timed morning wee log")} (before 11am) — ${morningWees.length}/${MIN_MORNING} so far`
          : `logs across ${plural(needDays, "more day")} needed to prove it's a routine, not one morning`,
    });
  }

  /* ---- 2. Success rate + direction of travel ---- */
  const MIN_RATE = 8;
  const MIN_RATE_DAYS = 3;
  if (recent.length >= MIN_RATE && dates.length >= MIN_RATE_DAYS) {
    const successes = recent.filter((e) => isSuccess(e.option)).length;
    const rate = Math.round((successes / recent.length) * 100);
    // split-half trend: first half of window vs second half
    const sorted = [...recent].sort((a, b) =>
      (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")),
    );
    const half = Math.floor(sorted.length / 2);
    const early = sorted.slice(0, half);
    const late = sorted.slice(half);
    const rEarly = early.filter((e) => isSuccess(e.option)).length / early.length;
    const rLate = late.filter((e) => isSuccess(e.option)).length / late.length;
    const delta = Math.round((rLate - rEarly) * 100);
    const dir = delta >= 8 ? "improving" : delta <= -8 ? "slipping" : "steady";
    insights.push({
      id: "toilet-success",
      emoji: dir === "slipping" ? "📉" : "🎯",
      title: `Success rate: ${rate}% and ${dir}`,
      body: `${successes} of the last ${recent.length} toilet events landed on the pad or grass. Recent form is ${dir}${dir !== "steady" ? ` (${delta > 0 ? "+" : ""}${delta} points, older half vs newer half)` : ""}.`,
      recommendation:
        dir === "slipping"
          ? "Tighten supervision for 3 days: back to the 30–60 min awake-time toilet cycle, and reward at the spot within 2 seconds."
          : rate >= 85
            ? "He's nearly there — start stretching the gap between reminders by 15 minutes."
            : "Keep rewarding every success at the spot; the rate should climb week on week at this age.",
      tone: dir === "slipping" ? "action" : rate >= 85 ? "good" : "info",
    });
  } else {
    pending.push({
      id: "toilet-success",
      emoji: "🎯",
      title: "Success rate & direction of travel",
      needs: `${plural(Math.max(0, MIN_RATE - recent.length), "more toilet log")} across at least ${MIN_RATE_DAYS} days — ${recent.length}/${MIN_RATE} so far`,
    });
  }

  /* ---- 3. Accident clustering (time of day) ---- */
  const accidents = recent.filter((e) => isAccident(e.option));
  const MIN_ACC = 3;
  if (accidents.length >= MIN_ACC) {
    const timed = accidents.filter((e) => toMinutes(e.time) != null);
    if (timed.length >= MIN_ACC) {
      const byWindow = new Map<string, number>();
      for (const a of timed) {
        const w = windowFor(toMinutes(a.time)!);
        byWindow.set(w.label, (byWindow.get(w.label) ?? 0) + 1);
      }
      const [topWindow, topCount] = Array.from(byWindow.entries()).sort((a, b) => b[1] - a[1])[0];
      const share = topCount / timed.length;
      if (share >= 0.5) {
        insights.push({
          id: "toilet-accident-cluster",
          emoji: "⚠️",
          title: `Accidents cluster in the ${topWindow}`,
          body: `${topCount} of ${plural(timed.length, "timed accident")} happened in the ${topWindow}. That's not bad luck — it's a gap in the routine at that time.`,
          recommendation: `Add a scheduled toilet trip at the start of the ${topWindow} window for the next week, and watch that slot on busy days.`,
          tone: "action",
        });
      } else {
        insights.push({
          id: "toilet-accident-cluster",
          emoji: "⚠️",
          title: `${plural(accidents.length, "accident")} in 14 days — no single hotspot`,
          body: "Accidents are spread across the day rather than clustered, which usually means supervision gaps rather than a routine gap.",
          recommendation: "Tether or pen him when you can't actively watch, and log the context in the note field so a pattern can emerge.",
          tone: "watch",
        });
      }
    }
  } else if (recent.length >= 5) {
    insights.push({
      id: "toilet-accident-low",
      emoji: "🏆",
      title: accidents.length === 0 ? "Zero accidents in 14 days" : `Only ${plural(accidents.length, "accident")} in 14 days`,
      body: "Too few accidents to form a pattern — which is exactly where you want to be.",
      recommendation: undefined,
      tone: "good",
    });
  } else {
    pending.push({
      id: "toilet-accident-cluster",
      emoji: "⚠️",
      title: "Accident hotspot detection",
      needs: "3+ timed accidents logged — activates automatically, hopefully never",
    });
  }

  /* ---- 4. Meal → toilet gap (needs feeding data too) ---- */
  const MIN_PAIRS = 5;
  const pairs = mealToToiletGaps(feedingEntries, entries);
  if (pairs.length >= MIN_PAIRS) {
    const sortedGaps = [...pairs].sort((a, b) => a - b);
    const median = sortedGaps[Math.floor(sortedGaps.length / 2)];
    insights.push({
      id: "toilet-meal-gap",
      emoji: "⏱️",
      title: `Meals move him in ~${median} min`,
      body: `Across ${plural(pairs.length, "meal")}, the median gap from eating to the next toilet event is ${median} minutes (range ${sortedGaps[0]}–${sortedGaps[sortedGaps.length - 1]}).`,
      recommendation: `Set a quiet timer for ${Math.max(5, median - 10)} minutes after each meal and head to the toilet spot before it rings.`,
      tone: "good",
    });
  } else {
    pending.push({
      id: "toilet-meal-gap",
      emoji: "⏱️",
      title: "Meal → toilet timing correlation",
      needs: `${plural(Math.max(0, MIN_PAIRS - pairs.length), "more day")} with a timed meal followed by a timed toilet log within 2 h — ${pairs.length}/${MIN_PAIRS} pairs so far`,
    });
  }

  return { insights, pending, allPending: insights.length === 0 };
}

/** Gaps (minutes) between a timed meal and the first toilet event within 2h after it. */
export function mealToToiletGaps(
  feeding: TrackerEntry[],
  toilet: TrackerEntry[],
): number[] {
  const gaps: number[] = [];
  const toiletByDate = new Map<string, number[]>();
  for (const t of toilet) {
    const m = toMinutes(t.time);
    if (m == null) continue;
    const arr = toiletByDate.get(t.date) ?? [];
    arr.push(m);
    toiletByDate.set(t.date, arr);
  }
  for (const f of feeding) {
    if (f.option && /snack/i.test(f.option)) continue; // training treats don't count
    const fm = toMinutes(f.time);
    if (fm == null) continue;
    const candidates = (toiletByDate.get(f.date) ?? [])
      .filter((tm) => tm > fm && tm - fm <= 120)
      .sort((a, b) => a - b);
    if (candidates.length > 0) gaps.push(candidates[0] - fm);
  }
  return gaps;
}

/* ================= FEEDING intelligence ================= */

/**
 * Feeding intelligence. Minimums:
 *  - meal-time regularity: ≥6 timed meals of the same type across ≥3 days
 *  - appetite trend (amounts): ≥6 entries with amounts across ≥3 days
 *  - missed-meal detection: ≥3 days of logging (needs an established baseline
 *    of meals-per-day before an absence means anything)
 */
export function feedingIntelligence(
  entries: TrackerEntry[],
  now: Date = new Date(),
): TrackerIntelligence {
  const insights: Insight[] = [];
  const pending: PendingInsight[] = [];
  const recent = lastDays(entries, 14, now);
  const meals = recent.filter((e) => !(e.option && /snack/i.test(e.option)));
  const dates = distinctDates(meals);

  /* ---- 1. Meal-time regularity per meal type ---- */
  const MIN_TIMED = 6;
  const MIN_DAYS = 3;
  const byType = new Map<string, number[]>();
  for (const m of meals) {
    const t = toMinutes(m.time);
    if (t == null || !m.option) continue;
    const arr = byType.get(m.option) ?? [];
    arr.push(t);
    byType.set(m.option, arr);
  }
  const timedTotal = Array.from(byType.values()).reduce((s, a) => s + a.length, 0);
  const regular: string[] = [];
  const drifting: string[] = [];
  if (timedTotal >= MIN_TIMED && dates.length >= MIN_DAYS) {
    for (const [type, mins] of Array.from(byType.entries())) {
      if (mins.length < 3) continue;
      const { mean, spreadMin } = circularMeanMinutes(mins);
      if (spreadMin <= 30) regular.push(`${type} ~${fmtTime(mean)}`);
      else drifting.push(`${type} (± ${Math.round(spreadMin)} min)`);
    }
    if (regular.length > 0 || drifting.length > 0) {
      const steady = drifting.length === 0;
      insights.push({
        id: "feeding-regularity",
        emoji: "🕐",
        title: steady ? "Meal times are steady" : "Meal times are drifting",
        body: `${regular.length > 0 ? `Consistent: ${regular.join(", ")}. ` : ""}${drifting.length > 0 ? `Loose: ${drifting.join(", ")}.` : ""}`,
        recommendation: steady
          ? "Keep it — a predictable gut makes toilet timing predictable, which is the whole housetraining game."
          : "Pin the loose meals to a fixed time (±15 min). Irregular meals are the #1 cause of surprise poos.",
        tone: steady ? "good" : "action",
      });
    }
  } else {
    pending.push({
      id: "feeding-regularity",
      emoji: "🕐",
      title: "Meal-time regularity",
      needs: `${plural(Math.max(0, MIN_TIMED - timedTotal), "more timed meal log")} across at least ${MIN_DAYS} days — ${timedTotal}/${MIN_TIMED} so far`,
    });
  }

  /* ---- 2. Appetite trend from amounts ---- */
  const MIN_AMT = 6;
  const withAmt = meals.filter((e) => typeof e.value === "number");
  const amtDates = distinctDates(withAmt);
  if (withAmt.length >= MIN_AMT && amtDates.length >= MIN_DAYS) {
    // average grams per day, then compare last 3 logged days vs the prior baseline
    const perDay = new Map<string, number>();
    for (const e of withAmt) perDay.set(e.date, (perDay.get(e.date) ?? 0) + (e.value as number));
    const days = Array.from(perDay.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    const recent3 = days.slice(-3);
    const baseline = days.slice(0, -3);
    if (baseline.length >= 2) {
      const avg = (xs: [string, number][]) => xs.reduce((s, [, v]) => s + v, 0) / xs.length;
      const bAvg = avg(baseline);
      const rAvg = avg(recent3);
      const pct = Math.round(((rAvg - bAvg) / bAvg) * 100);
      const dropping = pct <= -20;
      insights.push({
        id: "feeding-appetite",
        emoji: dropping ? "📉" : "🍽️",
        title: dropping
          ? `Appetite down ${Math.abs(pct)}% vs baseline`
          : `Appetite steady (~${Math.round(rAvg)} g/day)`,
        body: dropping
          ? `The last ${plural(recent3.length, "logged day")} average ${Math.round(rAvg)} g/day against a ${Math.round(bAvg)} g/day baseline.`
          : `Recent days average ${Math.round(rAvg)} g/day, in line with the ${Math.round(bAvg)} g/day baseline.`,
        recommendation: dropping
          ? "A puppy skipping meals or eating 20%+ less for 2+ days warrants a vet call — teething can explain it, but don't assume."
          : "Track weekly weight alongside; amount + weight together tell the real appetite story.",
        tone: dropping ? "action" : "good",
      });
    } else {
      insights.push({
        id: "feeding-appetite",
        emoji: "🍽️",
        title: `Logging ~${Math.round(days.reduce((s, [, v]) => s + v, 0) / days.length)} g/day so far`,
        body: `Amounts recorded on ${plural(days.length, "day")} — a couple more days builds the baseline for drop detection.`,
        tone: "info",
      });
    }
  } else {
    pending.push({
      id: "feeding-appetite",
      emoji: "🍽️",
      title: "Appetite trend & drop alerts",
      needs: `${plural(Math.max(0, MIN_AMT - withAmt.length), "more meal log")} with amounts across at least ${MIN_DAYS} days — ${withAmt.length}/${MIN_AMT} so far`,
    });
  }

  /* ---- 3. Missed-meal detection ---- */
  if (dates.length >= MIN_DAYS) {
    const perDayCount = new Map<string, number>();
    for (const m of meals) perDayCount.set(m.date, (perDayCount.get(m.date) ?? 0) + 1);
    const counts = Array.from(perDayCount.values()).sort((a, b) => a - b);
    const typical = counts[Math.floor(counts.length / 2)]; // median meals/day
    const todayISO = now.toISOString().slice(0, 10);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yISO = yesterday.toISOString().slice(0, 10);
    const yCount = perDayCount.get(yISO) ?? 0;
    if (perDayCount.has(yISO) === false && perDayCount.size >= 3 && dates[dates.length - 1] < yISO) {
      insights.push({
        id: "feeding-missed",
        emoji: "❓",
        title: "No meals logged since " + dates[dates.length - 1],
        body: `He normally shows ${plural(typical, "meal")} a day in the log. Either logging lapsed or meals did — both are worth knowing.`,
        recommendation: "If he genuinely skipped meals, two in a row is a vet call at this age. If it's just logging, one tap per meal keeps the trends honest.",
        tone: "watch",
      });
    } else if (yCount > 0 && yCount < typical) {
      insights.push({
        id: "feeding-missed",
        emoji: "❓",
        title: `Yesterday logged ${yCount} of his usual ${plural(typical, "meal")}`,
        body: "One light day is usually nothing — but two consecutive short days is the classic early sign something's off.",
        recommendation: "Log today's meals as they happen; the engine flags a real appetite drop automatically.",
        tone: "watch",
      });
    } else {
      insights.push({
        id: "feeding-rhythm",
        emoji: "✅",
        title: `Rhythm: ${plural(typical, "meal")} a day, on schedule`,
        body: `Meal logging is consistent across ${plural(dates.length, "day")} — the baseline the accident-prevention timing is built on.`,
        tone: "good",
      });
    }
  } else {
    pending.push({
      id: "feeding-missed",
      emoji: "❓",
      title: "Missed-meal detection",
      needs: `${plural(Math.max(0, MIN_DAYS - dates.length), "more day")} of meal logging to build the baseline — ${dates.length}/${MIN_DAYS} days so far`,
    });
  }

  return { insights, pending, allPending: insights.length === 0 };
}

/* ================= Paddington Today prediction ================= */

export interface ToiletPrediction {
  /** minutes since midnight of the predicted next likely toilet need */
  atMinutes: number;
  label: string; // e.g. "Next wee window ≈ 7:05am"
  detail: string;
}

/**
 * Best next-toilet-window prediction for the nudge layer.
 * Uses the morning anchor if we're before it; otherwise the meal-gap rule
 * against today's last logged meal. Returns null when nothing is unlocked.
 */
export function nextToiletWindow(
  toilet: TrackerEntry[],
  feeding: TrackerEntry[],
  now: Date = new Date(),
): ToiletPrediction | null {
  const recent = lastDays(toilet, 14, now);
  const nowMin = now.getHours() * 60 + now.getMinutes();

  // morning anchor
  const morningWees = recent.filter((e) => {
    const m = toMinutes(e.time);
    return m != null && m >= MORNING.from && m < MORNING.to && isWee(e.option) && isSuccess(e.option);
  });
  if (morningWees.length >= 5 && distinctDates(morningWees).length >= 3) {
    const { mean, spreadMin } = circularMeanMinutes(morningWees.map((e) => toMinutes(e.time)!) as number[]);
    if (nowMin < mean + spreadMin && nowMin > mean - 240) {
      return {
        atMinutes: mean,
        label: `Morning wee expected ≈ ${fmtTime(mean)}`,
        detail: `Be at the pad or grass by ${fmtTime(Math.max(0, mean - spreadMin))} — straight from the crate, no floor time.`,
      };
    }
  }

  // meal-gap prediction from today's most recent timed meal
  const gaps = mealToToiletGaps(feeding, toilet);
  if (gaps.length >= 5) {
    const median = [...gaps].sort((a, b) => a - b)[Math.floor(gaps.length / 2)];
    const todayISO = now.toISOString().slice(0, 10);
    const todaysMeals = feeding
      .filter((f) => f.date === todayISO && toMinutes(f.time) != null && !(f.option && /snack/i.test(f.option)))
      .map((f) => toMinutes(f.time)!) as number[];
    const lastMeal = todaysMeals.sort((a, b) => a - b).pop();
    if (lastMeal != null) {
      const predicted = lastMeal + median;
      if (predicted > nowMin && predicted - nowMin <= 120) {
        return {
          atMinutes: predicted,
          label: `Toilet window ≈ ${fmtTime(predicted)} (after the ${fmtTime(lastMeal)} meal)`,
          detail: `His median meal→toilet gap is ${median} min. Head to the spot a few minutes early.`,
        };
      }
    }
  }
  return null;
}
