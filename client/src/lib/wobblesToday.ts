/*
 * Keepsake Field Guide — "Wobbles Today" intelligence.
 * Stage-aware guidance (focus / expect / training) computed from age, plus
 * simple rule-based nudges derived from the family-shared server data
 * (passed in by the caller). No fake AI — every rule is transparent and
 * grounded in the handbook content.
 */
import { WOBBLES, wobblesAge, daysUntil } from "@/content/wobbles";
import { type TrackerEntry } from "@/lib/trackers";

export interface TodayStage {
  stage: string; // e.g. "Neonatal", "Socialisation window"
  title: string;
  text: string;
  focus: string; // today's focus
  expect: string; // expected behaviour
  training: string; // recommended micro-training
  link: string;
  linkLabel: string;
}

export function wobblesToday(): TodayStage {
  const age = wobblesAge();
  const toHome = daysUntil(WOBBLES.homecoming);

  if (!age.born)
    return {
      stage: "Countdown",
      title: "Counting Down to Wobbles",
      text: "He hasn't been born yet — use this time to read the handbook and prepare the house.",
      focus: "Read the first-day chapter and shop the kit list",
      expect: "Nothing yet — he's still a twinkle",
      training: "Train yourself: practise the crate setup",
      link: "/handbook/checklists",
      linkLabel: "Arrival checklist",
    };
  if (toHome > 0)
    return {
      stage: age.weeks < 3 ? "Neonatal — with the litter" : "Litter socialisation",
      title: "Settle In, Little One",
      text: `Wobbles is ${age.weeks} weeks old, growing up with his litter at The Doghouse QLD. Perfect time to puppy-proof, shop the kit list and read the first-day guide.`,
      focus: "Puppy-proof one room fully this week",
      expect: "The breeder is running ENS and enrichment — he's learning without you",
      training: "Decide your cue words now so the household is consistent from day one",
      link: "/handbook/first-day",
      linkLabel: "First-day guide",
    };
  if (age.weeks < 12)
    return {
      stage: "Socialisation window — early",
      title: "The Window Is Open",
      text: `At ${age.weeks} weeks, every calm new sight, sound and surface is building his adult brain. One tiny new experience a day — carried around Woodlands is perfect pre-vaccination.`,
      focus: "7:15am toilet walk (carry to the grass), pad practice at home, one carried new experience",
      expect: "Needle teeth, short naps every 45–90 min, toilet every 30–60 min awake",
      training: "Name response + 2-minute sit sessions before meals",
      link: "/trackers/social",
      linkLabel: "Log an experience",
    };
  if (age.weeks < 16)
    return {
      stage: "Socialisation window — closing",
      title: "Last Weeks of the Window",
      text: `${age.weeks} weeks — the socialisation window closes around 16 weeks. Prioritise variety: people, surfaces, sounds, gentle handling. Keep the 7:15am and evening walk rhythm; the 7pm park sessions stay carried/lap-based until he's fully vaccinated.`,
      focus: "Tick a new socialisation category this week; keep the walk routine steady",
      expect: "More confidence, testing boundaries, teething begins",
      training: "Recall games in the hallway; keep sessions under 5 minutes",
      link: "/trackers/social",
      linkLabel: "Log an experience",
    };
  if (age.months < 6)
    return {
      stage: "Junior — pre coat change",
      title: "Adolescent Brain, Baby Coat",
      text: `${age.months} months old — keep training sessions short and keep brushing daily so the brush stays a friend before the coat change hits. Once fully vaccinated (~late Oct), the 7pm park sessions move onto the grass — and the Woodlands Waterfront dog run opens up.`,
      focus: "Daily 2-minute brush ritual with treats; 7:15am + evening walks on schedule",
      expect: "Adult teeth arriving, more stamina, selective hearing",
      training: "Loose-lead walking and 'leave it' — practise on the way to the park",
      link: "/handbook/grooming-psychology",
      linkLabel: "See guidance",
    };
  if (age.months < 12)
    return {
      stage: "Coat change (6–12 months)",
      title: "Coat Change Season",
      text: "Between 6–12 months the adult fleece coat comes in and matting peaks. Daily line brushing, shorter cuts, and patience.",
      focus: "Line brush the 5 mat hotspots today",
      expect: "Sudden mats overnight; adolescent boundary-testing",
      training: "Cooperative care: brush, handle paws, reward calm",
      link: "/handbook/coat-science",
      linkLabel: "See guidance",
    };
  return {
    stage: "Adult",
    title: "All Grown Up (Mostly)",
    text: "Keep the routines: brush most days, groom every 4–6 weeks, and log health notes in the trackers.",
    focus: "Keep the brush-most-days habit",
    expect: "Settled routines — watch weight and coat condition",
    training: "One trick a month keeps his brain busy",
    link: "/trackers",
    linkLabel: "Open trackers",
  };
}

