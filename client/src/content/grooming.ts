/*
 * Home Grooming Master Class — the ONE consolidated grooming guide.
 * Merges the former handbook chapters (Grooming Masterclass, Grooming
 * Psychology, Haircut Style Guide) with the Grooming Salon walkthrough
 * into a single start-to-finish home groom: bath AND haircut, with every
 * decision pre-stated (lather count, water temperature, dryer direction,
 * ear protection, clipper lengths per zone, grinder-first nail routine).
 * Coat Science stays as a slim background-reading chapter in the handbook.
 *
 * Synthesised from poodle-coat drying guidance (allpoodleinfo), a Cavoodle
 * groomer's face-trim walkthrough (healthyhappypaws.com.au), groomer
 * community blade/guard conventions, cooperative-care training (chin rest,
 * lick mat, desensitisation ladders) and the household care rota.
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
  /** Cooperative-care confidence note — the psychology of this stage */
  confidence?: string;
}

/** Illustration assets (uploaded, webdev storage URLs — use as-is) */
export const GROOM_IMGS = {
  setup: "/manus-storage/groom-setup_e29c45f6_6f01de85.png",
  prebath: "/manus-storage/groom-prebath_03dd7958_a9106865.png",
  face: "/manus-storage/groom-face_704041f9_03a7956a.png",
  finish: "/manus-storage/groom-finish_aff9ef3e_19d92349.png",
  brush: "/manus-storage/groom-brush_1f59d0ef_6f9b5b54.png",
  bath: "/manus-storage/groom-bath_7e03a827_da854c3e.png",
  dry: "/manus-storage/groom-dry_93ab9809_3ad682ee.png",
  ears: "/manus-storage/groom-ears_10a595ae_397ac6db.png",
  nails: "/manus-storage/groom-nails_42ac407a_ad15c627.png",
  teeth: "/manus-storage/groom-teeth_4f76a1ca_0339c9e9.png",
} as const;

