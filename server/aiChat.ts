/*
 * Ask Paddington — server-side brain for the family AI assistant.
 *
 * Three jobs:
 *  1. buildPaddingtonContext(): deterministic profile of Paddington "today"
 *     (age, life stage, Singapore/Woodlands setup, family rhythm).
 *  2. buildSystemPrompt(): assembles the profile + the distilled memory
 *     book + safety guardrails into the system message for every chat.
 *  3. distillMemory(): after each exchange, a structured-JSON LLM call
 *     extracts NEW durable facts about Paddington so the assistant
 *     genuinely learns him over time.
 *
 * All Paddington constants are duplicated (small + stable) rather than
 * imported from client code, keeping the server bundle clean.
 */
import fs from "node:fs";
import path from "node:path";
import { invokeLLM, type Message } from "./_core/llm";
import type { AiMemoryRow } from "../drizzle/schema";

function readContextFile(name: string): string {
  for (const p of [
    path.join(process.cwd(), "docs/context", name),
    "/home/workdir/artifacts/" + name,
  ]) {
    try { if (fs.existsSync(p)) return fs.readFileSync(p, "utf8"); } catch {}
  }
  return "";
}


/* ---------------- Paddington constants (server copy) ---------------- */

export const WOBBLES_PROFILE = {
  name: "Paddington",
  pedigreeName: "Paddington", // official name (formerly Wobbles)
  breed: "Cavoodle (Cavalier King Charles Spaniel \u00d7 Toy Poodle), toy size",
  colour: "red parti (Blenheim) \u2014 rich red patches on white, fleece coat",
  sex: "male",
  dob: "2026-06-26",
  homecoming: "2026-09-23",
  expectedAdultWeight: "about 8 kg",
  breeder:
    "The Doghouse QLD (Charmaine), Moreton Bay region, Queensland \u2014 RightPaw-verified, raises litters with Puppy Culture + Early Neurological Stimulation",
  parents: "mum Addie (red Toy Poodle-type, curly coat), dad Hughie (Blenheim Cavalier)",
  home: "Blk 587 Woodlands Drive 16, Woodlands, Singapore (HDB flat; park right next door, Woodlands Waterfront within driving distance)",
  family:
    "Marcus (WFH Mon + Fri, office Tue\u2013Thu) and Chesa (home most days, sometimes office Tue/Thu). Monday is grooming day; Sunday is the Paddington focus day.",
  relocation:
    "Flying QF51 BNE \u2192 SIN with Jet Pets on 23 Sep 2026, same-day homecoming in Woodlands (AVS 12-week minimum; he flies at 12w5d). Collect Caboolture Mon 21 Sep; board Eagle Farm 21\u201323 Sep. Mitchville Relopet delivers to Blk 587 after Changi, about 2\u20134h after landing. Needs PALS dog licence before the AVS import licence, plus microchip/vaccination paperwork.",
  vaccinations:
    "Protech C3: dose 1 on 7 Aug 2026 (batch 4964023A, Dr Ayana Lowe, Fetch a Vet North Lakes; weight 1.6 kg; microchip 900164002411316). Dose 2 on 21 Aug 2026. Dose 3 on 4 Sep 2026 in Queensland. Dose 3 is NOT the 16-week core and he is NOT park-cleared. Singapore \u226516-week core on or after Friday 16 Oct 2026, then a Singapore vet nod before public grass. First SG vet visit is booked Friday 2 Oct 2026 at 4pm (SingVet Woodlands). That visit is paperwork, not the 16 Oct core.",
} as const;

/* ---------------- Age + stage (server-side, deterministic) ---------------- */

export interface PaddingtonAge {
  born: boolean;
  days: number;
  weeks: number;
  remDays: number;
  months: number;
}

function ymdSingapore(now: Date): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Singapore",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const n = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { y: n("year"), m: n("month"), d: n("day") };
}

function calendarDaysSince(iso: string, now: Date): number {
  const [by, bm, bd] = iso.split("-").map(Number);
  const t = ymdSingapore(now);
  return Math.round((Date.UTC(t.y, t.m - 1, t.d) - Date.UTC(by, bm - 1, bd)) / 86400000);
}

export function singaporeTodayIso(now: Date = new Date()): string {
  const t = ymdSingapore(now);
  return `${t.y}-${String(t.m).padStart(2, "0")}-${String(t.d).padStart(2, "0")}`;
}

export function wobblesAgeServer(now: Date = new Date()): PaddingtonAge {
  const days = calendarDaysSince(WOBBLES_PROFILE.dob, now);
  if (days < 0) return { born: false, days: 0, weeks: 0, remDays: 0, months: 0 };
  return {
    born: true,
    days,
    weeks: Math.floor(days / 7),
    remDays: days % 7,
    months: Math.floor(days / 30.44),
  };
}

export function daysUntilHomecoming(now: Date = new Date()): number {
  return -calendarDaysSince(WOBBLES_PROFILE.homecoming, now);
}

