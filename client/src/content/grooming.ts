/*
 * Grooming tab content — the start-to-finish home groom for Wobbles.
 * Synthesised from poodle-coat drying guidance (allpoodleinfo), a Cavoodle
 * groomer's face-trim walkthrough (healthyhappypaws.com.au) and general
 * at-home schedules (Camp Bow Wow), aligned with the household care rota.
 */

export interface GroomStep {
  slug: string;
  order: number; // 0-based position in the walkthrough
  emoji: string;
  title: string;
  short: string; // one-line summary for the index
  time: string; // rough duration
  img?: string;
  imgAlt?: string;
  steps: { title: string; text: string }[];
  watchOut: string; // the classic mistake at this stage
  puppyNote: string; // 8-16 week acclimation angle
}

/** Illustration assets (uploaded, webdev storage URLs — use as-is) */
export const GROOM_IMGS = {
  brush: "/manus-storage/groom-brush_1f59d0ef.png",
  bath: "/manus-storage/groom-bath_7e03a827.png",
  dry: "/manus-storage/groom-dry_93ab9809.png",
  ears: "/manus-storage/groom-ears_10a595ae.png",
  nails: "/manus-storage/groom-nails_42ac407a.png",
  teeth: "/manus-storage/groom-teeth_4f76a1ca.png",
} as const;