export const GROOM_STEPS: GroomStep[] = [
  {
    slug: "setup",
    order: 0,
    emoji: "🧺",
    title: "Set up the station",
    short: "Every tool laid out, bath prepped, calm puppy — before anything touches him",
    time: "5–10 min",
    img: GROOM_IMGS.setup,
    imgAlt: "Gouache sketch of grooming tools laid out on a mat while a Cavoodle puppy sits calmly nearby",
    steps: [
      {
        title: "Lay every tool out first — the full spread",
        text: "Slicker brush, metal comb, detangle spray, diluted shampoo bottle, conditioner, two towels, dryer, cotton balls (ear protection), Happy Hoodie, ear cleaner + cotton pads, nail grinder, toothbrush kit, round-tip scissors, clippers + guard combs (13 mm body / 16–19 mm legs), clipper oil, treat pouch. Everything within arm's reach BEFORE he arrives. Hunting for the comb mid-groom with a wet wriggly puppy is how grooms go wrong.",
      },
      {
        title: "Prep the bath before he's in it",
        text: "Non-slip rubber mat in the laundry sink or basin (less echo and slipping than the big tub), water run until it holds lukewarm — 37–38 °C, comfortable on your inner wrist — shampoo pre-diluted, towels unfolded on the counter. He should never stand waiting in the sink while you fiddle with taps.",
      },
      {
        title: "Non-slip surface at your height",
        text: "A rubber bath mat on the laundry counter or table top for the dry stages. Slipping paws = panicking puppy. Standing at your height saves your back and gives you control.",
      },
      {
        title: "Burn off the zoomies first",
        text: "Groom after a play session and a toilet break, never before. A tired puppy is a cooperative puppy.",
      },
      {
        title: "Treat pouch loaded, lick mat smeared",
        text: "Tiny treats or a lick mat smeared with xylitol-free peanut butter, stuck to the wall or bath at his head height, deployed constantly for the first months. He's learning what grooming IS — make the answer 'a treat dispenser'.",
      },
    ],
    watchOut: "Skipping the setup and improvising — every pause to fetch something teaches him grooming is chaotic.",
    puppyNote:
      "Weeks 1–4 home, 'grooming' is mostly pretend: tools appear, touch him for seconds, treats flow, done. Real full grooms come gradually.",
    confidence:
      "Teach the chin rest as his 'start button': chin resting in your palm = yes, you may groom; head lifts or he walks away = you stop. Dogs who are allowed to say no opt in faster — control itself is the reward. Build it in 2-minute sessions: treats while calm → palm under chin → treats delivered low so his chin sinks into your hand → add the cue 'CHIN'.",
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
        text: "A light spritz of detangle spray (or water + a drop of conditioner). Brushing a completely dry fleece coat snaps and splits the hair — but don't brush soaking-wet coat either; damp-misted is the sweet spot.",
      },
      {
        title: "Line brush in sections, skin to tip",
        text: "Part the coat with one hand to expose a horizontal line, brush that line from the SKIN outward with the slicker (light pressure — pins touch skin without scratching), move the part up a little, repeat row by row. Head → neck → back → each leg → tail. Fluff-brushing only the surface is the #1 cause of the 'surprise shave-down': mats felt silently at the skin under a perfect-looking top layer.",
      },
      {
        title: "Comb is the lie detector",
        text: "Follow with the metal comb through every section. If the comb glides to the skin, that section is truly done. If it snags — there's a mat forming that the slicker skated over.",
      },
      {
        title: "Mats: fingers first, tools second, never scissor points",
        text: "Pinch the hair between mat and skin (so pulling tugs your fingers, not him), work from the mat's tip inward with detangler and the comb's end teeth. Pea-to-marble mats: split vertically with a mat splitter into strips and brush out. Felted patches: stop — clip UNDER the mat or book the groomer. Never point scissors at a mat; mats pull skin up into themselves and one wiggle cuts him.",
      },
      {
        title: "Check the five hotspots",
        text: "Behind the ears, armpits, collar/harness line, inner thighs, tail base. Friction zones mat first, every time.",
      },
    ],
    watchOut: "Bathing a coat with mats in it — water tightens every tangle into felt that only clippers can remove.",
    puppyNote: "Puppy coat barely mats — which is exactly why now is the time to make brushing routine. The adult coat change (~8–12 months) shows no mercy to dogs who hate the brush.",
    confidence:
      "Brush while he works a lick mat, and let him walk away any time — never chase or hold. Reward him for coming back. If you see lip-licking, yawning, whale eye or freezing, you've pushed too far: back up a step.",
  },
  {
    slug: "prebath",
    order: 2,
    emoji: "👀",
    title: "Pre-bath once-over",
    short: "Eyes wiped, body scanned — 2 minutes of vet-grade intel",
    time: "2–3 min",
    img: GROOM_IMGS.prebath,
    imgAlt: "Gouache sketch of a person gently wiping a Cavoodle puppy's eye corner with a soft cloth",
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
      {
        title: "Protect the ears before water",
        text: "A loose cotton ball in each ear opening (never pushed into the canal) keeps bath water out — the #1 cause of post-bath ear infections in floppy-eared breeds. Take them out straight after the rinse.",
      },
    ],
    watchOut: "Treating this as optional — the scan is half the point of home grooming.",
    puppyNote: "This doubles as handling practice: paw squeezes, lip lifts and ear peeks with treats are the exact husbandry skills from the Training tab.",
  },
  {
    slug: "bath",
    order: 3,
    emoji: "🛁",
    title: "Bath — two lathers",
    short: "37–38 °C lukewarm, dilute shampoo, lather twice, face stays dry",
    time: "10–15 min",
    img: GROOM_IMGS.bath,
    imgAlt: "Gouache sketch of a Cavoodle puppy standing in a sink being lathered with shampoo",
    steps: [
      {
        title: "Water at 37–38 °C — lukewarm, wrist-tested",
        text: "Body temperature, comfortable on your inner wrist: not warm-warm, not cold. Hotter dries his skin and frightens him; colder makes him tense up. Keep checking as you go — sink taps drift.",
      },
      {
        title: "Wet from the neck back, to the skin",
        text: "Gentle stream or cup, soaking through the curls to the skin. Leave the head for last — better, skip wetting it entirely and use a damp cloth on the face. The cotton balls guard the ears.",
      },
      {
        title: "Lather #1 — the dirt lifter",
        text: "Puppy/dog shampoo only (human products strip dog skin), pre-diluted 1:3 in a bottle. Work through with fingers along the coat's growth direction — never circular scrubbing, which whips curls into tangles. This first lather lifts oil and street grime; it won't foam much. Rinse it out.",
      },
      {
        title: "Lather #2 — the real clean",
        text: "Second application on the now-degreased coat: this one foams properly and cleans to the skin. Pay special attention to the spots everyone misses — armpits, belly, groin, under the tail, between back legs, paws and between the pads. These are the sweat-and-friction zones that get smelly and matted first.",
      },
      {
        title: "Condition, then rinse until squeaky — then once more",
        text: "Conditioner every bath on a fleece coat, left 3–5 minutes (do a nail-grinding touch session while you wait), then rinse EXTREMELY well. Leftover product is the top cause of itchy, flaky post-bath skin. When you think he's rinsed, do one more full pass — armpits and belly hide suds.",
      },
    ],
    watchOut: "Water and shampoo on the face and in the ears — cloth-wipe the face, and keep those cotton balls in until the final rinse is done.",
    puppyNote: "First baths are 2 minutes long and mostly about warm water feeling fine. Fortnightly Monday baths (per the care rota) build the habit gently.",
    confidence:
      "Stick the lick mat to the tiles at head height and let him work it through both lathers. Calm, steady water flow beats a sprayer blast — and your boring, neutral narration beats anxious cooing.",
  },
  {
    slug: "dry",
    order: 4,
    emoji: "🌬️",
    title: "Towel + blow-dry",
    short: "Blot dry, then low-heat fluff-dry WITH the growth direction — never air-dry",
    time: "15–20 min",
    img: GROOM_IMGS.dry,
    imgAlt: "Gouache sketch of a Cavoodle puppy wrapped in a towel with a dryer held at a distance",
    steps: [
      {
        title: "Dab and blot, never rub",
        text: "Squeeze water out of the coat, wrap him and press — head, neck, back, legs, tail. Rubbing in circles snaps wet hair and starts tangles. A second dry towel finishes the job.",
      },
      {
        title: "Ears protected, dryer on LOW",
        text: "Happy Hoodie (stretchy ear wrap) on to muffle the noise and shield the ear openings from airflow — never blast air into the ear canals or at the eyes. Cool-to-low heat, 20–30 cm away, always moving. A human hairdryer on its cool setting is fine. Puppy skin scorches fast under high heat parked in one spot; if the air feels hot on your hand, it's too hot for him.",
      },
      {
        title: "Dry WITH the coat's growth direction",
        text: "Point the airflow the way the hair grows — from neck toward tail along the body, downward on the legs — and brush each section with the slicker in the same direction as the air hits it. This 'fluff drying' is what leaves the teddy coat straight, plush and clipper-ready instead of frizzed. Section order: back → sides → chest → legs → tail → head last (cloth-dried face).",
      },
      {
        title: "Fully dry means fully dry",
        text: "Damp-at-the-skin is where mats and hotspots breed, especially in Singapore humidity — and clippers cannot cut damp coat evenly. Run the comb through everywhere: it should glide to the skin.",
      },
    ],
    watchOut: "Letting the coat air-dry — an oodle coat air-dries into curl-tightened mats and frizz, undoing the whole groom and ruining any clip that follows.",
    puppyNote: "The dryer is the scariest tool. Introduce it OFF (treats near it), then on low pointed away, then brief passes — over multiple sessions before the first real blow-dry.",
    confidence:
      "Dryer desensitisation ladder: dryer off + treats → running across the room + treats → airflow near him, pointed down-and-away → brief passes on his back. One-minute sessions, escalate only when he's relaxed at the current rung. Dogs hear far better than we do — go slower than feels necessary.",
  },
  {
    slug: "clip",
    order: 5,
    emoji: "💈",
    title: "Clip the body & legs",
    short: "13 mm guard on the body, 16–19 mm legs & tail — clean, dry, brushed coat only",
    time: "20–30 min",
    steps: [
      {
        title: "Only ever clip a clean, dry, fully brushed coat",
        text: "Dirt dulls blades, damp coat cuts unevenly, and mats jam guard combs. That's why the clip sits HERE in the sequence — after bath, full fluff-dry and comb-check. If the comb doesn't glide, go back to brushing first.",
      },
      {
        title: "Body: 13 mm guard, with the growth",
        text: "Snap the 13 mm guard comb (a #4F-blade equivalent, ~½ inch) over the clipper for the body — the classic short-teddy length that suits Singapore heat while keeping the plush look. Clip WITH the direction of coat growth in long, smooth, overlapping strokes; against the growth cuts shorter and leaves track marks. Keep the blade FLAT against the body — a tipped edge gouges. Never go below 6 mm on the body except sanitary areas.",
      },
      {
        title: "Legs and tail: 16–19 mm, or scissor-finish",
        text: "Swap to the 16–19 mm guard (¾ inch) for legs and tail so they stay fuller than the body — that contrast is what reads 'teddy bear' rather than 'shaved'. Clip downward with the growth, then comb the leg hair out and scissor the columns round. The tail keeps its plume: comb out, trim stragglers to shape with scissors, don't clip it short.",
      },
      {
        title: "Order of operations",
        text: "Neck/shoulders → back → sides → chest → legs → sanitary (10 mm or a #10 blade, skin pulled taut) → tail. Pull skin taut in loose areas — armpits, flanks, sanitary — and 'scoop off' at the end of each stroke to blend. Face and head are a separate scissor stage (stage 9), never clippered.",
      },
      {
        title: "Blade heat checks every few minutes",
        text: "Touch the blade to your inner wrist every few minutes — hot blades burn skin. Rotate blades, use coolant spray, and oil the blade every 10–15 minutes of running time.",
      },
      {
        title: "The two-session rule",
        text: "Body one day, head and face tidy another if his patience runs out. A puppy's tolerance is a budget — a half-finished but happy groom beats a complete but traumatic one. The coat forgives; his trust doesn't.",
      },
    ],
    watchOut: "Going too short in the heat: never shave to the skin — the coat insulates against heat too, and bare skin sunburns. 13 mm body / 16–19 mm legs is as short as Wobbles needs.",
    puppyNote: "His first proper clip can be professional (~5–6 months, post-vaccination) so he learns the salon experience — but the plan is home maintenance: a light basic trim at EVERY fortnightly bath holds the coat at its set length, so no dramatic grow-out-and-chop cycles. Build the clipper conditioning ladder from puppyhood; expect your first solo full-length pass around adolescence.",
    confidence:
      "Clipper conditioning ladder, one rung per session: clippers visible → in hand, off → running across the room → running near him → OFF back of clippers touching him → running clippers flat against him, no cutting → single short strokes with jackpot treats. Back up a rung at any stress signal.",
  },
  {
    slug: "ears",
    order: 6,
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
        title: "Wipe only what you can see, and dry the flaps",
        text: "Cotton pad around your finger, wipe the outer folds and flap, and make sure the underside of those heavy Cavalier flaps is fully DRY after every bath — trapped moisture is where infections start. NEVER cotton buds down the canal — they pack wax deeper and can injure the eardrum. Keep the hair inside the ear flap trimmed for airflow.",
      },
    ],
    watchOut: "Over-cleaning. Weekly checks, but actual cleaning only when there's visible wax — a squeaky-clean canal loses its protective layer.",
    puppyNote: "Floppy Cavalier ears + Singapore humidity = ear-infection watchlist. The Monday rota check takes 30 seconds and catches trouble early.",
  },
  {
    slug: "nails",
    order: 7,
    emoji: "💅",
    title: "Nails — the grinder routine",
    short: "Grind a little, 2–3 short sessions a week — not just on groom day",
    time: "2–3 min per session",
    img: GROOM_IMGS.nails,
    imgAlt: "Diagrammatic gouache sketch of a paw held in a hand with the nail tip being shortened just below the quick",
    steps: [
      {
        title: "The routine: little and often, all week",
        text: "Nails are NOT a groom-day-only job. The plan is 2–3 short grinder sessions per week (Mon / Wed / Sat with the care rota), taking a tiny amount off each time. Frequent light grinding makes the quick recede, so nails can get — and stay — properly short. Waiting for the fortnightly groom lets the quick grow out and you can never catch up.",
      },
      {
        title: "How to grind",
        text: "Support the toe between thumb and finger, touch the spinning grinder to the nail tip for 1–2 seconds at a time, then off — brief touches, never held on (friction heat builds fast). Work around the tip at roughly 45°, rounding the edges smooth. Two or three touches per nail is a full session's worth.",
      },
      {
        title: "Know when to stop",
        text: "On white nails, stop a few millimetres before the pink quick. On dark nails, watch the ground face: when a grey-white chalky ring with a darker centre dot appears, the quick is close — stop. Grinding gives you far more warning than clippers ever did.",
      },
      {
        title: "Don't forget the dewclaws",
        text: "Up the inner leg — they never touch ground, never wear down, and curl into the skin if forgotten.",
      },
      {
        title: "If you do hit the quick",
        text: "Rarer with a grinder, but: styptic powder (or cornflour) pressed on for 30 seconds, calm voice, extra treats, end the session on an easy win.",
      },
      {
        title: "Watch the fur",
        text: "Long paw fur can wrap around a spinning grinder head. Hold the surrounding fur back with your fingers, or slip an old stocking over the paw with just the nails poking through.",
      },
    ],
    watchOut: "Waiting for clicking-on-the-floor — by then the quick has grown long and short nails take months of patient grinding to win back.",
    puppyNote: "Weeks 1–3: grinder OFF, touched to a nail, treat. Then running in the room, treat. Then a 1-second touch on one nail, jackpot. The noise-and-vibration introduction is the whole game — rush it and you buy years of paw-wrestling.",
    confidence:
      "One paw — even one nail — is a perfectly good session. Treats between every toe, and use the chin rest as his consent signal: chin down means keep going, head up means pause.",
  },
  {
    slug: "teeth",
    order: 8,
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
    order: 9,
    emoji: "✂️",
    title: "Face & tidy trim",
    short: "Round-tip scissors, eyes and hygiene — the head is scissor work, never clippers",
    time: "5–10 min",
    img: GROOM_IMGS.face,
    imgAlt: "Gouache sketch of a person carefully trimming around a Cavoodle puppy's eyes with round-tip scissors",
    steps: [
      {
        title: "Only on a clean, dry, brushed coat",
        text: "Scissors through dirty or damp curls chew and pull. The face tidy always comes at the END of the full groom sequence.",
      },
      {
        title: "Eye corners first",
        text: "Round-tip (blunt-nose) scissors only near eyes. Comb the fur at the inner corners forward, snip the overgrowth that's poking or catching gunk, tiny cuts, pointing away from the eyeball. Never let anyone shave between the eyes or down the nose bridge — it takes months to regrow.",
      },
      {
        title: "Round the head by scissor, check symmetry",
        text: "The teddy head is scissored, not clippered: comb up and out, scissor the outline round, checking from the front constantly. Thinning shears give a soft natural finish. Cavoodles carry heavier Cavalier ears than most doodles, so he'll trend slightly 'lamb-ish' rather than perfectly round — lean into it.",
      },
      {
        title: "Under the ears and mouth corners",
        text: "Where food and water cling. Comb down, trim the straggle line. Hold the ear leather between your fingers while trimming near the flap — you cannot cut what your fingers are protecting.",
      },
      {
        title: "Feet and hygiene tidy",
        text: "Scissor round 'bootie' feet, trim the hair between paw pads (overgrown pad hair slips on tiles), and a careful tidy under the tail and sanitary area with the same round-tips — just enough to keep things clean between grooms.",
      },
    ],
    watchOut: "Getting ambitious with the scissors — a wonky fringe grows back; a nicked ear leather or eye doesn't. When unsure, don't cut.",
    puppyNote: "Snipping sounds near the face are strange at first. Let him hear the scissors snip beside him (treats) before they ever touch fur.",
    confidence:
      "Face work demands the most stillness, so it earns the best treats. Chin rest on a rolled towel at the table edge gives him a job to do while you snip.",
  },
  {
    slug: "finish",
    order: 10,
    emoji: "🎉",
    title: "The victory lap",
    short: "Treat, play, log it — the groom must end on a high",
    time: "2 min",
    img: GROOM_IMGS.finish,
    imgAlt: "Gouache sketch of a freshly groomed Cavoodle puppy catching a treat mid-celebration",
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
        text: "Rinse the brush fur out, wash towels, wipe and oil the clipper blades, restock treats — future-you grooms a calm puppy because the kit was ready.",
      },
    ],
    watchOut: "Ending on the puppy's least favourite step. If a stage went badly, do a 10-second easy brush + treat afterwards so the session still ends well.",
    puppyNote: "Early on, the victory lap might be 80% of the session. That ratio is the investment that buys 15 years of easy grooming.",
    confidence:
      "A freshly clipped fleece coat looks straighter than usual — the waves bounce back within days, faster if you mist with water and scrunch.",
  },
];