/* ---------------- Rule-based nudges ---------------- */

export interface Nudge {
  id: string;
  emoji: string;
  text: string;
  link: string;
}

function daysSince(iso: string | undefined): number | null {
  if (!iso) return null;
  const then = new Date(iso + "T12:00:00").getTime();
  const today = new Date().setHours(12, 0, 0, 0);
  return Math.round((today - then) / 86400000);
}

/**
 * Transparent, deterministic nudges from family-shared server data. Max 2.
 * @param entriesByTracker newest-first entries per tracker id (server-backed)
 * @param readProgress shared reading-progress map (slug -> 0..1)
 */
export function todaysNudges(
  entriesByTracker: (id: string) => TrackerEntry[],
  readProgress: Record<string, number>,
): Nudge[] {
  const age = wobblesAge();
  const out: Nudge[] = [];
  if (!age.born || daysUntil(WOBBLES.homecoming) > 0) {
    // Pre-homecoming: reading nudge only
    const started = Object.entries(readProgress).find(([, v]) => v > 0.05 && v < 0.95);
    if (started)
      out.push({ id: "resume", emoji: "📖", text: "Pick up where you left off in the handbook", link: `/handbook/${started[0]}` });
    return out.slice(0, 2);
  }

  const readEntries = entriesByTracker;
  const groom = daysSince(readEntries("grooming")[0]?.date);
  if (groom == null || groom >= 2)
    out.push({ id: "brush", emoji: "🪮", text: groom == null ? "No brushing logged yet — start the daily ritual" : `Last brush was ${groom} days ago — quick 2-minute session?`, link: "/trackers/grooming" });

  const toilet = daysSince(readEntries("toilet")[0]?.date);
  if (age.weeks < 20 && (toilet == null || toilet >= 1))
    out.push({ id: "toilet", emoji: "🚽", text: "No toilet logs today — patterns only appear if you log", link: "/trackers/toilet" });

  const weight = daysSince(readEntries("weight")[0]?.date);
  if (age.months < 12 && (weight == null || weight >= 7))
    out.push({ id: "weigh", emoji: "⚖️", text: weight == null ? "First weigh-in still to come" : "Weekly weigh-in is due", link: "/trackers/weight" });

  if (age.weeks < 16) {
    const social = daysSince(readEntries("social")[0]?.date);
    if (social == null || social >= 2)
      out.push({ id: "social", emoji: "🌏", text: "The socialisation window is open — one tiny new experience today (carried around the block counts)", link: "/trackers/social" });
  }

  // Park socialisation rhythm: 7pm every other day, once fully vaccinated (~17wk buffer past the 16wk final dose)
  if (age.weeks >= 18 && age.months < 12) {
    const social = daysSince(readEntries("social")[0]?.date);
    if (social != null && social >= 2)
      out.push({ id: "park", emoji: "🏞️", text: "Park night is due — 7pm at the park with dogs and people, or drive to the Waterfront dog run", link: "/trackers/social" });
  }

  return out.slice(0, 2);
}
