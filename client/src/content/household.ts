/*
 * Household rhythm — the family's real weekly schedule, the recurring care
 * rota, and a rotating library of age-appropriate activity ideas.
 * Everything here is deterministic by calendar date, so "Paddington Today"
 * changes every single day but stays identical for everyone in the family
 * (and across refreshes) on the same date.
 */

/* ---------------- The family ---------------- */

export interface Person {
  id: "marcus" | "chesa";
  name: string;
  emoji: string;
}

export const FAMILY: Person[] = [
  { id: "marcus", name: "Marcus", emoji: "🧑🏻" },
  { id: "chesa", name: "Chesa", emoji: "👩🏻" },
];

export const HOMECOMING_ISO = "2026-09-23";
/** 16-week core. Public grass still needs a SingVet nod after this date. */
export const CORE_16W_ISO = "2026-10-16";
/** First bath Monday — 12 days home, not day 5. */
export const FIRST_BATH_MONDAY = "2026-10-05";
/** First park-night after the 16-week core plus a vet nod. */
export const PARK_NIGHT_ANCHOR = "2026-10-30";

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function onOrAfter(iso: string, date: Date): boolean {
  return startOfLocalDay(date).getTime() >= new Date(iso + "T00:00:00").getTime();
}

/** True from homecoming day 23 Sep. */
export function hasLanded(date: Date): boolean {
  return onOrAfter(HOMECOMING_ISO, date);
}

/** True from the 16-week core. Labels still say wait for the SingVet nod. */
export function groundWalksAllowed(date: Date): boolean {
  return onOrAfter(CORE_16W_ISO, date);
}

/* ---------------- Weekly schedule ----------------
 * Marcus: WFH Mon + Fri, office Tue/Wed/Thu, weekends home.
 * Chesa:  home most days; office sometimes on Tue and Thu.
 * Weekends: at least one of the two days is a home-focused Paddington day —
 * we treat Sunday as the default "focus day" (Saturday flagged flexible).
 */

export type Presence = "home" | "office" | "maybe-office";

export interface DayPlan {
  dow: number; // 0=Sun..6=Sat
  label: string;
  marcus: Presence;
  chesa: Presence;
  note: string; // one-line description of the day's texture
}

export const WEEK_PLAN: DayPlan[] = [
  {
    dow: 0,
    label: "Sunday",
    marcus: "home",
    chesa: "home",
    note: "Paddington focus day — the week's big adventure and unhurried together-time.",
  },
  {
    dow: 1,
    label: "Monday",
    marcus: "home",
    chesa: "home",
    note: "Both home (Marcus WFH) — grooming day: bath fortnight, nails, ears, the whole spa.",
  },
  {
    dow: 2,
    label: "Tuesday",
    marcus: "office",
    chesa: "maybe-office",
    note: "Marcus at the office; Chesa sometimes too — practise calm alone-time in short doses.",
  },
  {
    dow: 3,
    label: "Wednesday",
    marcus: "office",
    chesa: "home",
    note: "Marcus at the office; Chesa home — her one-on-one training and enrichment day.",
  },
  {
    dow: 4,
    label: "Thursday",
    marcus: "office",
    chesa: "maybe-office",
    note: "Office-leaning day — enrichment toys and licky mats earn their keep.",
  },
  {
    dow: 5,
    label: "Friday",
    marcus: "home",
    chesa: "home",
    note: "Marcus WFH — lunchtime play session and a proper wind-down into the weekend.",
  },
  {
    dow: 6,
    label: "Saturday",
    marcus: "home",
    chesa: "home",
    note: "Flexible weekend day — errands. Big-park / dog-run only after the 16 Oct core plus a SingVet nod.",
  },
];

export function dayPlanFor(date: Date): DayPlan {
  const base = WEEK_PLAN[date.getDay()];
  if (!hasLanded(date)) {
    if (base.dow === 6)
      return { ...base, note: "He is still in Queensland — kit list, crate dry-run, no puppy on errands." };
    if (base.dow === 0)
      return { ...base, note: "Paddington focus day for the humans — handbook and shopping, not a park day." };
    return { ...base, note: `${base.note} He is not home yet — no puppy care tasks today.` };
  }
  if (!groundWalksAllowed(date) && (base.dow === 0 || base.dow === 6)) {
    return {
      ...base,
      note: "Weekend at home — carry-adventures only. Public grass waits for Friday 16 Oct plus a SingVet nod.",
    };
  }
  return base;
}

