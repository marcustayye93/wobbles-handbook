/*
 * Pre-homecoming shopping countdown — week-by-week purchase plan.
 *
 * Sequences everything the flat needs before Wobbles lands on 24 Sep 2026
 * (flies with Jet Pets on 23 Sep at 12w5d — past the AVS 12-week minimum). Ordering logic:
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

export const HOMECOMING_ISO = "2026-09-24";

/**
 * Weeks run Monday–Sunday. Week 1 starts Mon 20 Jul 2026 (the plan's launch
 * week) and the final stretch ends on homecoming Thursday 24 Sep 2026.
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
        why: "The single most time-critical buy: Jet Pets needs the crate weeks early so Wobbles' meals can be fed in it at the farm — crate love takes weeks to build.",
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
        label: "White 6-panel playpen 120×60×60 + PVC waterproof pen mat ✔ bought",
        why: "Ordered 28 Jul — white steel 6-panel pen (120×60×60 cm) plus a sea-salt-blue PVC waterproof mat (60×120 cm) to protect the floor underneath. Decide the pen corner now so furniture can shift before he lands.",
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
        label: "MIKIPAD waterproof dog bed (dark brown) + latex cooling mat ✔ bought",
        why: "Ordered 27 Jul — all-season waterproof bed with a cooling mat for Singapore heat. A spare washable vet-bed mat is still a smart add for laundry rotation.",
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
        label: "Blue padded Y-front harness — Ruffwear Front Range style, reflective trim ✔ bought",
        why: "Check fit as he grows — the Front Range XXS fits ~2 kg at 12 weeks; keep the receipt in case he sizes up fast.",
        emoji: "🎽",
      },
      {
        id: "collar-tag",
        label: "Ruffwear Front Range collar (blue) ✔ bought",
        why: "Bought — the matching engraved ID tag is its own item below.",
        emoji: "🏷️",
      },
      {
        id: "id-tag",
        label: "Engraved ID tag (SG phone number) + AVS licence disc once PALS is done",
        why: "Engraving takes days, and AVS requires the licence disc on the collar. The collar is home — the tag is the missing half.",
        emoji: "🪪",
      },
      {
        id: "lead",
        label: "TUG retractable leash ✔ bought + slip lead & 580 ml walk water bottle ✔ bought — plus a fixed 1.8 m training lead",
        why: "The retractable is for relaxed sniffy walks later and the slip lead (lemon yellow, with clip-on water bottle) covers quick toilet runs; puppy lessons and roadside walks still want a short fixed lead for control.",
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
        label: "Choose the Woodlands vet + pre-register, book the first visit (~28 Sep)",
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
        label: "Raised 304 stainless-steel bowl + stand ✔ bought — add a narrow water bowl",
        why: "Ordered 27 Jul. A narrow water bowl is still worth adding — it keeps a Cavoodle beard drier, so less staining and daily blotting.",
        emoji: "🥣",
      },
      {
        id: "slow-feeder",
        label: "Slow feeder + lick mats — Trixie spiral mat + LickiMat UFO ✔ bought",
        why: "Slows gulpy meals and turns bath/grooming time into licking time — the UFO suction-cups to the shower wall.",
        emoji: "🍥",
      },
      {
        id: "dental-kit",
        label: "Dental kit — TropiClean Fresh Breath gel + TripleFlex toothbrush ✔ bought",
        why: "Teeth brushing starts as gum massage from week one home; daily by the time adult teeth land (~6 months).",
        emoji: "🦷",
      },
      {
        id: "grooming-tools",
        label: "Slicker brush + comb set & detangle spray ✔ bought — still need puppy shampoo & conditioner",
        why: "Macaron-grey slicker + comb set ordered 27 Jul; 奇愈记 detangling leave-in spray (120 ml) added 28 Jul for knot-free brushing. Brush-tolerance training starts day one; grab the dog-specific shampoo & conditioner to finish this line.",
        emoji: "🪮",
      },
      {
        id: "clippers",
        label: "Codos CP-6800 pet clipper + full-steel shears kit ✔ bought",
        why: "Clipper ordered 27 Jul; full-steel shears kit ordered 28 Jul — 7\" straight + 7\" curved + 6.5\" thinning + grooming comb, with case, finger guards and oil. The home-grooming trim kit is sorted; start the clipper conditioning ladder from week one.",
        emoji: "✂️",
      },
      {
        id: "nail-styptic",
        label: "Low-noise nail grinder (e.g. Dremel PawControl) + styptic powder",
        why: "We grind little-and-often (Mon/Wed/Sat), not clip — quieter, no crush pressure, and the quick recedes so nails stay short.",
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
        label: "Chew & tug arsenal ✔ bought — KONG Squid, KONG Teething Stick, Beeztees tug, mop toy, fleece rope tug, GiGwi antler chew ×2, squeaky duck plush",
        why: "Teething peaks 12–24 weeks — rotate two or three at a time so the box stays novel.",
        emoji: "🧸",
      },
      {
        id: "kong-lickmat",
        label: "KONG Puppy + KONG Classic (small) ✔ bought",
        why: "Frozen Kongs power crate training and grooming-table patience from day one.",
        emoji: "🍦",
      },
      {
        id: "puzzle",
        label: "Snuffle mat ✔ bought",
        emoji: "🧩",
      },
      {
        id: "kong-brush",
        label: "KONG cleaning brush ✔ bought",
        why: "Stuffed Kongs grow science experiments inside without it — brush after every frozen fill.",
        emoji: "🧼",
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
        label: "UP+ pee pads XL 60×90 cm ×3 packs ✔ bought — still need enzyme cleaner",
        why: "Thickened odour-control pads ordered 27 Jul. Enzyme cleaner is the missing half — it's the only thing that erases accident smells.",
        emoji: "🚽",
      },
      {
        id: "toilet-tray",
        label: "XL dog toilet tray with wall (white-grey) ✔ bought",
        why: "Ordered 27 Jul — the pad holder tray keeps pads flat and chew-proof, and the wall catches leg-lifts. Pairs with the pad-first HDB potty plan.",
        emoji: "🛁",
      },
      {
        id: "poo-bags",
        label: "Biodegradable poo bags ×150 (10 rolls) + lead dispenser ✔ bought",
        why: "Ordered 28 Jul — 150 biodegradable bags plus a pill-shaped dispenser that clips onto the lead. Walk-ready from day one.",
        emoji: "💩",
      },
      {
        id: "wipes-towels",
        label: "KOJIMA thick pet wipes ×5 packs ✔ bought — still need puppy towels ×3 (incl. one microfibre)",
        why: "KOJIMA thick wipes (80 pulls × 5 packs) ordered 28 Jul — paws, bums and muddy walks covered. Still to grab: three dedicated puppy towels, one of them microfibre for bath days.",
        emoji: "🧽",
      },
      {
        id: "import-licence",
        label: "Apply for the AVS import licence (valid 30 days — timing matters)",
        why: "It's only valid 30 days, so applying this week covers the 23 Sep flight with margin.",
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
        label: "Puppy-safe edible chews ✔ started — 85 g rabbit-skin roll in the cupboard (no rawhide)",
        why: "Save the rabbit-skin roll for after he lands — supervise long natural chews, and add one or two softer puppy chews closer to the date.",
        emoji: "🌾",
      },
      {
        id: "flight-confirm",
        label: "Confirm Jet Pets flight details + crate handover logistics",
        why: "Final flight confirmation usually lands ~1 week out; chase it if quiet.",
        emoji: "🛫",
      },
    ],
  },
  {
    id: "w9",
    start: "2026-09-14",
    end: "2026-09-24",
    title: "Final stretch — perishables & landing prep",
    theme: "The last-minute fresh stuff, then set the stage. He flies Wednesday 23rd and lands Thursday 24th.",
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
