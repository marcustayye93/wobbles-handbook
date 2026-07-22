/*
 * Pre-homecoming shopping countdown — week-by-week purchase plan.
 *
 * Sequences everything the flat needs before Wobbles lands on 18 Sep 2026
 * (12 weeks, earliest AVS export age). Ordering logic:
 *   - Big, slow-to-ship, needs-practice items first (IATA crate, pen, setup)
 *   - Admin with lead times mid-plan (insurance quotes, vet shortlist, PALS)
 *   - Consumables and food later (freshness + breeder confirms exact brand
 *     closer to the date)
 *   - Perishables and final checks in the last days
 *
 * Progress is stored in the family-shared "shopping" map keyed by item id,
 * so both phones tick the same list.
 */

export interface ShoppingItem {
  id: string; // stable key for shared tick state
  label: string;
  why?: string; // why this week / buying tip
  emoji: string;
}

export interface ShoppingWeek {
  id: string;
  /** ISO Monday the week starts (inclusive) */
  start: string;
  /** ISO Sunday the week ends (inclusive) */
  end: string;
  title: string;
  theme: string; // one-line framing for the week
  emoji: string;
  items: ShoppingItem[];
}

export const HOMECOMING_ISO = "2026-09-18";

/**
 * Weeks run Monday–Sunday. Week 1 starts Mon 20 Jul 2026 (the plan's launch
 * week) and the final stretch ends on homecoming Friday 18 Sep 2026.
 */