/* ---------------- Care rota ----------------
 * Recurring, date-deterministic care tasks. Bath is every other Monday
 * anchored to homecoming week; nails weekly on Mondays; parasite dose is a
 * placeholder on the 24th until the vet sets the real calendar day; teeth a
 * few times a week; ears weekly.
 */

export interface CareTask {
  id: string;
  emoji: string;
  label: string;
  detail: string;
  link: string;
  /** Which family member usually owns it (both = shared) */
  owner: "marcus" | "chesa" | "both";
}

/** ISO week index used for fortnight alternation, anchored so the first
 * bath Monday is 5 Oct 2026 (12 days home), not day 5. */
function fortnightIndex(date: Date): number {
  const anchor = new Date(FIRST_BATH_MONDAY + "T00:00:00");
  const days = Math.floor((date.getTime() - anchor.getTime()) / 86400000);
  return Math.floor(days / 7);
}

export interface CareRotaContext {
  /** True once a Health tracker "Desexing" event is logged. */
  desexed?: boolean;
}

function yearMonth(date: Date): { y: number; m: number; d: number } {
  return { y: date.getFullYear(), m: date.getMonth() + 1, d: date.getDate() };
}

/** Whole calendar days from `date` until ISO yyyy-mm-dd (negative if past). */
function daysUntilIso(iso: string, date: Date): number {
  const a = startOfLocalDay(date).getTime();
  const b = new Date(iso + "T00:00:00").getTime();
  return Math.round((b - a) / 86400000);
}

