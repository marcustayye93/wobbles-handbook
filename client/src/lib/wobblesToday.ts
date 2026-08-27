/*
 * Keepsake Field Guide — "Paddington Today" daily engine (v2).
 * Stage-aware guidance (focus / expect / training) computed from age,
 * PLUS a date-deterministic daily layer. Date-switch on WOBBLES.homecoming
 * (landing 24 Sep 2026). He is not fully vaccinated / park-cleared at landing.
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
import { nextToiletWindow } from "@/lib/insights";
import {
  currentWeek as currentShoppingWeek,
  overdueItems as overdueShoppingItems,
} from "@/content/shoppingPlan";

export interface TodayStage {
  stage: string;
  title: string;
  text: string;
  focus: string;
  expect: string;
  training: string;
  link: string;
  linkLabel: string;
}

export function wobblesToday(now: Date = new Date()): TodayStage {
  const age = wobblesAge(now);
  const toHome = daysUntil(WOBBLES.homecoming, now);

  if (!age.born)
    return {
      stage: "Countdown",
      title: "Counting Down to Paddington",
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
        text: `Paddington is ${age.weeks} weeks old, growing up with his litter at The Doghouse QLD. The breeder is running ENS and Puppy Culture — your job is the humans-only prep: puppy-proof, shop the kit list and read the first-day guide.`,
        focus: "Puppy-proof one room fully this week; keep working the kit list",
        expect: "The breeder is running ENS and enrichment — he's learning without you",
        training: "Decide your cue words now so the household is consistent from day one",
        link: "/handbook/first-day",
        linkLabel: "First-day guide",
      };
    return {
      stage: "With the breeder — export prep (8–12 weeks)",
      title: "Growing Up at the Farm",
      text: `${age.weeks} weeks old and still at The Doghouse QLD until he lands 24 Sep. C3 dose 3 is 8 Sep — that is NOT full vaccination and he is NOT park-cleared. ${toHome} days until landing: PALS before the import licence (valid 90 days, not 30), then Jet Pets confirmation, then the flat.`,
      focus: "PALS first, then import licence (90 days); C3 dose 3 on 8 Sep is not the 16-week core",
      expect: "The breeder handles the Australian C3 course and enrichment — ask for photo updates and the vaccination record",
      training: "Train yourselves: agree the house rules, cue words and the first-72-hours plan",
      link: "/singapore",
      linkLabel: "Road to Singapore",
    };
  }
  if (age.weeks < 16) {
    const daysHome = -toHome;
    if (daysHome <= 3)
      return {
        stage: "Just landed — decompression bubble",
        title: "Welcome Home, Paddington",
        text: `He's here! Days 1–3 are the decompression bubble: quiet flat, toilet spot, crate as a den, no visitors. No outings — just toilet trips, naps, gentle play and letting him learn that this is home. Carry-socialise from day 4. Ground/park wait for the ≥16-week core (~15 Oct) plus a vet nod.`,
        focus: "Quiet flat, toilet-spot repetition, name + hand-feeding, long naps",
        expect: "Jet-lag tired, some whining at night, toilet accidents — all normal after a big flight",
        training: "Nothing formal — just reward calm, say his name, hand-feed part of each meal",
        link: "/handbook/first-day",
        linkLabel: "First-day guide",
      };
    return {
      stage: "Socialisation sprint — window closing",
      title: "Four Weeks to Make Count",
      text: `${age.weeks} weeks — he arrived at nearly 13 weeks and the socialisation window closes around 16, so these first weeks ARE the sprint. Carry-socialise: people, surfaces, sounds, gentle handling in your arms. He is NOT park-cleared until the ≥16-week core (~15 Oct) plus a Singapore vet nod. Book SingVet.`,
      focus: "Carry-socialise; book SingVet; one or two new ticks a day. No public grass yet.",
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
      text: `${age.months} months old — keep training sessions short and keep brushing daily so the brush stays a friend before the coat change hits. Public grass only after the 16-week core and a Singapore vet nod — not around 22 Sep.`,
      focus: "Daily 2-minute brush ritual with treats; 7:15am + evening walks on schedule",
      expect: "Adult teeth arriving, more stamina, selective hearing",
      training: "Loose-lead walking and 'leave it' — practise on the way to the park once he is cleared",
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
    text: "Keep the routines: brush most days, groom every 4–6 weeks, and log health notes in Logs.",
    focus: "Keep the brush-most-days habit",
    expect: "Settled routines — watch weight and coat condition",
    training: "One trick a month keeps his brain busy",
    link: "/trackers",
    linkLabel: "Open logs",
  };
}

export interface DailyBrief {
  plan: DayPlan;
  whoHome: string;
  care: CareTask[];
  activity: ActivityIdea;
  parkNight: boolean;
  reminders: OneOffReminder[];
}

function presenceLabel(p: "home" | "office" | "maybe-office"): string {
  return p === "home" ? "home" : p === "office" ? "office" : "maybe office";
}

export function todaysBrief(now: Date = new Date(), settings?: HouseholdSettings): DailyBrief {
  const plan = settings ? dayPlanWithSettings(now, settings) : dayPlanFor(now);
  const homecomingFuture = daysUntil(WOBBLES.homecoming, now) > 0;
  const age = wobblesAge(now);
  const bothHome = plan.marcus === "home" && plan.chesa === "home";
  const whoHome = bothHome
    ? "Everyone home"
    : `Marcus ${presenceLabel(plan.marcus)} · Chesa ${presenceLabel(plan.chesa)}`;
  return {
    plan,
    whoHome,
    care: careTasksFor(now),
    activity: activityFor(now, homecomingFuture),
    parkNight: !homecomingFuture && age.weeks >= 16 && isParkNight(now),
    reminders: settings ? remindersFor(now, settings) : [],
  };
}

export interface Nudge {
  id: string;
  emoji: string;
  text: string;
  link: string;
  person?: "Marcus" | "Chesa";
}

function daysSince(iso: string | undefined, now: Date = new Date()): number | null {
  if (!iso) return null;
  const then = new Date(iso + "T12:00:00").getTime();
  const today = new Date(now).setHours(12, 0, 0, 0);
  return Math.round((today - then) / 86400000);
}

export function todaysNudges(
  entriesByTracker: (id: string) => TrackerEntry[],
  _readProgress: Record<string, number>,
  now: Date = new Date(),
  settings?: HouseholdSettings,
  shoppingTicks?: Record<string, boolean>,
): Nudge[] {
  const age = wobblesAge(now);
  const out: Nudge[] = [];

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
    if (shoppingTicks) {
      const week = currentShoppingWeek(now);
      const left = week.items.filter((it) => !shoppingTicks[it.id]).length;
      const behind = overdueShoppingItems(shoppingTicks, now).length;
      if (behind > 0)
        out.push({
          id: "shopping-catchup",
          emoji: "🛒",
          text: `${behind} shopping item${behind === 1 ? "" : "s"} slipped from earlier weeks — catch up before the list stacks`,
          link: "/handbook/shopping",
        });
      else if (left > 0)
        out.push({
          id: "shopping-week",
          emoji: week.emoji,
          text: `${week.title}: ${left} item${left === 1 ? "" : "s"} to buy this week on the countdown`,
          link: "/handbook/shopping",
        });
    }
    return out.slice(0, 4);
  }

  for (const task of careTasksFor(now)) {
    if (task.id === "teeth") continue;
    out.push({
      id: `care-${task.id}`,
      emoji: task.emoji,
      text: task.label + " — " + task.detail.split(".")[0].toLowerCase() + ".",
      link: task.link,
      person: task.owner === "marcus" ? "Marcus" : task.owner === "chesa" ? "Chesa" : undefined,
    });
  }

  const readEntries = entriesByTracker;

  const prediction = nextToiletWindow(readEntries("toilet"), readEntries("feeding"), now);
  if (prediction)
    out.push({
      id: "toilet-window",
      emoji: "\u23F0",
      text: `${prediction.label} \u2014 ${prediction.detail}`,
      link: "/trackers/toilet",
    });
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

  if (age.weeks >= 18 && age.months < 12 && isParkNight(now))
    out.push({ id: "park", emoji: "🏞️", text: "Park night tonight — 7pm at the park next door with dogs and people (or drive to the Waterfront dog run)", link: "/trackers/social" });

  const reminders = out.filter((n) => n.id.startsWith("reminder-"));
  const rest = out.filter((n) => !n.id.startsWith("reminder-"));
  return [...reminders, ...rest.slice(0, 3)];
}
