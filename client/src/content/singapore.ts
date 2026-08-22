/*
 * Storybook Picture-Book theme — Road to Singapore content.
 * Facts audited against AVS (avs.nparks.gov.sg, updated Jun 2026) and Jet Pets.
 * Flight plan confirmed Jul 2026: Jet Pets manages the move; flight 23/24 Sep 2026.
 */

export interface SgStep {
  phase: string;
  title: string;
  timing: string;
  detail: string;
  icon: string;
}

export const SG_FACTS = [
  { label: "Flight (Jet Pets)", value: "23/24 Sep 2026", note: "AVS requires ≥12 weeks at export — he flies at 12w6d, fly-ready ~22 Sep as the breeder planned" },
  { label: "Rabies requirements", value: "None", note: "Australia is AVS Schedule I (rabies-free): no rabies vaccination or serology needed" },
  { label: "Quarantine in Singapore", value: "None", note: "Schedule I dogs with correct paperwork skip quarantine entirely" },
  { label: "Import licence", value: "≈ S$50, valid 30 days", note: "Apply via AVS after getting his Singapore dog licence (PALS)" },
  { label: "Flight time BNE → SIN", value: "≈ 8 hours", note: "Direct flights from Brisbane; travels as manifest cargo in a climate-controlled hold" },
  { label: "HDB flat rule", value: "Cavoodles allowed", note: "Toy Cavoodles fall within HDB's approved small-breed list (one dog per flat); condos allow small dogs too — check by-laws" },
] as const;

export const SG_STEPS: SgStep[] = [
  {
    phase: "Before the move",
    title: "Jet Pets booked & crate training",
    timing: "Booked — flight 23/24 Sep 2026",
    detail:
      "Jet Pets is managing the move: pet travel consultant, quote and flight plan are locked in. Ask for his IATA-approved travel crate early — weeks of feeding meals and napping in the crate turns flight day from scary to familiar.",
    icon: "phone",
  },
  {
    phase: "Before the move",
    title: "Microchip + vaccination check",
    timing: "Done with normal puppy care",
    detail:
      "Paddington is microchipped at his first vet visit (11 Aug). Singapore requires core dog vaccinations — his full Protech C3 course (11 Aug, 25 Aug, 8 Sep) is done at the breeder's vet with the rest of the litter. Keep every certificate in one folder.",
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
      "Apply online (≈ S$50). The licence is valid for 30 days from the intended date of entry, so time the application against the 23 Sep flight. Jet Pets can handle this paperwork as part of their door-to-door service.",
    icon: "file-text",
  },
  {
    phase: "Paperwork",
    title: "Australian export documents (DAFF)",
    timing: "Final 2 weeks",
    detail:
      "An accredited vet completes his pre-export health check and certificate, and the Australian Department of Agriculture (DAFF) issues the export permit and health certification. Jet Pets' accredited vets handle this end-to-end.",
    icon: "stamp",
  },
  {
    phase: "Flight day",
    title: "Door-to-door travel day",
    timing: "23 Sep 2026 (12w6d old)",
    detail:
      "A Jet Pets handler collects Paddington, he waits in a transit lounge (not on hot tarmac), then flies in a dim, climate-controlled hold kept around 18 °C — pets are loaded last and unloaded first. Vets advise NO sedation for flying; it interferes with balance and breathing at altitude. Optional PetTrakr tag lets you follow his journey.",
    icon: "plane",
  },
  {
    phase: "Arrival",
    title: "Changi arrival & inspection",
    timing: "On landing",
    detail:
      "Paddington clears Singapore's Changi Animal & Plant Quarantine (CAPQ) inspection — with Schedule I paperwork there is no quarantine stay — and is delivered to your door in Singapore.",
    icon: "check",
  },
  {
    phase: "Settling in",
    title: "First weeks at Blk 587 Woodlands Drive 16",
    timing: "First month",
    detail:
      "Register with a vet near Woodlands, complete the free AVS Pet Ownership Course and finalise his dog licence on PALS, mesh the windows (HDB fall risk), and settle the routine: 7:15am toilet walk just after sunrise, pad at home, evening walk after the 7pm sunset. Keep parasite prevention monthly and year-round — heartworm, ticks and fleas are perennial in the tropics.",
    icon: "sun",
  },
  {
    phase: "Settling in",
    title: "His park map from home",
    timing: "Once the SG vet signs off (first visit, ~28 Sep)",
    detail:
      "On foot: the small park right next to the block — perfect for the daily walks and the 7pm every-other-day social sessions. By car: Woodlands Waterfront Park (coastal dog run, sea views, ~5–10 min), Admiralty Park (NParks nature park, ~10 min) and Sembawang Park's dog run with a separate small-dog pen (~15 min). Dogs must be leashed everywhere public; off-leash only inside designated dog runs, licensed and vaccinated.",
    icon: "map",
  },
];

export const SG_TIPS = [
  "Fly him young if you can: a 12–16-week-old puppy adapts to the move faster, and it lands inside his socialisation window — Singapore's sounds and smells become 'normal' quickly.",
  "Sun runs 7am–7pm nearly year-round in Singapore: the 7:15am toilet walk lands right after sunrise (coolest slot), and the evening walk belongs after the 7pm sunset. Between 10am–5pm, test pavement with the 7-second hand test before any outing.",
  "Singapore's vaccination standard: puppy C3/C5 series ending at ≥16 weeks, first adult booster at 52 weeks, then annual boosters. No rabies shot needed locally — Singapore is rabies-free.",
  "Parasite calendar: one combined monthly preventive (chew like NexGard Spectra/Simparica Trio, or a spot-on drip) covers heartworm + ticks + fleas — same date every month, forever. Deworm every 3 months once he's past 6 months.",
  "Humidity means faster matting and more ear infections — keep his cut short, brush often, and dry his ears after every wet walk.",
  "Apartment toilet reality: keep BOTH systems alive — wee/poo on the pad at home and outside on walks. Reward each in its right place; never punish the wrong spot, just log it and tighten timing.",
  "Singapore vet care is excellent but pricey — pet insurance or a savings buffer is worth arranging before the move.",
] as const;
