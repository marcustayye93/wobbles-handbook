/*
 * Caretaker's Guide to Wobbles — the handover template.
 *
 * This is the single document Marcus & Chesa pass to whoever is looking
 * after Wobbles while they travel. Wobbles LIVES AT THE CARETAKER'S HOUSE
 * during the stay (not visited at home), so the guide covers the full
 * day-to-day: safety, water, food, and at least one daily walk.
 *
 * Confirmed facts come from WOBBLES / household content. Anything not yet
 * decided is marked with the TBC constant so the page renders a clear
 * "To be confirmed" badge — fill these in before the first handover.
 */

export const TBC = "To be confirmed";

export function isTBC(value: string): boolean {
  return value === TBC;
}

/** A single labelled fact inside a section (renders label + value + TBC badge). */
export interface GuideItem {
  label: string;
  value: string;
  /** Optional extra guidance shown under the value in smaller text. */
  note?: string;
}

export interface GuideSection {
  id: string;
  emoji: string;
  title: string;
  /** One-line framing so the caretaker knows why the section matters. */
  intro: string;
  items: GuideItem[];
}

/** The caretaker's three non-negotiables, shown up top as a mission card. */
export const CORE_DUTIES: { emoji: string; title: string; text: string }[] = [
  {
    emoji: "🛡️",
    title: "Keep him safe",
    text: "Wobbles stays at your house for the stay. Keep doors, gates and balconies closed, keep anything chewable or toxic out of reach, and never leave him unsupervised outdoors.",
  },
  {
    emoji: "💧",
    title: "Water & food, always",
    text: "Fresh water available at all times (we provide the bowl). Feed his own kibble only — measured meals on his schedule, no human food, no other brands.",
  },
  {
    emoji: "🐾",
    title: "At least one walk a day",
    text: "Minimum one daily walk to burn energy — a tired Cavoodle is a well-behaved Cavoodle. Keep him on-leash at all times outside.",
  },
];

/** Everything we physically hand over with Wobbles. */
export interface HandoverItem {
  emoji: string;
  name: string;
  detail: string;
}

export const HANDOVER_KIT: HandoverItem[] = [
  {
    emoji: "📦",
    name: "IATA travel crate",
    detail:
      "His safe den — set it up in a quiet corner with the blanket inside. He sleeps in it and it doubles as his calm-down space. Never use it as punishment.",
  },
  {
    emoji: "🧻",
    name: "Pee pad",
    detail:
      "Place it in a fixed spot (near the door or bathroom). He is pad-trained — take him to it after waking, after meals and after play.",
  },
  {
    emoji: "🥣",
    name: "Food & water bowls",
    detail:
      "His own two bowls. Water bowl stays full and is rinsed daily; food bowl is measured per meal, not free-fed.",
  },
  {
    emoji: "🦴",
    name: "His kibble (pre-portioned)",
    detail:
      "Enough of his exact kibble for the whole stay, plus a buffer. Feed only this — sudden food changes upset a puppy's stomach.",
  },
];

/**
 * The structured handover sections. TBC values render a "To be confirmed"
 * badge on the page — replace them with real details before the handover.
 */
