/*
 * Storybook Picture-Book theme — Road to Singapore content.
 * Facts audited against AVS (avs.nparks.gov.sg, updated Jun 2026) and Jet Pets.
 * Flight plan confirmed Jul 2026: Jet Pets manages the move; flight 23 Sep,
 * landing 24 Sep 2026. C3 dose 3 on 8 Sep is NOT full vaccination.
 */

export interface SgStep {
  phase: string;
  title: string;
  timing: string;
  detail: string;
  icon: string;
}

export const SG_FACTS = [
  { label: "Flight (Jet Pets)", value: "23/24 Sep 2026", note: "AVS requires ≥12 weeks at export — he flies 23 Sep and lands 24 Sep. Still in QLD until landing. Not fully vaccinated; not park-cleared." },
  { label: "Rabies requirements", value: "None", note: "Australia is AVS Schedule I (rabies-free): no rabies vaccination or serology needed" },
  { label: "Quarantine in Singapore", value: "None", note: "Schedule I dogs with correct paperwork skip quarantine entirely" },
  { label: "Import licence", value: "≈ S$50, valid 90 days", note: "PALS dog licence FIRST, then apply via AVS. The import licence is valid 90 days — not 30." },
  { label: "Flight time BNE → SIN", value: "≈ 8 hours", note: "Direct flights from Brisbane; travels as manifest cargo in a climate-controlled hold" },
  { label: "HDB flat rule", value: "Cavoodles allowed", note: "Toy Cavoodles fall within HDB's approved small-breed list (one dog per flat); condos allow small dogs too — check by-laws" },
] as const;

export const SG_STEPS: SgStep[] = [
  {
    phase: "Before the move",
    title: "Jet Pets booked & crate training",
    timing: "Booked — flies 23 Sep, lands 24 Sep 2026",
    detail:
      "Jet Pets is managing the move: pet travel consultant, quote and flight plan are locked in. Ask for his IATA-approved travel crate early — weeks of feeding meals and napping in the crate turns flight day from scary to familiar.",
    icon: "phone",
  },
  {
    phase: "Before the move",
    title: "Microchip + vaccination check",
    timing: "Done with normal puppy care",
    detail:
      "Paddington is microchipped (7 Aug). C3 dose 3 is 8 Sep at the farm — that is NOT the 16-week core and he is NOT fully vaccinated or park-cleared at landing. Keep every certificate in one folder. Ground time waits for the ≥16-week booster (~15 Oct) plus a Singapore vet nod.",
    icon: "scan",
  },
  {
    phase: "Paperwork",
    title: "Get his Singapore dog licence (PALS)",
    timing: "Before the import licence — this week",
    detail:
      "Every dog in Singapore must be licensed with AVS via the PALS portal — and you need the licence number BEFORE you can apply for the import permit. This is the next irreversible admin.",
    icon: "badge",
  },
  {
    phase: "Paperwork",
    title: "Apply for the AVS import licence",
    timing: "After PALS — valid 90 days",
    detail:
      "Apply online (≈ S$50). The licence is valid for 90 days from the intended date of entry — not 30 days — so time the application against the 24 Sep landing. Jet Pets can handle this paperwork as part of their door-to-door service.",
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
    timing: "Flies 23 Sep 2026 · lands 24 Sep",
    detail:
      "A Jet Pets handler collects Paddington, he waits in a transit lounge (not on hot tarmac), then flies in a dim, climate-controlled hold kept around 18 °C — pets are loaded last and unloaded first. Vets advise NO sedation for flying; it interferes with balance and breathing at altitude. Optional PetTrakr tag lets you follow his journey.",
    icon: "plane",
  },
  {
    phase: "Arrival",
    title: "Changi arrival & inspection",
    timing: "On landing — 24 Sep",
    detail:
      "Paddington clears Singapore's Changi Animal & Plant Quarantine (CAPQ) inspection — with Schedule I paperwork there is no quarantine stay — and is delivered to your door in Singapore.",
    icon: "check",
  },
  {
    phase: "Settling in",
    title: "First weeks at Blk 587 Woodlands Drive 16",
    timing: "Days 1–3 decompression, then carry-socialise",
    detail:
      "Quiet flat, toilet spot, crate as den, no visitors for the first three days. Register with SingVet. Carry-socialise until the ≥16-week core (~15 Oct) plus a vet nod — he is not park-cleared at landing. Mesh the windows (HDB fall risk). Keep parasite prevention monthly and year-round.",
    icon: "sun",
  },
  {
    phase: "Settling in",
    title: "His park map from home",
    timing: "After ≥16-week core (~15 Oct) + vet nod",
    detail:
      "Not around 22 Sep and not after the first vet visit alone. Carry him until the Singapore vet clears ground time. Then: the small park next to the block for daily walks; Woodlands Waterfront Park (coastal dog run) by car. Dogs must be leashed everywhere public; off-leash only inside designated dog runs, licensed and vaccinated.",
    icon: "map",
  },
];

export const SG_TIPS = [
  "Fly him young if you can: a 12–16-week-old puppy adapts to the move faster, and it lands inside his socialisation window — Singapore's sounds and smells become 'normal' quickly.",
  "Sun runs 7am–7pm nearly year-round in Singapore: the 7:15am toilet walk lands right after sunrise (coolest slot), and the evening walk belongs after the 7pm sunset. Between 10am–5pm, test pavement with the 7-second hand test before any outing.",
  "Singapore's vaccination standard: puppy C3/C5 series ending at ≥16 weeks, first adult booster at 52 weeks, then annual boosters. Dose 3 on 8 Sep in Australia is not that 16-week core. No rabies shot needed locally — Singapore is rabies-free.",
  "Parasite calendar: one combined monthly preventive (chew like NexGard Spectra/Simparica Trio, or a vet-chosen spot-on — not Revolution Plus) covers heartworm + ticks + fleas — same date every month, forever. Deworm every 3 months once he's past 6 months.",
  "Humidity means faster matting and more ear infections — keep his cut short, brush often, and dry his ears after every wet walk.",
  "Apartment toilet reality: keep BOTH systems alive — wee/poo on the pad at home and outside on walks. Reward each in its right place; never punish the wrong spot, just log it and tighten timing.",
  "Singapore vet care is excellent but pricey — pet insurance or a savings buffer is worth arranging before the move.",
] as const;