export const GROOM_STEPS: GroomStep[] = [
  {
    slug: "setup",
    order: 0,
    emoji: "🧺",
    title: "Set up & settle",
    short: "Tools out, mat down, calm puppy — before anything touches him",
    time: "5 min",
    steps: [
      {
        title: "Lay everything out first",
        text: "Slicker brush, metal comb, detangle spray, puppy shampoo, two towels, dryer, ear cleaner + cotton pads, nail clippers, toothbrush kit, round-tip scissors — all within arm's reach. Hunting for the comb mid-groom with a wet wriggly puppy is how grooms go wrong.",
      },
      {
        title: "Non-slip surface at your height",
        text: "A rubber bath mat on the laundry counter or table top. Slipping paws = panicking puppy. Standing at your height saves your back and gives you control.",
      },
      {
        title: "Burn off the zoomies first",
        text: "Groom after a play session and a toilet break, never before. A tired puppy is a cooperative puppy.",
      },
      {
        title: "Treat pouch loaded",
        text: "Tiny treats or a lick mat smeared with something good, deployed constantly for the first months. He's learning what grooming IS — make the answer 'a treat dispenser'.",
      },
    ],
    watchOut: "Skipping the setup and improvising — every pause to fetch something teaches him grooming is chaotic.",
    puppyNote:
      "Weeks 1–4 home, 'grooming' is mostly pretend: tools appear, touch him for seconds, treats flow, done. Real full grooms come gradually.",
  },
  {
    slug: "brush",
    order: 1,
    emoji: "🪮",
    title: "Brush-out & de-mat",
    short: "Line brushing with slicker + comb — always BEFORE water",
    time: "10–15 min",
    img: GROOM_IMGS.brush,
    imgAlt: "Gouache sketch of a hand line-brushing a Cavoodle puppy's sectioned coat with a slicker brush",
    steps: [
      {
        title: "Mist first, never brush bone-dry",
        text: "A light spritz of detangle spray (or water + a drop of conditioner). Brushing a completely dry fleece coat snaps and splits the hair.",
      },
      {
        title: "Line brush in sections",
        text: "Part the coat with one hand, brush the exposed line from skin outward with the slicker, move the part up a little, repeat. Head → neck → back → each leg → tail. You're brushing the coat, not just the surface fluff.",
      },
      {
        title: "Comb is the lie detector",
        text: "Follow with the metal comb through every section. If the comb glides to the skin, that section is truly done. If it snags — there's a mat forming that the slicker skated over.",
      },
      {
        title: "Work mats from the tip",
        text: "Hold the mat at the base (so you're not pulling skin), tease it apart from the outer tip inward with the comb's end teeth. Big felted mats: don't fight them — that's a groomer job.",
      },
      {
        title: "Check the five hotspots",
        text: "Behind the ears, armpits, collar/harness line, inner thighs, tail base. Friction zones mat first, every time.",
      },
    ],
    watchOut: "Bathing a coat with mats in it — water tightens every tangle into felt that only clippers can remove.",
    puppyNote: "Puppy coat barely mats — which is exactly why now is the time to make brushing routine. The adult coat change (~8–12 months) shows no mercy to dogs who hate the brush.",
  },
  {
    slug: "prebath",
    order: 2,
    emoji: "👀",
    title: "Pre-bath once-over",
    short: "Eyes wiped, body scanned — 2 minutes of vet-grade intel",
    time: "2–3 min",
    steps: [
      {
        title: "Eye corners",
        text: "Warm, damp lint-free cloth held on any crust for 10–15 seconds to soften, then wipe inner corner → outward. Fresh side of cloth per eye. Cavoodle tear-staining is normal; sudden gunk or redness is a vet flag.",
      },
      {
        title: "Hands-on body scan",
        text: "Run fingers everywhere while he's dry: lumps, scabs, ticks, red patches, flaky skin, anything tender. You will find problems weeks before anyone else because you do this fortnightly.",
      },
      {
        title: "Peek at paws",
        text: "Between the pads: grass seeds, tangled fur, cracked pads. Singapore pavements add melted-tar and hot-ground checks in the dry season.",
      },
    ],
    watchOut: "Treating this as optional — the scan is half the point of home grooming.",
    puppyNote: "This doubles as handling practice: paw squeezes, lip lifts and ear peeks with treats are the exact husbandry skills from the Training tab.",
  },
  {
    slug: "bath",
    order: 3,
    emoji: "🛁",
    title: "Bath",
    short: "Lukewarm water, dilute puppy shampoo, face stays dry",
    time: "10 min",
    img: GROOM_IMGS.bath,
    imgAlt: "Gouache sketch of a Cavoodle puppy standing in a sink being lathered with shampoo",
    steps: [
      {
        title: "Lukewarm, wrist-tested",
        text: "Comfortable on your inner wrist — not warm-warm, not cold. The laundry sink or a basin beats the big bathtub for a small puppy: less echo, less slipping, less fear.",
      },
      {
        title: "Wet from the neck back",
        text: "Soak to the skin with a gentle stream or cup. Leave the head for last — or skip wetting it entirely and use a damp cloth on the face instead. Water in ears is the #1 cause of post-bath ear trouble in floppy-eared breeds.",
      },
      {
        title: "Dilute the shampoo",
        text: "Puppy/dog shampoo only (human products strip dog skin), diluted 1:3 with water in an old bottle — it spreads through a curly coat far better and rinses faster.",
      },
      {
        title: "Massage with fingers, not nails",
        text: "Work the lather with the coat, not in circles (circular scrubbing tangles curls). Don't miss armpits, belly and under the tail.",
      },
      {
        title: "Rinse until the water runs clear — then once more",
        text: "Leftover shampoo is the top cause of itchy flaky skin after baths. When you think he's rinsed, do one more pass.",
      },
    ],
    watchOut: "Water and shampoo on the face and in the ears — cloth-wipe the face, cotton-ball the ear openings if he's a splasher.",
    puppyNote: "First baths are 2 minutes long and mostly about warm water feeling fine. Fortnightly Monday baths (per the care rota) build the habit gently.",
  },
  {
    slug: "dry",
    order: 4,
    emoji: "🌬️",
    title: "Towel + blow-dry",
    short: "Dab-dry then low-heat fluff dry — never air-dry an oodle",
    time: "15–20 min",
    img: GROOM_IMGS.dry,
    imgAlt: "Gouache sketch of a Cavoodle puppy wrapped in a towel with a dryer held at a distance",
    steps: [
      {
        title: "Dab and blot, never rub",
        text: "Wrap him and press the water out — head, neck, back, legs, tail. Rubbing in circles snaps wet hair and starts tangles. A second dry towel finishes the job.",
      },
      {
        title: "Dryer on LOW and at distance",
        text: "Cool-to-low heat, 20–30 cm away, always moving. A human hairdryer on its cool setting is fine. Puppy skin scorches fast under high heat parked in one spot.",
      },
      {
        title: "Line brush as you dry",
        text: "Dry section by section, brushing each with the slicker as the air hits it — this 'fluff drying' is what leaves the teddy coat plush and mat-free instead of frizzed.",
      },
      {
        title: "Fully dry means fully dry",
        text: "Damp-at-the-skin is where mats and hotspots breed, especially in Singapore humidity. Run the comb through: it should glide everywhere.",
      },
    ],
    watchOut: "Letting the coat air-dry — an oodle coat air-dries into curl-tightened mats and frizz, undoing the whole groom.",
    puppyNote: "The dryer is the scariest tool. Introduce it OFF (treats near it), then on low pointed away, then brief passes — over multiple sessions before the first real blow-dry.",
  },
  {
    slug: "ears",
    order: 5,
    emoji: "👂",
    title: "Ears",
    short: "Cleaner, massage, shake, wipe — weekly check on Mondays",
    time: "3–5 min",
    img: GROOM_IMGS.ears,
    imgAlt: "Gouache sketch of a hand gently lifting a Cavoodle puppy's ear flap to wipe it with a cotton pad",
    steps: [
      {
        title: "Look and sniff first",
        text: "Lift the flap: healthy is pale pink and nearly odourless. Red, swollen, yeasty-smelling or dark discharge = vet, not cleaning.",
      },
      {
        title: "Cleaner in, tip out",
        text: "Squeeze dog ear cleaner into the canal without pushing the bottle tip inside. Massage the ear base 20–30 seconds — the squelch means it's working.",
      },
      {
        title: "Let him shake",
        text: "Stand back; the head-shake brings the loosened gunk up and out. This is the step doing the deep cleaning, not you.",
      },
      {
        title: "Wipe only what you can see",
        text: "Cotton pad around your finger, wipe the outer folds and flap. NEVER cotton buds down the canal — they pack wax deeper and can injure the eardrum.",
      },
    ],
    watchOut: "Over-cleaning. Weekly checks, but actual cleaning only when there's visible wax — a squeaky-clean canal loses its protective layer.",
    puppyNote: "Floppy Cavalier ears + Singapore humidity = ear-infection watchlist. The Monday rota check takes 30 seconds and catches trouble early.",
  },
  {
    slug: "nails",
    order: 6,
    emoji: "💅",
    title: "Nails",
    short: "Tips only, little and often — respect the quick",
    time: "5 min",
    img: GROOM_IMGS.nails,
    imgAlt: "Diagrammatic gouache sketch of a paw held in a hand with clippers trimming just the nail tip below the quick",
    steps: [
      {
        title: "Find the quick",
        text: "On white nails the pink core is visible — cut a few millimetres beyond it. On dark nails take thin slivers until a grey-white oval appears in the cut face, then stop.",
      },
      {
        title: "Hold the paw softly, clip at 45°",
        text: "Thumb on pad, finger behind the nail's toe, clip the tip in one decisive squeeze. Hesitant part-cuts crush and hurt more than confident small ones.",
      },
      {
        title: "One or two nails is a fine session",
        text: "Little and often beats a 20-minute wrestle. A full set can be spread across a whole week — the Monday rota slot is a nudge, not a marathon.",
      },
      {
        title: "Don't forget the dewclaws",
        text: "Up the inner leg — they never touch ground, never wear down, and curl into the skin if forgotten.",
      },
      {
        title: "If you nick the quick",
        text: "Styptic powder (or cornflour) pressed on for 30 seconds, calm voice, extra treats, end the session. It happens to everyone once.",
      },
    ],
    watchOut: "Waiting for clicking-on-the-floor — by then the quick has grown long and short nails take months to win back.",
    puppyNote: "Weeks 1–3: just touch the clippers to a nail and pay. Clip your first single real tip when he's relaxed being pawed. Grinders work too, introduce the noise the same slow way.",
  },
  {
    slug: "teeth",
    order: 7,
    emoji: "🦷",
    title: "Teeth",
    short: "Finger brush + dog toothpaste — Tue/Thu/Sat rhythm",
    time: "2–3 min",
    img: GROOM_IMGS.teeth,
    imgAlt: "Gouache sketch of a finger brush cleaning a Cavoodle puppy's teeth with the lip gently lifted",
    steps: [
      {
        title: "Dog toothpaste only",
        text: "Human toothpaste contains xylitol and fluoride — both toxic to dogs. Poultry-flavoured dog paste turns brushing into a treat in itself.",
      },
      {
        title: "Start with a lick, then a rub",
        text: "Week one: paste licked off your finger. Week two: finger rubs along the gum line. Then the finger brush, then (optionally) a small dog toothbrush.",
      },
      {
        title: "Lift the lip, small circles",
        text: "Focus on the outside surfaces along the gum line — that's where plaque sits. The tongue handles the inner faces reasonably well.",
      },
      {
        title: "Ten seconds a side is a win",
        text: "Consistency beats duration. The Tue/Thu/Sat rota slots build a lifetime habit for a breed prone to small-jaw crowding and early dental disease.",
      },
    ],
    watchOut: "Skipping teeth because 'he's a puppy' — small breeds like Cavoodles top the dental-disease charts by age three.",
    puppyNote: "Baby teeth fall out from ~4 months, but the brushing HABIT is the thing being trained now, on whichever teeth are in.",
  },
  {
    slug: "face",
    order: 8,
    emoji: "✂️",
    title: "Face & tidy trim",
    short: "Round-tip scissors, eyes and hygiene only — clips are groomer work",
    time: "5–10 min",
    steps: [
      {
        title: "Only on a clean, dry, brushed coat",
        text: "Scissors through dirty or damp curls chew and pull. The face tidy always comes at the END of the full groom sequence.",
      },
      {
        title: "Eye corners first",
        text: "Round-tip (blunt-nose) scissors only near eyes. Comb the fur at the inner corners forward, snip the overgrowth that's poking or catching gunk, tiny cuts, pointing away from the eyeball.",
      },
      {
        title: "Under the ears and mouth corners",
        text: "Where food and water cling. Comb down, trim the straggle line. Hold the ear leather between your fingers while trimming near the flap — you cannot cut what your fingers are protecting.",
      },
      {
        title: "Hygiene trim",
        text: "Careful tidy under the tail and around the belly/sanitary area with the same round-tips, just enough to keep things clean between grooms.",
      },
      {
        title: "Leave the styling to the pros",
        text: "The full teddy-bear clip is a professional job — first groomer visit around 5–6 months, after vaccinations. Do a treats-only 'happy visit' to the salon first so the venue isn't scary.",
      },
    ],
    watchOut: "Getting ambitious with the scissors — a wonky fringe grows back; a nicked ear leather or eye doesn't. When unsure, don't cut.",
    puppyNote: "Snipping sounds near the face are strange at first. Let him hear the scissors snip beside him (treats) before they ever touch fur.",
  },
  {
    slug: "finish",
    order: 9,
    emoji: "🎉",
    title: "The victory lap",
    short: "Treat, play, log it — the groom must end on a high",
    time: "2 min",
    steps: [
      {
        title: "Jackpot finish",
        text: "The best treat of the session lands as the last tool goes down, then straight into his favourite game. The final 30 seconds colour his memory of the entire groom.",
      },
      {
        title: "Log it in the Grooming tracker",
        text: "Ticking 'Bath + blow dry' in the tracker keeps the fortnightly rhythm honest and shows patterns (ear gunk after park season, matting hotspots).",
      },
      {
        title: "Quick tool reset",
        text: "Rinse the brush fur out, wash towels, restock treats — future-you grooms a calm puppy because the kit was ready.",
      },
    ],
    watchOut: "Ending on the puppy's least favourite step. If nails went badly, do a 10-second easy brush + treat afterwards so the session still ends well.",
    puppyNote: "Early on, the victory lap might be 80% of the session. That ratio is the investment that buys 15 years of easy grooming.",
  },
];

