/*
 * Storybook Picture-Book theme — Road to Singapore content.
 * Facts audited against AVS (avs.nparks.gov.sg, updated Jun 2026) and Jetpets.
 */

export interface SgStep {
  phase: string;
  title: string;
  timing: string;
  detail: string;
  icon: string;
}

export const SG_FACTS = [
  { label: "Earliest export age", value: "12 weeks — 18 Sep 2026", note: "AVS requires dogs to be at least 12 weeks old at export" },
  { label: "Rabies requirements", value: "None", note: "Australia is AVS Schedule I (rabies-free): no rabies vaccination or serology needed" },
  { label: "Quarantine in Singapore", value: "None", note: "Schedule I dogs with correct paperwork skip quarantine entirely" },
  { label: "Import licence", value: "≈ S$50, valid 30 days", note: "Apply via AVS after getting his Singapore dog licence (PALS)" },
  { label: "Flight time BNE → SIN", value: "≈ 8 hours", note: "Direct flights from Brisbane; travels as manifest cargo in a climate-controlled hold" },
  { label: "HDB flat rule", value: "Cavoodles allowed", note: "Toy Cavoodles fall within HDB's approved small-breed list (one dog per flat); condos allow small dogs too — check by-laws" },
] as const;

export const SG_STEPS: SgStep[] = [
  {
    phase: "Before the move",
    title: "Book Jetpets & start crate training",
    timing: "As early as possible",
    detail:
      "Contact Jetpets for a pet travel consultant, quote and flight plan. Ask for his IATA-approved travel crate early — weeks of feeding meals and napping in the crate at home turns flight day from scary to familiar.",
    icon: "phone",
  },
  {
    phase: "Before the move",
    title: "Microchip + vaccination check",
    timing: "Done with normal puppy care",
    detail:
      "Wobbles is already microchipped (ISO 15-digit chip) by the breeder. Singapore requires core dog vaccinations (distemper, hepatitis, parvovirus — his C3 course) with a vet-issued record. Keep every certificate in one folder.",
    icon: "scan",
  },
  {
    phase: "Paperwork",
    title: "Get his Singapore dog licence (PALS)",
    timing: "≥ 6 weeks before flying",
    detail:
      "Every dog in Singapore must be licensed with AVS via the PALS portal — and you need the licence number BEFORE you can apply for the import permit.",
    icon: "badge",
  },
  {
    phase: "Paperwork",
    title: "Apply for the AVS import licence",
    timing: "≥ 30 days before travel (ideal)",
    detail:
      "Apply online (≈ S$50). The licence is valid for 30 days from the intended date of entry, so time the application against the flight date. Jetpets can handle this paperwork as part of their door-to-door service.",
    icon: "file-text",
  },
  {
    phase: "Paperwork",
    title: "Australian export documents (DAFF)",
    timing: "Final 2 weeks",
    detail:
      "An accredited vet completes his pre-export health check and certificate, and the Australian Department of Agriculture (DAFF) issues the export permit and health certification. Jetpets' accredited vets handle this end-to-end.",
    icon: "stamp",
  },
  {
    phase: "Flight day",
    title: "Door-to-door travel day",
    timing: "From 18 Sep 2026 (12+ weeks old)",
    detail:
      "A Jetpets handler collects Wobbles, he waits in a transit lounge (not on hot tarmac), then flies in a dim, climate-controlled hold kept around 18 °C — pets are loaded last and unloaded first. Vets advise NO sedation for flying; it interferes with balance and breathing at altitude. Optional PetTrakr tag lets you follow his journey.",
    icon: "plane",
  },
  {
    phase: "Arrival",
    title: "Changi arrival & inspection",
    timing: "On landing",
    detail:
      "Wobbles clears Singapore's Changi Animal & Plant Quarantine (CAPQ) inspection — with Schedule I paperwork there is no quarantine stay — and is delivered to your door in Singapore.",
    icon: "check",
  },
  {
    phase: "Settling in",
    title: "First weeks as a Singapore dog",
    timing: "First month",
    detail:
      "Register with a local vet, keep parasite prevention year-round (heartworm and ticks are perennial in the tropics), walk early morning or evening to dodge the heat, and keep the coat short. Dog-friendly spots to explore: Bishan-Ang Mo Kio Park, East Coast Park, Sentosa's Tanjong Beach and dozens of pet-welcome cafés.",
    icon: "sun",
  },
];

export const SG_TIPS = [
  "Fly him young if you can: a 12–16-week-old puppy adapts to the move faster, and it lands inside his socialisation window — Singapore's sounds and smells become 'normal' quickly.",
  "Heat rules: walk before 9 am or after 6 pm, test pavement with the 7-second hand test, carry water, and watch for heavy panting.",
  "Humidity means faster matting and more ear infections — keep his cut short, brush often, and dry his ears after every wet walk.",
  "Grass is scarcer in the city: train him early to toilet on command and on varied surfaces so HDB void decks and pavements don't confuse him.",
  "Singapore vet care is excellent but pricey — pet insurance or a savings buffer is worth arranging before the move.",
] as const;