export function careTasksFor(date: Date, ctx: CareRotaContext = {}): CareTask[] {
  if (!hasLanded(date)) return [];
  const dow = date.getDay();
  const dom = date.getDate();
  const out: CareTask[] = [];

  if (dow === 1) {
    const bathWeek = fortnightIndex(date) % 2 === 0;
    if (bathWeek)
      out.push({
        id: "bath",
        emoji: "🛁",
        label: "Bath day (every other Monday)",
        detail:
          "Line-brush FIRST (water sets mats), lukewarm water, dog shampoo, towel + cool blow-dry, brush again once dry.",
        link: "/handbook/grooming-masterclass",
        owner: "both",
      });
    out.push({
      id: "nails",
      emoji: "💅",
      label: "Nail check + trim (Mondays)",
      detail:
        "If they click on the floor, they're due. Tiny slivers off the tip, treats between paws — stop before the quick.",
      link: "/handbook/grooming-masterclass",
      owner: "marcus",
    });
    out.push({
      id: "ears",
      emoji: "👂",
      label: "Ear check (Mondays)",
      detail:
        "Cavoodle drop ears trap humidity in Singapore. Look for redness, smell, head-shaking; wipe visible wax only.",
      link: "/handbook/grooming-masterclass",
      owner: "chesa",
    });
  }

  if (dom === 24)
    out.push({
      id: "parasite",
      emoji: "🛡️",
      label: "Parasite dose reminder (vet sets the real date)",
      detail:
        "Placeholder on the 24th until SingVet sets the calendar day at the booked visit on Friday 2 Oct, 4pm. Log the real dose in Health.",
      link: "/trackers/health",
      owner: "both",
    });

  // Teeth: Tue / Thu / Sat rhythm (3x weekly minimum)
  if (dow === 2 || dow === 4 || dow === 6)
    out.push({
      id: "teeth",
      emoji: "🦷",
      label: "Teeth brushing night",
      detail:
        "Dog toothpaste only. 30 seconds a side is plenty — small breeds like Cavoodles are dental-disease prone.",
      link: "/handbook/daily-hacks",
      owner: "chesa",
    });

  const { y, m, d: day } = yearMonth(date);
  if (y === 2026 && m === 10 && day === 2)
    out.push({
      id: "singvet-first",
      emoji: "🩺",
      label: "SingVet Woodlands, 4pm",
      detail:
        "Booked Friday 2 Oct 2026 at 4pm. Chip, papers, and the parasite plan. This is not the 16 Oct core, and he is not park-cleared yet.",
      link: "/health",
      owner: "both",
    });

  const untilCore = daysUntilIso(CORE_16W_ISO, date);

  // 16-week core: the seven days before Friday 16 Oct 2026.
  if (untilCore >= 1 && untilCore <= 7) {
    out.push({
      id: "core-16w",
      emoji: "💉",
      label: "16-week core this week — book SingVet",
      detail:
        "Friday 16 Oct 2026 is the ≥16-week core. The vet confirms the exact vaccine. Dose 3 on 4 Sep is not this shot and is not park-cleared.",
      link: "/health",
      owner: "both",
    });
  }

  // Annual C3 booster: every October from 2027 (12 months after the 16 Oct 2026 core).
  if (m === 10 && y >= 2027) {
    out.push({
      id: "annual-booster",
      emoji: "💉",
      label: "Annual C3 booster due — book SingVet",
      detail:
        "First adult booster is Oct 2027, then every October. The vet confirms the exact vaccine and whether the schedule is annual or triennial — the app does not.",
      link: "/health",
      owner: "both",
    });
  }

  // Blood panels: annual every June from 2027; twice-yearly (Jun + Dec) from his 8th birthday, Jun 2034.
  if (m === 6 && y >= 2027) {
    const senior = y >= 2034;
    out.push({
      id: senior ? "blood-senior" : "blood-annual",
      emoji: "🩸",
      label: senior
        ? "Senior blood panel due (twice-yearly)"
        : "Annual comprehensive blood panel due",
      detail:
        "Full blood count + biochemistry. Early detection is the point — log the results in the Health tracker. The vet confirms timing; this is not a prescription.",
      link: "/health",
      owner: "both",
    });
  }
  if (m === 12 && y >= 2034) {
    out.push({
      id: "blood-senior",
      emoji: "🩸",
      label: "Senior blood panel due (twice-yearly)",
      detail:
        "Full blood count + biochemistry. Early detection is the point — log the results in the Health tracker. The vet confirms timing; this is not a prescription.",
      link: "/health",
      owner: "both",
    });
  }

  // Neutering: discuss in Dec 2026 (6 months). Then monthly until a Desexing log exists.
  if (!ctx.desexed && m === 12 && y === 2026) {
    out.push({
      id: "neuter-discuss",
      emoji: "✂️",
      label: "Discuss neutering timing with SingVet",
      detail:
        "For a toy breed (~8 kg adult) the typical window is 6–9 months after the full vaccination course; the vet confirms the exact date. Pre-anaesthetic bloods at the procedure are the baseline panel everything later is compared against.",
      link: "/health",
      owner: "both",
    });
  }
  if (!ctx.desexed && y >= 2027) {
    out.push({
      id: "neuter-followup",
      emoji: "✂️",
      label: "Neutering not yet logged — confirm the date with SingVet",
      detail:
        "Log a Desexing event in the Health tracker when it is done. The vet confirms timing — the app does not set a surgery date. Pre-anaesthetic bloods at the procedure are his baseline panel.",
      link: "/health",
      owner: "both",
    });
  }

  return out;
}

/* ---------------- Rotating activity ideas ----------------
 * Pools keyed to life stage; the pick rotates deterministically by date so
 * the suggestion is fresh every day and never random-per-refresh.
 * WFH ideas assume someone is home; office ideas assume an emptier flat.
 */

export interface ActivityIdea {
  emoji: string;
  title: string;
  text: string;
}

/** Pre-homecoming: preparation ideas for the humans */
const PREP_IDEAS: ActivityIdea[] = [
  { emoji: "📦", title: "Prep mission", text: "Order one item off the kit list today — spread the shopping so nothing is a last-minute panic." },
  { emoji: "🚪", title: "Puppy-proof patrol", text: "Get on your knees in one room and look for cables, gaps and chewables at puppy eye-level." },
  { emoji: "📖", title: "Chapter night", text: "Read one handbook chapter together tonight so you and Chesa land on the same rules before he arrives." },
  { emoji: "🗣️", title: "Cue-word summit", text: "Agree tonight on his cue words (toilet cue, crate cue, 'off') — consistency from day one beats correcting later." },
  { emoji: "🧺", title: "Den dry-run", text: "Set up the crate + pen where they'll live and leave them: he should arrive to a settled home, not moving furniture." },
  { emoji: "🌳", title: "Scout the route", text: "Walk the 7:15am route yourselves: lift → block grass. Pick his exact toilet patch in the park next door." },
];

