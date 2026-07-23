/*
 * Storybook Picture-Book theme — content data.
 * Wobbles' verified profile facts from the RightPaw listing (The Doghouse QLD)
 * and user-provided details. Keep this file the single source of truth.
 */

export const ASSETS = {
  icon: "/manus-storage/wobbles-icon_1c51767c_351b9cb9.png",
  adultRendering: "/manus-storage/wobbles-adult_b7c22044_a8a45e9a.png",
  heroGrooming: "/manus-storage/hero-grooming_fbd52402_17a10aa2.png",
  heroSingapore: "/manus-storage/hero-singapore_c2d583c0_cdfc13a0.png",
  heroFirstDay: "/manus-storage/hero-firstday_4e0b74c1_cee4a38a.png",
  // 2D cartoon sketch placeholders until better photos arrive (user request)
  photoFace: "/manus-storage/wobbles-cartoon-face_f9d46ad9_924ffdb4.png",
  photoNewborn: "/manus-storage/wobbles-cartoon-newborn_4c708746_0960ae3c.png",
  // v2 redesign — gouache illustration set (ChatGPT mockup template)
  v2Hero: "/manus-storage/v2-hero-wobbles_e23eb8ad_c0be2832.png",
  v2SpotBed: "/manus-storage/v2-spot-bed_74206722_8d9adfb8.png",
  v2SpotPeek: "/manus-storage/v2-spot-peek_a9eefd94_7c866ee6.png",
  v2SpotHighfive: "/manus-storage/v2-spot-highfive_74c8f74f_58e0efe2.png",
  v2ChMemories: "/manus-storage/v2-ch-memories_a04daa45_088ccc60.png",
} as const;

/** v2 chapter cover illustrations, keyed by section slug */
export const CHAPTER_COVERS: Record<string, string> = {
  "coat-science": "/manus-storage/v2-ch-coat_dcb610ff_882b139f.png",
  "first-day": "/manus-storage/v2-ch-firstday_851e68f2_99b07e02.png",
  parenting: "/manus-storage/v2-ch-parenting_9b8a716b_86fe68cc.png",
  "grooming-masterclass": "/manus-storage/v2-ch-grooming_dda950a4_32b8bac4.png",
  "grooming-psychology": "/manus-storage/v2-ch-psychology_29168ebf_b68e4446.png",
  "haircut-styles": "/manus-storage/v2-ch-haircuts_23679ac6_c734dd8b.png",
  "daily-hacks": "/manus-storage/v2-ch-dailylife_aa465916_78d1c1b8.png",
  products: "/manus-storage/v2-ch-kit_e2598265_6f632973.png",
  "internet-hacks": "/manus-storage/v2-ch-internet_9d28d351_9c82f74f.png",
  singapore: "/manus-storage/v2-ch-singapore_d7a4fe63_a34340e6.png",
  memories: "/manus-storage/v2-ch-memories_a04daa45_088ccc60.png",
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
  /**
   * Homecoming = arrival day in Singapore. Driver: AVS (NParks) requires dogs
   * to be at least 12 weeks old at export from Australia, and Singapore farms/
   * breeders release only after the second vaccination (~10–12 weeks). Legal
   * minimum SALE age under AVS breeding conditions is 9 weeks — but the export
   * rule makes 12 weeks (18 Sep 2026) the earliest realistic homecoming.
   * (Commonly misremembered as an "NEA 6-weeks-at-the-farm" rule — it's AVS.)
   */
  homecoming: "2026-09-18",
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
    date: "2026-08-28",
    label: "9 weeks — legal sale age reached (stays at the farm)",
    detail:
      "Under AVS breeding-licence conditions no puppy may be sold before 9 weeks. Wobbles stays with the breeder until he can fly, banking litter manners and farm socialisation — the breeder keeps running his enrichment curriculum.",
    icon: "badge-check",
  },
  {
    date: "2026-09-04",
    label: "Second vaccination at the breeder (10 weeks)",
    detail:
      "The second C3 booster is given at the farm in Queensland around 10 weeks, before export. Verify the record lands in his puppy pack — Singapore's import inspection and his AVS licence both need it.",
    icon: "syringe",
  },
  {
    date: "2026-09-04",
    label: "Pre-homecoming admin sprint (humans only)",
    detail:
      "Two weeks out: finish the free AVS Pet Ownership Course, get his PALS dog licence number, confirm the AVS import permit and Jetpets flight, puppy-proof the flat and finish the kit list. Everything ready before he lands.",
    icon: "badge-check",
  },
  {
    date: "2026-09-18",
    label: "Homecoming day — lands in Singapore (12 weeks)",
    detail:
      "The big day! At exactly 12 weeks — the earliest AVS export age — Wobbles flies BNE → SIN, clears Changi's CAPQ inspection (no quarantine) and comes home to Woodlands with his mum-scented blanket and puppy pack.",
    icon: "home",
  },
  {
    date: "2026-09-18",
    label: "Start monthly parasite preventive (12 weeks)",
    detail:
      "Singapore is year-round heartworm, tick and flea territory. Ask the vet to start a monthly combined preventive (NexGard Spectra / Simparica Trio chew, or a spot-on) at the first Singapore vet visit — then repeat on the 18th of every month, forever.",
    icon: "shield",
  },
  {
    date: "2026-09-21",
    label: "First Singapore vet visit + licence wrap-up",
    detail:
      "Within his first days home: register with a Woodlands vet, confirm the microchip and vaccination records, start parasite prevention, and finalise the AVS dog licence on PALS. Cavoodles are HDB-approved; one dog per flat.",
    icon: "stethoscope",
  },
  {
    date: "2026-10-02",
    label: "Third vaccination window opens (14 weeks)",
    detail:
      "Final puppy C3/C5 booster — Singapore guidelines want the last dose at 16 weeks or older. Full protection arrives about two weeks after the final dose.",
    icon: "syringe",
  },
  {
    date: "2026-10-16",
    label: "Final puppy vaccine due (16 weeks)",
    detail:
      "The last puppy dose must land at ≥16 weeks under Singapore guidelines. Deworming cadence also shifts now: monthly until 6 months, then every 3 months.",
    icon: "syringe",
  },
  {
    date: "2026-10-16",
    label: "Socialisation window closes (~16 weeks)",
    detail:
      "The critical socialisation period runs to roughly 16 weeks — and Wobbles lands with only ~4 weeks of it left. His first month home IS the socialisation sprint: front-load the Confidence Club and carried outings from day 4.",
    icon: "users",
  },
  {
    date: "2026-10-30",
    label: "Fully vaccinated — parks and dog runs open up",
    detail:
      "About 1–2 weeks after the final dose, ground time in public parks is safe. The 7pm park socialisation sessions can move onto the grass — and the Woodlands Waterfront dog run is now on the menu (licensed + vaccinated dogs only).",
    icon: "trees",
  },
  {
    date: "2026-12-26",
    label: "6 months — sterilisation chat + coat change",
    detail:
      "Discuss sterilisation timing with the vet (it also drops the AVS licence fee to ~S$15/yr or S$35 lifetime). Meanwhile the soft puppy coat starts transitioning to the adult fleece coat — peak matting season, daily line brushing.",
    icon: "scissors",
  },
  {
    date: "2027-06-26",
    label: "First birthday + first adult booster (52 weeks)",
    detail:
      "Wobbles turns one! Singapore guidelines call for the first adult core booster at 52 weeks — then annually. Adult coat should be fully in, near his adult weight of about 8 kg.",
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