/** Kit checklist for the tools card */
export const GROOM_KIT: { item: string; note: string }[] = [
  { item: "Soft slicker brush ✔ bought", note: "Macaron-grey slicker + comb set ordered 27 Jul — puppy-soft pins now; standard slicker for the adult coat" },
  { item: "Metal greyhound comb ✔ bought", note: "Came with the slicker set — the mat lie-detector; coat isn't done until this glides" },
  { item: "Detangle spray", note: "Or water + a drop of dog conditioner in a mist bottle" },
  { item: "Puppy shampoo + conditioner", note: "Dog-specific, shampoo diluted 1:3; conditioner every bath; never human products" },
  { item: "Two cotton towels", note: "High-GSM; dab and blot only" },
  { item: "Dryer + Happy Hoodie", note: "Human hairdryer on cool/low works; the ear wrap muffles noise and shields ears" },
  { item: "Cotton balls", note: "Loose in the ear openings during the bath — water out, no post-bath ear trouble" },
  { item: "Dog ear cleaner + cotton pads", note: "Never cotton buds in the canal" },
  { item: "Nail grinder + styptic powder", note: "Grinder-first routine, 2–3 short sessions a week; cornflour backup" },
  { item: "Clippers + guard combs (13 mm & 16–19 mm) ✔ bought", note: "Codos CP-6800 cordless clipper + original blade ordered 27 Jul — 13 mm body, 16–19 mm legs/tail; clipper oil + coolant spray alongside" },
  { item: "Dog toothpaste + finger brush", note: "Human toothpaste is toxic (xylitol)" },
  { item: "Grooming scissors: 7\" straight + 6.5\" thinning shears ✔ bought", note: "Full-steel set ordered 27 Jul — still add round-tip (blunt-nose) scissors for eye and ear work" },
  { item: "Non-slip mat + treat pouch + lick mat", note: "The three that make every other tool usable" },
];

