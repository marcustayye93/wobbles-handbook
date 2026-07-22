/*
 * Training tab content — priority-ordered puppy curriculum for Wobbles.
 * Synthesised from AKC puppy training timeline, The Puppy Academy schedule,
 * How to Train a Dream Dog (8-week essentials) and Found Animals pad-to-
 * outdoors transition guidance, adapted to a Singapore HDB Cavoodle.
 * Ordering = teaching priority, not difficulty.
 */

export interface TrainingStep {
  title: string;
  text: string;
}

export interface TrainingSkill {
  slug: string;
  priority: number;
  emoji: string;
  title: string;
  short: string; // one-line summary for the index
  startWhen: string; // human-readable timing
  startWeeks: number; // Wobbles age (weeks) when this skill should begin
  goal: string;
  img?: string; // illustration URL
  imgAlt?: string;
  steps: TrainingStep[];
  wobbles: string; // Wobbles/Singapore-specific note
  proTip: string;
  trackerChoice: string; // matching option in the Training Log tracker
}

/** Illustration assets (uploaded, webdev storage URLs — use as-is) */
export const TRAINING_IMGS = {
  potty: "/manus-storage/train-potty_dc3c2c22.png",
  name: "/manus-storage/train-name_1e420efc.png",
  crate: "/manus-storage/train-crate_ced70d0a.png",
  sit: "/manus-storage/train-sit_a088dcd6.png",
  recall: "/manus-storage/train-recall_3df38a28.png",
  leash: "/manus-storage/train-leash_1a09440a.png",
  handling: "/manus-storage/train-handling_00e3a4fd.png",
  social: "/manus-storage/train-social_9d76efed.png",
  confidence: "/manus-storage/train-confidence_7ebd9739.png",
  bite: "/manus-storage/train-bite_3cf46d65.png",
  stay: "/manus-storage/train-stay_b68e27ae.png",
  tricks: "/manus-storage/train-tricks_d10f4535.png",
} as const;