/** Both-home days (Mon/Fri/weekends) — richer, together activities */
const HOME_IDEAS: ActivityIdea[] = [
  { emoji: "🧸", title: "New-toy Tuesday energy", text: "Rotate his toy box today — hide half, bring back an 'old' one. A re-discovered toy is a new toy for free." },
  { emoji: "👃", title: "Scatter-feed breakfast", text: "Skip the bowl: scatter kibble across a snuffle mat or towel. Ten minutes of sniffing tires him like a walk." },
  { emoji: "🎾", title: "Hallway recall relay", text: "You at one end, Chesa at the other — call him back and forth for treats. The best recall game two people can play." },
  { emoji: "📦", title: "Box maze lunch", text: "Build a cardboard-box maze in the living room and hide treats in it. Demolition is part of the fun." },
  { emoji: "🧘", title: "Settle-on-mat practice", text: "Practise 'go to mat' while you both work/read — calm is a skill. Reward quietly every time he chooses the mat." },
  { emoji: "🚿", title: "Cooperative-care minute", text: "One minute of paw-holding, ear-touching, brush-showing with treats. Grooming stays easy because you rehearsed it." },
  { emoji: "🫣", title: "Hide-and-seek", text: "One of you holds him, the other hides behind a door — then call once. Builds recall AND makes you the best game in the flat." },
  { emoji: "🍧", title: "Frozen KONG craft", text: "Stuff a KONG with soaked kibble and freeze it for tonight — tropical-weather enrichment that doubles as teething relief." },
  { emoji: "🎓", title: "Trick of the week", text: "Pick one party trick (spin, paw, touch) and do three 2-minute sessions today. Tiny sessions, big results." },
  { emoji: "🛋️", title: "Chill-together reward", text: "After his last pad trip, deliberate calm cuddle time on the floor at his level. Bonding is training too." },
];

/** Office-leaning days (Tue–Thu) — alone-time skills + low-effort enrichment */
const OFFICE_IDEAS: ActivityIdea[] = [
  { emoji: "🥣", title: "Licky-mat departure", text: "Give a smeared licky mat as whoever leaves walks out — departures become good news, not drama." },
  { emoji: "🎧", title: "Radio babysitter", text: "Leave quiet radio or a podcast on while the flat is emptier — soft voices beat silence for a young puppy." },
  { emoji: "⏱️", title: "Alone-time reps", text: "Whoever's home: three fake departures today (keys, shoes, out 2–5 min, back, no fuss). Separation practice in tiny doses." },
  { emoji: "🧩", title: "Puzzle-feeder dinner", text: "Tonight's dinner goes in the puzzle feeder or a rolled towel — an office day should still end with a brain workout." },
  { emoji: "📹", title: "Puppy-cam check", text: "Peek at the camera at lunch: is he sleeping (great) or pacing (shorten tomorrow's alone stretch)? Data beats guilt." },
  { emoji: "🌆", title: "Lobby-bench social", text: "Five minutes on the void-deck bench with him on your lap, watching Woodlands go by. Paws stay off the ground until the 16 Oct core plus a SingVet nod." },
  { emoji: "🦴", title: "Long-chew wind-down", text: "A safe long-lasting chew after dinner — chewing is self-soothing after a stimulating day apart." },
];