/** Frequency cheatsheet, aligned with the household care rota */
export const GROOM_FREQUENCY: { task: string; cadence: string; rota: string }[] = [
  { task: "Quick brush", cadence: "3–4× a week (daily during the 8–12 mo coat change)", rota: "Little and often" },
  { task: "Full line brush + comb", cadence: "Weekly", rota: "Weekend slot" },
  { task: "Bath + blow-dry + basic trim", cadence: "Every 2 weeks — every bath ends with a trim, so the coat holds one set length", rota: "Monday (care rota)" },
  { task: "Basic trim (home)", cadence: "Every bath: eyes/face, paw pads, sanitary + light 13 mm body / 16–19 mm leg top-up", rota: "Same session, after the dry" },
  { task: "Ear check / clean", cadence: "Check weekly, clean when waxy", rota: "Monday (care rota)" },
  { task: "Nails (grinder)", cadence: "2–3 short sessions a week, a little off each time", rota: "Mon / Wed / Sat" },
  { task: "Teeth", cadence: "3× a week minimum", rota: "Tue / Thu / Sat (care rota)" },
  { task: "Eye wipe / face check", cadence: "Daily 10 seconds", rota: "With morning cuddle" },
  { task: "Professional groom", cadence: "Optional — occasional shaping only, since fortnightly trims hold the length; first visit ~5–6 months for the experience", rota: "Book only if the shape drifts" },
];