/** Compact life-stage line matching the app's stage engine. */
export function currentStage(now: Date = new Date()): string {
  const age = wobblesAgeServer(now);
  const toHome = daysUntilHomecoming(now);
  if (!age.born) return "Not born yet \u2014 the family is preparing the flat and reading up.";
  if (toHome > 0) {
    if (age.weeks < 8)
      return `${age.weeks} weeks old, still with his litter at the breeder in Queensland (${toHome} days until he arrives in Singapore). The breeder handles ENS/enrichment; the family is puppy-proofing and shopping.`;
    return `${age.weeks} weeks old, still at the breeder in Queensland for export prep (${toHome} days until homecoming on 23 Sep 2026; Protech C3: dose 1 done 7 Aug, dose 2 due 21 Aug, dose 3 ~4 Sep). Admin sprint: AVS import permit, PALS licence, Jet Pets flight 23 Sep.`;
  }
  const daysHome = -toHome;
  if (age.weeks < 16) {
    if (daysHome <= 3)
      return `Just landed in Singapore (day ${daysHome + 1} home, ${age.weeks} weeks old) \u2014 decompression bubble: quiet flat, toilet-spot repetition, no visitors.`;
    return `${age.weeks} weeks old, ${daysHome} days home \u2014 socialisation sprint (window closes ~16 weeks): carried outings, 100-things list, day-one skills (name, sit, crate, recall games).`;
  }
  if (age.months < 6)
    return `${age.months} months old \u2014 junior, pre coat change: daily 2-minute brush ritual, loose-lead walking, park sessions once fully vaccinated.`;
  if (age.months < 12)
    return `${age.months} months old \u2014 coat change season (6\u201312 months): matting peaks, daily line brushing of the 5 hotspots, adolescent boundary-testing.`;
  return `${age.months} months old \u2014 adult: brush most days, professional groom every 4\u20136 weeks, watch weight and coat condition.`;
}

/* ---------------- System prompt ---------------- */

/* ---------------- Breeder notes (Charmaine, The Doghouse QLD) ---------------- */

/**
 * Verified facts from the in-person conversation with Charmaine (breeder/trainer)
 * recorded during Marcus's visit to The Doghouse QLD before Paddington's homecoming.
 * These are ground-truth inputs — always prefer these over general breed advice.
 */
