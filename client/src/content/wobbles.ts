/*
 * Storybook Picture-Book theme — content data.
 * Wobbles' verified profile facts from the RightPaw listing (The Doghouse QLD)
 * and user-provided details. Keep this file the single source of truth.
 */

export const ASSETS = {
  icon: "/manus-storage/wobbles-icon_1c51767c.png",
  adultRendering: "/manus-storage/wobbles-adult_b7c22044.png",
  heroGrooming: "/manus-storage/hero-grooming_fbd52402.png",
  heroSingapore: "/manus-storage/hero-singapore_c2d583c0.png",
  heroFirstDay: "/manus-storage/hero-firstday_4e0b74c1.png",
  // 2D cartoon sketch placeholders until better photos arrive (user request)
  photoFace: "/manus-storage/wobbles-cartoon-face_f9d46ad9.png",
  photoNewborn: "/manus-storage/wobbles-cartoon-newborn_4c708746.png",
  // v2 redesign — gouache illustration set (ChatGPT mockup template)
  v2Hero: "/manus-storage/v2-hero-wobbles_e23eb8ad.png",
  v2SpotBed: "/manus-storage/v2-spot-bed_74206722.png",
  v2SpotPeek: "/manus-storage/v2-spot-peek_a9eefd94.png",
  v2SpotHighfive: "/manus-storage/v2-spot-highfive_74c8f74f.png",
  v2ChMemories: "/manus-storage/v2-ch-memories_a04daa45.png",
} as const;

/** v2 chapter cover illustrations, keyed by section slug */
export const CHAPTER_COVERS: Record<string, string> = {
  "coat-science": "/manus-storage/v2-ch-coat_dcb610ff.png",
  "first-day": "/manus-storage/v2-ch-firstday_851e68f2.png",
  parenting: "/manus-storage/v2-ch-parenting_9b8a716b.png",
  "grooming-masterclass": "/manus-storage/v2-ch-grooming_dda950a4.png",
  "grooming-psychology": "/manus-storage/v2-ch-psychology_29168ebf.png",
  "haircut-styles": "/manus-storage/v2-ch-haircuts_23679ac6.png",
  "daily-hacks": "/manus-storage/v2-ch-dailylife_aa465916.png",
  products: "/manus-storage/v2-ch-kit_e2598265.png",
  "internet-hacks": "/manus-storage/v2-ch-internet_9d28d351.png",
  singapore: "/manus-storage/v2-ch-singapore_d7a4fe63.png",
  memories: "/manus-storage/v2-ch-memories_a04daa45.png",
};

export const WOBBLES = {
  name: "Wobbles",
  pedigreeName: "Paddington",
  litterId: "Boy 3 — English Tails Litter",
  breed: "Cavoodle (Cavalier King Charles Spaniel × Toy Poodle)",
  dob: "2026-06-26",
  sex: "Male",
  size: "Toy",
  expectedAdultWeight: "≈ 8 kg",
  coat: "Fleece",
  colour: "Red parti (Blenheim) — rich red patches on white",
  price: "A$5,500",
  mum: { name: "Addie", desc: "Red Toy Poodle-type mum with a curly coat" },
  dad: { name: "Hughie", desc: "Blenheim Cavalier King Charles Spaniel dad" },
  breeder: {
    name: "The Doghouse QLD",
    person: "Charmaine",
    location: "Moreton Bay region, Queensland",
    program:
      "RightPaw-verified breeder raising puppies with Puppy Culture, Early Neurological Stimulation (ENS) and a structured enrichment curriculum",
    listingUrl:
      "https://rightpaw.com.au/l/the-doghouse-qld-theodore-cavoodles/296a0927-5317-4f69-a9ef-de2a28b688d4",
  },
  homecoming: "2026-08-21",
} as const;

export interface Milestone {
  date: string; // ISO
  label: string;
  detail: string;
  icon: string; // lucide icon name hint, rendered by page
}

export const MILESTONES: Milestone[] = [
  {
    date: "2026-06-26",
    label: "Born",
    detail: "Wobbles is born at The Doghouse QLD — Boy 3 of the English Tails litter.",
    icon: "star",
  },
  {
    date: "2026-06-29",
    label: "ENS begins (days 3–16)",
    detail:
      "The breeder runs Early Neurological Stimulation: five gentle 3–5 second handling exercises, once daily, from day 3 to day 16.",
    icon: "hand",
  },
  {
    date: "2026-08-07",
    label: "First vaccination + vet check (~6 weeks)",
    detail:
      "First C3 core vaccination (distemper, hepatitis, parvovirus), microchip and vet health check with the breeder.",
    icon: "syringe",
  },
  {
    date: "2026-08-21",
    label: "Homecoming day (8 weeks)",
    detail:
      "Wobbles comes home! He arrives with a mum-scented blanket, his puppy pack, and a seatbelt tether for the drive.",
    icon: "home",
  },
  {
    date: "2026-09-04",
    label: "Second vaccination window opens (10 weeks)",
    detail:
      "Second C3 booster is typically given at 10–12 weeks. Book this with your vet soon after homecoming.",
    icon: "syringe",
  },
  {
    date: "2026-09-18",
    label: "12 weeks — Singapore export age reached",
    detail:
      "Singapore's AVS requires dogs to be at least 12 weeks old at export. From today Wobbles can legally fly to Singapore.",
    icon: "plane",
  },
  {
    date: "2026-10-02",
    label: "Third vaccination window opens (14 weeks)",
    detail:
      "Final puppy C3 booster is typically given at 14–16 weeks. Full protection arrives about two weeks after the final dose.",
    icon: "syringe",
  },
  {
    date: "2026-10-16",
    label: "Socialisation window closes (~16 weeks)",
    detail:
      "The critical socialisation period runs to roughly 16 weeks. Every calm, positive new experience before now pays off for life.",
    icon: "users",
  },
  {
    date: "2026-12-26",
    label: "6 months — coat change may begin",
    detail:
      "Between 6 and 12 months the soft puppy coat transitions to the adult fleece coat. This is peak matting season — daily line brushing.",
    icon: "scissors",
  },
  {
    date: "2027-06-26",
    label: "First birthday",
    detail: "Wobbles turns one! Adult coat should be fully in, near his adult weight of about 8 kg.",
    icon: "cake",
  },
];

/** Compute Wobbles' age from a reference date */
export function wobblesAge(now: Date = new Date()) {
  const dob = new Date(WOBBLES.dob + "T00:00:00");
  const ms = now.getTime() - dob.getTime();
  const days = Math.floor(ms / 86400000);
  const weeks = Math.floor(days / 7);
  const remDays = days - weeks * 7;
  const months = Math.floor(days / 30.44);
  return { days, weeks, remDays, months, born: ms >= 0 };
}

export function daysUntil(iso: string, now: Date = new Date()) {
  const target = new Date(iso + "T00:00:00");
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.ceil((target.getTime() - startOfNow.getTime()) / 86400000);
}

export function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
