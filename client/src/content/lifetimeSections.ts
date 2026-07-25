/*
 * "Growing with Wobbles" — the lifetime chapters (U1/U7).
 * Written now, read for years: adolescence through the golden twilight.
 * Facts audited against AKC, PDSA, AAHA senior-care guidelines, VCA,
 * Ohio State Honoring the Bond (HHHHHMM QoL scale, Dr Alice Villalobos).
 */
import type { Section } from "./types";

export const LIFETIME_SECTIONS: Section[] = [
  // ─────────────────────────────────────────── 10. Adolescence (12–18 mo)
  {
    slug: "adolescence",
    title: "The Teenage Months",
    emoji: "🌪️",
    tagline: "12–18 months: selective hearing, boundary tests, and how to win",
    readMins: 7,
    stage: "12–18 months",
    unlockMonths: 12,
    blocks: [
      {
        type: "p",
        text: "Somewhere around his first birthday, the sweet puppy who watched your every move discovers he has opinions. Adolescence in dogs is real and measurable — hormone shifts and a rewiring brain, just like human teenagers. Studies at the University of Nottingham found adolescent dogs are genuinely less responsive to known cues from their own carers (while obeying strangers fine), and that it passes. Cavoodles hit this phase roughly 12–18 months; being a small-cross he matures faster than a big dog, so by a year and a half the storm is mostly over.",
      },
      { type: "h", text: "What changes (and what doesn't)" },
      {
        type: "list",
        items: [
          "Selective hearing: 'sit' and 'come' suddenly seem negotiable. He hasn't forgotten — he's testing whether the rules still apply.",
          "Energy spikes: bigger zoomies, more stamina, and a dog who can now out-walk you.",
          "Boundary testing: counter-surfing attempts, stealing socks for a game of chase, pushing at furniture rules.",
          "A second fear-ish patch: some dogs get briefly spookier about things they were fine with. Don't force it; re-socialise gently.",
          "What doesn't change: his bond with you. Adolescent dogs test their people precisely because they're securely attached.",
        ],
      },
      { type: "h", text: "The playbook" },
      {
        type: "steps",
        items: [
          {
            title: "Consistency beats intensity",
            text: "Everyone in the flat enforces the same rules, every time. One person allowing the sofa while another bans it teaches him rules are negotiable — the exact lesson you don't want a teenager learning.",
          },
          {
            title: "Re-run the basics in harder places",
            text: "Recall in the living room means nothing at the park. Take the known cues on tour: hallway, void deck, park at quiet hours, park at busy hours. Pay generously — adolescents work for wages, not praise alone.",
          },
          {
            title: "Manage, don't battle",
            text: "If he counter-surfs, clear the counters. If he steals socks, close the laundry basket. Removing the opportunity beats winning the argument.",
          },
          {
            title: "Burn the energy on his brain",
            text: "A 10-minute scent game tires him more than a 30-minute walk. Snuffle mats, find-it games, and new walking routes keep the teenage brain busy and out of trouble.",
          },
        ],
      },
      {
        type: "tip",
        title: "Don't take it personally",
        text: "The Nottingham study's most charming finding: adolescent dogs ignore their own person more than strangers — exactly like human teens are worst for their own parents. It's a sign of attachment, not defiance. Keep training sessions short, cheerful and well-paid, and the adult dog who emerges around 18 months will be the one you built.",
      },
      {
        type: "warn",
        title: "Don't skip walks as punishment",
        text: "An under-exercised adolescent is a destructive adolescent. However cheeky he's been, the walk still happens — structure and outlets are the treatment, not the reward.",
      },
      { type: "h", text: "Desexing decision window" },
      {
        type: "p",
        text: "If Wobbles isn't desexed yet, this is the window most vets in Singapore suggest for small breeds — commonly between 6 and 12 months, with some preferring to wait until skeletal maturity around 12 months. Talk it through at the annual check-up: timing affects coat texture in Poodle crosses (desexed coats often thicken — expect more matting), weight tendency (metabolism drops ~20–25%, so meals adjust), and behaviour. There's no single right answer; there is a right conversation with your vet.",
      },
    ],
  },

  // ─────────────────────────────────────────── 11. Adult rhythm (1.5–4 yr)
  {
    slug: "adult-rhythm",
    title: "The Settled Rhythm",
    emoji: "🧭",
    tagline: "1½–4 years: the maintenance years, and how not to coast",
    readMins: 6,
    stage: "1½–4 years",
    unlockMonths: 18,
    blocks: [
      {
        type: "p",
        text: "By a year and a half, the hard work pays off: the routines are his now, the manners are set, and life finds its rhythm. The danger of these years is complacency — adult dogs drift quietly. A kilo creeps on over a year of extra treats; tartar builds silently; the groom interval stretches from 5 weeks to 8. This chapter is the maintenance manual: short, because the whole point is a sustainable rhythm.",
      },
      { type: "h", text: "The adult care rhythm" },
      {
        type: "table",
        headers: ["Cadence", "What happens"],
        rows: [
          ["Daily", "Two walks (Singapore heat rules still apply: early morning, after sunset), brush the coat, fresh water, meal times fixed"],
          ["3× a week", "Teeth — the single highest-value habit; small breeds lose teeth young without it"],
          ["Weekly", "Ears checked and wiped, quick paw + skin once-over during the brush"],
          ["Monthly", "Weigh-in (log it), nail check, parasite prevention on the 24th, flea/tick/heartworm per vet plan"],
          ["Every 4–6 weeks", "Full groom — home or salon; never let the coat blow past 6 weeks in this climate"],
          ["Yearly", "Vet check + booster around his birthday (26 June), PALS licence renewal, weight/diet review"],
        ],
      },
      { type: "h", text: "Feeding the adult dog" },
      {
        type: "p",
        text: "Adult Cavoodles typically eat twice a day. The right amount is the amount that keeps his ribs easy to feel but not see — body condition beats any number on a packet. Recalibrate after desexing (needs drop ~20%), and remember treats count: a dental chew plus training treats can quietly add 20% to his calories. The monthly weigh-in is your early-warning system; healthy adult weight for a Cavoodle his size is roughly 5–7 kg, and drift beyond ±10% of his stable adult weight is worth a diet conversation.",
      },
      { type: "h", text: "Keep the brain young" },
      {
        type: "list",
        items: [
          "One new trick a month — the Training School curriculum doesn't end at graduation.",
          "Rotate toys weekly; a 'new' old toy is nearly as exciting as a genuinely new one.",
          "Change walking routes — new smells are a dog's newspaper.",
          "Scent games and food puzzles on rainy days (Singapore has plenty).",
          "Keep recall paid for life. A recall that stops earning treats stops working.",
        ],
      },
      {
        type: "tip",
        title: "The annual birthday audit",
        text: "Every 26 June, do a 15-minute audit alongside the cake: weight trend over the year, teeth photo compared to last year's, coat condition, booster booked, PALS renewed, and one honest question — is he getting enough exercise and company? Small course-corrections yearly beat big interventions later.",
      },
    ],
  },

  // ─────────────────────────────────────────── 12. Prime years (4–8 yr)
  {
    slug: "prime-years",
    title: "The Prime of His Life",
    emoji: "🌤️",
    tagline: "4–8 years: full stride — and the art of spotting quiet change",
    readMins: 6,
    stage: "4–8 years",
    unlockMonths: 48,
    blocks: [
      {
        type: "p",
        text: "Four to eight are the glory years: a dog in full stride, routines effortless, personality fully bloomed. But this is also when ageing starts invisibly. Dental disease, weight drift, early joint wear and (in Cavalier crosses) heart murmurs all tend to begin here — quietly. The owner's job in the prime years is gentle vigilance: keep the rhythm, and watch for the subtle stuff.",
      },
      { type: "h", text: "What to watch for" },
      {
        type: "list",
        items: [
          "Weight drift: the single most common midlife issue. Extra weight is extra load on joints and heart — keep the monthly weigh-in sacred.",
          "Dental wear: look in his mouth weekly. Red gums, brown tartar, or breath that clears the room mean a vet dental — small breeds often need a professional clean around 5–7.",
          "Stamina dips: slower on the stairs, lagging on the second walk, hesitating before jumping onto the sofa. These are data points, not just 'getting older'.",
          "Heart health: Cavalier King Charles Spaniels carry a known risk of mitral valve disease, and Cavoodles inherit a diluted version of that risk. Ask the vet to listen carefully at every annual — murmurs caught early are managed best.",
          "Lumps and bumps: run your hands over him during grooms. Most lumps in midlife are harmless fatty lipomas, but every new one gets shown to the vet.",
        ],
      },
      {
        type: "warn",
        title: "The Cavalier heart",
        text: "Mitral valve disease is the big inherited risk from the Cavalier side. In Cavoodles the Poodle cross substantially reduces it, but it doesn't erase it. From age 5 onward, make 'please listen to his heart' an explicit ask at every annual check. An early murmur often needs nothing but monitoring — the point is knowing.",
      },
      { type: "h", text: "The midlife tune-up" },
      {
        type: "steps",
        items: [
          {
            title: "Keep the annual vet visit honest",
            text: "Bring the tracker data: weight trend, any stamina notes, photos of anything odd. Five minutes of logs turns a routine consult into a genuinely useful one.",
          },
          {
            title: "Consider a baseline blood panel around 6",
            text: "A blood + urine panel while he's healthy gives the vet a personal 'normal' to compare against when he's older. Cheap insurance.",
          },
          {
            title: "Mind the joints early",
            text: "Keep him lean, keep walks regular, and add ramps or steps if he's a serial sofa-jumper. Cavoodles can carry the Cavalier tendency to luxating patellas — a skippy back leg gets a vet look.",
          },
          {
            title: "Refresh the old skills",
            text: "Prime-years dogs coast on reputation. Re-proof recall and loose-lead yearly; it keeps walks safe and his brain in the game.",
          },
        ],
      },
      {
        type: "tip",
        title: "Photograph the ordinary",
        text: "In the prime years you stop photographing him because he always looks the same. Take the boring photos anyway — the Tuesday-afternoon-nap photos. Years from now, those are the ones that matter. (The Memories page has a home for every one.)",
      },
    ],
  },

  // ─────────────────────────────────────────── 13. Golden years (8–12 yr)
  {
    slug: "golden-years",
    title: "The Golden Years",
    emoji: "🍂",
    tagline: "8–12 years: the senior gentleman's care plan",
    readMins: 8,
    stage: "8–12 years",
    unlockMonths: 96,
    blocks: [
      {
        type: "p",
        text: "Around eight, a small dog like Wobbles officially becomes a senior — though Cavoodles, blessed with hybrid vigour and a typical 13–16 year lifespan, often wear it lightly. Senior is not sick. It's a shift in the care rhythm: twice-yearly vet visits instead of annual, more attention to comfort, and a new habit — the monthly quality-of-life check-in — that keeps love honest with observation.",
      },
      { type: "h", text: "The senior care rhythm — what changes" },
      {
        type: "table",
        headers: ["Area", "The senior upgrade"],
        rows: [
          ["Vet visits", "Twice a year, with annual (then twice-yearly from ~10) blood + urine panels. Kidney, liver and thyroid trouble show in blood long before behaviour"],
          ["Walks", "Same regularity, gentler intensity. Two shorter sniffy walks beat one long march. Let him set the pace"],
          ["Bedding", "Orthopaedic memory-foam bed; one on each floor he uses. Warmth matters — old joints hate the aircon draught"],
          ["Jumps", "Ramps or steps for sofa and bed. Every jump avoided is arthritis postponed"],
          ["Food", "Senior formula around 8–10 on vet advice: fewer calories, joint support, easier chewing if teeth are tired"],
          ["Grooming", "Shorter sessions, extra padding on the table, more breaks. Arthritis makes long stands hard — split the groom over two days if needed"],
          ["Teeth", "More important than ever. Dental pain is the great hidden misery of old dogs — and utterly fixable"],
        ],
      },
      { type: "h", text: "The big four of senior health" },
      {
        type: "steps",
        items: [
          {
            title: "Arthritis (very likely, very treatable)",
            text: "Stiff mornings, hesitating at stairs, licking joints. Modern arthritis care is excellent — weight control, joint supplements, and genuinely effective pain meds. A senior dog who 'slowed down' often speeds back up on the right treatment.",
          },
          {
            title: "Dental disease (near-universal)",
            text: "By 8+, most small dogs have some. Signs: breath, drooling, chewing on one side, dropping food. A dental under anaesthesia is safe for most seniors after a pre-anaesthetic blood panel — untreated tooth root abscesses are far riskier than the procedure.",
          },
          {
            title: "Heart (the Cavalier watch continues)",
            text: "If a murmur appears, the vet may suggest an echo scan and possibly medication. Cough at night or after exercise, breathing faster at rest (count: over ~30 breaths/min asleep is worth a call), or tiring quickly — call the vet.",
          },
          {
            title: "Cognitive change (the quiet one)",
            text: "Canine cognitive dysfunction — night pacing, staring at walls, getting 'stuck' in corners, forgetting the toilet routine. Report early: enrichment, diet supplements and medication genuinely slow it.",
          },
        ],
      },
      { type: "h", text: "The monthly quality-of-life check-in" },
      {
        type: "p",
        text: "From eight onward, the Health page carries a monthly check-in built on the HHHHHMM scale used by veterinary palliative care (Dr Alice Villalobos): Hurt, Hunger, Hydration, Hygiene, Happiness, Mobility, and More-good-days-than-bad. Seven questions, scored 0–5, five quiet minutes a month. While he's thriving it's a two-minute victory lap — but doing it monthly builds the baseline that makes real change unmissable later, and takes the guesswork out of the hardest conversations years down the road.",
      },
      {
        type: "tip",
        title: "Seniors still learn",
        text: "An old dog absolutely learns new tricks — often better than the teenager did, because he's actually listening. Keep one easy trick in rotation, keep scent games going, keep him in the family bustle. Mental engagement is the best cognitive medicine there is.",
      },
      {
        type: "warn",
        title: "'He's just old' is not a diagnosis",
        text: "Almost every 'just old age' sign — slowing down, drinking more, sleeping more, accidents — is also a sign of a treatable condition. The rule for the golden years: every change gets a vet conversation before it gets a shrug.",
      },
    ],
  },

  // ─────────────────────────────────────────── 14. Twilight care (12+ yr)
  {
    slug: "twilight-care",
    title: "Every Day Is the Good Stuff",
    emoji: "🕯️",
    tagline: "12+ years: comfort, joy, and honest love for a grand old man",
    readMins: 7,
    stage: "12+ years",
    unlockMonths: 144,
    blocks: [
      {
        type: "p",
        text: "Cavoodles commonly live 13–16 years, so the twilight can be long and genuinely sweet. The job description simplifies beautifully: keep him comfortable, keep him included, and fill the days with small joys. This chapter is written years ahead of when it's needed — because the family that reads it early makes calmer, kinder decisions when the time comes.",
      },
      { type: "h", text: "Comfort is the curriculum" },
      {
        type: "list",
        items: [
          "Warmth: old dogs feel the aircon. A blanket nest away from draughts, maybe a light jumper on cold-office days.",
          "Traction: bare tile is treacherous for weak hips. Runner rugs and yoga-mat strips along his routes make the flat walkable again.",
          "Short happy outings: five slow minutes of sniffing the void deck beats a walk that leaves him sore. He decides the distance.",
          "Food he loves: appetite fades in very old dogs. Warm the food, add a spoon of the good stuff (vet-approved), hand-feed if he enjoys it. Calories now outrank rules.",
          "Night lights: old eyes struggle in the dark. A soft night light along the toilet route prevents 3am confusion.",
          "Keep him in the middle of things: carry him to the couch, take him on café trips in the carrier. Inclusion is the best medicine for old-dog blues.",
        ],
      },
      { type: "h", text: "The monthly check-in becomes the compass" },
      {
        type: "p",
        text: "In the twilight, the HHHHHMM quality-of-life check-in on the Health page graduates from habit to compass. Score honestly each month — and any time something changes. A total above 35 out of 70 on the classic scale (we score 0–5 per question, above ~21 of 35) generally means quality of life is acceptable and treatments are worth continuing. What the scale really does is replace the fog of 'is he okay?' with a trend line the whole family can see and discuss — including with the vet.",
      },
      {
        type: "h",
        text: "The hardest, kindest conversation",
      },
      {
        type: "p",
        text: "One day — hopefully many, many years from now — the trend line will bend down and not come back. Veterinarians offer a gentle framework: more bad days than good days, week after week; the loss of the things that made him him (the ball, the greeting at the door, the joy in food); pain that medication no longer manages. When those hold true, letting go is not giving up — it's the final act of the care this whole handbook is about. Talk about it as a family before you're in it. Decide what 'his worst day' looks like while you're calm, so you never have to invent the answer while you're heartbroken.",
      },
      {
        type: "quote",
        text: "Better a week too early than a day too late.",
        source: "The advice veterinarians most often give — and the hardest to hear",
      },
      {
        type: "tip",
        title: "Write things down now",
        text: "The Memories page holds seventeen-odd years of photos, firsts, and daily logs by the time you read this chapter for real. Add to it deliberately in the twilight: the sound of his snore, the exact way he asks for dinner, the Tuesday-afternoon sunbeam spot. Grief is lighter when the remembering has already been done together.",
      },
      {
        type: "p",
        text: "And then — after however long the goodbye takes — remember what Wobbles would want: dinner on time, walks with sniffing, and his people happy. This handbook began before he came home. It doesn't end; it just becomes the story of a very good dog, kept by the family who loved him properly, from the first day to the last.",
      },
    ],
  },
];
