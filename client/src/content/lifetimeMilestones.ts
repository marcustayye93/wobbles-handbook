/*
 * U5 — Lifetime milestone generator. Pure and deterministic: given a horizon
 * in years it produces every recurring care milestone of Wobbles' life
 * (birthdays, boosters, PALS renewals, dental checks, senior bloodwork, and
 * life-stage thresholds). `allMilestones()` merges these with the hand-written
 * first-year MILESTONES — static entries always win on date+label collisions.
 *
 * Consumers: Growth timeline, Home countdown / coming-up, Health schedule.
 * Tests: server/lifetimeMilestones.test.ts.
 */
import { MILESTONES, WOBBLES, type Milestone } from "@/content/wobbles";

/** Birth year parsed once — 2026. */
const BIRTH_YEAR = Number(WOBBLES.dob.slice(0, 4));
const BIRTH_MMDD = WOBBLES.dob.slice(5); // "06-26"

const ordinal = (n: number): string => {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
};

/**
 * Generate recurring lifetime milestones out to `horizonYears` after birth.
 * Deterministic — no clock access, no storage.
 */
export function generateLifetimeMilestones(horizonYears = 16): Milestone[] {
  const out: Milestone[] = [];
  const lastYear = BIRTH_YEAR + horizonYears;

  for (let year = BIRTH_YEAR + 1; year <= lastYear; year++) {
    const age = year - BIRTH_YEAR;

    // Birthday — every 26 Jun.
    out.push({
      date: `${year}-${BIRTH_MMDD}`,
      label: `Wobbles turns ${age} 🎂`,
      detail:
        age === 1
          ? "His first birthday — from wobbly farm pup to a proper little Singapore dog in one year. Cake (dog-safe), a long birthday walk, and a photo in the same spot as homecoming day."
          : `The ${ordinal(age)} birthday walk. Same tradition every year: a favourite route, a birthday photo, and something delicious. These stack into the best photo series you'll ever own.`,
      icon: "cake",
    });

    // Annual core booster + health check — combined with the birthday vet
    // visit from the first birthday onward.
    out.push({
      date: `${year}-${BIRTH_MMDD}`,
      label: `Annual booster + health check (age ${age})`,
      detail:
        "The yearly vet visit: core vaccine booster per the vet's protocol (C3 yearly or triennially with titre checks), weight and dental look-over, and a chance to raise anything the symptom log has collected.",
      icon: "syringe",
    });

    // PALS dog licence renewal — every September from the year after arrival.
    out.push({
      date: `${year}-09-01`,
      label: "PALS dog licence renewal",
      detail:
        "Renew Wobbles' AVS dog licence on PALS before it lapses — a few minutes online. Keep the licence number with his records; it's needed for vet visits, boarding and travel.",
      icon: "badge-check",
    });

    // Annual dental check — every January from 2028 (age 1.5+), offset six
    // months from the birthday visit so his mouth is seen twice a year.
    if (year >= BIRTH_YEAR + 2) {
      out.push({
        date: `${year}-01-15`,
        label: "Annual dental check",
        detail:
          "Cavoodles are prone to dental disease — small mouths, crowded teeth. A January check offsets the June vet visit so his teeth get looked at twice a year. Ask about a scale-and-polish if tartar is building.",
        icon: "stethoscope",
      });
    }

    // Senior bloodwork — twice yearly (Jun + Dec) from age 8.
    if (age >= 8) {
      out.push({
        date: `${year}-${BIRTH_MMDD}`,
        label: "Senior bloodwork (mid-year)",
        detail:
          "From age 8, twice-yearly senior panels (blood count, organ function, thyroid, urinalysis) catch kidney, liver and endocrine changes years before symptoms show. Pairs with the birthday vet visit.",
        icon: "stethoscope",
      });
      out.push({
        date: `${year}-12-15`,
        label: "Senior bloodwork (end-of-year)",
        detail:
          "The second senior panel of the year. Trends matter more than single results — the vet compares against June's numbers to spot slow drifts early.",
        icon: "stethoscope",
      });
    }
  }

  // Life-stage thresholds (from the U1 stage engine):
  // adolescence 12 mo, young adult 18 mo, prime 4 y, senior 8 y, twilight 12 y.
  const stages: { date: string; label: string; detail: string }[] = [
    {
      date: `${BIRTH_YEAR + 1}-${BIRTH_MMDD}`,
      label: "Adolescence begins",
      detail:
        "Twelve months old — the teenage chapter. Expect boundary testing and selective hearing; keep training light, fun and consistent. It passes.",
    },
    {
      date: `${BIRTH_YEAR + 1}-12-26`,
      label: "Young adult",
      detail:
        "Eighteen months — the teenage fog lifts and the dog he'll be for the next decade settles in. Time to lock in the adult rhythm: monthly weigh-ins, annual boosters, daily teeth.",
    },
    {
      date: `${BIRTH_YEAR + 4}-${BIRTH_MMDD}`,
      label: "Prime years begin",
      detail:
        "Four years old — peak Wobbles. The job now is vigilance disguised as routine: watch for subtle changes in weight, gait and appetite while enjoying the best years.",
    },
    {
      date: `${BIRTH_YEAR + 8}-${BIRTH_MMDD}`,
      label: "Senior years begin",
      detail:
        "Eight years old — officially a senior (in a breed that often lives 14+). Vet visits go twice-yearly, comfort adjustments start, and the quality-of-life check-ins begin.",
    },
    {
      date: `${BIRTH_YEAR + 12}-${BIRTH_MMDD}`,
      label: "Golden twilight begins",
      detail:
        "Twelve years old — the golden twilight. Comfort-first care, shorter sniffier walks, and making every ordinary day count.",
    },
  ];
  for (const s of stages) {
    const stageYear = Number(s.date.slice(0, 4));
    if (stageYear <= lastYear) out.push({ ...s, icon: "star" });
  }

  return out.sort((a, b) => a.date.localeCompare(b.date) || a.label.localeCompare(b.label));
}

/**
 * The full life timeline: hand-written first-year MILESTONES merged with the
 * generated recurring ones. De-duplicated by `date+label`; static entries win.
 */
export function allMilestones(horizonYears = 16): Milestone[] {
  const seen = new Set<string>(MILESTONES.map((m) => `${m.date}|${m.label}`));
  const merged = [...MILESTONES];
  for (const m of generateLifetimeMilestones(horizonYears)) {
    const key = `${m.date}|${m.label}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(m);
    }
  }
  return merged.sort((a, b) => a.date.localeCompare(b.date) || a.label.localeCompare(b.label));
}