export const SHOPPING_WEEKS: ShoppingWeek[] = [
  {
    id: "w1",
    start: "2026-07-20",
    end: "2026-07-26",
    title: "The big-ticket week",
    theme: "Order the slow, bulky things now — they need shipping time AND practice time.",
    emoji: "📦",
    items: [
      {
        id: "crate-iata",
        label: "IATA flight crate (size for ~8 kg adult, breathable, clip-lock)",
        why: "The single most time-critical buy: Jetpets needs the crate weeks early so Wobbles' meals can be fed in it at the farm — crate love takes weeks to build.",
        emoji: "✈️",
      },
      {
        id: "home-crate",
        label: "Home crate + divider panel",
        why: "Ships slowly and anchors the whole flat layout. The divider keeps the sleeping area puppy-sized for potty training.",
        emoji: "🏠",
      },
      {
        id: "playpen-gates",
        label: "Playpen and/or baby gates",
        why: "Bulky delivery. Decide the pen corner now so furniture can shift before he lands.",
        emoji: "🚧",
      },
      {
        id: "measure-corner",
        label: "Measure & choose the crate corner (quiet, not under aircon draft)",
        why: "Free, but do it before the crate arrives so there are no surprises in a Woodlands flat.",
        emoji: "📐",
      },
    ],
  },
  {
    id: "w2",
    start: "2026-07-27",
    end: "2026-08-02",
    title: "Sleep & comfort setup",
    theme: "Everything that makes the crate corner feel like home.",
    emoji: "🛏️",
    items: [
      {
        id: "bed-mat",
        label: "Crate bed + washable vet-bed mat (buy two for laundry rotation)",
        why: "Accidents happen — a spare mat means the crate never smells like one.",
        emoji: "🛌",
      },
      {
        id: "blankets",
        label: "Two soft blankets (one goes to the breeder for mum's scent)",
        why: "Post one to Charmaine in August so it comes back on the flight smelling of mum and littermates.",
        emoji: "🧸",
      },
      {
        id: "snuggle-toy",
        label: "Snuggle toy with heartbeat (or warm-pack plush)",
        why: "The classic first-nights-alone soother — worth having before night one, not after.",
        emoji: "💗",
      },
      {
        id: "white-noise",
        label: "White-noise plan (speaker/app) for the sleep corner",
        why: "HDB corridor sounds are new to a farm puppy; steady noise masks the lift lobby.",
        emoji: "🔊",
      },
    ],
  },
  {
    id: "w3",
    start: "2026-08-03",
    end: "2026-08-09",
    title: "Walking gear & ID",
    theme: "Gear that needs fitting decisions — order early enough to exchange sizes.",
    emoji: "🦮",
    items: [
      {
        id: "harness",
        label: "Y-front puppy harness (size XS/S — he'll be ~2 kg at 12 weeks)",
        why: "Exchanges take a week; a Y-front protects a toy-breed windpipe better than a collar-led walk.",
        emoji: "🎽",
      },
      {
        id: "collar-tag",
        label: "Lightweight collar + engraved ID tag (SG phone number)",
        why: "Engraving takes days. AVS also requires the licence disc once PALS is done.",
        emoji: "🏷️",
      },
      {
        id: "lead",
        label: "Lightweight 1.8 m lead (no retractables for puppies)",
        emoji: "🪢",
      },
      {
        id: "carry-sling",
        label: "Puppy carry sling / carrier for pre-vaccination outings",
        why: "His socialisation window closes ~16 Oct — carried outings start day 4, so this must be ready on arrival.",
        emoji: "👜",
      },
    ],
  },
  {
    id: "w4",
    start: "2026-08-10",
    end: "2026-08-16",
    title: "Admin with lead times",
    theme: "Not purchases — sign-ups. These have processing queues, so start now.",
    emoji: "📋",
    items: [
      {
        id: "insurance",
        label: "Compare + shortlist pet insurance (active from day one home)",
        why: "Most policies have 14–30 day waiting periods — buying at homecoming leaves him uncovered exactly when accidents peak.",
        emoji: "🛡️",
      },
      {
        id: "avs-course",
        label: "Complete the free AVS Pet Ownership Course (both of you)",
        why: "Required before the PALS dog licence; it's online and self-paced.",
        emoji: "🎓",
      },
      {
        id: "vet-shortlist",
        label: "Choose the Woodlands vet + pre-register, book the first visit (~21 Sep)",
        why: "Good clinics book out; the first check should happen within days of landing.",
        emoji: "🩺",
      },
      {
        id: "post-blanket",
        label: "Post the scent blanket to The Doghouse QLD",
        why: "Allow 1–2 weeks for AU delivery so it lives with the litter well before the flight.",
        emoji: "📮",
      },
    ],
  },
  {
    id: "w5",
    start: "2026-08-17",
    end: "2026-08-23",
    title: "Feeding station & grooming kit",
    theme: "The daily-care hardware — nothing perishable yet.",
    emoji: "🍽️",
    items: [
      {
        id: "bowls",
        label: "Stainless/ceramic food bowl + narrow water bowl (beard-friendly)",
        why: "A narrow water bowl keeps a Cavoodle beard drier — less staining, less daily blotting.",
        emoji: "🥣",
      },
      {
        id: "grooming-tools",
        label: "Slicker brush + metal comb + puppy shampoo & conditioner",
        why: "Brush-tolerance training starts day one; fleece coats mat fast without a proper comb.",
        emoji: "🪮",
      },
      {
        id: "nail-styptic",
        label: "Puppy nail clippers + styptic powder",
        emoji: "💅",
      },
      {
        id: "food-scale",
        label: "Kitchen scale for meal portions + weekly weigh-ins",
        why: "Toy breeds are portion-sensitive; the weight tracker in this app wants numbers.",
        emoji: "⚖️",
      },
    ],
  },
  {
    id: "w6",
    start: "2026-08-24",
    end: "2026-08-30",
    title: "Toys, chews & enrichment",
    theme: "A 12-week-old lands mid-teething — stock the chew arsenal.",
    emoji: "🧸",
    items: [
      {
        id: "chew-toys",
        label: "Chew + teething toys ×6 (varied textures) + rotate box",
        why: "Teething peaks 12–24 weeks — exactly his first months home. More legal chews = fewer chewed cables.",
        emoji: "🦷",
      },
      {
        id: "kong-lickmat",
        label: "Two puppy Kongs + a lick mat",
        why: "Frozen Kongs power crate training and grooming-table patience from day one.",
        emoji: "🍦",
      },
      {
        id: "puzzle",
        label: "One beginner puzzle feeder / snuffle mat",
        emoji: "🧩",
      },
      {
        id: "puppy-proof",
        label: "Puppy-proofing pass: cable covers, bin locks, toxic plants out",
        why: "Do the sweep now, live with it for two weeks, and you'll catch what the first pass missed.",
        emoji: "🔌",
      },
    ],
  },
  {
    id: "w7",
    start: "2026-08-31",
    end: "2026-09-06",
    title: "Consumables & clean-up",
    theme: "Shelf-stable supplies — fine to hold for three weeks.",
    emoji: "🧻",
    items: [
      {
        id: "pads-cleaner",
        label: "Puppy pads (big stock) + enzyme cleaner",
        why: "Pad-first potty training in an HDB flat burns through pads fast; enzyme cleaner is the only thing that erases accident smells.",
        emoji: "🚽",
      },
      {
        id: "poo-bags",
        label: "Poo bags + dispenser for the lead",
        emoji: "💩",
      },
      {
        id: "wipes-towels",
        label: "Pet wipes + dedicated puppy towels ×3 (incl. one microfibre)",
        emoji: "🧽",
      },
      {
        id: "import-licence",
        label: "Apply for the AVS import licence (valid 30 days — timing matters)",
        why: "It's only valid 30 days, so applying this week covers the 18 Sep flight with margin.",
        emoji: "🛂",
      },
    ],
  },
  {
    id: "w8",
    start: "2026-09-07",
    end: "2026-09-13",
    title: "Food & treats week",
    theme: "Buy food only now — the breeder confirms his exact kibble before export.",
    emoji: "🦴",
    items: [
      {
        id: "breeder-food",
        label: "Confirm exact food with Charmaine + buy 2–3 weeks' supply of the same",
        why: "Switching food AND homes at once upsets tummies. Same brand, same protein, transition later.",
        emoji: "🥘",
      },
      {
        id: "training-treats",
        label: "Tiny soft training treats (pea-sized) + a treat pouch",
        why: "Training starts hour one — potty parties need instant rewards on your belt.",
        emoji: "🍖",
      },
      {
        id: "chew-edibles",
        label: "A few puppy-safe edible chews (no rawhide)",
        emoji: "🌾",
      },
      {
        id: "flight-confirm",
        label: "Confirm Jetpets flight details + crate handover logistics",
        why: "Final flight confirmation usually lands ~1 week out; chase it if quiet.",
        emoji: "🛫",
      },
    ],
  },
  {
    id: "w9",
    start: "2026-09-14",
    end: "2026-09-18",
    title: "Final stretch — perishables & landing prep",
    theme: "The last-minute fresh stuff, then set the stage. He lands Friday.",
    emoji: "🏁",
    items: [
      {
        id: "fresh-extras",
        label: "Fresh extras: plain cooked chicken / puppy-safe fresh toppers",
        why: "Perishable — buy in homecoming week so nothing expires before he can eat it.",
        emoji: "🍗",
      },
      {
        id: "frozen-kongs",
        label: "Stuff + freeze three Kongs ready for night one",
        emoji: "🧊",
      },
      {
        id: "setup-flat",
        label: "Full flat setup: crate corner made, pen up, pads down, water filled",
        why: "The homecoming car ride ends at a ready den — no assembling furniture with a puppy underfoot.",
        emoji: "🏡",
      },
      {
        id: "changi-kit",
        label: "Changi pickup kit: carrier, towel, water, wipes, spare pads for the car",
        why: "Puppies often toilet (or worse) right after a long flight — line the carrier.",
        emoji: "🚗",
      },
    ],
  },
];

