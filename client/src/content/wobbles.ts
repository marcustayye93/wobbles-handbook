import { ART_FACE, ART_GROOM, ART_HERO, ART_PEEK, ART_SLEEP } from "./localArt";

/*
 * Storybook Picture-Book theme — content data.
 * Paddington's verified profile facts from the RightPaw listing (The Doghouse QLD)
 * and user-provided details. Keep this file the single source of truth.
 */

export const ASSETS = {
  icon: ART_FACE,
  adultRendering: ART_HERO,
  heroGrooming: ART_GROOM,
  heroSingapore: ART_HERO,
  heroFirstDay: ART_HERO,
  photoFace: ART_FACE,
  photoNewborn: ART_FACE,
  v2Hero: ART_HERO,
  v2SpotBed: ART_SLEEP,
  v2SpotPeek: ART_PEEK,
  v2SpotHighfive: ART_FACE,
  v2ChMemories: ART_HERO,
} as const;

/** v2 chapter cover illustrations, keyed by section slug */
export const CHAPTER_COVERS: Record<string, string> = {
  "coat-science": ART_HERO,
  "first-day": ART_SLEEP,
  parenting: ART_HERO,
  "grooming-masterclass": ART_GROOM,
  "grooming-psychology": ART_HERO,
  "haircut-styles": ART_HERO,
  "daily-hacks": ART_HERO,
  products: ART_HERO,
  "internet-hacks": ART_HERO,
  singapore: ART_HERO,
  memories: ART_HERO,
};

export const WOBBLES = {
  name: "Paddington",
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
  homecoming: "2026-09-23",
} as const;

export interface Milestone {
  date: string;
  label: string;
  detail: string;
  icon: string;
}

export const MILESTONES: Milestone[] = [
  { date: "2026-06-26", label: "Born", detail: "Paddington is born at The Doghouse QLD — Boy 3 of the English Tails litter.", icon: "star" },
  { date: "2026-06-29", label: "ENS begins (days 3–16)", detail: "The breeder runs Early Neurological Stimulation: five gentle 3–5 second handling exercises, once daily, from day 3 to day 16.", icon: "hand" },
  { date: "2026-08-07", label: "First vaccination + vet check (6 weeks)", detail: "Protech C3 dose 1 (batch 4964023A) administered 7 Aug 2026 by Dr Ayana Lowe BVSc(Hons)BSc at Fetch a Vet Pty Ltd (mobile vet, North Lakes QLD). Microchip 900164002411316 implanted between shoulder blades. Weight: 1.6 kg. Full health exam: all clear — no hernias, no murmur, no abnormalities. Booster (dose 2) due 21 Aug 2026.", icon: "syringe" },
  { date: "2026-08-28", label: "9 weeks — legal sale age reached (stays at the farm)", detail: "Under AVS breeding-licence conditions no puppy may be sold before 9 weeks. Paddington stays with the breeder until he can fly, banking litter manners and farm socialisation — the breeder keeps running his enrichment curriculum.", icon: "badge-check" },
  { date: "2026-09-04", label: "Second vaccination at the breeder (10 weeks)", detail: "The second C3 booster is given at the farm in Queensland around 10 weeks, before export. Verify the record lands in his puppy pack — Singapore's import inspection and his AVS licence both need it.", icon: "syringe" },
  { date: "2026-09-04", label: "Pre-homecoming admin sprint (humans only)", detail: "PALS dog licence BEFORE the AVS import licence (the import licence is valid 90 days, not 30). Finish the free AVS Pet Ownership Course, confirm Jet Pets, puppy-proof the flat. He is not fully vaccinated and not park-cleared.", icon: "badge-check" },
  { date: "2026-09-04", label: "C3 dose 3 (Australia) — not fully vaccinated", detail: "Third Protech C3 at the farm on 4 Sep. This is NOT the 16-week core and he is NOT park-cleared. Ground time waits for the ≥16-week booster (16 Oct) plus a Singapore vet nod. Carry-socialise until then.", icon: "syringe" },
  { date: "2026-09-23", label: "Homecoming day — QF51 BNE → SIN", detail: "The big day! Paddington flies BNE → SIN on 23 Sep, comes home 23 Sep, clears Changi's CAPQ inspection (no quarantine) and comes home to Woodlands with his mum-scented blanket and puppy pack.", icon: "home" },
  { date: "2026-09-24", label: "Start monthly parasite preventive", detail: "Singapore is year-round heartworm, tick and flea territory. Ask the vet to start a monthly combined preventive (NexGard Spectra / Simparica Trio chew, or a spot-on) at the first Singapore vet visit — then repeat on the 24th of every month, forever.", icon: "shield" },
  { date: "2026-09-28", label: "First Singapore vet visit + licence wrap-up", detail: "Within his first days home: register with a Woodlands vet (SingVet), confirm the microchip and vaccination records, start parasite prevention, and finalise the AVS dog licence on PALS. He is still not park-cleared — ask when the 16-week core can be booked.", icon: "stethoscope" },
  { date: "2026-10-16", label: "16-week core booster (Singapore)", detail: "The ≥16-week core must land at 16 weeks or older under Singapore guidelines. This — not dose 3 on 4 Sep — is the shot that starts the park clock. Deworming cadence also shifts: monthly until 6 months, then every 3 months.", icon: "syringe" },
  { date: "2026-10-16", label: "Socialisation window closes (~16 weeks)", detail: "The critical socialisation period runs to roughly 16 weeks — and Paddington lands with only ~4 weeks of it left. His first month home IS the socialisation sprint: front-load carried outings from day 4. Ground/park only after this core plus a vet nod.", icon: "users" },
  { date: "2026-10-30", label: "Park-cleared — after 16-week core + vet nod", detail: "About 1–2 weeks after the 16-week core, and only with the Singapore vet's nod, ground time in public parks is on the table. Not around 22 Sep. The 7pm sessions can then move onto the grass — licensed dogs only.", icon: "trees" },
  { date: "2026-12-26", label: "6 months — sterilisation chat + coat change", detail: "Discuss sterilisation timing with the vet (it also drops the AVS licence fee to ~S$15/yr or S$35 lifetime). Meanwhile the soft puppy coat starts transitioning to the adult fleece coat — peak matting season, daily line brushing.", icon: "scissors" },
  { date: "2027-06-26", label: "First birthday + first adult booster (52 weeks)", detail: "Paddington turns one! Singapore guidelines call for the first adult core booster at 52 weeks — then annually. Adult coat should be fully in, near his adult weight of about 8 kg.", icon: "cake" },
];

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

export function isPreHomecoming(now: Date = new Date()) {
  return daysUntil(WOBBLES.homecoming, now) > 0;
}

export function daysHome(now: Date = new Date()) {
  return -daysUntil(WOBBLES.homecoming, now);
}

export function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