export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "profile",
    emoji: "🐶",
    title: "Meet Wobbles",
    intro: "The essentials about who you're looking after.",
    items: [
      { label: "Name", value: "Wobbles (pedigree name: Paddington)" },
      { label: "Breed", value: "Cavoodle (Cavalier King Charles Spaniel × Toy Poodle), toy size" },
      { label: "Born", value: "26 June 2026" },
      { label: "Sex", value: "Male" },
      { label: "Colour & coat", value: "Red parti (Blenheim) fleece coat — rich red patches on white" },
      { label: "Microchip number", value: TBC, note: "On his vaccination card — we'll fill this in after his microchipping at the breeder's vet." },
      { label: "AVS dog licence number", value: TBC, note: "Issued via PALS once he's licensed in Singapore." },
      { label: "Temperament notes", value: TBC, note: "We'll describe his personality, fears and quirks once we've lived with him." },
    ],
  },
  {
    id: "contacts",
    emoji: "📞",
    title: "Contacts & emergencies",
    intro: "Who to call, in order. Save these before we leave.",
    items: [
      { label: "Marcus (dad) — mobile / WhatsApp", value: TBC, note: "We answer WhatsApp even overseas — message anytime, day or night." },
      { label: "Chesa (mum) — mobile / WhatsApp", value: TBC },
      { label: "Our travel dates & destination", value: TBC, note: "So you know our timezone and when we're back." },
      { label: "Regular vet (clinic, address, phone)", value: TBC, note: "Will be his Woodlands clinic once registered after homecoming." },
      { label: "24-hour emergency vet", value: TBC, note: "Nearest after-hours animal hospital to YOUR home — we'll look this up together before the handover." },
      { label: "Backup local contact", value: TBC, note: "A nearby friend/family member who can help if you can't reach us." },
    ],
  },
  {
    id: "routine",
    emoji: "⏰",
    title: "Daily routine",
    intro: "Keep his day predictable — routine is what keeps a puppy settled in a new house.",
    items: [
      { label: "Morning", value: "Wake → straight to the pee pad → breakfast → short walk before it gets hot (around 7:15–7:30am at ours)." },
      { label: "Daytime", value: "Naps (puppies sleep 16–18 hours a day), water always available, pad breaks after every nap, meal and play session." },
      { label: "Evening", value: "Main walk after sunset (~7pm) — this is the energy-burner. Dinner after the walk." },
      { label: "Bedtime", value: "Last pad break, then he sleeps in his crate with the door closed. He may whine the first night — he settles.", note: "Exact bedtime: " + TBC },
      { label: "Alone time", value: TBC, note: "Maximum time he can be left alone at your place — depends on his age and training at the time of the stay." },
    ],
  },
  {
    id: "feeding",
    emoji: "🍽️",
    title: "Feeding",
    intro: "His kibble only. Measured meals, fresh water always.",
    items: [
      { label: "Kibble brand & formula", value: TBC, note: "The breeder confirms his exact kibble before export — we'll hand over a full supply, pre-portioned." },
      { label: "Meals per day", value: TBC, note: "Likely 3 meals/day as a young puppy, dropping to 2 as he grows — we'll confirm for the stay." },
      { label: "Portion per meal", value: TBC, note: "We'll include a scoop marked to the right level." },
      { label: "Meal times", value: TBC },
      { label: "Treats", value: "Only the treats we provide, and only a few a day (use part of his kibble ration for rewards where possible)." },
      { label: "Never feed", value: "Chocolate, grapes/raisins, onion, garlic, xylitol (sugar-free gum/sweets), cooked bones, alcohol, caffeine — and no table scraps, however much he begs." },
      { label: "Water", value: "Fresh water in his bowl at all times. Rinse and refill at least daily — more in hot weather." },
    ],
  },
  {
    id: "toilet",
    emoji: "🚽",
    title: "Toilet",
    intro: "He's pad-trained indoors and also goes on walks.",
    items: [
      { label: "Pad placement", value: "One fixed spot from day one — near a door or in the bathroom. Don't move it mid-stay." },
      { label: "When to take him", value: "Immediately after waking, ~10–20 minutes after each meal, after play sessions, and last thing at night." },
      { label: "Accidents", value: "Never scold — just clean thoroughly (enzyme cleaner if possible, so no scent marker remains) and take him to the pad more often." },
      { label: "On walks", value: "Bring poo bags (we'll include some). He'll usually go early in the walk." },
      { label: "His usual signals", value: TBC, note: "Circling, sniffing, heading to the door — we'll describe his exact tells once we know them." },
    ],
  },
  {
    id: "walks",
    emoji: "🐾",
    title: "Walks & exercise",
    intro: "At least one walk a day, on-leash, every day. This is the big one.",
    items: [
      { label: "Minimum", value: "One walk daily — ideally the evening walk after sunset when it's cooler. Two (short morning + longer evening) is even better." },
      { label: "Length", value: TBC, note: "Rule of thumb for puppies: ~5 minutes per month of age, up to twice a day — we'll confirm for his age at the stay." },
      { label: "Leash rule", value: "ALWAYS on-leash outside. He's small, quick, and Singapore traffic is unforgiving. Check the harness is snug before every walk." },
      { label: "Heat", value: "No midday walks — Singapore pavement burns paws. Back-of-hand test: if you can't hold your hand on the pavement for 5 seconds, it's too hot." },
      { label: "Other dogs", value: TBC, note: "How he reacts to other dogs and whether park/dog-run visits are okay — depends on his socialisation stage." },
      { label: "Indoor energy burners", value: "Rainy-day backups: scatter-feed his kibble on a towel, frozen KONG, short training games, fetch down the corridor." },
    ],
  },
  {
    id: "house",
    emoji: "🏠",
    title: "Making your house safe",
    intro: "Ten minutes of puppy-proofing before he arrives saves a vet trip.",
    items: [
      { label: "Out of reach", value: "Cables, shoes, remote controls, medication, cleaning products, rubbish bins, and any plants (many common houseplants are toxic to dogs)." },
      { label: "Doors, gates & balconies", value: "Keep them closed. If you have a balcony, he goes out there only supervised — toy puppies fit through shockingly small gaps." },
      { label: "His zone", value: "Set up the crate in a quiet corner away from foot traffic. Pee pad in its fixed spot. He'll settle fastest with a small, consistent territory." },
      { label: "Small items & kids' toys", value: "Anything Lego-sized is a swallow hazard for a chewing puppy — sweep floors before he arrives." },
      { label: "Your own pets", value: TBC, note: "If you have pets, we'll plan a gradual introduction together before the stay." },
    ],
  },
  {
    id: "grooming",
    emoji: "🛁",
    title: "Grooming & upkeep (light-touch)",
    intro: "Keep it minimal — we handle the full grooming routine. Just the daily basics.",
    items: [
      { label: "Brushing", value: "A gentle once-over with the brush we provide every day or two — fleece coats mat fast, especially behind ears and armpits." },
      { label: "Baths", value: "Not needed for a short stay unless he rolls in something. If you must: lukewarm water, the dog shampoo we provide, dry him fully." },
      { label: "Eyes & paws", value: "Wipe tear stains with a damp cotton pad; rinse paws after muddy walks." },
      { label: "Anything more", value: "Leave nails, ears and trimming to us — if something looks urgent, message us first." },
    ],
  },
  {
    id: "health",
    emoji: "🩺",
    title: "Health & medication",
    intro: "What's due during the stay, and when to worry.",
    items: [
      { label: "Vaccination status", value: "Fully vaccinated (three Protech C3 doses completed in Australia before export). Card included in his folder." },
      { label: "Monthly parasite preventive", value: TBC, note: "He gets a monthly chew/spot-on on the 24th of each month — if a dose falls in the stay, we'll hand it over with written instructions." },
      { label: "Other medication", value: TBC, note: "None expected — we'll confirm before the handover." },
      { label: "Insurance / payment for vet visits", value: TBC, note: "Policy details or our guarantee to cover any vet bill — call us first unless it's an emergency." },
      { label: "Go to the vet NOW if", value: "Repeated vomiting or diarrhoea, refusing food AND water, lethargy/collapse, difficulty breathing, suspected poisoning, any injury, or a fall from height. Call us on the way — never wait for us to reply first." },
      { label: "Message us (not urgent) if", value: "One-off vomit or soft stool, skipping a single meal, mild limping that resolves, excessive scratching." },
    ],
  },
  {
    id: "rules",
    emoji: "📜",
    title: "House rules & training words",
    intro: "Use our words so his training doesn't unravel while we're away.",
    items: [
      { label: "Cue words", value: TBC, note: "His command list (sit, come, toilet cue, etc.) — we'll write these down once his training is underway." },
      { label: "Crate", value: "The crate is his happy place — treats and meals can go in it, punishment never does. Don't force him in; toss a treat and let him walk in." },
      { label: "Furniture & beds", value: TBC, note: "Whether he's allowed on sofas/beds — we'll align so the rules are the same in both homes." },
      { label: "Biting & chewing", value: "If he mouths you, go still and swap in a chew toy. Never rough games with hands." },
      { label: "Alone-time rule", value: "Don't make a fuss on leaving or returning — calm exits and entries keep separation anxiety away." },
    ],
  },
  {
    id: "updates",
    emoji: "📸",
    title: "Keeping us posted",
    intro: "You don't have to — but we'd love it, and this app makes it easy.",
    items: [
      { label: "This app", value: "Open this website on your phone and pick the Caretaker profile — everything you log (meals, walks, toilet) syncs straight to our phones in real time." },
      { label: "One-tap logging", value: "The Home screen has one-tap buttons for Walk, Meal, Toilet, Sleep and Shower. One tap = logged. That's genuinely all we need." },
      { label: "Photos", value: "Drop a photo into the Memories tab whenever he does something cute. It goes into his lifelong photo journal." },
      { label: "Daily check-in", value: TBC, note: "We'll agree a rhythm — e.g. one WhatsApp message or app log per day so we know all's well." },
    ],
  },
];

/** Count of items still marked To be confirmed (used for the page banner + tests). */
export function tbcCount(): number {
  return GUIDE_SECTIONS.reduce(
    (sum, s) => sum + s.items.filter((i) => isTBC(i.value)).length,
    0
  );
}