/** Flat item count across the whole plan */
export const SHOPPING_TOTAL = SHOPPING_WEEKS.reduce((n, w) => n + w.items.length, 0);

/** Status of a week relative to today */
export type WeekStatus = "past" | "current" | "future";

export function weekStatus(week: ShoppingWeek, now: Date = new Date()): WeekStatus {
  const today = toISODate(now);
  if (today < week.start) return "future";
  if (today > week.end) return "past";
  return "current";
}

/** The week whose range contains today; falls back to first future week, else last week. */
export function currentWeek(now: Date = new Date()): ShoppingWeek {
  const found = SHOPPING_WEEKS.find((w) => weekStatus(w, now) === "current");
  if (found) return found;
  const future = SHOPPING_WEEKS.find((w) => weekStatus(w, now) === "future");
  return future ?? SHOPPING_WEEKS[SHOPPING_WEEKS.length - 1];
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** "20–26 Jul" / "14–18 Sep" style compact range label */
export function weekRangeLabel(week: ShoppingWeek): string {
  const s = new Date(week.start + "T00:00:00");
  const e = new Date(week.end + "T00:00:00");
  const sMonth = s.toLocaleDateString("en-AU", { month: "short" });
  const eMonth = e.toLocaleDateString("en-AU", { month: "short" });
  if (sMonth === eMonth) return `${s.getDate()}–${e.getDate()} ${eMonth}`;
  return `${s.getDate()} ${sMonth} – ${e.getDate()} ${eMonth}`;
}

/** Items overdue: from past weeks and still unticked */
export function overdueItems(
  ticks: Record<string, boolean>,
  now: Date = new Date(),
): { week: ShoppingWeek; item: ShoppingItem }[] {
  const out: { week: ShoppingWeek; item: ShoppingItem }[] = [];
  for (const w of SHOPPING_WEEKS) {
    if (weekStatus(w, now) !== "past") continue;
    for (const it of w.items) {
      if (!ticks[it.id]) out.push({ week: w, item: it });
    }
  }
  return out;
}