/** Kit checklist for the tools card */
export const GROOM_KIT: { item: string; note: string }[] = [
  { item: "Soft slicker brush", note: "Puppy-soft pins now; standard slicker for the adult coat" },
  { item: "Metal greyhound comb", note: "The mat lie-detector — coat isn't done until this glides" },
  { item: "Detangle spray", note: "Or water + a drop of dog conditioner in a mist bottle" },
  { item: "Puppy shampoo", note: "Dog-specific, diluted 1:3; never human products" },
  { item: "Two cotton towels", note: "High-GSM; dab and blot only" },
  { item: "Dryer", note: "Human hairdryer on cool/low works; ionic dog dryer is a luxury upgrade" },
  { item: "Dog ear cleaner + cotton pads", note: "Never cotton buds in the canal" },
  { item: "Nail clippers (small) + styptic powder", note: "Scissor-type for toy breeds; cornflour backup" },
  { item: "Dog toothpaste + finger brush", note: "Human toothpaste is toxic (xylitol)" },
  { item: "Round-tip scissors", note: "Blunt noses only near eyes and ears" },
  { item: "Non-slip mat + treat pouch", note: "The two that make every other tool usable" },
];

/** Frequency cheatsheet, aligned with the household care rota */
export const GROOM_FREQUENCY: { task: string; cadence: string; rota: string }[] = [
  { task: "Quick brush", cadence: "3–4× a week (daily during the 8–12 mo coat change)", rota: "Little and often" },
  { task: "Full line brush + comb", cadence: "Weekly", rota: "Weekend slot" },
  { task: "Bath + blow-dry", cadence: "Every 2 weeks", rota: "Monday (care rota)" },
  { task: "Ear check / clean", cadence: "Check weekly, clean when waxy", rota: "Monday (care rota)" },
  { task: "Nails", cadence: "Every 3–4 weeks, tips only", rota: "Monday (care rota)" },
  { task: "Teeth", cadence: "3× a week minimum", rota: "Tue / Thu / Sat (care rota)" },
  { task: "Eye wipe / face check", cadence: "Daily 10 seconds", rota: "With morning cuddle" },
  { task: "Professional groom", cadence: "Every 6–8 weeks from ~5–6 months", rota: "First visit post-vaccination" },
];