export const BREEDER_NOTES = `
### Health & genetics (from Charmaine, The Doghouse QLD)
- No health issues observed in the litter so far (no diarrhoea, vomiting, or skin problems as of the visit).
- First vaccination and full vet check completed 7 Aug 2026 (6 weeks old) by Dr Ayana Lowe BVSc(Hons)BSc, Fetch a Vet Pty Ltd (mobile vet, North Lakes QLD). Results: all clear — healthy young pet, fit for vaccination.
- Vet health report (7 Aug 2026): Weight 1.6 kg. Demeanour bright, alert, responsive. Gums pink and moist, CRT <2 sec. Ears, eyes, nose: no abnormalities. Lymph nodes normal. Oral: no abnormalities. Heart: no murmur, regular rhythm, rate normal. Chest: normal bronchovesicular sounds, eupnoeic, respiratory rate normal (20–40/min). Abdomen: soft and comfortable. Urogenital/perineal: no abnormalities. No umbilical hernia, no inguinal hernia, no hind dewclaws. Temperature 38.0°C. Musculoskeletal: no abnormalities. Skin/coat: good condition, no ectoparasites. Neuro: normal.
- Microchip 900164002411316 implanted 7 Aug 2026, located between shoulder blades. Registered to breeder Charmaine Botha, 9–13 Lemon Grove, Caboolture QLD 4510.
- Protech C3 dose 1 administered 7 Aug 2026, batch 4964023A, expiry 21 Apr 2027. Booster (dose 2) due 21 Aug 2026.
- Base-narrow canines are very common in Cavoodle puppies at first vet check — the bottom canine tooth can touch the gum. In almost all cases the jaw widens naturally as the puppy grows, the baby tooth falls out, and the adult tooth aligns correctly. Surgical removal is extremely rare (Charmaine has seen it once in her entire breeding career). Do not panic if the vet flags this.
- Charmaine screens breeding dogs with: annual physical examinations, radiographic X-rays of knees and hips (scored by a governing body), echocardiograms by a specialist canine cardiologist, and specialist ophthalmologist eye examinations. Dad Hughie has had all radiographic and cardiac screening — his hips, elbows, and knees are excellent. Mum Addie has had annual physicals; her offspring retained in the breeding program have had full radiographic screening and all are good.
- Cavaliers can be a sickly breed (heart, joints), but crossing with Poodle hybridises and improves robustness. Paddington's dad is described as "genetically blessed" for a Cavalier.
- Patellar luxation and hip dysplasia have a genetic AND environmental component. Charmaine's health guarantee does not cover these because the environmental component is the owner's responsibility.
- Joint safety rules (critical — joints only fuse at 18 months; before that, bone-to-bone connection is ligament only):
  • Keep hair on paws trimmed short so he does not slip on tiles/wooden floors.
  • Buy couch/sofa stairs and train him not to jump down from elevated surfaces onto hard floors.
  • Do NOT play ball, tug, or chase games on slippery floors.
  • The less slipping on hard floors before 18 months, the better the joint alignment will be long-term.
  • Do NOT put shoes on him — trimmed paw hair is the correct solution.

### Food & feeding (from Charmaine)
- Paddington has been eating beef, lamb, and kangaroo so far. Beef is his favourite; he enjoyed lamb at dinner. He does not love kangaroo yet.
- Charmaine feeds her dogs real food (human-grade fresh food, similar to the Australian brand Lika — meat, vegetables, quinoa, pumpkin seeds). She also leaves Royal Canin dry kibble out at all times as a free-choice snack.
- Cavoodles are NOT food-driven and are NOT overeaters. You do not need to measure food portions — they eat until satisfied and stop. Leaving dry kibble out freely is fine for this breed.
- Puppies may eat very little or have reduced appetite for the first 1–2 weeks in a new home because of stress (they think they are in danger). This is normal. They will not starve — they have a will to survive. Appetite returns fully once they feel safe.
- Feeding by hand (small pieces of boiled chicken or fresh food) is an excellent bonding technique in the first days home.
- Boiled plain chicken is fine as a treat or hand-feeding bonding tool, but not as a complete diet (lacks fibre and vegetables).
- Store-bought chicken can trigger skin and ear allergies in Cavoodles — not because of the chicken itself, but because of the hormones and additives in commercial chicken. Organic chicken would likely be fine. No allergies observed in this litter so far.
- Puppies can be distracted mid-meal (take a bite, get distracted, come back). This is normal for the breed. Leaving kibble out during the day means they can snack when hungry.
- Remove food at night — if food is left down overnight, puppies eat more and produce more stools during the night.
- Cavoodles respond well to praise as a training reward — they are companion/lap dogs bred to please. Treats work too, but praise alone can be equally effective. Find a high-value treat they love (e.g. kangaroo jerky for adults; small puppy treats for young Paddington) for training.
- Greek yogurt (plain, no added sugar) is safe for Paddington to eat.

### Toilet training (from Charmaine)
- Charmaine trains puppies to toilet on a metal grid placed over a pee pad. The grid holds the pad down (prevents chewing) and gives a consistent texture the puppy learns to associate with toileting. Buy from a hardware store (landscape/gardening section — used for growing creepers up walls), not a pet shop.
- Puppies already naturally prefer to toilet on the grid rather than their sleeping area. Consistency of texture is key — if the surface feels different, the association breaks.
- Astroturf (fake grass) is another option but can become very smelly in an apartment; the metal grid is easier to clean.
- Toilet training method: take Paddington to his toilet spot every 30 minutes. If he does not go, no problem — just keep repeating. Every successful wee or poo on the spot is one step closer to the habit forming. Every accident on the floor is one step toward him thinking he can go anywhere.
- If he has an accident on the floor, use paper towel to absorb the urine and squeeze it onto the pee pad — his scent on the pad teaches him that is where he should go.
- Watch for pre-toilet signals: sniffing in circles, waking up from a nap. Act immediately when you see these.
- Do not get upset at accidents — he is a baby. Clean it up and move on.
- Little boys will eventually lift their leg against a tree or wall when outside, but not yet at this age.

### First days home — settling in (from Charmaine)
- First few days: keep Paddington at home only. No walks or outings. Let him get used to the apartment, Marcus, and Chesa.
- Gentle handling, calm voice, lots of cuddles and reassuring strokes. Hand-feeding is a great bonding tool.
- He will likely be looking for his littermates (or Charmaine's older dogs, who he has been socialising with). He will quickly realise they are not there and bond to the people who feed and care for him.
- Appetite will be reduced for 1–2 weeks — this is normal stress behaviour, not illness.
- Paddington is the most confident puppy in his litter. He startles at sudden sights but recovers quickly. He is not excessively sound-sensitive at this stage. He is not an excessive barker, chewer, or stressor.

### Crate and safe pen setup (from Charmaine)
- Use a "safe pen" (playpen) with the crate inside it. The crate door must always be open (cable-tie it open or remove it) — Paddington must choose to go in himself, never be put in.
- Put his smell blanket (the one he travelled with), smell toy, and comfy bed inside the crate. His scent will remain even after washing.
- Inside the pen during the day: crate (open), food, water, toys, activity toys. At night: remove food (to reduce overnight stools); keep water.
- Cover the crate on two sides with a canvas cover for a den feeling, but leave one side open for airflow — especially important in Singapore's heat.
- A cooling mat inside the crate is a good idea. With aircon, the crate will be comfortable.
- The crate becomes a positive, self-chosen space. Never force him in. Put treats in occasionally so he associates it with good things.
- Recommended: place the pen in the living room (not the bedroom) so he learns to settle himself independently. Having him in the bedroom means every time you get up in the night he wakes up expecting interaction.
- He must be out of the safe pen whenever someone is home and able to supervise. The pen is only for: overnight sleeping, unsupervised periods (Zoom calls, gym, grocery run, going out for dinner). Out of the pen = part of the family, learning the apartment.
- It is important to leave Paddington alone regularly from the start (even for dinner out, a few hours) to prevent separation anxiety. He knows the difference between you being in another room and you being out of the flat entirely.
- Puppies sleep up to 20 hours a day — they are fine being in the pen for reasonable periods.

### Grooming & handling habituation (from Charmaine)
- Daily repetition is the key to all handling tolerance: teeth brushing, ear cleaning, nail trimming, bathing. Do a small amount every day (even 1 minute) rather than a full session once a month. After enough repetitions, he will simply wait for you to finish.
- Use a toothbrush (Charmaine provided one). Daily brushing — after about a year of daily practice, dogs sit calmly for it.
- In Singapore's year-round heat, keep his coat shorter (shorter body, teddy-bear face) to help with temperature regulation. Shorter coat still looks cute on a Cavoodle.
- Trim paw hair regularly to prevent slipping on tiles (also critical for joint health — see above).

### Temperament & personality (from Charmaine)
- Paddington is the most confident puppy in his litter. Startles at sudden sights but recovers quickly. Not excessive with sound sensitivity.
- Not an excessive barker, chewer, or stressor — naturally calm disposition.
- Cavaliers are bred to please. They are companion/lap dogs. They respond to praise and want to make their owners happy. This makes training with praise very effective.
- Trainability not yet fully assessed (doggy-door training and structured training sessions had not started at the time of the visit). Charmaine expected to have a better read after the following week.
- Expected adult size: 7.5–8 kg. Mum is 6.5 kg (Poodle build), dad is ~7.5–8 kg (more solid Cavalier build). Paddington looks more like his dad in face and body structure, so Charmaine expects him to be on the larger/more solid end.
- Sight-sensitive at this stage (startles if something appears suddenly in front of him) but recovers quickly. Not excessively sound-sensitive.

### Night-time and sleep (from Charmaine)
- A small night light near the pen is helpful for the first few nights.
- Playing the same music at night that Charmaine plays helps with the transition (familiar sound cue).
- In Singapore's heat, aircon will be on — the crate will be comfortable. A cooling mat is a good addition.
- Puppies lack body fat and can get cold in cooler climates, but Singapore's warmth means this is less of a concern.

### Frozen Kong recipes (family-approved)
Use a Kong toy stuffed and frozen as enrichment, mental stimulation, or a calming activity. Both recipes are safe for Paddington.

**Savoury Kong**
- Soaked puppy kibble (base layer)
- 1 teaspoon plain Greek yogurt (no added sugar)
- Healthy seeds such as chia seeds
- Boiled skinless chicken (shredded or in small pieces)
Stuff in layers, freeze overnight, serve frozen.

**Sweet Kong**
- Steamed pumpkin, carrots, and sweet potato (mashed or in small pieces)
- Puppy-safe fruits such as blueberries
- Healthy seeds such as chia seeds or flax seeds
- 1 teaspoon plain Greek yogurt (no added sugar)
Stuff in layers, freeze overnight, serve frozen.

Notes: Always use plain Greek yogurt with no added sugar. Boiled chicken is fine as an ingredient here (as a treat component, not a complete meal). Introduce new ingredients one at a time to watch for any reactions. Frozen Kongs are especially useful during crate time, teething, or when Paddington needs to settle.
`.trim();

