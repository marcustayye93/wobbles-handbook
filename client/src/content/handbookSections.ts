/*
 * Storybook Picture-Book theme — handbook section content.
 * All facts audited against research notes (AVS, AKC, groomer community,
 * Puppy Culture / Dr Battaglia ENS, Zak George, PDSA/PetMD).
 */
import type { Section } from "./types";
import { ASSETS } from "./wobbles";
import { LIFETIME_SECTIONS } from "./lifetimeSections";

/** Chapters for the puppy year (written for now). */
export const PUPPY_SECTIONS: Section[] = [
  // ─────────────────────────────────────────────────────────── 1. First Day
  {
    slug: "first-day",
    title: "The First Day & Night",
    emoji: "🏡",
    tagline: "Homecoming is 24 September 2026 — here's exactly how to nail it",
    readMins: 8,
    hero: ASSETS.heroFirstDay,
    blocks: [
      {
        type: "p",
        text: "Wobbles comes home at nearly 13 weeks old on Thursday 24 September 2026, flying with Jet Pets on the 23rd — Singapore's AVS rules mean puppies can only be imported from 12 weeks of age, so he spends his first three months with his litter at The Doghouse QLD. He'll arrive with his puppy pack: a blanket carrying his mum's scent, his puppy passport, microchip and vaccination records (all three Protech C3 shots done in Australia). The first 48 hours set the tone for everything — but they don't have to be perfect, just calm. Remember he's also just flown 7+ hours from Brisbane, so day one is about rest, not introductions.",
      },
      { type: "h", text: "Before he arrives" },
      {
        type: "list",
        items: [
          "Puppy-proof: hide cables, remove toxic plants (lilies, sago palm), lock away medicines, chocolate, grapes, xylitol gum.",
          "Set up his den: crate or pen in a quiet corner, bed inside, water nearby.",
          "Buy the SAME food the breeder uses — keep his diet unchanged for at least the first 2 weeks.",
          "Agree the house rules with the whole family BEFORE he arrives: sofa or not? Which rooms? Where does he sleep? Changing rules later confuses him.",
          "Baby gates up, and decide his permanent night-time sleeping spot from night one.",
        ],
      },
      { type: "h", text: "The first hour" },
      {
        type: "steps",
        items: [
          {
            title: "Toilet spot first",
            text: "Before he even enters the flat, show him his two legal toilets: carry him to the grass downstairs first, then straight to the pad in its permanent spot at home. If he goes at either, quiet praise and a tiny treat. This is his very first lesson.",
          },
          {
            title: "Show him his den",
            text: "Take him straight to his safe space with the mum-scented blanket inside. Let him sniff and explore at his own pace.",
          },
          {
            title: "One room at a time",
            text: "Don't give him the run of the house. Introduce rooms slowly over days, not hours.",
          },
          {
            title: "Keep it quiet",
            text: "Everyone calm and seated. No visitors for the first few days — he has enough new things to process.",
          },
        ],
      },
      {
        type: "tip",
        title: "Fear periods & the big move",
        text: "Puppies go through a fear-imprint period around 8–11 weeks — Wobbles rides most of it out safely at the farm, but the flight and rehoming at 12 weeks are still a big deal, and a second sensitive patch can linger. Anything genuinely frightening this week can leave a lasting mark. Keep week one gentle, positive and boring (in a good way).",
      },
      { type: "h", text: "The first day rhythm" },
      {
        type: "p",
        text: "Puppies sleep 18–20 hours a day. The classic first-time-owner mistake is too much stimulation: an overtired puppy is a bitey, frantic puppy. Follow a loop of short play (15–30 minutes) → toilet break → nap in the den (45 minutes to 2 hours) → toilet break → repeat. Toilet breaks come after every meal, every nap and every play session.",
      },
      {
        type: "table",
        headers: ["Time", "What happens"],
        rows: [
          ["7:15–7:30 am", "Morning toilet walk — just after sunrise, coolest part of the day. Carry him from the crate to the lift to the grass (no lobby floor time), wee/poo, praise, home. Then breakfast → pad break → short play → nap"],
          ["Midday", "Pad break → lunch (3 meals/day under ~14–18 weeks) → pad break → play → long nap"],
          ["Afternoon", "Pad break → gentle exploring or handling practice → nap. Skip pavement outings 10am–5pm — Singapore pavement gets paw-burning hot"],
          ["~5 pm", "Dinner — roughly 4 hours before bedtime so he can empty out"],
          ["After 7 pm", "Sunset walk — short evening stroll once it cools. Every other day this becomes the 7pm park session (carried until fully vaccinated)"],
          ["Bedtime", "Final pad trip immediately before lights out"],
        ],
      },
      {
        type: "warn",
        title: "No public walks yet",
        text: "His Protech C3 course finishes on 8 Sep in Australia, so he lands fully protected (immunity ~22 Sep, two weeks after dose 3). Still, hold off on public ground until the first SG vet visit (~28 Sep) confirms he's clear — and ask the vet about a 16-week booster, since his third dose was given at 10.5 weeks. Until then, carry him outside: being carried around Woodlands, to the shops, past the playground is brilliant socialisation with zero parvo risk. The 7:15am toilet walk works too — carry him to one clean patch of grass, same spot every time.",
      },
      { type: "h", text: "Surviving the first night" },
      {
        type: "list",
        items: [
          "Crate or bed in YOUR bedroom for the first nights — he's never slept alone in his life.",
          "Mum-scented blanket in the crate (it's in his puppy pack), plus something that smells of you.",
          "Comfort a crying puppy. Ignoring him does not 'toughen him up' — it raises his stress and can create lasting anxiety.",
          "Learn his two cries: anxious crying early in the night means he needs reassurance; waking and crying in the middle of the night usually means he needs a toilet trip.",
          "Night toilet trips are normal: at 12 weeks he can hold roughly 5–6 hours overnight, so expect one trip a night at first. Keep trips boring — out, wee, praise, back to bed, no play.",
          "Crying at bedtime typically fades within days to a couple of weeks. Consistency wins.",
        ],
      },
      {
        type: "tip",
        title: "Make the crate wonderful",
        text: "Feed his meals in the crate, hide treats in it, give chew toys in it, leave the door open during the day. The crate must only ever mean good things — never use it as punishment.",
      },
    ],
  },

  // ────────────────────────────────────────────────────── 2. Parenting
  {
    slug: "parenting",
    title: "Parenting Techniques",
    emoji: "🎓",
    tagline: "Puppy Culture, ENS, Zak George — and what the evidence says",
    readMins: 10,
    blocks: [
      {
        type: "p",
        text: "Wobbles isn't starting from zero. The Doghouse QLD raises litters on Puppy Culture and Early Neurological Stimulation — structured, evidence-informed early-development programs. Your job is to keep the momentum going through the critical socialisation window, which for Wobbles closes around 16 weeks (16 October 2026).",
      },
      { type: "h", text: "Puppy Culture — what the breeder has already done" },
      {
        type: "p",
        text: "Puppy Culture is Jane Killion's age-appropriate development program for a puppy's first 12 weeks — the period she calls 'the time that shapes the dog for life'. Charmaine's puppies get enrichment, problem-solving games, early crate and potty foundations, resource-guarding prevention through trading games, and 'manding' — teaching the puppy to sit politely to ask for attention instead of jumping.",
      },
      {
        type: "list",
        items: [
          "Manding: when Wobbles sits and looks at you, reward it — he's 'asking politely'. Ignore jumping; reward sitting.",
          "Exchange games: trade a treat for whatever is in his mouth. Never chase-and-snatch — that teaches guarding.",
          "Communication trinity: a marker word or clicker ('yes!') powered up with treats makes every future lesson faster.",
          "Fear-period awareness: gentle first week home (he lands at 12 weeks, fresh off a flight) and again during the second fear period around 6–14 months.",
          "Short game-based sessions: 30 seconds to 2 minutes. Stop while he still wants more.",
        ],
      },
      { type: "h", text: "ENS — already done, days 3–16" },
      {
        type: "p",
        text: "Early Neurological Stimulation (the US military 'Bio Sensor' program, popularised by Dr Carmen Battaglia) was performed on Wobbles by the breeder between days 3 and 16 of his life: five gentle exercises, once daily, 3–5 seconds each — tactile toe stimulation with a cotton tip, head held up, head pointed down, resting on his back, and a moment on a cool damp towel.",
      },
      {
        type: "bars",
        title: "Reported ENS benefits (Battaglia)",
        items: [
          { label: "Stress tolerance", value: 90, note: "greater tolerance in tests" },
          { label: "Cardiovascular performance", value: 85, note: "stronger heart rate response" },
          { label: "Problem-solving calmness", value: 80, note: "calmer, fewer errors" },
          { label: "Disease resistance", value: 70, note: "reported improvement" },
        ],
      },
      {
        type: "warn",
        title: "Bias caveat — ENS",
        text: "ENS evidence comes largely from Battaglia's summaries of decades-old military research; independent replications are limited. It's low-risk and plausibly helpful, but it is not magic, and it is never a substitute for real socialisation. It also can't be 'topped up' now — the window closed at day 16.",
      },
      { type: "h", text: "Zak George's Dog Training Revolution" },
      {
        type: "p",
        text: "Zak George's approach is relationship-based positive reinforcement — think 'attachment parenting plus CBT for dogs'. He rejects dominance/alpha theory outright and refuses aversive tools (prong collars, shock collars, leash corrections).",
      },
      {
        type: "list",
        items: [
          "Train the dog in front of you — respond to Wobbles' actual personality, not Cavoodle stereotypes.",
          "Exercise before training: a puppy with the zoomies cannot concentrate. Play first, then train.",
          "Manage the environment instead of punishing: gates, pens, leashes indoors, and nothing chewable left out.",
          "Capture good behaviour: the instant he does something you like, mark and reward it.",
          "Progress with the 3 Ds — distance, duration, distraction — one at a time.",
          "Mistakes are information, not disobedience. If he fails, the exercise was too hard; make it easier.",
        ],
      },
      {
        type: "warn",
        title: "Bias caveat — Zak George",
        text: "Critics argue Zak's YouTube-friendly style under-serves serious behaviour cases and suits highly food- or toy-motivated dogs best. 'Balanced' trainers dispute his blanket rejection of aversives. That said, the American Veterinary Society of Animal Behavior's position statements side firmly with reward-based training as first-line and warn that punishment-based methods carry welfare and aggression risks.",
      },
      { type: "h", text: "The consensus, in one paragraph" },
      {
        type: "quote",
        text: "Reward what you like, manage what you don't, socialise early and gently, never use pain or intimidation, and keep sessions short and fun. Every mainstream veterinary behaviour body lands here.",
        source: "Synthesis of AVSAB position statements, Puppy Culture & modern trainer consensus",
      },
      {
        type: "tip",
        title: "Your one job before 16 October",
        text: "The socialisation window is the single highest-leverage project of Wobbles' entire life. Aim for daily, brief, positive exposures: people of all kinds, surfaces, sounds, handling, car rides — and since home is an HDB flat in Woodlands, prioritise lifts, void decks, corridor noise, traffic and the MRT rumble. Once the SG vet signs off at the first visit (~28 Sep — his Protech C3 course finished back on 8 Sep), the 7pm every-other-day park sessions take over: the small park next to the block for the walkable nights, and Woodlands Waterfront Park's dog run (a short drive away, open 24/7 with sea views) when you want off-leash play with other dogs. Positive, brief, and puppy-chooses. Never flood him.",
      },
    ],
  },

  // ────────────────────────────────────────────────────── 3. Coat science
  {
    slug: "coat-science",
    title: "Coat Science",
    emoji: "🧬",
    tagline: "Why fleece coats mat, when it happens, and the red-parti fade",
    readMins: 7,
    blocks: [
      {
        type: "p",
        text: "Wobbles has a breeder-listed FLEECE coat: soft and wavy — the classic low-shedding 'teddy bear' Cavoodle coat. With curly-coated mum Addie and Blenheim Cavalier dad Hughie, his coat blends Poodle curl genes with Cavalier silk. Whatever the exact cross percentages, the fleece coat is what determines his care.",
      },
      { type: "h", text: "The three Cavoodle coat types" },
      {
        type: "table",
        headers: ["Coat", "Look", "Shedding", "Matting risk", "Brushing"],
        rows: [
          ["Hair (straight)", "Silky, Cavalier-leaning", "Moderate", "Low", "1–2×/week"],
          ["Fleece (wavy) ← Wobbles", "Soft waves, teddy-bear look", "Low", "Moderate", "3–4×/week (daily in coat change)"],
          ["Wool (curly)", "Tight Poodle curls", "Lowest", "Highest", "Daily"],
        ],
      },
      {
        type: "p",
        text: "Here's the counterintuitive part: low-shedding dogs mat MORE, not less. Shed hairs don't fall to the floor — they get trapped in the coat, where moisture and friction felt them into mats. 'Non-shedding' is a grooming commitment, not a grooming discount.",
      },
      { type: "h", text: "The coat-change timebomb" },
      {
        type: "timeline",
        items: [
          {
            when: "0–6 months (Jun–Dec 2026)",
            title: "Puppy coat",
            text: "Soft, fluffy, single-texture and deceptively low-maintenance. Use this time to build brushing habits while it's easy.",
          },
          {
            when: "6–12 months (Dec 2026 – Jun 2027)",
            title: "Coat change — DANGER ZONE",
            text: "The adult coat pushes through, texture tightens, and matting risk spikes dramatically. This is when unprepared owners end up with a shaved-down dog. Daily line brushing through this window.",
          },
          {
            when: "12+ months (from Jun 2027)",
            title: "Adult fleece coat",
            text: "Defined wave, denser coat, stable routine: thorough brushing 3–4×/week plus a professional groom every 4–6 weeks.",
          },
        ],
      },
      {
        type: "warn",
        title: "Singapore humidity accelerates matting",
        text: "Moisture tightens tangles into mats. Singapore's year-round humidity means Wobbles' coat will mat faster than it would in Queensland winter. A shorter cut and religious brushing are your friends in the tropics.",
      },
      { type: "h", text: "Where mats form (check these daily)" },
      {
        type: "list",
        items: [
          "Behind and under the ears (his long Cavalier ears are hotspot #1)",
          "Armpits and where the harness sits",
          "Collar line and chest",
          "Belly, groin, and where the back legs meet the body",
          "Tail base and trouser feathering",
        ],
      },
      {
        type: "tip",
        title: "The comb test",
        text: "Grooming isn't judged by the slicker brush — it's judged by a metal comb. If a fine metal comb glides from skin to tip without catching, the coat is genuinely mat-free. If it catches, a mat is forming at the skin even if the surface looks perfect.",
      },
      { type: "h", text: "Will his red patches stay red?" },
      {
        type: "p",
        text: "Probably not entirely. Poodles carry a 'fading gene', and red/apricot coats commonly soften over the first 12–24 months — rich red can mellow toward apricot. His white base stays white, so his Blenheim pattern will remain; only the intensity of the red may change. Take monthly photos: watching the fade is part of the fun.",
      },
      {
        type: "img",
        src: ASSETS.adultRendering,
        alt: "Artist's rendering of Wobbles as an adult Cavoodle",
        caption: "An artist's guess at grown-up Wobbles — fleece coat, Blenheim markings and all.",
      },
    ],
  },


  // NOTE: The former "Grooming Masterclass", "Grooming Psychology" and
  // "Haircut Style Guide" chapters were consolidated into the Home Grooming
  // Master Class page (/grooming). Old slugs redirect in SectionReader.tsx.
  // ─────────────────────────────────────────────────── 7. Daily life hacks
  {
    slug: "daily-hacks",
    title: "Daily Life Hacks",
    emoji: "💡",
    tagline: "Tear stains, muddy paws, floppy ears and mealtime mess",
    readMins: 8,
    blocks: [
      {
        type: "p",
        text: "Wobbles' gorgeous white Blenheim face comes with one catch: everything shows. Tear stains, beard gunk and muddy paws are all more visible on white — so tiny daily habits matter more for him than for a solid-red Cavoodle.",
      },
      { type: "h", text: "Tear stains (his #1 cosmetic battle)" },
      {
        type: "p",
        text: "The rusty streaks under a dog's eyes are porphyrins — iron-containing molecules in tears — plus moisture that feeds bacteria and yeast. Both Cavaliers and Poodles are prone, and light coats show it worst. Triggers include hair poking the eyes, teething (expect a puppy flare-up), blocked tear ducts, food sensitivities, plastic bowls and mineral-heavy tap water.",
      },
      {
        type: "steps",
        items: [
          { title: "Daily 60-second routine", text: "Warm damp cloth or saline wipe from the inner corner outward, a fresh section of cloth per eye. Then — critical — DRY the area thoroughly and comb through the under-eye fur with a tiny flea comb." },
          { title: "Keep it trimmed", text: "Keep eye-corner hair snipped short (ball-tip scissors) so it can't wick tears down the face." },
          { title: "Fix the inputs", text: "Filtered water, stainless or ceramic bowls washed daily, blot his beard after drinking." },
        ],
      },
      {
        type: "warn",
        title: "Never hydrogen peroxide near the eyes",
        text: "It's an old internet 'hack' that can seriously injure eyes. Established stains take 6–8 weeks to grow out — nothing removes them instantly, whatever the bottle claims. See a vet if staining suddenly increases, turns gooey, affects one eye only, or he squints.",
      },
      { type: "h", text: "Floppy-ear care (high priority)" },
      {
        type: "p",
        text: "Wobbles has the double whammy: heavy Cavalier ear flaps that trap moisture, plus Poodle-type hair growing in the canal. Warm, damp, dark ear canals grow yeast — and Queensland and Singapore humidity both make it worse.",
      },
      {
        type: "list",
        items: [
          "Weekly sniff-and-look: a healthy ear is pale pink and nearly odourless. Yeasty smell, brown discharge, head shaking or scratching = vet.",
          "Cleaning: vet-approved ear cleaner only. Fill the canal (without the bottle tip touching the ear), massage the base 30–60 seconds, let him shake, wipe out the visible parts with a cotton ball.",
          "NEVER cotton buds in the canal, never human products, never plain water.",
          "Dry ears after every bath and swim — this is when most infections start.",
          "Keep the hair on the inside of the ear flap trimmed for airflow. Only pluck canal hair if your vet advises it.",
          "A snood at mealtimes keeps those long ears out of the food bowl.",
        ],
      },
      { type: "h", text: "Muddy paws & the entryway station" },
      {
        type: "list",
        items: [
          "Build a cleaning station at the door: absorbent doormat, dedicated towel, and a MudBuster (silicone-bristle cup) or shallow tub for serious mud.",
          "Train 'wait' at the door from puppyhood — a dog who stands calmly for paw wiping is a lifetime gift.",
          "Trim the hair between his paw pads regularly: it collects mud, and overgrown pad hair makes dogs slip on tiles.",
          "Paw wax (like Musher's Secret) is a barrier against mud and hot pavement.",
          "Hot-weather rule for QLD and Singapore: if the pavement is too hot for the back of your hand for 7 seconds, it's too hot for paws.",
        ],
      },
      { type: "h", text: "Mealtime & misc hacks" },
      {
        type: "list",
        items: [
          "Narrow, slightly elevated bowls keep beards and ears from soaking in food and water; blot his beard after drinking.",
          "Y-front harness (not strap-style) reduces armpit matting; take the harness OFF at home and brush friction zones daily.",
          "Cornstarch dusted on chronically damp fur (chin, face folds) keeps it dry — it doubles as emergency styptic powder for nail quicks.",
          "A fine flea comb is the best tool ever invented for eye gunk and beard crumbs.",
        ],
      },
      {
        type: "warn",
        title: "Queensland special: paralysis ticks",
        text: "Until the move, remember Moreton Bay is paralysis-tick country (Ixodes holocyclus) — deadly to dogs. Wobbles needs a vet-recommended tick preventative from homecoming, plus daily fingertip tick checks (ears, face, neck, between toes) after any grass or bush time. Early signs: wobbly back legs, voice change, vomiting. It's an emergency.",
      },
      {
        type: "tip",
        title: "The monthly preventive habit — for life",
        text: "One combined monthly preventive (a chew like NexGard Spectra or Simparica Trio, or a spot-on drip like Revolution Plus) covers ticks, fleas AND heartworm in a single dose — and it starts at homecoming (24 Sep 2026, logged in his calendar). In Singapore this never pauses: heartworm mosquitoes and tropical ticks are active all 12 months, so pick a memorable date (the 24th) and re-dose every month, forever. Log each dose in the Health tracker.",
      },
    ],
  },

  // ───────────────────────────────────────────────────── 8. Products
  {
    slug: "products",
    title: "The Kit List",
    emoji: "🛒",
    tagline: "Budget, mid-range and pro picks for every tool",
    readMins: 6,
    blocks: [
      {
        type: "p",
        text: "You don't need the pro tier on day one. The budget column grooms Wobbles perfectly well; upgrade the tools you use most as your skills grow. The two items worth over-buying from the start: the slicker brush and the metal comb — they're your daily drivers.",
      },
      { type: "h", text: "The tier table" },
      {
        type: "table",
        headers: ["Tool", "Budget", "Mid-range", "Pro"],
        rows: [
          ["Slicker brush", "Hertzko self-cleaning (~$25)", "Artero / quality long-pin (~$40)", "Chris Christensen Big G Coral (~$90)"],
          ["Metal comb", "Any greyhound-style stainless (~$10)", "Andis steel comb (~$20)", "CC Buttercomb (~$40+)"],
          ["Clippers", "Oneisall low-noise kit (~$40–60)", "Wahl Bravura (~$200)", "Andis Pulse ZR2 (~$330)"],
          ["Dryer", "Microfibre towels + human dryer on COOL", "Shelandy HV dryer (~$60–100)", "K9-II / Flying Pig Pro (~$250+)"],
          ["Shampoo", "TropiClean Hypoallergenic Puppy (~$10)", "Earthbath Oatmeal & Aloe (~$20)", "CC Smart Wash / iGroom (~$25–40)"],
          ["Nails", "Dremel PawControl grinder (~$40) + styptic", "Grinder + scratchboard training", "Grinder, diamond bit + LED quick-light"],
        ],
      },
      { type: "h", text: "Shampoo rules (read before buying)" },
      {
        type: "list",
        items: [
          "Dog-specific pH ONLY — human shampoo (including baby shampoo) strips dog skin.",
          "Avoid: sulfates, parabens, phosphates, alcohol, artificial dyes and fragrances, formaldehyde-releasing preservatives.",
          "Prefer: short ingredient lists, oatmeal, aloe, coconut-derived cleansers.",
          "Dilute concentrates per the label (often 10:1–32:1) — a pro bottle lasts a year.",
          "Conditioner EVERY bath on a fleece coat: it cuts matting, speeds drying, and keeps the coat soft.",
          "Whitening shampoos (for his white patches) exist — Bio-Groom Super White — but use sparingly and keep far from eyes.",
        ],
      },
      { type: "h", text: "The small heroes" },
      {
        type: "table",
        headers: ["Item", "Why", "≈ Price"],
        rows: [
          ["Happy Hoodie", "Muffles dryer noise over his ears — the #1 dryer-stress fix", "$10–15"],
          ["Lick mat", "Sticks to the wall; turns grooming into snack time", "$8"],
          ["Detangler spray (e.g. CC Ice on Ice / The Stuff)", "Never brush a dry coat bare", "$20–30"],
          ["Musher's Secret paw wax", "Mud, hot pavement and salt barrier", "$15"],
          ["MudBuster paw cleaner", "Muddy-paw days, solved", "$15–20"],
          ["Snood", "Keeps Cavalier ears out of dinner", "$10"],
          ["Fine flea comb", "Eye gunk and beard crumbs", "$5"],
          ["Styptic powder", "Stops nail-quick bleeding instantly", "$10"],
        ],
      },
      {
        type: "tip",
        title: "Where to buy in Australia",
        text: "PetBarn and Petstock carry the budget–mid tiers; Groomers Direct AU and specialist online stores carry Chris Christensen and pro gear. In Singapore, try Pet Lovers Centre, Kohepets and Perromart. Scissors: never buy cheap no-name shears — trusted brands include Roseline, Kiepe and Groom Professional.",
      },
      {
        type: "quote",
        text: "Buy 'Notes from the Grooming Table' by Melissa Verplank — groomers call it the bible. One reference book beats a hundred conflicting TikToks.",
        source: "Groomer community consensus",
      },
    ],
  },

  // ────────────────────────────────────────────── 9. Internet hacks
  {
    slug: "internet-hacks",
    title: "Best of the Internet",
    emoji: "🌐",
    tagline: "Field-tested wisdom from groomers and owner communities",
    readMins: 6,
    blocks: [
      {
        type: "p",
        text: "Thousands of Cavoodle and doodle owners have made every mistake so you don't have to. Here's the distilled, fact-checked best of Reddit's grooming and doodle communities and professional groomer posts.",
      },
      { type: "h", text: "From professional groomers" },
      {
        type: "list",
        items: [
          "The 'do whatever' default: if you give a groomer no instructions, most will do ~1.5 cm body with a short teddy head. Know what you want.",
          "S.C.E.N.T. weekly check: Skin, Coat, Ears, Nails, Teeth — a 2-minute Sunday habit that catches problems early.",
          "Matted dogs get one humane option: the longest blade that fits UNDER the mats. Head and ears can often be saved — ask.",
          "A 'bath and tidy' appointment between full grooms (often half price) stretches haircut intervals and keeps the coat workable.",
          "Groomers can save a matted head and ears even when the body must be shaved — always ask before agreeing to a full shave-down.",
        ],
      },
      { type: "h", text: "From the owner trenches" },
      {
        type: "list",
        items: [
          "Enforced naps are magic: 30–45 minutes of play, then crate rest. Puppies need 18–20 hours of sleep; nearly all 'crazy biting' is an overtired puppy.",
          "Velcro-dog warning: Cavoodles are bred companions and prone to separation anxiety. Practise short alone-time from week one — leave for 30 seconds, return calmly, build up.",
          "Puppy licence expires: adult dogs tolerate puppy rudeness until ~4–5 months, then start correcting it. Early positive dog-dog socialisation matters.",
          "Take a photo the day of every groom. A folder of 'this length, this style' photos is the best groomer communication tool ever.",
          "The kitchen-sink bath era ends fast — at 8 kg adult weight, a laundry tub or walk-in shower with a hand sprayer is the long-term setup.",
          "Bitter-apple spray on cables, and a 'trade up' policy for stolen items — chase a puppy carrying your sock once, and fetch-the-sock becomes his favourite game forever.",
        ],
      },
      { type: "h", text: "Viral hacks that actually work" },
      {
        type: "table",
        headers: ["Hack", "Verdict"],
        rows: [
          ["Lick mat on the shower wall during baths", "✅ Gold standard — turns bath time into snack time"],
          ["Happy Hoodie for dryer noise", "✅ Groomer-approved, cheap, effective"],
          ["Cornstarch as emergency styptic for nail quicks", "✅ Works (proper styptic powder is faster)"],
          ["Scratchboard so the dog files his own nails", "✅ Real technique — teach 'shake', angle the board"],
          ["Coconut oil for tear stains", "❌ Feeds yeast around the eyes — skip it"],
          ["Hydrogen peroxide on face stains", "❌ Dangerous near eyes — never"],
          ["Shaving a doodle 'to keep him cool'", "⚠️ Never below 6 mm — coats insulate against heat too, and bare skin burns"],
          ["Human detangler / conditioner on dogs", "❌ Wrong pH — dog products only"],
        ],
      },
      {
        type: "tip",
        title: "Rate every source",
        text: "One question filters most bad advice: 'Would a vet or a certified groomer say this on camera?' If a hack involves human medicine, human cosmetics or punishing the dog — close the tab.",
      },
    ],
  },
];

/** All chapters: the puppy year plus the "Growing with Wobbles" lifetime chapters. */
export const SECTIONS: Section[] = [...PUPPY_SECTIONS, ...LIFETIME_SECTIONS];

export { LIFETIME_SECTIONS };

export function getSection(slug: string): Section | undefined {
  return SECTIONS.find((s) => s.slug === slug);
}