export const TRAINING_SKILLS: TrainingSkill[] = [
  {
    slug: "potty",
    priority: 1,
    emoji: "🚽",
    title: "Potty training",
    short: "Pad-first HDB routine, then the outdoor transition",
    startWhen: "Day 1 home (8 weeks)",
    startWeeks: 8,
    goal: "Wobbles reliably goes on his pad (and later, his park patch) — and never learns that carpet is an option.",
    img: TRAINING_IMGS.potty,
    imgAlt: "Gouache sketch of a Cavoodle puppy on a toilet pad near the door while a person praises him",
    steps: [
      {
        title: "Set the schedule",
        text: "Out to the pad first thing on waking, within 20–30 minutes after every meal, after every play burst and nap, and last thing at night. Rule of thumb: months of age ÷ 2 = hours he can hold it (an 8-week puppy ≈ every 1–2 hours awake).",
      },
      {
        title: "One pad spot, always the same",
        text: "Pick a fixed pad station (near the service-yard or front door — wherever the future exit route is). Carry him there calmly; don't let him wander en route or the hallway becomes a toilet too.",
      },
      {
        title: "Cue while he goes",
        text: "The moment he starts, quietly repeat one cue — 'go potty'. Say it during, not before. Within weeks the word itself triggers the behaviour, which is gold for rainy-day pads and pre-bed wees.",
      },
      {
        title: "Party within 2 seconds",
        text: "Praise + a tiny treat the instant he finishes, right there at the pad. Rewards given later (back inside) teach 'coming inside' — not 'going on the pad'.",
      },
      {
        title: "Supervise or confine",
        text: "Eyes-on 100% of the time he's loose, or he's in the pen/crate. Every unnoticed accident is a rehearsal. Watch for sniffing, circling, whining and mid-play freezes — scoop him to the pad immediately.",
      },
      {
        title: "Accidents: clean, never scold",
        text: "If you catch him mid-act, a cheerful interrupt and carry to the pad. If you find it later, say nothing — he cannot connect it. Clean with an enzymatic cleaner (not household cleaner) so the smell doesn't invite a repeat.",
      },
      {
        title: "Transition outdoors after vaccinations (~16 weeks)",
        text: "Move the pad progressively toward the door, then outside to his park patch next door. Take a used pad out the first few times so the smell says 'this is the spot'. Keep the same cue and the same party.",
      },
    ],
    wobbles:
      "Pre-vaccination (until ~30 Oct 2026), pads are the safe default in the flat — HDB grass is parvo-risky ground. The 7:15am lift-to-park routine takes over once the vet clears him; the pad can stay as a rainy-day backup, which most Singapore dog owners keep for monsoon season.",
    proTip:
      "Track every wee and poo in the Toilet tracker for the first fortnight. The pattern that emerges IS his schedule — you'll start pre-empting him instead of reacting.",
    trackerChoice: "Name response", // potty logs live in the toilet tracker; nearest training log choice not used
  },
  {
    slug: "name",
    priority: 2,
    emoji: "📛",
    title: "The name game",
    short: "His name = the best word he knows. Foundation of everything.",
    startWhen: "Day 1–2 home (8 weeks)",
    startWeeks: 8,
    goal: "Hearing 'Wobbles' whips his head toward you, every time — the attention switch every other skill is built on.",
    img: TRAINING_IMGS.name,
    imgAlt: "Gouache sketch of a person holding a treat at eye level while a Cavoodle puppy looks up",
    steps: [
      {
        title: "Say 'Wobbles' once, brightly",
        text: "Quiet room, treats in hand. One clear, happy 'Wobbles!' — don't repeat it if he doesn't look; wait, or make a small kissy sound to help.",
      },
      {
        title: "Mark the head-turn",
        text: "The instant his head turns to you, say 'Yes!' and treat. Hold the treat up at your eye level sometimes so 'name' also means 'eye contact'.",
      },
      {
        title: "Ten reps, three times a day",
        text: "Use part of his kibble ration. Sessions are 60–90 seconds — done before he can lose interest.",
      },
      {
        title: "Add distance and distraction slowly",
        text: "Across the room → from another room → mid-play → at the void deck. If he fails twice in a row, the step was too big; go back one.",
      },
    ],
    wobbles:
      "House rule for Marcus and Chesa: his name is NEVER followed by anything bad (no 'Wobbles, no!'). The name only ever predicts good things — that's what keeps the head-turn reliable for life.",
    proTip: "His pedigree name 'Paddington' makes a fun secondary cue later, but pick ONE everyday name now and both humans stick to it.",
    trackerChoice: "Name response",
  },
  {
    slug: "crate",
    priority: 3,
    emoji: "🛏️",
    title: "Crate confidence & alone time",
    short: "The crate as his den — and calm minutes alone from week one",
    startWhen: "Week 1 home (8–9 weeks)",
    startWeeks: 8,
    goal: "Wobbles walks into his crate on cue, settles, and can be alone briefly without drama — the anti-separation-anxiety vaccine.",
    img: TRAINING_IMGS.crate,
    imgAlt: "Gouache sketch of a treat trail leading into an open crate with a Cavoodle puppy approaching",
    steps: [
      {
        title: "Make the crate appear furnished",
        text: "Set it up before homecoming where it will live long-term (bedroom corner for the first weeks). Mum-scented blanket inside, door pinned open, treats 'magically' appearing in it all day.",
      },
      {
        title: "Treat-trail games, zero pressure",
        text: "Toss a treat trail to the door, then just inside, then to the back. He goes in and comes out freely — never shove, never trap him in early days.",
      },
      {
        title: "Meals in the crate",
        text: "Feed every meal inside with the door open, then door closed for the length of the meal, then closed +30 seconds, +1 minute… He's busy eating; the door becomes boring.",
      },
      {
        title: "Add the cue and the release",
        text: "As he trots in, say 'crate' (or 'bed'); treat him inside. Open the door only when he's calm and use one release word ('okay!') — calm exits are part of the skill.",
      },
      {
        title: "Build alone-time in tiny doses",
        text: "Three fake departures a day: keys, shoes, out the front door for 2–5 minutes, back in, no fuss either way. A stuffed licky mat or frozen KONG as you leave turns departures into good news.",
      },
    ],
    wobbles:
      "With hybrid work (both home Mon/Fri), Tue–Thu office days are the real test. Puppy-cam at lunch: sleeping = great; pacing or crying = shorten tomorrow's alone stretch. Never use the crate as punishment — it's his den, not a naughty corner.",
    proTip: "Cover the crate top and three sides with a light cloth — den-like crates settle puppies faster in bright HDB living rooms.",
    trackerChoice: "Crate training",
  },
  {
    slug: "handling",
    priority: 4,
    emoji: "🤲",
    title: "Handling & cooperative care",
    short: "Paws, ears, muzzle, brush — rehearse grooming before it's needed",
    startWhen: "Week 1–2 home (8–10 weeks)",
    startWeeks: 8,
    goal: "Being touched anywhere — paws held, ears checked, brush on coat, harness over head — predicts treats, not restraint.",
    img: TRAINING_IMGS.handling,
    imgAlt: "Gouache sketch of a Cavoodle puppy relaxing belly-up in a person's lap while they gently hold one paw",
    steps: [
      {
        title: "One minute a day, treats constant",
        text: "Touch a paw → treat. Lift an ear flap → treat. Touch the muzzle, tail, collar → treat each. Stop before he squirms; end on a win.",
      },
      {
        title: "Introduce the tools as props",
        text: "Show the brush → treat. One brush stroke → treat. Same with the comb, nail clippers (just touching a nail at first), toothbrush and the harness ('Bump It' game: he bumps it with his nose → treat).",
      },
      {
        title: "Pair with real care, gently",
        text: "Graduate to 30-second real brush sessions and single nail tips. Keep the ratio heavily in favour of easy wins — a Cavoodle will be groomed roughly 1,000 hours over his life; this fortnight decides whether that's pleasant or a wrestle.",
      },
      {
        title: "Weekly harness dress-rehearsals",
        text: "Harness on, treats, wear it around the flat for 10 minutes, off. By the time real walks start (post-vaccination) the gear is old news.",
      },
    ],
    wobbles:
      "This skill is the bridge to the whole Grooming tab — his fleece coat means lifelong brushing, and Monday nail/ear rota only works if he was taught to enjoy handling now, during the socialisation window.",
    proTip: "The breeder's ENS + Puppy Culture start means Wobbles arrives pre-loaded with positive handling history. Don't spend it — keep investing.",
    trackerChoice: "Handling & cooperative care",
  },
  {
    slug: "sit",
    priority: 5,
    emoji: "🪑",
    title: "Sit — and 'sit to say please'",
    short: "First cue + built-in impulse control before meals and play",
    startWhen: "Week 1 home (8–9 weeks)",
    startWeeks: 8,
    goal: "A fast, happy sit on one cue — then sit becomes how Wobbles asks for everything (meals, doors, leash, play).",
    img: TRAINING_IMGS.sit,
    imgAlt: "Gouache sketch of a hand luring a treat in an arc over a Cavoodle puppy's nose into a sit",
    steps: [
      {
        title: "Lure the arc",
        text: "Treat at his nose, slowly arc your hand up and back over his head. As his nose follows, his bottom folds down — the moment it touches, 'Yes!' + treat.",
      },
      {
        title: "Fade the food, keep the hand",
        text: "After ~10 good reps, make the same arc with an empty hand; treat from the other hand. The gesture is now the cue.",
      },
      {
        title: "Add the word",
        text: "Say 'sit' just BEFORE the hand signal. Word → gesture → sit → reward. Soon the word alone works.",
      },
      {
        title: "Make sit the magic password",
        text: "Bowl goes up → he sits → bowl goes down (lifting again if he breaks). Sit before the leash clips on, before doors open, before play starts. Impulse control without a single 'no'.",
      },
    ],
    wobbles: "Never push his bottom down — toy-breed joints are tiny, and luring teaches him to think rather than be posed.",
    proTip: "Train right before meals with his own kibble: hungry puppy = laser focus, and no extra calories on a toy-sized frame.",
    trackerChoice: "Sit / down",
  },
  {
    slug: "recall",
    priority: 6,
    emoji: "📣",
    title: "Recall — 'come'",
    short: "The lifetime safety skill; start indoors, day one week two",
    startWhen: "Week 1–2 home (8–10 weeks)",
    startWeeks: 9,
    goal: "'Wobbles, come!' beats squirrels, other dogs and interesting smells — because coming to you has never once been a bad deal.",
    img: TRAINING_IMGS.recall,
    imgAlt: "Gouache sketch of a person crouched with open arms as a Cavoodle puppy runs joyfully toward them",
    steps: [
      {
        title: "Start at silly-easy range",
        text: "Two metres away, crouch, arms open, one bright 'Wobbles, come!' — he'll come because you're the most interesting thing in the room. Jackpot: 3 treats, one after another, plus praise.",
      },
      {
        title: "The hallway relay",
        text: "Marcus at one end, Chesa at the other. Call him back and forth, treating each arrival. The best two-person recall game there is — and it drains puppy energy on rainy days.",
      },
      {
        title: "Hide-and-seek upgrade",
        text: "One person gently holds him, the other hides behind a door and calls once. Finding you = party. Builds recall AND makes humans the best game in the flat.",
      },
      {
        title: "Never poison the cue",
        text: "NEVER call him to something he dislikes (nail trims, crate-and-leave, telling off). Go and get him for those. 'Come' must mean only wonderful things, forever.",
      },
      {
        title: "Take it outside on a long line",
        text: "Post-vaccination: void deck, then the park, on a 5m long line. Pay every single recall outdoors for the first year — Singapore parks are full of better offers than you.",
      },
    ],
    wobbles: "Off-leash reliability is a 12–18 month project; the dog run at Woodlands Waterfront is the graduation exam, not the classroom.",
    proTip: "Keep a 'recall-only' treat (something spectacular, like freeze-dried liver) that appears for nothing else.",
    trackerChoice: "Recall ('come')",
  },
  {
    slug: "social",
    priority: 7,
    emoji: "🌏",
    title: "Socialisation sprint",
    short: "The 8–16 week window: carry-socialising Woodlands before vaccines finish",
    startWhen: "Immediately — window closes ~16 Oct 2026",
    startWeeks: 8,
    goal: "By 16 weeks, Wobbles has calmly experienced the sounds, surfaces, people and sights of his world — so adult Wobbles finds nothing scary.",
    img: TRAINING_IMGS.social,
    imgAlt: "Gouache sketch of a person carrying a Cavoodle puppy in their arms while it watches a busy Singapore street",
    steps: [
      {
        title: "Carry, don't ground",
        text: "Pre-vaccination he can see everything from your arms or a carrier: lift lobbies, void decks, the wet market's edge, bus stops, school-run crowds, thunderstorms from the window. Zero paw-on-ground risk, full brain download.",
      },
      {
        title: "One new thing a day",
        text: "Umbrellas, brooms, wheelchairs, helmets, kids' scooters, the MRT rumble, hawker-centre clatter (from a distance). Pair every novelty with treats; let him look as long as he wants.",
      },
      {
        title: "People of all kinds",
        text: "Men with beards, aunties with trolleys, uniformed neighbours, toddlers (visual only at first). He chooses whether to approach — never pass him around a circle of hands.",
      },
      {
        title: "Sound library on rainy days",
        text: "Play recordings quietly (fireworks, garbage trucks, construction, thunder) during meals, raising the volume across days. Singapore is loud; pre-load it now.",
      },
      {
        title: "Calm dogs only, post-second-vaccine",
        text: "One-on-one meetings with known, vaccinated, gentle adult dogs in a clean space beat ten chaotic dog-run ambushes. Watch his body language: curved, loose, wagging = good.",
      },
    ],
    wobbles:
      "Wobbles lands in Singapore right at the tail of his window — the Woodlands lobby-bench sessions and 7pm park-edge watching aren't optional extras, they're the syllabus. The '100 Things' checklist in this app IS his socialisation scorecard.",
    proTip: "Fearful moment? Add distance, feed, retreat, retry smaller another day. One bad scare teaches faster than ten good visits — protect him from being overwhelmed.",
    trackerChoice: "Handling & cooperative care",
  },
  {
    slug: "confidence",
    priority: 8,
    emoji: "\ud83e\udee7",
    title: "Confidence Club (social anxiety)",
    short: "A dedicated day-one programme to melt away shyness before it sets",
    startWhen: "Day 1 home (8 weeks) \u2014 daily 5-minute sessions",
    startWeeks: 8,
    goal: "Wobbles learns that new people, sounds and places predict good things \u2014 and that he always has an exit \u2014 so early wariness never hardens into lifelong social anxiety.",
    img: TRAINING_IMGS.confidence,
    imgAlt: "Gouache sketch of a shy Cavoodle puppy peeking out from behind a person's legs while the person crouches and tosses a treat toward him",
    steps: [
      {
        title: "Read him before you train him",
        text: "Learn his worry signals first: tail tucked, ears pinned, crouching, freezing, lip-licking, yawning, refusing treats. A puppy showing these is in survival mode and literally cannot learn \u2014 your only job in that moment is to add distance and let him decompress. Never force him toward what scares him; being pushed 'through it' (flooding) makes fear worse, not better.",
      },
      {
        title: "The 3-day decompression bubble",
        text: "For his first 72 hours home, the flat IS the world: no visitors, no lift adventures, no meet-the-neighbours. Predictable meals, naps and one calm human nearby build the safety baseline every later session stands on. A puppy who feels safe at home base has somewhere to be brave FROM.",
      },
      {
        title: "Treat-toss greetings \u2014 he always approaches, never the reverse",
        text: "With every new person (start with one calm friend): they sit or crouch side-on, no eye contact, no reaching, and toss a treat toward Wobbles. He chooses whether to close the gap \u2014 each toss lands slightly closer. Only when HE initiates contact may they offer a chin or chest scratch (never over-the-head pats). His choice is the whole trick: dogs who approach on their own terms come back braver.",
      },
      {
        title: "'Look at that' \u2014 turn scary into a paycheck",
        text: "At a distance where he's curious-not-worried, let him LOOK at the trigger (a stranger, a skateboard, the lift doors), then mark 'Yes!' and treat the moment he looks. Repeat until seeing the scary thing makes him whip round to you for his pay. That's counter-conditioning: the trigger itself now predicts good things.",
      },
      {
        title: "Work the comfort-zone edge, one metre at a time",
        text: "Find the invisible line where loose-and-sniffy turns into tense-and-scanning \u2014 then train just INSIDE it. Feed, play, retreat, done. Sessions of 2\u20135 minutes, always ending while he's still comfortable. The zone grows on its own; pushing past it shrinks it. If he stops taking treats, you're already too close \u2014 back up.",
      },
      {
        title: "Give him the steering wheel",
        text: "On lobby-bench and corridor outings, pause at decision points and let him choose the direction: he looks left, you go left. Puppies who feel like participants instead of passengers gain confidence dramatically faster \u2014 tiny doses of control are the antidote to anxiety.",
      },
      {
        title: "Confidence through the body: wobble work & sniffing games",
        text: "Fitting for a puppy named Wobbles: cushions, folded towels, a wobbly sofa cushion to climb over, cardboard boxes to explore, treats scattered in a snuffle mat or rolled towel. Conquering small physical puzzles and using his nose are proven general confidence builders \u2014 and perfect rainy-day sessions.",
      },
      {
        title: "Retreat is always allowed \u2014 and always rewarded",
        text: "If he startles: add distance calmly, scatter a few treats to lower his head and heart rate, and end the outing on an easy win near home. Comforting a scared puppy does NOT reinforce fear \u2014 that's a myth. One overwhelming scare teaches faster than ten good visits, so guard him from being flooded.",
      },
    ],
    wobbles:
      "Cavaliers lean velcro-soft and poodles lean sensitive \u2014 so a Cavoodle's shyness responds beautifully to this programme but punishes any forcing. Wobbles' syllabus: day 1\u20133 flat-only bubble, week 1 lobby bench with treat-toss strangers at a distance, week 2 void deck 'look at that' sessions, week 3+ one calm visitor at a time into the flat. If wariness ever escalates (growling at all strangers, refusing food outdoors for days), loop in a force-free trainer early \u2014 weeks 8\u201316 are the cheapest time to fix it.",
    proTip:
      "Keep a 'brave list' in the Training Log: every session, note ONE thing he handled calmly. On the inevitable wobbly day, the list is your proof that the graph points up \u2014 progress with fearful puppies is measured in weeks, not walks.",
    trackerChoice: "Confidence building",
  },
  {
    slug: "bite",
    priority: 9,
    emoji: "🦷",
    title: "Bite inhibition & polite play",
    short: "Teeth on toys, never skin — plus 'drop it' before he's big enough to argue",
    startWhen: "From day 1; peaks during teething (12–24 weeks)",
    startWeeks: 8,
    goal: "Wobbles learns human skin is off-limits, mouths softly if ever, and trades anything in his mouth for a better offer.",
    img: TRAINING_IMGS.bite,
    imgAlt: "Gouache sketch of a Cavoodle puppy chewing a rope toy offered by a hand instead of fingers",
    steps: [
      {
        title: "Redirect every nip",
        text: "Teeth touch skin → calm 'ouch', hands go still and boring, a chew toy appears. The game continues on the toy. Never jerk hands away (that's prey-drive fun) and never play rough with bare hands.",
      },
      {
        title: "End the game if he persists",
        text: "Second nip in a row → you stand up and disengage for 30 seconds. The lesson: teeth on skin makes the fun stop. No yelling — just consequences.",
      },
      {
        title: "Teach 'drop it' as a trade",
        text: "He has a toy → show a treat → the moment his mouth opens, say 'drop it', treat, and GIVE THE TOY BACK. Dropping things means bonus + toy returns; he'll never learn to guard.",
      },
      {
        title: "Teach 'leave it' for the floor",
        text: "Treat under your shoe → he noses at it → the instant he backs off, 'leave it', and pay from your HAND (never the floor one). Life-saving on Singapore pavements full of chicken bones.",
      },
      {
        title: "Manage teething",
        text: "Frozen KONGs, soaked-frozen kibble, chilled carrot ends, rotating chew textures. A puppy with sore gums who lacks legal chews will invent illegal ones.",
      },
    ],
    wobbles: "Cavoodle puppies are mouthy but soft. The 'ouch + disengage' routine works fast IF both humans are consistent — one person allowing hand-wrestling undoes it all.",
    proTip: "Nipping spikes when he's overtired. Witching-hour zoomies + piranha mode at 9pm usually means 'put me to bed', not 'train me harder'.",
    trackerChoice: "Leave it / drop it",
  },
  {
    slug: "leash",
    priority: 10,
    emoji: "🦮",
    title: "Loose-leash walking",
    short: "The J-shaped leash: gear desensitisation now, real walks post-vaccination",
    startWhen: "Gear from week 1; street walks from ~18 weeks",
    startWeeks: 10,
    goal: "Wobbles walks beside you on a slack, J-shaped leash — because pulling has never once worked.",
    img: TRAINING_IMGS.leash,
    imgAlt: "Gouache sketch of a Cavoodle puppy walking at heel with a relaxed J-shaped leash",
    steps: [
      {
        title: "Gear becomes furniture first",
        text: "Harness on with treats, worn around the flat in 10-minute stints (see Handling). Then clip the leash and let him drag it supervised — no hands yet, no pressure.",
      },
      {
        title: "Follow-me in the flat",
        text: "Leash in hand, treat at your seam (left trouser leg). Step, treat at your side. Step-step, treat. The corridor is your first training street.",
      },
      {
        title: "Be a tree when it tightens",
        text: "Leash goes taut → you stop instantly, silent. The moment it slackens (he turns, steps back), 'Yes!', treat at your side, walk on. Pulling = world stops; slack = world moves.",
      },
      {
        title: "Pay the position, not the pace",
        text: "Random treats whenever he's in the magic zone beside you. High rate at first (every 2–3 steps), thinning out over weeks.",
      },
      {
        title: "Sniffing is the walk",
        text: "A puppy walk is a sniffari, not a march. Use a cue like 'go sniff' as a reward itself. Distance goals come later — a 15-minute sniff-heavy loop beats a 45-minute drag.",
      },
    ],
    wobbles:
      "Route one is already scouted: lift → block grass → park next door, 7:15am before the heat. Front-clip harness, never a collar-jerk — toy-breed tracheas are fragile.",
    proTip: "In Singapore heat, the 5-second rule: back of your hand on the pavement — if you can't hold 5 seconds, it burns paws. Walk before 9am or after 6pm.",
    trackerChoice: "Loose-lead walking",
  },
  {
    slug: "stay",
    priority: 11,
    emoji: "🧘",
    title: "Down, stay & settle on mat",
    short: "The calm-is-a-skill trio for weeks 10–16",
    startWhen: "Weeks 10–16",
    startWeeks: 10,
    goal: "Wobbles can lie down on cue, hold position while life happens, and park himself on a mat while humans eat, work or order coffee.",
    img: TRAINING_IMGS.stay,
    imgAlt: "Gouache sketch of a Cavoodle puppy lying calmly on a small mat while a person holds up a gentle stay hand signal",
    steps: [
      {
        title: "Down from a sit",
        text: "From sit, lure the treat from his nose straight down between his paws, then slowly drag it forward along the floor — elbows drop, 'Yes!', pay on the floor between his paws.",
      },
      {
        title: "Stay = 3 Ds, one at a time",
        text: "Duration first (1s → 5s → 20s), then Distance (one step back, return, pay), then Distraction (toy dropped nearby). Raise ONE D at a time; return to HIM to pay — never call him out of a stay early on.",
      },
      {
        title: "The release word ends it",
        text: "'Okay!' releases; nothing else does. If he breaks early, no drama — reset easier and win.",
      },
      {
        title: "Mat = magnet",
        text: "A distinct mat appears → treats rain on it. Shape lying on it, add 'go to mat', then feed calm slowly: every voluntary chin-down on the mat while you work earns a quiet treat.",
      },
      {
        title: "Take the mat on tour",
        text: "The same mat goes to the void-deck bench, then a pet-friendly café. Ten calm minutes under a table is a Singapore superpower.",
      },
    ],
    wobbles: "Settle-on-mat is the WFH saviour: he learns 'humans at laptops = nap time on my mat', which makes hybrid weeks vastly easier.",
    proTip: "Capture calm all day: any time he chooses to lie quietly, a treat silently appears between his paws. What gets rewarded gets repeated.",
    trackerChoice: "Settle on mat",
  },
  {
    slug: "tricks",
    priority: 12,
    emoji: "🎪",
    title: "Fun tricks",
    short: "Touch, paw, spin, roll over — dessert after the vegetables",
    startWhen: "Any time after basics (12+ weeks)",
    startWeeks: 12,
    goal: "One party trick a month. Tricks are 'just training' to him — pure bonding, brain-drain, and excellent wet-weather enrichment.",
    img: TRAINING_IMGS.tricks,
    imgAlt: "Gouache sketch of a Cavoodle puppy giving a high-five paw to a person's open hand",
    steps: [
      {
        title: "Touch (hand target) first",
        text: "Palm out near his nose → curiosity makes him boop it → 'Yes!' + treat. Touch is secretly useful: it repositions him anywhere, doubles as a recall, and greets strangers politely.",
      },
      {
        title: "Paw / shake",
        text: "Treat in closed fist at floor level → he paws at it → mark the paw-lift, pay. Add the cue once the paw is reliable.",
      },
      {
        title: "Spin",
        text: "Lure a slow circle with a treat at nose height, 'Yes!' on completion. Both directions — 'spin' and 'twirl'.",
      },
      {
        title: "Roll over — only on soft ground",
        text: "From down, lure the nose toward his shoulder blade so he rocks onto a hip, then continue the arc over. Break it into quarters; some dogs take a week per quarter.",
      },
      {
        title: "Three 2-minute sessions beat one long one",
        text: "The 'trick of the week' rhythm from the Home ideas rotation: tiny sessions, end on a win, film the milestones for Memories.",
      },
    ],
    wobbles: "Cavoodles are poodle-smart and Cavalier-soft: they learn tricks fast and wilt under frustration. If he's stuck, the step is too big — always his teacher's fault, never his.",
    proTip: "Tricks make brilliant vet-visit and groomer icebreakers — a puppy doing 'touch' on the scale is a puppy not worrying about the scale.",
    trackerChoice: "Tricks / fun",
  },
];

/** Skill status relative to Wobbles' age in weeks */
export function skillStatus(skill: TrainingSkill, ageWeeks: number): "now" | "soon" | "later" {
  if (ageWeeks >= skill.startWeeks) return "now";
  if (skill.startWeeks - ageWeeks <= 2) return "soon";
  return "later";
}

/** Golden rules shown at the top of the Training tab */
export const TRAINING_RULES: string[] = [
  "Sessions are 3–5 minutes, 2–3 times a day — a puppy's attention is a budget, not a bottomless well.",
  "Train before meals with his own kibble: focus up, calories controlled.",
  "Mark the exact moment ('Yes!') then pay within 2 seconds — timing is the whole game.",
  "Never punish, never yell: it only teaches him to fear you (and to hide the behaviour better).",
  "If he fails twice in a row, the step is too big. Make it easier, win, climb again.",
  "End every session on a win, even a gimme — training must stay his favourite game.",
  "One cue, one meaning, both humans: agree the exact words at the cue-word summit and stick to them.",
];