export const MEMORY_CATEGORIES = [
  "health",
  "training",
  "food",
  "behaviour",
  "routine",
  "grooming",
  "other",
] as const;

export type MemoryCategory = (typeof MEMORY_CATEGORIES)[number];

export function buildPaddingtonContext(now: Date = new Date()): string {
  const age = wobblesAgeServer(now);
  const ageLine = age.born
    ? `${age.weeks} weeks ${age.remDays} days old (${age.months} months), born ${WOBBLES_PROFILE.dob}`
    : `not born yet (due ${WOBBLES_PROFILE.dob})`;
  return [
    `Name: ${WOBBLES_PROFILE.name}`,
    `Breed: ${WOBBLES_PROFILE.breed}`,
    `Coat/colour: ${WOBBLES_PROFILE.colour}`,
    `Sex: ${WOBBLES_PROFILE.sex}; expected adult weight ${WOBBLES_PROFILE.expectedAdultWeight}`,
    `Age today: ${ageLine}`,
    `Life stage right now: ${currentStage(now)}`,
    `Parents: ${WOBBLES_PROFILE.parents}`,
    `Breeder: ${WOBBLES_PROFILE.breeder}`,
    `Home: ${WOBBLES_PROFILE.home}`,
    `Family: ${WOBBLES_PROFILE.family}`,
    `Relocation: ${WOBBLES_PROFILE.relocation}`,
  ].join("\n");
}

