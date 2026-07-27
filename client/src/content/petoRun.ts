/*
 * PetO Brisbane run — a store-specific shopping list for the family's Brisbane
 * visit. Every product was verified on peto.com.au on 27 Jul 2026 (prices in
 * AUD, subject to change in store). Items reuse the SAME ids as the master
 * shopping plan where they overlap, so ticking one in either view ticks both
 * (shared "shopping" map).
 *
 * Curation logic: only gaps that make sense to buy IN Brisbane are listed —
 * especially anything that should reach the breeder (The Doghouse QLD) before
 * Wobbles flies on 23 Sep: the scent blanket, breeder-matching food, and gear
 * needed on landing day.
 */

export interface PetoProduct {
  name: string;
  price: string; // AUD as shown on peto.com.au, e.g. "$17.99"
  url: string;
  note?: string; // sizing / variant tip
}

export interface PetoRunItem {
  /** Matches the master shopping-plan item id where the item overlaps */
  id: string;
  emoji: string;
  label: string; // short, what to grab
  why: string; // why this matters / Brisbane-specific angle
  pick: PetoProduct; // the top in-store pick
  alts?: PetoProduct[]; // one or two alternatives
  travel?: string; // flying-to-SG note (liquids, bulk)
  priority: "grab-first" | "standard" | "optional";
}

export interface PetoStore {
  name: string;
  area: string;
  address: string;
  phone: string;
  services?: string;
  hours: string;
  bestFor?: string;
}

export const PETO_RUN_DATE_NOTE =
  "Prices checked on peto.com.au, 27 Jul 2026 — PetO price-guarantees to beat any competitor by 10%.";

export const PETO_STORES: PetoStore[] = [
  {
    name: "PetO Spring Hill",
    area: "Inner city — closest to the CBD",
    address: "9 St. Pauls Terrace, Spring Hill QLD 4000",
    phone: "(07) 3073 3880",
    services: "DIY Dog Wash",
    hours: "Mon–Wed 8–6 · Thu 8–7 · Fri–Sat 8–6 · Sun 9–5",
    bestFor: "Staying in the city? Opens 8am — do the run before the day starts.",
  },
  {
    name: "PetO Browns Plains",
    area: "South — toward Logan / breeder country",
    address: "3 Commerce Dr, Browns Plains QLD 4118",
    phone: "(07) 3086 6300",
    services: "DIY Dog Wash · Vet · Groomer",
    hours: "Mon–Wed 9–6 · Thu 9–7 · Fri 9–6 · Sat 9–5:30 · Sun 9–5",
    bestFor: "On the way to/from The Doghouse QLD — pair with a breeder visit.",
  },
  {
    name: "PetO Stafford",
    area: "North Brisbane",
    address: "36 Webster Rd, Stafford QLD 4053",
    phone: "(07) 3073 3800",
    hours: "Mon–Wed 9–6 · Thu 9–6:30 · Fri–Sat 9–5:30 · Sun 9–5",
  },
  {
    name: "PetO Virginia",
    area: "North Brisbane",
    address: "1836 Sandgate Road, Virginia QLD 4014",
    phone: "(07) 3865 3967",
    services: "Vet · Groomers",
    hours: "Mon–Wed 9–6 · Thu 9–7 · Fri–Sat 9–6 · Sun 9–5",
  },
  {
    name: "PetO Macgregor",
    area: "South Brisbane",
    address: "583–585 Kessels Rd, Macgregor QLD 4109",
    phone: "(07) 3420 2800",
    services: "Vet · Groomers",
    hours: "Mon–Sat 9–5:30 · Sun 9–5",
  },
  {
    name: "PetO Underwood",
    area: "South Brisbane",
    address: "The Zone, 183 Kingston Road, Underwood QLD 4119",
    phone: "(07) 3387 6300",
    services: "Vet",
    hours: "Mon–Wed 8:30–5:30 · Thu 8:30–6:30 · Fri–Sat 8:30–5:30 · Sun 9–5",
  },
  {
    name: "PetO Capalaba",
    area: "East Brisbane",
    address: "Shop 81, 38–62 Moreton Bay Rd, Capalaba QLD 4157",
    phone: "(07) 3569 0811",
    services: "Grooming · Vet",
    hours: "Mon–Wed 9–5:30 · Thu 9–7 · Fri–Sat 9–5:30 · Sun 9–5",
  },
];

