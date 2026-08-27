/** Canonical Paddington facts — single source of truth.
 *  Import this everywhere instead of duplicating numbers.
 *  Home switches on `homecoming`: until that date he is still in QLD.
 */

export const WOBBLES = {
  name: "Paddington",
  nickname: "Paddy",
  breed: "Cavalier King Charles Spaniel",
  sex: "male" as const,
  /** ISO date — he is in Queensland until this landing day. */
  dob: "2026-06-23",
  homecoming: "2026-09-24",
  homecomingLabel: "24 Sep 2026",
  breeder: {
    name: "Cavalier Heaven",
    location: "Queensland, Australia",
    owner: "Jan",
  },
  family: {
    dad: "Marcus",
    mum: "Renee",
    brother: "Isaac",
  },
  vet: {
    name: "SingVet",
    location: "Upper Thomson, Singapore",
    firstVisit: "2026-09-28",
  },
  colour: "Blenheim",
} as const;

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayLocal(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

/** Whole days until `iso` (local). Negative if that date is in the past. */
export function daysUntil(iso: string): number {
  const t = todayLocal().getTime();
  const d = parseISO(iso).getTime();
  return Math.round((d - t) / 86_400_000);
}

/** True while he is still in Queensland — Home must not be a 7am logger. */
export function isPreHomecoming(now: Date = todayLocal()): boolean {
  return daysUntil(WOBBLES.homecoming) > 0;
}

/** Days since landing. 0 on 24 Sep. Negative before. */
export function daysHome(now: Date = todayLocal()): number {
  return -daysUntil(WOBBLES.homecoming);
}

export function ageOn(date: Date = todayLocal()) {
  const dob = parseISO(WOBBLES.dob);
  let months = (date.getFullYear() - dob.getFullYear()) * 12 + (date.getMonth() - dob.getMonth());
  let days = date.getDate() - dob.getDate();
  if (days < 0) {
    months -= 1;
    const prev = new Date(date.getFullYear(), date.getMonth(), 0);
    days += prev.getDate();
  }
  const totalDays = Math.round((date.getTime() - dob.getTime()) / 86_400_000);
  const weeks = Math.floor(totalDays / 7);
  return { months, days, weeks, totalDays };
}

export function ageLabel(date: Date = todayLocal()): string {
  const a = ageOn(date);
  if (a.months <= 0) return `${a.totalDays} days old`;
  if (a.days === 0) return `${a.months} month${a.months === 1 ? "" : "s"} old`;
  return `${a.months}mo ${a.days}d`;
}

export type MilestoneKind = "health" | "admin" | "social" | "home";

export interface Milestone {
  id: string;
  date: string;
  title: string;
  detail: string;
  kind: MilestoneKind;
  done?: boolean;
}

export const MILESTONES: Milestone[] = [
  {
    id: "dob",
    date: "2026-06-23",
    title: "Born in Queensland",
    detail: "Cavalier Heaven. Jan's boy.",
    kind: "home",
    done: true,
  },
  {
    id: "c3-1",
    date: "2026-07-14",
    title: "C3 dose 1",
    detail: "Core vaccine. Queensland.",
    kind: "health",
    done: true,
  },
  {
    id: "c3-2",
    date: "2026-08-04",
    title: "C3 dose 2",
    detail: "Core vaccine. Queensland.",
    kind: "health",
    done: true,
  },
  {
    id: "microchip",
    date: "2026-08-20",
    title: "Microchip",
    detail: "Required for the import licence.",
    kind: "admin",
    done: true,
  },
  {
    id: "c3-3",
    date: "2026-09-08",
    title: "C3 dose 3",
    detail: "Last Queensland core shot. He is still not fully vaccinated and not park-cleared after this dose.",
    kind: "health",
  },
  {
    id: "pals",
    date: "2026-09-10",
    title: "PALS licence (Marcus)",
    detail: "Must be in hand before NParks will issue the import licence. Do this first.",
    kind: "admin",
  },
  {
    id: "import-licence",
    date: "2026-09-12",
    title: "NParks import licence",
    detail: "Valid 90 days from issue — not 30. Apply only after PALS is done.",
    kind: "admin",
  },
  {
    id: "homecoming",
    date: "2026-09-24",
    title: "Lands in Singapore",
    detail: "Quiet flat. Crate as den. No visitors days 1–3.",
    kind: "home",
  },
  {
    id: "first-vet",
    date: "2026-09-28",
    title: "First SingVet visit",
    detail: "Book on landing week. Confirm core schedule and when ground time is allowed.",
    kind: "health",
  },
  {
    id: "sixteen-weeks",
    date: "2026-10-15",
    title: "16-week core",
    detail: "Earliest window for ground / park — only after this AND a SingVet nod. Not 22 Sep.",
    kind: "health",
  },
  {
    id: "park-cleared",
    date: "2026-10-30",
    title: "Park-cleared (vet nod)",
    detail: "After ≥16-week core plus SingVet confirmation. Carry-socialise until then.",
    kind: "social",
  },
];

export function nextMilestone(from: Date = todayLocal()): Milestone | undefined {
  const t = from.getTime();
  return MILESTONES.find((m) => parseISO(m.date).getTime() >= t);
}

export function upcomingMilestones(from: Date = todayLocal(), n = 4): Milestone[] {
  const t = from.getTime();
  return MILESTONES.filter((m) => parseISO(m.date).getTime() >= t).slice(0, n);
}
