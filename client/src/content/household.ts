/*
 * Household rhythm — the family's real weekly schedule, the recurring care
 * rota, and a rotating library of age-appropriate activity ideas.
 * Everything here is deterministic by calendar date, so "Wobbles Today"
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

/* ---------------- Weekly schedule ----------------
 * Marcus: WFH Mon + Fri, office Tue/Wed/Thu, weekends home.
 * Chesa:  home most days; office sometimes on Tue and Thu.
 * Weekends: at least one of the two days is a home-focused Wobbles day —
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
    note: "Wobbles focus day — the week's big adventure and unhurried together-time.",
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
    note: "Flexible weekend day — errands with Wobbles carried along, or a bigger park by car.",
  },
];

export function dayPlanFor(date: Date): DayPlan {
  return WEEK_PLAN[date.getDay()];
}

/* ---------------- Care rota ----------------
 * Recurring, date-deterministic care tasks. Bath is every other Monday
 * anchored to homecoming week; nails weekly on Mondays; parasite dose on
 * the 18th monthly (homecoming date); teeth a few times a week; ears weekly.
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
 * Monday after homecoming (2026-09-21) is a bath Monday. */
function fortnightIndex(date: Date): number {
  const anchor = new Date("2026-09-21T00:00:00"); // first bath Monday
  const days = Math.floor((date.getTime() - anchor.getTime()) / 86400000);
  return Math.floor(days / 7);
}

export function careTasksFor(date: Date): CareTask[] {
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

  if (dom === 18)
    out.push({
      id: "parasite",
      emoji: "🛡️",
      label: "Monthly parasite dose today (the 18th)",
      detail:
        "Heartworm + tick + flea preventive chew or spot-on. Log it in the Health tracker so the family knows it's done.",
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
  { emoji: "🛋️", title: "Chill-together reward", text: "After the evening walk, deliberate calm cuddle time on the floor at his level — bonding is training too." },
];

/** Office-leaning days (Tue–Thu) — alone-time skills + low-effort enrichment */
const OFFICE_IDEAS: ActivityIdea[] = [
  { emoji: "🥣", title: "Licky-mat departure", text: "Give a smeared licky mat as whoever leaves walks out — departures become good news, not drama." },
  { emoji: "🎧", title: "Radio babysitter", text: "Leave quiet radio or a podcast on while the flat is emptier — soft voices beat silence for a young puppy." },
  { emoji: "⏱️", title: "Alone-time reps", text: "Whoever's home: three fake departures today (keys, shoes, out 2–5 min, back, no fuss). Separation practice in tiny doses." },
  { emoji: "🧩", title: "Puzzle-feeder dinner", text: "Tonight's dinner goes in the puzzle feeder or a rolled towel — an office day should still end with a brain workout." },
  { emoji: "📹", title: "Puppy-cam check", text: "Peek at the camera at lunch: is he sleeping (great) or pacing (shorten tomorrow's alone stretch)? Data beats guilt." },
  { emoji: "🌆", title: "Lobby-bench social", text: "After the evening walk, 5 minutes on the void-deck bench watching Woodlands go by — passive socialisation, zero effort." },
  { emoji: "🦴", title: "Long-chew wind-down", text: "A safe long-lasting chew after dinner — chewing is self-soothing after a stimulating day apart." },
];

/** Weekend-specific bigger adventures (layered on top for Sat/Sun) */
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
  if (dow === 0 || dow === 6) return pick(WEEKEND_IDEAS, date, 3);
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
 * 7pm park socialisation every other day, anchored to homecoming.
 */
export function isParkNight(date: Date): boolean {
  const anchor = new Date("2026-09-19T00:00:00"); // first park night, day after homecoming
  const days = Math.floor((date.getTime() - anchor.getTime()) / 86400000);
  return days >= 0 && days % 2 === 0;
}