export const PETO_RUN: PetoRunItem[] = [
  {
    id: "blankets",
    emoji: "🧸",
    label: "Two soft plush blankets — one stays with the breeder for mum's scent",
    why: "The single smartest Brisbane buy: hand one straight to Charmaine (no postage, no delay) so it lives with the litter and flies home smelling of mum on 23 Sep.",
    pick: {
      name: "La Doggie Vita Dog Central Plush Blanket (Indigo)",
      price: "$34.99",
      url: "https://peto.com.au/la-doggie-vita-dog-central-blanket-indigo-plush-blanket/",
      note: "80 × 60 cm — perfectly toy-breed sized. Any small fleece blanket in store works too; buy two.",
    },
    priority: "grab-first",
  },
  {
    id: "breeder-food",
    emoji: "🥘",
    label: "A bag of Wobbles' exact kibble (confirm the brand with Charmaine first)",
    why: "Australian breeders usually feed Australian brands — buying the exact bag in Brisbane means zero food-switch stress. Text Charmaine before the run.",
    pick: {
      name: "Royal Canin Mini Puppy Dry Dog Food",
      price: "from $39.99",
      url: "https://peto.com.au/royal-canin-mini-puppy-dry-dog-food/",
      note: "Only if it matches the breeder's brand — otherwise grab whatever she names.",
    },
    alts: [
      {
        name: "Black Hawk Small Breed Puppy Chicken & Rice",
        price: "$54.99",
        url: "https://peto.com.au/black-hawk-chicken-rice-dry-small-puppy-dog-food/",
      },
      {
        name: "Advance Puppy (Chicken)",
        price: "$114.99 (large bag)",
        url: "https://peto.com.au/advance-puppy-growth-all-breed-dry-dog-food-chicken/",
      },
    ],
    travel: "Dry food is fine to fly but a 2–3 kg bag goes in checked luggage. Declare pet food at SG customs if asked; small personal quantities are fine.",
    priority: "grab-first",
  },
  {
    id: "lead",
    emoji: "🪢",
    label: "Fixed 1.8 m training lead (the last missing lead)",
    why: "Retractable and slip lead are bought — puppy school and roadside walks still need a short fixed lead for control.",
    pick: {
      name: "Rogz Utility Classic Dog Lead (Black, Small)",
      price: "$17.99",
      url: "https://peto.com.au/rogz-utility-classic-dog-lead-black/",
      note: "Small = 1.8 m × 11 mm, lightweight with reflective stitching — ideal for a toy Cavoodle.",
    },
    alts: [
      {
        name: "Kazoo Active Nylon Lead (Ocean Sunrise)",
        price: "$27.99",
        url: "https://peto.com.au/kazoo-active-nylon-dog-lead-ocean-sunrise/",
      },
    ],
    priority: "standard",
  },
  {
    id: "carry-sling",
    emoji: "👜",
    label: "Soft puppy carrier for pre-vaccination outings",
    why: "His socialisation window closes ~16 Oct — carried outings start day 4 home, so this must be waiting on arrival.",
    pick: {
      name: "Bono Fido Port A Pet Carrier",
      price: "$89.99",
      url: "https://peto.com.au/bono-fido-carrier-port-a-pet/",
      note: "Soft-sided with mesh windows — snug and secure for a 2 kg puppy.",
    },
    travel: "Packs flat-ish in luggage; also doubles as the Changi pickup carrier.",
    priority: "standard",
  },
  {
    id: "bowls",
    emoji: "🥣",
    label: "Narrow / small water bowl (beard-friendly)",
    why: "The raised feeding station is bought — a small narrow bowl keeps a Cavoodle beard drier, so less staining and daily blotting.",
    pick: {
      name: "Pet One Stainless Anti-Ant Anti-Tip Bowl (450 ml)",
      price: "$18.99",
      url: "https://peto.com.au/pet-one-stainless-steel-bowl-anti-ant-anti-tip-1-8l/",
      note: "Grab the 450 ml size — anti-tip base survives clumsy puppy paws.",
    },
    alts: [
      {
        name: "FuzzYard Life Silicone Bowl (Soft Blush)",
        price: "$19.99",
        url: "https://peto.com.au/fuzzyard-life-silicone-dog-bowl-soft-blush/",
      },
    ],
    priority: "standard",
  },
  {
    id: "grooming-tools",
    emoji: "🧴",
    label: "Puppy shampoo + conditioner (oatmeal, fleece-coat friendly)",
    why: "Brush kit is bought — the gentle wash pair finishes the grooming caddy. Aloveen is the Aussie vet-favourite for exactly this coat.",
    pick: {
      name: "Aloveen Oatmeal Shampoo (250 ml)",
      price: "$27.99",
      url: "https://peto.com.au/aloveen-shampoo-for-dogs-and-cats/",
      note: "Pair with Aloveen Conditioner ($34.99) — soothing oatmeal for sensitive puppy skin.",
    },
    alts: [
      {
        name: "Aloveen Oatmeal Conditioner",
        price: "$34.99",
        url: "https://peto.com.au/aloveen-conditioner-for-dogs-and-cats/",
      },
      {
        name: "TropiClean Gentle Coconut Puppy Shampoo",
        price: "$23.99",
        url: "https://peto.com.au/tropiclean-gentle-coconut-puppy-kitten-shampoo/",
      },
    ],
    travel: "250 ml bottles > 100 ml — checked luggage only.",
    priority: "standard",
  },
  {
    id: "training-treats",
    emoji: "🍖",
    label: "Tiny soft training treats + a belt treat pouch",
    why: "Training starts hour one home — pea-sized rewards on your belt make potty parties instant.",
    pick: {
      name: "SavourLife Puppy Training Treats (Lamb)",
      price: "$15.99",
      url: "https://peto.com.au/savourlife-puppy-lamb-training-treats/",
      note: "Tiny cubes, no breaking needed; Australian lamb with DHA — gentle on puppy tummies.",
    },
    alts: [
      {
        name: "DOOG Stella Treat & Training Pouch",
        price: "$19.99",
        url: "https://peto.com.au/doog-stella-treat-training-dog-pouch/",
      },
    ],
    travel: "AU-made commercial treats in sealed packs are fine into SG in small personal amounts — keep them sealed and in checked luggage.",
    priority: "standard",
  },
  {
    id: "poo-bags",
    emoji: "💩",
    label: "Poo bag dispenser + starter rolls",
    why: "Cheap, light, and one less thing to source in the first SG week.",
    pick: {
      name: "FuzzYard 'What the Poop' Dispenser + 2 rolls",
      price: "$12.99",
      url: "https://peto.com.au/fuzzyard-what-the-poop-poop-bag-dispenser-and-poop-bags/",
      note: "Velcro-loops to the lead so it doesn't swing into a tiny puppy.",
    },
    alts: [
      {
        name: "Beco Mint Scented Poop Bags",
        price: "$7.19",
        url: "https://peto.com.au/beco-poop-bags-mint-scented/",
      },
    ],
    priority: "standard",
  },
  {
    id: "pads-cleaner",
    emoji: "🧪",
    label: "Enzyme urine cleaner — only if luggage space allows",
    why: "Pee pads are bought; enzyme cleaner is the missing half. It's a heavy liquid though — buying in SG may be smarter.",
    pick: {
      name: "Urine Off Dog & Puppy Stain & Odour Remover",
      price: "$41.99",
      url: "https://peto.com.au/urine-off-dog-puppy-stain-odour-remover/",
    },
    alts: [
      {
        name: "Nature's Miracle Urine Destroyer Plus",
        price: "$38.39",
        url: "https://peto.com.au/natures-miracle-urine-destroyer-plus/",
      },
    ],
    travel: "Large liquid bottle — checked luggage only, bag it against leaks. Skippable: Urine Off is sold in Singapore too.",
    priority: "optional",
  },
  {
    id: "nail-styptic",
    emoji: "💅",
    label: "Nail grinder + styptic powder — compare before buying here",
    why: "PetO's quiet grinder is the pro-grade Andis — great but pricey. A Dremel PawControl from a hardware store or online may halve the cost.",
    pick: {
      name: "Andis 2-Speed Cord/Cordless Nail Grinder",
      price: "$179.99",
      url: "https://peto.com.au/andis-2-speed-cord-cordles-nail-grinder/",
      note: "Quiet, made for small pets. Ask staff for styptic (blood-stop) powder in the grooming aisle.",
    },
    travel: "Cordless grinders have lithium batteries — carry-on, not checked.",
    priority: "optional",
  },
  {
    id: "snuggle-toy",
    emoji: "💗",
    label: "Heartbeat snuggle toy — NOT stocked at PetO (buy online instead)",
    why: "PetO doesn't carry heartbeat toys (checked their whole range). Order a Snuggle Puppy from eDog Australia / Amazon AU delivered to your Brisbane stay, and hand it to Charmaine with the blanket.",
    pick: {
      name: "In-store stand-ins: KONG Snuzzles Kiddos Teddy (Small) or Snugglesafe Microwave Heatpad",
      price: "varies",
      url: "https://peto.com.au/search.php?search_query=snuzzles",
      note: "The heat pad covers the warmth half of the comfort equation if the online order can't arrive in time.",
    },
    priority: "optional",
  },
];

/** Items whose ids overlap the master shopping plan (ticks are shared) */
export const PETO_RUN_SHARED_IDS = PETO_RUN.map((i) => i.id);