export function buildSystemPrompt(
  memoryFacts: Pick<AiMemoryRow, "fact" | "category">[],
  now: Date = new Date(),
): string {
  const memoryBlock =
    memoryFacts.length > 0
      ? memoryFacts.map((m) => `- [${m.category}] ${m.fact}`).join("\n")
      : "(nothing recorded yet \u2014 this memory book fills up as the family chats with you)";

  const locked = readContextFile("LOCKED_FACTS.md");
  const pack = readContextFile("PADDINGTON.md");
  return `You are "Ask Paddington", the private family assistant inside Paddington's Handbook \u2014 a keepsake app Marcus and Chesa use to raise their Cavoodle puppy, Paddington. Today's date is ${singaporeTodayIso(now)}.

## Paddington's profile (verified facts \u2014 always ground answers in these)
${buildPaddingtonContext(now)}

## Verified notes from Paddington's breeder Charmaine (The Doghouse QLD) — treat as ground truth
${BREEDER_NOTES}

## Paddington's memory book (facts you have learned from past family conversations)
${memoryBlock}

## How to answer
- Be warm, practical and concise \u2014 you are talking to first-time puppy parents on their phones. Prefer short paragraphs or tight bullet lists; use markdown.
- **Answer the question first.** Never dump a locked-facts sheet. Never say the model is offline. Never echo "You asked:".
- For "schedule / full day / routine" questions: give a timed plan for today and the next relevant days (homecoming, first 3 days home, daily rhythm, vaccines/park). Do not recap his breed.
- Always tailor advice to Paddington specifically: his exact age today, toy-Cavoodle size, fleece coat, HDB-flat life in Woodlands, Singapore climate (hot, humid, thunderstorms), and the family's weekly rhythm.
- Use the memory book: if the family told you something before (his weight, what treat works, a quirk), build on it rather than asking again.
- If a question needs information you don't have (e.g. his current weight and none is in memory), give the general answer for his age/breed and ask one short follow-up question.
- Singapore specifics matter: AVS/NParks rules, PALS licensing, HDB-approved breeds, no off-leash in void decks, early-morning or evening walks to beat the heat.

## Safety guardrails (non-negotiable)
- You are not a vet. For anything that could be a medical emergency \u2014 toxin ingestion (chocolate, xylitol, grapes, lilies), repeated vomiting or diarrhoea, collapse, seizures, breathing trouble, bloat, heatstroke, not eating for 24h+ in a young puppy \u2014 tell them to contact a vet immediately and give first-aid holding steps only. A 24h option near Woodlands: Animal & Avian Veterinary Clinic or VES Hospital (Whitley).
- Never diagnose; describe possibilities and always defer to the vet for medication, dosing, or persistent symptoms.
- For puppies under 16 weeks, flag vaccination status before recommending ground contact in public areas.`;
}

/* ---------------- Memory distillation ---------------- */

export interface DistilledFact {
  fact: string;
  category: MemoryCategory;
}

export const DISTILL_SCHEMA = {
  name: "wobbles_memory_facts",
  strict: true,
  schema: {
    type: "object",
    properties: {
      facts: {
        type: "array",
        description:
          "NEW durable facts about Paddington or his family's care setup learned from this exchange. Empty if nothing new and durable.",
        items: {
          type: "object",
          properties: {
            fact: {
              type: "string",
              description:
                "One self-contained fact, past-tense/dated where possible, e.g. 'Paddington weighed 2.1 kg on 3 Oct 2026'.",
            },
            category: {
              type: "string",
              enum: [...MEMORY_CATEGORIES],
              description: "Best-fit category for the fact.",
            },
          },
          required: ["fact", "category"],
          additionalProperties: false,
        },
      },
    },
    required: ["facts"],
    additionalProperties: false,
  },
} as const;

export const DISTILL_SYSTEM_PROMPT = `You maintain the long-term memory book for a family's Cavoodle puppy, Paddington. Given one exchange from their chat with the puppy-care assistant, extract NEW durable facts about Paddington or the family's care setup that would help answer future questions.

Extract ONLY things the FAMILY revealed (not the assistant's general advice): measurements (weight, height), health events, food/treat preferences and reactions, training progress and what worked, behaviour quirks, fears, routines, equipment they own, names (vet, groomer, daycare).

Do NOT extract: general dog knowledge, the assistant's suggestions, hypotheticals, questions, anything already in the EXISTING MEMORY list, or transient states ("he is sleepy right now"). Facts must stand alone without the conversation. Date-stamp measurements when the date is known. Return an empty facts array when nothing qualifies \u2014 most exchanges have nothing new.`;

