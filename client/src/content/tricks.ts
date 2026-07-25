/*
 * Trick library for the Journey tab.
 * Each trick has a gouache illustration, difficulty, step-by-step guide, and
 * matching rules that link it to Training Log entries so practice sessions
 * count toward the trick's "times practiced" counter.
 *
 * Matching: an entry counts for a trick when
 *   entry.option === trick exact match string (one of matchOptions), OR
 *   entry.note contains one of the trick's keywords (case-insensitive).
 */

export type TrickLevel = "foundation" | "core" | "party";

export interface Trick {
  id: string;
  name: string;
  emoji: string;
  level: TrickLevel;
  image: string;
  tagline: string;
  why: string;
  /** Training Log `option` values that count toward this trick */
  matchOptions: string[];
  /** Lowercase keywords matched against entry notes */
  keywords: string[];
  /** Rough age to start */
  startAge: string;
  /** Session length guidance */
  sessionLength: string;
  steps: { title: string; detail: string }[];
  proTip: string;
}

export const TRICKS: Trick[] = [
  {
    id: "sit",
    name: "Sit",
    emoji: "🪑",
    level: "foundation",
    image: "/manus-storage/trick-sit_40edf2a7.png",
    tagline: "The polite default position",
    why: "Sit is Wobbles' first 'please'. Once it's solid, he can offer it instead of jumping, mugging for food, or bolting out doors — it becomes his way of asking nicely for everything.",
    matchOptions: ["Sit / down"],
    keywords: ["sit"],
    startAge: "From 8 weeks — he can learn this the first week home",
    sessionLength: "2–3 minutes, 2–3 times a day",
    steps: [
      {
        title: "Lure the nose up",
        detail: "Hold a treat right at his nose, then move it slowly up and slightly back over his head. As his nose follows, his bottom naturally folds to the floor.",
      },
      {
        title: "Mark the moment",
        detail: "The instant his bottom touches, say 'yes!' warmly and give the treat. Timing matters more than anything — the treat should arrive within a second.",
      },
      {
        title: "Fade the lure",
        detail: "After a few wins, make the same hand motion with an empty hand. Treat from the other hand when he sits. Now the gesture is the cue.",
      },
      {
        title: "Add the word",
        detail: "Say 'sit' just before the hand signal. After a dozen reps he'll beat you to it on the word alone. Practise in new rooms, then outside.",
      },
    ],
    proTip: "Never push his bottom down — puppies push back by instinct. Let the lure do the work.",
  },
  {
    id: "down",
    name: "Down",
    emoji: "⬇️",
    level: "foundation",
    image: "/manus-storage/trick-down_8724bcfb.png",
    tagline: "Settle into a calm lie-down",
    why: "Down is the gateway to calm. A puppy who can hold a down can wait at cafés, relax during dinner, and switch off when the household is busy.",
    matchOptions: ["Sit / down"],
    keywords: ["down", "lie"],
    startAge: "From 9–10 weeks, once sit is reliable",
    sessionLength: "3 minutes, ideally when he's slightly tired",
    steps: [
      {
        title: "Start from a sit",
        detail: "With Wobbles sitting, hold a treat at his nose and slowly draw it straight down to the floor between his front paws.",
      },
      {
        title: "Draw it forward",
        detail: "When the treat reaches the floor, drag it slowly away from him along the ground. His elbows will follow it down into a sphinx position.",
      },
      {
        title: "Mark and release",
        detail: "The moment his elbows touch, 'yes!' and treat on the floor between his paws — feeding low keeps him down.",
      },
      {
        title: "Name it and build duration",
        detail: "Add the word 'down', then start counting a beat or two before treating. Feed several treats in a row while he stays down to teach that staying put pays.",
      },
    ],
    proTip: "If he pops up or stands instead, try luring under your bent knee so he has to crouch — then mark that.",
  },
  {
    id: "recall",
    name: "Come (Recall)",
    emoji: "📣",
    level: "foundation",
    image: "/manus-storage/trick-recall_19008b50.png",
    tagline: "The cue that can save his life",
    why: "A rock-solid recall is the single most important thing Wobbles will ever learn — it's what lets him have off-lead freedom safely, and it can genuinely save his life near roads.",
    matchOptions: ["Recall ('come')"],
    keywords: ["recall", "come"],
    startAge: "From day one home — start indoors at 2 metres",
    sessionLength: "1–2 minutes, sprinkled through the day",
    steps: [
      {
        title: "Make his name golden",
        detail: "Say 'Wobbles!' in a bright voice, and the instant he looks at you, mark and treat. His name should always predict good things, never trouble.",
      },
      {
        title: "Short happy recalls",
        detail: "Crouch, open your arms, call 'Wobbles, come!' in your happiest voice. When he arrives, throw a party — several treats fed one by one, plus praise.",
      },
      {
        title: "Ping-pong between people",
        detail: "Marcus and Chesa sit a few metres apart and take turns calling him. He learns that running to a person who called is the best game in the house.",
      },
      {
        title: "Add distance and distraction slowly",
        detail: "Hallway, then garden, then (after vaccines) quiet parks on a long line. Pay every single recall generously for the first year — no exceptions.",
      },
    ],
    proTip: "Never call him to something he dislikes (bath, nail trim, being left). Go and get him instead — protect the word.",
  },
  {
    id: "stay",
    name: "Stay",
    emoji: "✋",
    level: "core",
    image: "/manus-storage/trick-stay_52d30e21.png",
    tagline: "Patience in position",
    why: "Stay teaches impulse control — the puppy skill that transfers to everything: waiting at doors, staying calm at kerbs, and posing beautifully for photos.",
    matchOptions: [],
    keywords: ["stay", "wait"],
    startAge: "From 11–12 weeks, after sit and down are solid",
    sessionLength: "3 minutes, in a boring room first",
    steps: [
      {
        title: "One second wins",
        detail: "Ask for a sit, hold your palm out flat, wait one heartbeat, then mark and treat. That's a stay — tiny, but real.",
      },
      {
        title: "Build the three Ds separately",
        detail: "Duration first (count to 2, 3, 5…), then distance (one step back, return, treat), then distraction (a small toy wiggle). Only raise one D at a time.",
      },
      {
        title: "Always return to him",
        detail: "In early training, come back to Wobbles to deliver the treat rather than calling him out of the stay — it teaches him the stay itself is what pays.",
      },
      {
        title: "Release word",
        detail: "End every stay with a clear 'free!' so he learns the difference between 'still working' and 'all done'.",
      },
    ],
    proTip: "If he breaks the stay twice in a row, you've asked for too much. Halve the difficulty and rebuild.",
  },
  {
    id: "touch",
    name: "Touch",
    emoji: "👆",
    level: "core",
    image: "/manus-storage/trick-touch_a21ce00b.png",
    tagline: "Nose-to-hand target",
    why: "Touch is the Swiss army knife of tricks: it repositions him without grabbing, redirects him from trouble, builds recall, and becomes the foundation for spin, heel and fancy tricks later.",
    matchOptions: [],
    keywords: ["touch", "target", "boop"],
    startAge: "From 9 weeks — most puppies get this in one session",
    sessionLength: "2 minutes",
    steps: [
      {
        title: "Present the palm",
        detail: "Hold your flat palm a few centimetres from his nose, fingers down. Most puppies investigate instantly — the moment his nose touches, mark and treat.",
      },
      {
        title: "Move it around",
        detail: "Offer the palm left, right, low, high. He learns to seek the hand wherever it appears.",
      },
      {
        title: "Add the cue",
        detail: "Say 'touch' just before presenting the hand. Treat every success from the other hand.",
      },
      {
        title: "Use it in real life",
        detail: "Use touch to call him off the couch, guide him onto the scale at the vet, or turn him away from something he shouldn't have — all without any pulling.",
      },
    ],
    proTip: "Rub a little treat smell on your palm for the very first rep if he seems unsure.",
  },
  {
    id: "leaveit",
    name: "Leave It",
    emoji: "🚫",
    level: "core",
    image: "/manus-storage/trick-leaveit_dbcfee5e.png",
    tagline: "Self-control around temptation",
    why: "Singapore footpaths are full of chicken bones and mystery snacks. 'Leave it' is the cue that keeps dropped medication, toxic food and gross finds out of his mouth.",
    matchOptions: ["Leave it / drop it"],
    keywords: ["leave it", "leave-it"],
    startAge: "From 10–11 weeks",
    sessionLength: "3 minutes",
    steps: [
      {
        title: "The closed fist game",
        detail: "Hold a treat inside your closed fist and let him lick and paw at it. Say nothing. The instant he backs off — even slightly — mark and treat from the OTHER hand.",
      },
      {
        title: "Open hand",
        detail: "Show the treat on your open palm. If he lunges, close your fist. When he holds back, mark and reward from the other hand. He never gets the 'leave it' treat itself.",
      },
      {
        title: "To the floor",
        detail: "Place the treat on the floor under your hovering hand. Same rule: backing off earns a better treat from you.",
      },
      {
        title: "Add the cue and walk-bys",
        detail: "Say 'leave it' as you present the temptation. Graduate to walking past treats on lead — mark every voluntary head-turn away.",
      },
    ],
    proTip: "Always pay 'leave it' with something better than what he left. He's learning that ignoring treasure makes treasure appear.",
  },
  {
    id: "dropit",
    name: "Drop It",
    emoji: "🎾",
    level: "core",
    image: "/manus-storage/trick-dropit_ef9cd6e3.png",
    tagline: "Give things up happily",
    why: "Puppies grab everything. A cheerful 'drop it' means no chasing him around the flat for a sock, and no resource guarding — he learns giving things up is a trade, not a loss.",
    matchOptions: ["Leave it / drop it"],
    keywords: ["drop", "give", "swap"],
    startAge: "From 10 weeks, during play",
    sessionLength: "Fold it into every tug or fetch session",
    steps: [
      {
        title: "Trade, don't take",
        detail: "While he holds a toy, present a treat at his nose. When he opens his mouth to take it, say 'drop' and let the toy fall into your hand.",
      },
      {
        title: "Give the toy back",
        detail: "This is the secret: after he drops, return the toy most of the time. He learns dropping doesn't end the fun — it continues it.",
      },
      {
        title: "Two-toy fetch",
        detail: "Throw one toy; when he returns, produce an identical one and get excited about it. He drops the first to chase the second. Say 'drop' as he releases.",
      },
      {
        title: "Fade the visible trade",
        detail: "Ask for the drop with an empty hand, then reward from your pocket or with the toy throw itself.",
      },
    ],
    proTip: "Never chase him or prise his mouth open — that teaches keep-away. Boring statue + great trades wins every time.",
  },
  {
    id: "paw",
    name: "Shake / Paw",
    emoji: "🐾",
    level: "party",
    image: "/manus-storage/trick-paw_b1a08076.png",
    tagline: "The classic crowd-pleaser",
    why: "Beyond the cuteness, paw builds handling tolerance — a puppy who happily offers his paw makes nail trims, paw wipes after walks, and vet exams far easier.",
    matchOptions: ["Handling & cooperative care"],
    keywords: ["paw", "shake"],
    startAge: "From 11–12 weeks",
    sessionLength: "2 minutes",
    steps: [
      {
        title: "Hide a treat in your fist",
        detail: "Hold a closed fist with a treat at his chest height while he sits. Most puppies will paw at it when sniffing fails.",
      },
      {
        title: "Mark the paw lift",
        detail: "The instant his paw touches your hand, mark and open the fist. If he only noses it, wait — patience gets the paw.",
      },
      {
        title: "Switch to an open palm",
        detail: "Offer a flat, open palm. Mark the moment his paw lands on it. Add the word 'shake' just before offering the hand.",
      },
      {
        title: "Hold gently, then release",
        detail: "Cup his paw softly for a second before treating, gradually adding a gentle up-down shake. Keep it light — never grip.",
      },
    ],
    proTip: "Teach both paws with different cues ('shake' / 'other one') for double the party value.",
  },
  {
    id: "spin",
    name: "Spin",
    emoji: "🌀",
    level: "party",
    image: "/manus-storage/trick-spin_1655d662.png",
    tagline: "A happy twirl on cue",
    why: "Spin is pure joy and great body awareness for a growing puppy — it stretches his spine, builds rear-end coordination, and looks adorable before dinner.",
    matchOptions: ["Tricks / fun"],
    keywords: ["spin", "twirl"],
    startAge: "From 12 weeks",
    sessionLength: "2 minutes, on a non-slip surface",
    steps: [
      {
        title: "Lure a big slow circle",
        detail: "Hold a treat at nose height and draw a wide, flat circle parallel to the floor. His nose follows, his body follows his nose.",
      },
      {
        title: "Mark the full rotation",
        detail: "Treat when he completes the whole circle. If he loses the lure halfway, slow down and make the circle wider.",
      },
      {
        title: "Shrink the gesture",
        detail: "Over sessions, make the hand circle smaller and higher until a little finger-twirl is enough.",
      },
      {
        title: "Add the word",
        detail: "Say 'spin' before the gesture. Teach the opposite direction as 'twirl' for bonus style.",
      },
    ],
    proTip: "Always practise on grippy flooring — spinning on tiles is hard on puppy joints.",
  },
  {
    id: "rollover",
    name: "Roll Over",
    emoji: "🔄",
    level: "party",
    image: "/manus-storage/trick-rollover_8b6b0963.png",
    tagline: "The full tumble",
    why: "Roll over builds trust — a puppy who happily flips onto his back near you is a confident puppy. It also makes belly checks and grooming much easier.",
    matchOptions: ["Tricks / fun"],
    keywords: ["roll"],
    startAge: "From 13–14 weeks, once down is easy",
    sessionLength: "3 minutes on a soft surface",
    steps: [
      {
        title: "Start in a down",
        detail: "With Wobbles lying down, hold a treat at his nose and slowly curve it toward his shoulder blade. His head turns, his weight shifts onto one hip.",
      },
      {
        title: "Reward the hip roll",
        detail: "Mark and treat the hip-shift several times before asking for more. This half-roll is the hard part.",
      },
      {
        title: "Continue the arc",
        detail: "Next, keep the lure moving over his spine so he rolls onto his back and over to the other side. Big mark, jackpot of treats.",
      },
      {
        title: "Smooth it out",
        detail: "Chain it into one fluid motion, add the cue 'roll over', then shrink the lure into a rolling finger gesture.",
      },
    ],
    proTip: "Practise after exercise when he's relaxed — a wound-up puppy would rather bounce than roll.",
  },
  {
    id: "mat",
    name: "Settle on Mat",
    emoji: "🛏️",
    level: "core",
    image: "/manus-storage/trick-mat_3ade070a.png",
    tagline: "His portable off-switch",
    why: "'Go to your mat' gives Wobbles a job when the doorbell rings, guests arrive, or you're eating. The mat travels — cafés, friends' homes, the vet waiting room — and calm comes with it.",
    matchOptions: ["Settle on mat"],
    keywords: ["mat", "settle", "place", "bed"],
    startAge: "From 10 weeks",
    sessionLength: "5 minutes, plus passive rewards all day",
    steps: [
      {
        title: "Make the mat magic",
        detail: "Put the mat down and quietly drop a treat on it whenever he steps on. Say nothing — let him discover that the mat rains snacks.",
      },
      {
        title: "Reward the down",
        detail: "Once he beelines to the mat, wait for a sit or down before treating. Feed several treats in a row between his paws for lying calmly.",
      },
      {
        title: "Add the cue and duration",
        detail: "Say 'on your mat' as he heads there. Slowly stretch the time between treats, and reward extra for a relaxed hip-roll or chin-down.",
      },
      {
        title: "Proof it around life",
        detail: "Practise while you cook, watch TV, and eventually while the doorbell rings. Catch him settling there on his own? Quiet treat, every time.",
      },
    ],
    proTip: "A licky mat or long-lasting chew on the mat during your dinner builds the habit without any training effort.",
  },
  {
    id: "heel",
    name: "Loose-Lead Walking",
    emoji: "🚶",
    level: "core",
    image: "/manus-storage/trick-heel_2c38548f.png",
    tagline: "Walks that are a pleasure",
    why: "A Cavoodle who walks on a loose lead gets more walks, more adventures and more freedom — pulling is the number one reason dogs get walked less. Start before bad habits start.",
    matchOptions: ["Loose-lead walking"],
    keywords: ["heel", "lead", "leash", "walk"],
    startAge: "Indoors from 10 weeks; outside after vaccinations",
    sessionLength: "5 minutes indoors; every walk is practice later",
    steps: [
      {
        title: "Charge the position",
        detail: "Stand still with Wobbles at your left side. Mark and treat at your trouser seam. That spot next to your leg becomes the best place in the world.",
      },
      {
        title: "One step, treat",
        detail: "Take one step; if he comes along with slack in the lead, mark and treat at the seam. Build to two steps, then five, then ten.",
      },
      {
        title: "Be a tree when it tightens",
        detail: "The moment the lead goes tight, stop dead. Wait for slack (he'll look back), mark it, and walk on. Pulling never works; slack always does.",
      },
      {
        title: "Add the world",
        detail: "Once vaccinated, repeat the process outside where sniffs compete with you. Pay generously — a good walking habit at 4 months lasts a lifetime.",
      },
    ],
    proTip: "Let him sniff as the reward: slack lead → 'go sniff!' release. Sniffing is puppy currency.",
  },
];

export function getTrick(id: string): Trick | undefined {
  return TRICKS.find((t) => t.id === id);
}

/** Minimal entry shape needed for practice counting (matches SyncedEntry). */
export interface PracticeEntry {
  option?: string | null;
  note?: string | null;
}

/**
 * Count Training Log entries that match a trick, via exact option match or
 * note keyword match (case-insensitive). An entry counts at most once.
 */
export function practiceCount(trick: Trick, entries: PracticeEntry[]): number {
  return entries.filter((e) => entryMatchesTrick(trick, e)).length;
}

export function entryMatchesTrick(trick: Trick, e: PracticeEntry): boolean {
  const opt = (e.option ?? "").trim();
  if (opt && (trick.matchOptions.includes(opt) || opt === trick.name)) return true;
  const note = (e.note ?? "").toLowerCase();
  if (note && trick.keywords.some((k) => note.includes(k))) return true;
  return false;
}
