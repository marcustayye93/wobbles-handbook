/*
 * Storybook Picture-Book theme — tracker definitions & shared storage.
 * Each tracker stores an array of entries (newest first) under "wobbles:tracker:<id>".
 */
// (storage moved to server — see hooks/useSyncedData.ts)

export interface TrackerEntry {
  id: string; // unique id
  date: string; // ISO yyyy-mm-dd
  time?: string; // hh:mm
  value?: number; // numeric value (weight kg, bristol type…)
  option?: string; // chosen preset option
  note?: string;
}

export type TrackerGroup = "daily" | "health" | "growing";

export interface TrackerMeta {
  id: string;
  title: string;
  emoji: string;
  group: TrackerGroup;
  empty: string;
  intro: string;
  /** which fields the add-form shows */
  fields: {
    time?: boolean;
    value?: { label: string; unit: string; min: number; max: number; step: number };
    options?: { label: string; choices: string[] };
    note?: boolean;
  };
  /** show a line chart of value over time */
  chart?: { label: string; unit: string };
  /** contextual guidance shown under the log */
  tips: string[];
}

export const TRACKERS: TrackerMeta[] = [
  {
    id: "weight",
    title: "Weight",
    emoji: "⚖️",
    group: "health",
    empty: "Weekly weigh-ins",
    intro:
      "Weigh weekly as a puppy (hold him on bathroom scales, subtract yourself), then monthly as an adult. Toy Cavoodles typically land at 5–8 kg full-grown; Wobbles is predicted ≈8 kg.",
    fields: {
      value: { label: "Weight", unit: "kg", min: 0.2, max: 20, step: 0.05 },
      note: true,
    },
    chart: { label: "Weight", unit: "kg" },
    tips: [
      "A puppy should gain steadily every week — a plateau or loss of more than a few days is a vet call.",
      "Rule of thumb: many toy/small breeds sit near half their adult weight around 4–5 months, but growth curves vary — the trend matters more than any single number.",
      "Sudden weight GAIN in an adult usually means treats have crept up — recount the daily calories, including training treats.",
    ],
  },
  {
    id: "feeding",
    title: "Feeding",
    emoji: "🍽️",
    group: "daily",
    empty: "Meals & amounts",
    intro:
      "Puppies eat 3–4 small meals a day until ~6 months, then 2. Log meals in the first weeks to spot appetite dips early — a puppy skipping two meals in a row needs a vet call.",
    fields: {
      time: true,
      options: { label: "Meal", choices: ["Breakfast", "Lunch", "Dinner", "Snack / training treats"] },
      value: { label: "Amount", unit: "g", min: 5, max: 500, step: 5 },
      note: true,
    },
    tips: [
      "Keep him on the breeder's food for at least the first 1–2 weeks, then transition over 7–10 days if changing.",
      "Feed to body condition, not the packet: you should feel ribs easily under a slight fat cover.",
      "Use part of the daily kibble ration as training treats so calories don't blow out.",
    ],
  },
  {
    id: "toilet",
    title: "Toilet",
    emoji: "🚽",
    group: "daily",
    empty: "Pad, outside & accidents",
    intro:
      "Apartment life at Blk 587 means two legal toilets: the pad at home and the grass outside. Log every wee and poo — pad or outside — plus any accidents, for the first 2–3 weeks. Patterns jump out (after meals, after naps, after play) and you'll pre-empt instead of clean up.",
    fields: {
      time: true,
      options: {
        label: "What happened",
        choices: ["Wee on pad ✅", "Wee outside ✅", "Poo on pad ✅", "Poo outside ✅", "Wee accident", "Poo accident"],
      },
      note: true,
    },
    tips: [
      "Pad AND outside both count as wins — reward within 2 seconds of finishing, at the spot, from your pocket.",
      "The 7:15am walk is the anchor: carry him straight from the crate to the lift to the grass — no floor time in between, or the wee happens in the lift lobby.",
      "Keep the pad in ONE fixed spot (service yard or bathroom works well in an HDB flat) — moving it resets his map.",
      "A young puppy needs a toilet break roughly every 30–60 minutes when awake, plus after every meal, nap and play session.",
      "Accidents are YOUR data, not his fault. Clean with enzymatic cleaner; never punish.",
    ],
  },
  {
    id: "stool",
    title: "Poo Quality",
    emoji: "💩",
    group: "health",
    empty: "Bristol-style scoring",
    intro:
      "Vets score dog poo 1–7: 1 = hard pellets, 2 = firm segmented (ideal), 3 = log with cracks (good), 4 = soft but formed, 5 = soft blobs, 6 = mushy, 7 = liquid. Log daily in the first month.",
    fields: {
      time: true,
      value: { label: "Score", unit: "/7", min: 1, max: 7, step: 1 },
      note: true,
    },
    chart: { label: "Poo score", unit: "/7" },
    tips: [
      "Score 2–3 is the target. One-off soft poo after a food change is normal; watery poo in a young puppy for >24h (or ANY blood/lethargy) is a same-day vet visit.",
      "Puppies are parvo-vulnerable until fully vaccinated — diarrhoea + lethargy + vomiting is an emergency.",
      "New treats, chews and scavenged snacks are the usual suspects behind sudden score changes.",
    ],
  },
  {
    id: "vaccines",
    title: "Health & Vaccines",
    emoji: "💉",
    group: "health",
    empty: "Shots, worming & vet visits",
    intro:
      "Australian puppies typically get C3 vaccines at ~6–8, 10–12 and 14–16 weeks, then annual boosters. Wobbles' first shot happens at the breeder before homecoming; log everything here for the Singapore paperwork later.",
    fields: {
      options: {
        label: "Event",
        choices: [
          "Vaccination (C3/C5)",
          "Worming dose",
          "Flea / tick / heartworm dose",
          "Vet check-up",
          "Vet visit (illness)",
          "Desexing",
          "Other",
        ],
      },
      note: true,
    },
    tips: [
      "Keep every vaccination certificate — AVS in Singapore wants the full history with the microchip number on each record.",
      "Puppy worming: typically every 2 weeks till 12 weeks, monthly till 6 months, then per vet advice.",
      "Book the 16-week shot the day you get him — that's the one that clears him for full public outings.",
    ],
  },
  {
    id: "social",
    title: "Socialisation",
    emoji: "🌏",
    group: "growing",
    empty: "New experiences log",
    intro:
      "The critical window closes around 12–16 weeks. Every calm, positive new experience now pays off for a decade. Aim for a few tiny novelties a day — carried in your arms is fine before full vaccination.",
    fields: {
      options: {
        label: "Category",
        choices: [
          "New person",
          "New dog / animal",
          "New sound",
          "New surface",
          "New place",
          "Handling / body touch",
          "Car / transport",
          "Weather / water",
        ],
      },
      note: true,
    },
    tips: [
      "Quality over quantity: one calm, treat-paired experience beats ten overwhelming ones.",
      "Watch his body language — if he's frozen, tucked or backing away, add distance and let him choose to approach.",
      "Pre-vaccination hack: carry him through a café strip, sit on a bench at a school pickup, play traffic sounds at low volume during dinner.",
    ],
  },
  {
    id: "grooming",
    title: "Grooming Log",
    emoji: "✂️",
    group: "daily",
    empty: "Brushing, baths & trims",
    intro:
      "Little and often wins: 2–3 minute brush sessions most days, a proper line-brush weekly, bath every 2–4 weeks, full groom every 4–6 weeks. Log it so 'I brushed him recently' meets reality.",
    fields: {
      options: {
        label: "Activity",
        choices: [
          "Quick brush (2–5 min)",
          "Full line brush",
          "Bath + blow dry",
          "Face / eye trim",
          "Nail trim",
          "Ear check / clean",
          "Full clip (home)",
          "Professional groom",
        ],
      },
      note: true,
    },
    tips: [
      "Always brush BEFORE a bath — water tightens existing mats into felt.",
      "Check the 5 mat hotspots every session: behind ears, armpits, collar line, inner thighs, tail base.",
      "During the 6–12 month coat change, daily brushing is the only thing standing between Wobbles and a shave-down.",
    ],
  },
  {
    id: "training",
    title: "Training Log",
    emoji: "🎓",
    group: "growing",
    empty: "Skills & sessions",
    intro:
      "Puppy attention spans are 3–5 minutes. Two or three micro-sessions a day beat one long one. Log what you worked on and how it went — progress is addictive once you can see it.",
    fields: {
      options: {
        label: "Skill",
        choices: [
          "Name response",
          "Sit / down",
          "Recall ('come')",
          "Crate training",
          "Loose-lead walking",
          "Leave it / drop it",
          "Handling & cooperative care",
          "Settle on mat",
          "Tricks / fun",
        ],
      },
      value: { label: "How did it go?", unit: "/5", min: 1, max: 5, step: 1 },
      note: true,
    },
    chart: { label: "Session rating", unit: "/5" },
    tips: [
      "End every session on a win — even an easy one — so training stays his favourite game.",
      "Train BEFORE meals, using part of his kibble ration: hungry puppies focus better and calories stay controlled.",
      "If he fails twice in a row, the step is too big. Make it easier, win, then climb again.",
    ],
  },
];

export function getTracker(id: string): TrackerMeta | undefined {
  return TRACKERS.find((t) => t.id === id);
}

/** Ordered groups for the hub: routine first, then health, then development. */
export const TRACKER_GROUPS: { id: TrackerGroup; title: string; blurb: string }[] = [
  { id: "daily", title: "Daily care", blurb: "The everyday routine" },
  { id: "health", title: "Health & vet", blurb: "Watch the trends" },
  { id: "growing", title: "Growing up", blurb: "Skills & experiences" },
];

// NOTE: useTrackerEntries now lives in hooks/useSyncedData.ts (server-backed).
