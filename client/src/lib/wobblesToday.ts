/*
 * Keepsake Field Guide — "Wobbles Today" daily engine (v2).
 * Stage-aware guidance (focus / expect / training) computed from age,
 * PLUS a date-deterministic daily layer: the household weekly schedule
 * (Marcus WFH Mon/Fri, office Tue–Thu; Chesa home most days), recurring
 * care-rota reminders (fortnightly Monday baths, weekly nails/ears,
 * monthly parasite dose on the 18th), a rotating activity idea, and
 * per-person nudges. Everything is transparent, rule-based and identical
 * for the whole family on any given date. No fake AI.
 */
import { WOBBLES, wobblesAge, daysUntil } from "@/content/wobbles";
import {
  dayPlanFor,
  careTasksFor,
  activityFor,
  isParkNight,
  type DayPlan,
  type CareTask,
  type ActivityIdea,
} from "@/content/household";
import {
  dayPlanWithSettings,
  remindersFor,
  type HouseholdSettings,
  type OneOffReminder,
} from "@/lib/householdSettings";
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

/* ---------------- Stage layer (varies with age) ---------------- */

export function wobblesToday(now: Date = new Date()): TodayStage {
  const age = wobblesAge(now);
  const toHome = daysUntil(WOBBLES.homecoming, now);

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
  if (toHome > 0) {
    if (age.weeks < 8)
      return {
        stage: age.weeks < 3 ? "Neonatal — with the litter" : "Litter socialisation",
        title: "Settle In, Little One",
        text: `Wobbles is ${age.weeks} weeks old, growing up with his litter at The Doghouse QLD. The breeder is running ENS and Puppy Culture — your job is the humans-only prep: puppy-proof, shop the kit list and read the first-day guide.`,
        focus: "Puppy-proof one room fully this week; keep working the kit list",
        expect: "The breeder is running ENS and enrichment — he's learning without you",
        training: "Decide your cue words now so the household is consistent from day one",
        link: "/handbook/first-day",
        linkLabel: "First-day guide",
      };
    return {
      stage: "With the breeder — export prep (8–12 weeks)",
      title: "Growing Up at the Farm",
      text: `${age.weeks} weeks old and still at The Doghouse QLD — AVS won't let him fly before 12 weeks, so he's banking litter manners, farm socialisation and his second vaccination there. ${toHome} days until he lands: nail the admin sprint (AVS import permit, PALS licence, Jetpets booking) and finish the flat.`,
      focus: "Admin sprint: import permit, PALS licence, Jetpets confirmation, kit list done",
      expect: "The breeder handles his 2nd vax and enrichment — ask for photo updates and the vaccination record",
      training: "Train yourselves: agree the house rules, cue words and the first-72-hours plan",
      link: "/singapore",
      linkLabel: "Road to Singapore",
    };
  }
  if (age.weeks < 16) {
    const daysHome = -toHome; // days since homecoming (0 = arrival day)
    if (daysHome <= 3)
      return {
        stage: "Just landed — decompression bubble",
        title: "Welcome Home, Wobbles",
        text: `He's here! Days 1–3 are the decompression bubble: flat-only, calm, predictable. No visitors, no outings — just toilet trips, naps, gentle play and letting him learn that this is home. The socialisation sprint starts from day 4.`,
        focus: "Quiet flat, toilet-spot repetition, name + hand-feeding, long naps",
        expect: "Jet-lag tired, some whining at night, toilet accidents — all normal after a big flight",
        training: "Nothing formal — just reward calm, say his name, hand-feed part of each meal",
        link: "/handbook/first-day",
        linkLabel: "First-day guide",
      };
    return {
      stage: "Socialisation sprint — window closing",
      title: "Four Weeks to Make Count",
      text: `${age.weeks} weeks — he arrived at 12 weeks and the socialisation window closes around 16, so this month IS the sprint. Front-load the Confidence Club and the 100 Things list: people, surfaces, sounds, gentle handling. Carried/lap-based outings until he's fully vaccinated.`,
      focus: "One or two new socialisation ticks a day; 7:15am walk + 7pm park (carried) rhythm",
      expect: "Growing confidence, testing boundaries, teething begins",
      training: "Day-1 skills all start now: name, sit, crate love, recall games — under 5 minutes a session",
      link: "/trackers/social",
      linkLabel: "Log an experience",
    };
  }
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

/* ---------------- Daily layer (varies every date) ---------------- */

export interface DailyBrief {
  plan: DayPlan; // who's home today + the day's texture
  whoHome: string; // human-readable, e.g. "Marcus WFH · Chesa home"
  care: CareTask[]; // today's care-rota tasks (bath / nails / parasite / teeth)
  activity: ActivityIdea; // today's rotating idea
  parkNight: boolean; // 7pm park socialisation night?
  reminders: OneOffReminder[]; // family-added one-off reminders for today
}

function presenceLabel(p: "home" | "office" | "maybe-office"): string {
  return p === "home" ? "home" : p === "office" ? "office" : "maybe office";
}

export function todaysBrief(now: Date = new Date(), settings?: HouseholdSettings): DailyBrief {
  const plan = settings ? dayPlanWithSettings(now, settings) : dayPlanFor(now);
  const homecomingFuture = daysUntil(WOBBLES.homecoming, now) > 0;
  const bothHome = plan.marcus === "home" && plan.chesa === "home";
  const whoHome = bothHome
    ? "Everyone home"
    : `Marcus ${presenceLabel(plan.marcus)} · Chesa ${presenceLabel(plan.chesa)}`;
  return {
    plan,
    whoHome,
    care: careTasksFor(now),
    activity: activityFor(now, homecomingFuture),
    parkNight: !homecomingFuture && isParkNight(now),
    reminders: settings ? remindersFor(now, settings) : [],
  };
}

/* ---------------- Rule-based nudges ---------------- */

export interface Nudge {
  id: string;
  emoji: string;
  text: string;
  link: string;
  /** Who the nudge is mainly for; undefined = whole family */
  person?: "Marcus" | "Chesa";
}

function daysSince(iso: string | undefined, now: Date = new Date()): number | null {
  if (!iso) return null;
  const then = new Date(iso + "T12:00:00").getTime();
  const today = new Date(now).setHours(12, 0, 0, 0);
  return Math.round((today - then) / 86400000);
}

/**
 * Transparent, deterministic nudges from family-shared server data plus the
 * household schedule. Max 3. Care-rota tasks (bath / nails / parasite dose)
 * take priority, then data-driven gaps, with owners named so Marcus and
 * Chesa each see their own jobs.
 * @param entriesByTracker newest-first entries per tracker id (server-backed)
 * @param readProgress shared reading-progress map (slug -> 0..1)
 */
export function todaysNudges(
  entriesByTracker: (id: string) => TrackerEntry[],
  readProgress: Record<string, number>,
  now: Date = new Date(),
  settings?: HouseholdSettings,
): Nudge[] {
  const age = wobblesAge(now);
  const out: Nudge[] = [];

  // 0) Family-added one-off reminders for today always come first
  // (ticked-off ones stay on the plan card, struck through, but leave the nudges)
  if (settings) {
    for (const r of remindersFor(now, settings)) {
      if (r.done) continue;
      out.push({
        id: `reminder-${r.id}`,
        emoji: "📌",
        text: r.text,
        link: "",
        person: r.person === "marcus" ? "Marcus" : r.person === "chesa" ? "Chesa" : undefined,
      });
    }
  }

  if (!age.born || daysUntil(WOBBLES.homecoming, now) > 0) {
    // Pre-homecoming: reading nudge only
    const started = Object.entries(readProgress).find(([, v]) => v > 0.05 && v < 0.95);
    if (started)
      out.push({ id: "resume", emoji: "📖", text: "Pick up where you left off in the handbook", link: `/handbook/${started[0]}` });
    return out.slice(0, 4);
  }

  // 1) Care rota first — they're date-anchored jobs with named owners
  for (const task of careTasksFor(now)) {
    if (task.id === "teeth") continue; // teeth shows in the day plan, not as a nudge
    out.push({
      id: `care-${task.id}`,
      emoji: task.emoji,
      text: task.label + " — " + task.detail.split(".")[0].toLowerCase() + ".",
      link: task.link,
      person: task.owner === "marcus" ? "Marcus" : task.owner === "chesa" ? "Chesa" : undefined,
    });
  }

  // 2) Data-driven gaps from the shared trackers
  const readEntries = entriesByTracker;
  const groom = daysSince(readEntries("grooming")[0]?.date, now);
  if (groom == null || groom >= 2)
    out.push({
      id: "brush",
      emoji: "🪮",
      text: groom == null ? "No brushing logged yet — start the daily ritual" : `Last brush was ${groom} days ago — quick 2-minute session?`,
      link: "/trackers/grooming",
      person: "Chesa",
    });

  const toilet = daysSince(readEntries("toilet")[0]?.date, now);
  if (age.weeks < 20 && (toilet == null || toilet >= 1))
    out.push({ id: "toilet", emoji: "🚽", text: "No toilet logs today — patterns only appear if you log", link: "/trackers/toilet" });

  const weight = daysSince(readEntries("weight")[0]?.date, now);
  if (age.months < 12 && (weight == null || weight >= 7))
    out.push({
      id: "weigh",
      emoji: "⚖️",
      text: weight == null ? "First weigh-in still to come" : "Weekly weigh-in is due",
      link: "/trackers/weight",
      person: "Marcus",
    });

  if (age.weeks < 16) {
    const social = daysSince(readEntries("social")[0]?.date, now);
    if (social == null || social >= 2)
      out.push({ id: "social", emoji: "🌏", text: "The socialisation window is open — one tiny new experience today (carried around the block counts)", link: "/trackers/social" });
  }

  // 3) Park night reminder (7pm every other day, post-full-vaccination)
  if (age.weeks >= 18 && age.months < 12 && isParkNight(now))
    out.push({ id: "park", emoji: "🏞️", text: "Park night tonight — 7pm at the park next door with dogs and people (or drive to the Waterfront dog run)", link: "/trackers/social" });

  // Reminders always survive the cap; then up to 3 rule-based nudges
  const reminders = out.filter((n) => n.id.startsWith("reminder-"));
  const rest = out.filter((n) => !n.id.startsWith("reminder-"));
  return [...reminders, ...rest.slice(0, 3)];
}