/* ---------------- Haircut style guide (merged from the old handbook chapter) ---------------- */

export interface HaircutStyle {
  style: string;
  body: string;
  headLegs: string;
  upkeep: string;
}

export const HAIRCUT_STYLES: HaircutStyle[] = [
  {
    style: "Puppy cut",
    body: "One length all over, 1–2.5 cm",
    headLegs: "Head same or slightly longer; round muzzle; tapered ears",
    upkeep: "Easiest. Trim every 4–6 wks",
  },
  {
    style: "Teddy bear (Wobbles' cut)",
    body: "13 mm body guard, legs 16–19 mm",
    headLegs: "Head scissored noticeably longer than body; legs full and column-like",
    upkeep: "Brush 3×+/wk; length held by the basic trim at every fortnightly bath",
  },
  {
    style: "Lamb cut",
    body: "Short body 1–2.5 cm",
    headLegs: "Long fluffy sculpted legs, poofy rounded head",
    upkeep: "Daily leg brushing; pro styling",
  },
  {
    style: "Summer / kennel",
    body: "≤1.25 cm all over (never below 6 mm)",
    headLegs: "Often keeps a teddy head and plumed tail",
    upkeep: "Lowest. Groom every 8–12 wks",
  },
  {
    style: "Asian fusion",
    body: "Short body",
    headLegs: "Flared bell-bottom legs, very round 'mushroom' muzzle, dramatic ears",
    upkeep: "Highest skill; frequent upkeep",
  },
];