/** Normalise for dedupe comparison. */
export function normaliseFact(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** Filter out facts already known (exact/normalised match) and enforce caps. */
export function dedupeNewFacts(
  candidates: DistilledFact[],
  existing: Pick<AiMemoryRow, "fact">[],
  maxNew = 5,
): DistilledFact[] {
  const known = new Set(existing.map((e) => normaliseFact(e.fact)));
  const out: DistilledFact[] = [];
  for (const c of candidates) {
    const fact = (c.fact ?? "").trim();
    if (!fact || fact.length > 500) continue;
    const key = normaliseFact(fact);
    if (!key || known.has(key)) continue;
    const category = (MEMORY_CATEGORIES as readonly string[]).includes(c.category)
      ? c.category
      : "other";
    known.add(key);
    out.push({ fact, category: category as MemoryCategory });
    if (out.length >= maxNew) break;
  }
  return out;
}

/** Parse the structured distillation response defensively. */
export function parseDistillResponse(raw: unknown): DistilledFact[] {
  let content = raw;
  if (typeof content === "string") {
    try {
      content = JSON.parse(content);
    } catch {
      return [];
    }
  }
  if (!content || typeof content !== "object") return [];
  const facts = (content as { facts?: unknown }).facts;
  if (!Array.isArray(facts)) return [];
  return facts
    .filter(
      (f): f is { fact: string; category: string } =>
        !!f &&
        typeof f === "object" &&
        typeof (f as { fact?: unknown }).fact === "string" &&
        (f as { fact: string }).fact.trim().length > 0,
    )
    .map((f) => ({
      fact: f.fact,
      category: ((MEMORY_CATEGORIES as readonly string[]).includes(f.category)
        ? f.category
        : "other") as MemoryCategory,
    }));
}

/**
 * LLM call: distill new memory facts from one exchange.
 * Returns [] on any failure — memory building must never break the chat.
 */
export async function distillMemory(
  userMessage: string,
  assistantReply: string,
  existing: Pick<AiMemoryRow, "fact">[],
): Promise<DistilledFact[]> {
  try {
    const existingBlock =
      existing.length > 0
        ? existing.map((e) => `- ${e.fact}`).join("\n")
        : "(empty)";
    const messages: Message[] = [
      { role: "system", content: DISTILL_SYSTEM_PROMPT },
      {
        role: "user",
        content: `EXISTING MEMORY:\n${existingBlock}\n\nEXCHANGE:\nFamily: ${userMessage}\nAssistant: ${assistantReply}`,
      },
    ];
    const res = await invokeLLM({
      messages,
      maxTokens: 800,
      response_format: { type: "json_schema", json_schema: DISTILL_SCHEMA },
    });
    const raw = res.choices[0]?.message?.content;
    const text = Array.isArray(raw)
      ? raw.map((p) => (typeof p === "string" ? p : "text" in p ? p.text : "")).join("")
      : raw;
    return dedupeNewFacts(parseDistillResponse(text), existing);
  } catch (err) {
    console.warn("[AskPaddington] memory distillation failed:", err);
    return [];
  }
}

/* ---------------- Offline / locked-facts answers ---------------- */

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function fmtDay(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-SG", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export type AskIntent =
  | "schedule"
  | "shiro"
  | "vaccines"
  | "toilet"
  | "crate"
  | "flight"
  | "firstdays"
  | "food"
  | "vet"
  | "groom"
  | "general";

export function classifyAskIntent(question: string): AskIntent {
  const s = question.toLowerCase();
  if (/\bshiro\b/.test(s)) return "shiro";
  if (/\b(flight|qf51|jet pets|homecoming|changi|landing|arrive|caboolture|eagle farm)\b/.test(s)) return "flight";
  if (/(vaccin|\bc3\b|park[\s-]*clear|grass|16[- ]week|sixteen week)/.test(s)) return "vaccines";
  if (/\b(toilet|pee pad|wee|poo|potty)\b/.test(s)) return "toilet";
  if (/\b(crate|playpen|safe pen|marukan|den)\b/.test(s)) return "crate";
  if (/\b(first days?|decompress|no visitors|quiet days)\b/.test(s)) return "firstdays";
  if (/\b(food|feed|eat|kibble|kong|chicken|appetite)\b/.test(s)) return "food";
  if (/\b(vet|emergency|poison|toxin|vomit|seizure|collapse|heatstroke)\b/.test(s)) return "vet";
  if (/\b(groom|brush|bath|nails|ears|coat)\b/.test(s)) return "groom";
  if (/\b(schedule|timetable|routine|full day|day plan|calendar|full schedule)\b/.test(s)) return "schedule";
  return "general";
}

function scheduleReply(now: Date): string {
  const age = wobblesAgeServer(now);
  const toHome = daysUntilHomecoming(now);
  const today = isoDate(now);
  const ageLine = age.born
    ? `${age.weeks} weeks ${age.remDays} day${age.remDays === 1 ? "" : "s"} old today (${fmtDay(today)}).`
    : "Not born yet.";

  if (toHome > 0) {
    return [
      `**Paddington's schedule from today**`,
      ``,
      `He is still at The Doghouse QLD — ${ageLine} **${toHome} day${toHome === 1 ? "" : "s"}** until he lands.`,
      ``,
      `### Until he flies`,
      `- **${fmtDay("2026-09-21")} (Mon 21 Sep)** — collect him at Caboolture. Then board at Eagle Farm 21–23 Sep.`,
      `- **${fmtDay("2026-09-23")} (Wed 23 Sep)** — homecoming. QF51 Jet Pets, BNE 11:05 → SIN 17:25. Same-day Woodlands delivery to Blk 587 #12-54 via Mitchville Relopet (+65 6482 0084), about 2–4 hours after arrival. No quarantine.`,
      ``,
      `### First 3 days home (23–25 Sep)`,
      `- Flat only. Decompression. Toilet spot, crate as a den, hand-feeding, long naps.`,
      `- **No visitors. No Shiro meeting. No public grass.**`,
      `- Carry to the pad / metal grid every ~30 minutes. No scolding.`,
      ``,
      `### Daily rhythm once the bubble lifts (from ~day 4)`,
      `- **7:15–7:30am** — carry crate → lift → grass (no lobby floor). Breakfast, pad, short play, nap.`,
      `- Loop: play 15–30 min → toilet → nap 45 min–2 h → toilet. He sleeps 18–20 hours.`,
      `- Skip pavement **10am–5pm** (Singapore heat). Dinner ~5pm. Evening after **7pm**.`,
      `- Carry-socialise. Ground/park waits for the **16-week core on Friday 16 Oct** plus a SingVet nod.`,
      ``,
      `### Your week`,
      `- **Sun** — Paddington focus day (both home).`,
      `- **Mon** — both home, grooming day (Marcus WFH).`,
      `- **Tue–Thu** — Marcus office; Chesa home / maybe-office.`,
      `- **Fri** — Marcus WFH. **Sat** — flexible.`,
      ``,
      `SingVet Woodlands is booked for **Friday 2 Oct 2026, 4pm**. Chip, papers, parasite plan. That visit is not the 16 Oct core. C3 dose 3 on 4 Sep is **not** park-cleared.`,
    ].join("\n");
  }

  const daysHome = -toHome;
  if (daysHome <= 3) {
    return [
      `**Quiet days home — day ${daysHome + 1}**`,
      ``,
      `${ageLine} He landed 23 Sep. This is the decompression bubble.`,
      ``,
      `- Stay in the flat. Toilet on the metal-grid pad every ~30 min. No scolding.`,
      `- Crate door open (Marukan medium, living-room pen). Hand-feed. Long naps.`,
      `- **No visitors. No Shiro. No public grass.**`,
      `- From day 4: carry-socialise. SingVet Woodlands is booked for **Friday 2 Oct, 4pm** (not the 16 Oct core).`,
      `- Park / public ground only after **Friday 16 Oct** core plus a vet nod.`,
      ``,
      `Daily loop: play 15–30 min → toilet → nap → toilet. Sleep 18–20 hours. Skip hot pavement 10am–5pm.`,
    ].join("\n");
  }

  const parkOpen = age.weeks >= 16;
  return [
    `**This week's rhythm for Paddington**`,
    ``,
    ageLine,
    ``,
    `- **7:15–7:30am** toilet (carry until he is park-cleared). Breakfast → pad → short play → nap.`,
    `- Loop all day: play → toilet → nap → toilet. Dinner ~5pm. Evening after 7pm.`,
    `- Skip pavement 10am–5pm.`,
    parkOpen
      ? `- 16-week core is in. Public grass only with the Singapore vet's nod.`
      : `- **Not park-cleared.** 16-week core is **Friday 16 Oct 2026**, then a SingVet nod. Carry-socialise until then.`,
    `- **Sun** focus day. **Mon** grooming. Marcus office Tue–Thu, WFH Mon+Fri.`,
    `- SingVet Woodlands is booked for **Friday 2 Oct 2026, 4pm**. Chip, papers, parasite plan. Not the 16 Oct core.`,
    `- Shiro lives at the parents' landed house — managed intros, never unsupervised, not a Woodlands housemate.`,
  ].join("\n");
}

function vaccineReply(question: string): string {
  const s = question.toLowerCase();
  const asksFourth =
    /\b(fourth|4th|4rd)\b/.test(s) ||
    /\b(booster|core shot|16[- ]week|sixteen[- ]week)\b/.test(s) ||
    (/\bsingvet\b/.test(s) && /\b(vaccin|shot|jab|dose)\b/.test(s));

  if (asksFourth) {
    return [
      `**His fourth vaccination is the Singapore ≥16-week core on Friday 16 October 2026, booked at SingVet Woodlands.**`,
      ``,
      `That is the shot — not a fourth C3 in Australia. The three Queensland doses were 7 Aug, 21 Aug and 4 Sep. Dose 3 is **not** park-cleared.`,
      `The first Singapore vet visit is booked for **Friday 2 October 2026, 4pm** at SingVet Woodlands. Chip, papers and the parasite plan. It is **not** the fourth vaccination.`,
      `Book the core **on or after Friday 16 Oct**. Then wait for SingVet's nod before public grass.`,
    ].join("\n");
  }

  if (/\b(grass|park[\s-]*clear|when can he (go|walk|run))\b/.test(s)) {
    return [
      `**Not until Friday 16 Oct 2026, plus a SingVet nod.**`,
      ``,
      `C3 dose 3 on 4 Sep in Queensland is not park-cleared. Carry-socialise until the ≥16-week core, then wait for the vet.`,
    ].join("\n");
  }

  return [
    `**Three C3s in Australia, then the Singapore core.**`,
    ``,
    `- Dose 1: **7 Aug**. Dose 2: **21 Aug**. Dose 3: **4 Sep** (QLD). Dose 3 is not park-cleared.`,
    `- Fourth vaccination = Singapore ≥16-week core on **Friday 16 Oct 2026** at SingVet. Never 15 Oct.`,
    `- First SingVet visit is booked **Friday 2 Oct 2026, 4pm**. Paperwork, not that fourth shot.`,
    `- Public grass only after the core plus the vet's nod.`,
  ].join("\n");
}

export function lockedFactsReply(question: string, now: Date = new Date()): string {
  const intent = classifyAskIntent(question);
  const age = wobblesAgeServer(now);
  const ageLine = `${age.weeks} weeks ${age.remDays} day${age.remDays === 1 ? "" : "s"}`;

  switch (intent) {
    case "schedule":
      return scheduleReply(now);
    case "flight":
      return [
        `**QF51 is Wednesday 23 September 2026.**`,
        ``,
        `- Jet Pets, BNE **11:05** → SIN **17:25**. Homecoming is the same day — not 24 Sep.`,
        `- Collect Caboolture **Mon 21 Sep**. Board Eagle Farm 21–23 Sep.`,
        `- Mitchville Relopet (+65 6482 0084) brings him to Blk 587 #12-54 about 2–4 hours after landing. No quarantine.`,
        `- First 3 days home: flat only, no Shiro, no public grass.`,
      ].join("\n");
    case "firstdays":
      return [
        `**Days 1–3 home (from 23 Sep) are the decompression bubble.**`,
        ``,
        `Quiet flat, toilet spot, crate as a den, hand-feeding, long naps. No visitors. No Shiro meeting. No public grass.`,
        `From about day 4, carry-socialise. Ground time waits for the 16-week core on **Friday 16 Oct** plus a SingVet nod.`,
      ].join("\n");
    case "vaccines":
      return vaccineReply(question);
    case "shiro":
      return [
        `**Shiro is not a Woodlands housemate.**`,
        ``,
        `He is the family's Japanese Spitz, about 11, at Marcus's parents' landed house. Territorial, short temper, not well socialised.`,
        `No meeting in the first 3 days home. After that: short, boring, managed intros — Paddington held or behind a barrier, Shiro on lead, never unsupervised. One HDB licence = Paddington only.`,
      ].join("\n");
    case "toilet":
      return [
        `**Toilet: metal grid over a pad, every ~30 minutes, no scolding.**`,
        ``,
        `Charmaine's method — hardware-store grid so he can't chew the pad. Same texture every time.`,
        `After naps, play, and meals, take him to the spot. Accidents: paper-towel the wee onto the pad so the pad smells right. He is a baby.`,
        `Until the 16 Oct core + vet nod, public grass is carry-only.`,
      ].join("\n");
    case "crate":
      return [
        `**Marukan medium crate, door open, inside the living-room pen.**`,
        ``,
        `He chooses the crate — never forced in. Travel blanket and a cooling mat inside. Cover two sides, leave one open for Singapore airflow.`,
        `Pen is for overnight and unsupervised stretches. Out of the pen whenever someone is home and can watch him. Not in the bedroom at night.`,
      ].join("\n");
    case "food":
      return [
        `**Keep the breeder food for at least the first 2 weeks.** Confirm the exact brand/protein with Charmaine before stocking.`,
        ``,
        `Appetite often dips 1–2 weeks after the move — stress, not a crisis. Hand-feed boiled chicken or his usual food to bond. Remove food at night so nights stay quieter.`,
        `Cavoodles here are not treated as overeaters. No rawhide. Three frozen Kongs ready for night one.`,
      ].join("\n");
    case "vet":
      return [
        `I'm not a vet. For toxin, collapse, breathing trouble, seizures, repeated vomiting/diarrhoea, or a young puppy off food 24h+, go now.`,
        ``,
        `- After landing: **SingVet Woodlands**.`,
        `- After hours: Westside Serangoon / **VES Whitley**.`,
        `First SG visit is booked **Friday 2 Oct 2026, 4pm** at SingVet Woodlands: chip, papers, year-round parasite preventive. Not the 16 Oct core.`,
      ].join("\n");
    case "groom":
      return [
        `**Monday is grooming day.** Fleece mats — brush before water.`,
        ``,
        `Daily 1-minute handling (teeth, ears, paws) beats a monthly battle. Trim paw hair so he doesn't slip on tiles (joints fuse at 18 months).`,
        `Singapore heat: shorter body, teddy face. First full spa once he has settled, not on landing night.`,
      ].join("\n");
    default:
      return [
        `Paddington is a male toy Cavoodle, red parti / Blenheim, fleece — **${ageLine}** today.`,
        ``,
        daysUntilHomecoming(now) > 0
          ? `He is still in Queensland. **QF51 homecoming is Wednesday 23 Sep** (not 24 Sep). First 3 days home: flat only, no Shiro, no public grass.`
          : `He is home in Woodlands. First 3 days were decompression. Public grass waits for **Friday 16 Oct** plus a SingVet nod.`,
        ``,
        `Ask me for the **full schedule**, flight, vaccines, toilet, crate, or Shiro and I'll go straight to the plan — I won't dump a fact sheet.`,
      ].join("\n");
  }
}

/* ---------------- Chat reply ---------------- */

/** Extract plain text from an invokeLLM content payload. */
export function contentToText(raw: unknown): string {
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    return raw
      .map((p) =>
        typeof p === "string" ? p : p && typeof p === "object" && "text" in p ? String(p.text) : "",
      )
      .join("\n");
  }
  return "";
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

/** How many past messages to replay to the model each turn. */
export const HISTORY_WINDOW = 20;

export async function generateAssistantReply(
  history: ChatTurn[],
  memoryFacts: Pick<AiMemoryRow, "fact" | "category">[],
  now: Date = new Date(),
): Promise<string> {
  const recent = history.slice(-HISTORY_WINDOW);
  const messages: Message[] = [
    { role: "system", content: buildSystemPrompt(memoryFacts, now) },
    ...recent.map((m) => ({ role: m.role, content: m.content })),
  ];
  const lastUser = [...recent].reverse().find((m) => m.role === "user")?.content ?? "";
  try {
    const res = await invokeLLM({ messages, maxTokens: 1400 });
    const text = contentToText(res.choices[0]?.message?.content).trim();
    if (!text) throw new Error("Empty reply from the assistant");
    return text;
  } catch (err) {
    console.warn("[Ask Paddington] model unavailable, using locked-facts answer", err);
    return lockedFactsReply(lastUser, now);
  }
}

/** Title for a new conversation, derived from the first user message. */
export function conversationTitle(firstMessage: string): string {
  const firstLine = firstMessage.split("\n")[0] ?? "";
  const clean = firstLine.replace(/\s+/g, " ").trim();
  if (!clean) return "New conversation";
  return clean.length <= 60 ? clean : clean.slice(0, 57).trimEnd() + "\u2026";
}