/** Weekend before park-cleared: carry / indoor only. No dog-run or big-park. */
const WEEKEND_PRECLEAR_IDEAS: ActivityIdea[] = [
  { emoji: "🚌", title: "Carry-adventure", text: "Carry him somewhere genuinely new — a different block, a lift with strangers, the wet market's edge. Paws stay off public grass." },
  { emoji: "📸", title: "Milestone photo shoot", text: "Same spot, same blanket, every few weeks — future-you will treasure the growth series. Add it to Memories." },
  { emoji: "🍧", title: "Frozen KONG craft", text: "Stuff a KONG with soaked kibble and freeze it for tonight — tropical-weather enrichment that doubles as teething relief." },
  { emoji: "🫣", title: "Hide-and-seek", text: "One of you holds him, the other hides behind a door — then call once. Builds recall AND makes you the best game in the flat." },
  { emoji: "🧘", title: "Settle-on-mat practice", text: "Practise 'go to mat' while you both work/read — calm is a skill. Reward quietly every time he chooses the mat." },
  { emoji: "☕", title: "Café training mission", text: "A pet-friendly café: he practises settling on a mat under the table, carried in. Ten minutes is a win. No ground time." },
];

/** Weekend-specific bigger adventures (only after 16 Oct + vet nod). */
const WEEKEND_IDEAS: ActivityIdea[] = [
  { emoji: "🚗", title: "Big-park expedition", text: "Drive to a bigger park this weekend — new smells for him, proper walk for you. Bring water and go before 10am." },
  { emoji: "🏞️", title: "Dog-run morning", text: "Once he's fully vaccinated: Woodlands Waterfront dog run, early slot when it's cool and the regulars are friendly." },
  { emoji: "☕", title: "Café training mission", text: "A pet-friendly café: he practises settling on a mat under the table while you have breakfast. Ten minutes is a win." },
  { emoji: "📸", title: "Milestone photo shoot", text: "Same spot, same blanket, every few weeks — future-you will treasure the growth series. Add it to Memories." },
  { emoji: "🛁", title: "Full spa morning", text: "Weekend deep-groom: bath if due, line-brush everything, nails, ears — then a long nap for everyone involved." },
  { emoji: "🚌", title: "Carry-adventure", text: "Pre-vaccination: carry him somewhere genuinely new — the wet market's edge, a different block, a lift with strangers." },
];

/* ---------------- Deterministic picker ---------------- */

/** Stable day index: days since epoch in local time. */
export function dayIndex(date: Date): number {
  return Math.floor(
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 86400000,
  );
}

function pick<T>(pool: T[], date: Date, salt = 0): T {
  return pool[(dayIndex(date) + salt) % pool.length];
}

/**
 * Today's activity idea: pre-homecoming → prep ideas; weekends get the
 * weekend pool; office-leaning weekdays get alone-time ideas; both-home
 * weekdays get the richer pool. Deterministic per date.
 */
export function activityFor(date: Date, homecomingFuture: boolean): ActivityIdea {
  if (homecomingFuture) return pick(PREP_IDEAS, date);
  const dow = date.getDay();
  if (dow === 0 || dow === 6) {
    const groundWeekend = date.getTime() >= new Date(PARK_NIGHT_ANCHOR + "T00:00:00").getTime();
    return pick(groundWeekend ? WEEKEND_IDEAS : WEEKEND_PRECLEAR_IDEAS, date, 3);
  }
  const plan = dayPlanFor(date);
  const officeDay = plan.marcus === "office";
  return officeDay ? pick(OFFICE_IDEAS, date, 1) : pick(HOME_IDEAS, date, 2);
}

/** A second, different idea for the same day (used as a spare). */
export function bonusActivityFor(date: Date, homecomingFuture: boolean): ActivityIdea {
  if (homecomingFuture) return pick(PREP_IDEAS, date, 3);
  const dow = date.getDay();
  if (dow === 0 || dow === 6) return pick(HOME_IDEAS, date, 5);
  const plan = dayPlanFor(date);
  const officeDay = plan.marcus === "office";
  return officeDay ? pick(OFFICE_IDEAS, date, 4) : pick(HOME_IDEAS, date, 7);
}

/* ---------------- Park-night rhythm ----------------
 * 7pm park socialisation every other day, only after the 16-week core
 * plus a vet nod. Anchor is 30 Oct, not 25 Sep (decompression day 3).
 */
export function isParkNight(date: Date): boolean {
  const anchor = new Date(PARK_NIGHT_ANCHOR + "T00:00:00");
  const days = Math.floor((date.getTime() - anchor.getTime()) / 86400000);
  return days >= 0 && days % 2 === 0;
}