/** How to brief a professional groomer (kept from the old style-guide chapter) */
export const GROOMER_BRIEF: string[] = [
  "Bring PHOTOS. 'Teddy bear cut' means something different in every salon.",
  "Specify each zone separately: ears, top of head, muzzle, body, legs, feet, tail — for Wobbles: 13 mm body, longer legs, round scissored head, plumed tail.",
  "Say 'don't poodle my doodle' if you want a round muzzle and round feet instead of shaved poodle face/feet.",
  "Never let anyone shave between the eyes or down the bridge of the nose — it takes months to regrow.",
  "Your maintenance level sets the length: lots of home brushing earns a long coat; minimal brushing means a practical short cut.",
  "Ask about a 48-hour free-fix window (common) and book cheaper bath-and-tidy visits between full grooms.",
];

/** Blade/guard length decoder for the clipping stage */
export const BLADE_GUIDE: { blade: string; length: string; use: string }[] = [
  { blade: "#10 blade", length: "≈1.5 mm", use: "Sanitary and paw pads ONLY — never the body" },
  { blade: "#7F blade", length: "≈3 mm", use: "Very short summer cut (still never below 6 mm on the body)" },
  { blade: "#5F blade", length: "≈6 mm", use: "The absolute body minimum outside dematting" },
  { blade: "#4F blade / 13 mm guard", length: "≈9.5–13 mm", use: "Wobbles' body length — short teddy, Singapore-friendly" },
  { blade: "16–19 mm guard", length: "≈16–19 mm", use: "Legs and tail — the fuller teddy contrast" },
];
