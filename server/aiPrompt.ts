/*
 * Ask Paddington — profile, age/stage, and system prompt.
 */
import type { AiMemoryRow } from "../drizzle/schema";
import { ASK_KNOWLEDGE_PACK } from "./askKnowledge";

export const WOBBLES_PROFILE = {
  name: "Paddington",
  alsoCalled: "Paddy",
  breed: "Cavoodle (Cavalier King Charles Spaniel \u00d7 Toy Poodle), toy size",
  colour: "red parti (Blenheim) \u2014 rich red patches on white, fleece coat",
  sex: "male",
  dob: "2026-06-26",
  homecoming: "2026-09-24",
  expectedAdultWeight: "about 6 kg",
  breeder:
    "The Doghouse QLD (Charmaine), Moreton Bay region, Queensland \u2014 RightPaw-verified, raises litters with Puppy Culture + Early Neurological Stimulation",
  parents: "mum Addie (red Toy Poodle-type, curly coat), dad Hughie (Blenheim Cavalier)",
  home: "Blk 587 Woodlands Drive 16, Woodlands, Singapore (HDB flat; park right next door, Woodlands Waterfront within driving distance)",
  family:
    "Marcus (WFH Mon + Fri, office Tue\u2013Thu) and Chesa (home most days, sometimes office Tue/Thu). Monday is grooming day; Sunday is the Paddy focus day.",
  relocation:
    "Flying from Brisbane to Singapore with Jet Pets on 23 Sep 2026, landing/homecoming 24 Sep (AVS requires 12 weeks minimum age at export — he flies at 12w5d). Needs import permit (valid 90 days from issue), PALS dog licence, and microchip/vaccination paperwork.",
  vaccinations:
    "Protech C3 at the breeder: 11 Aug, 25 Aug, 8 Sep 2026 (dose 3 at ~10.5 weeks). This is an early-finish series, not full protection. Final core dose at \u226516 weeks is expected at SingVet after landing (he turns 16 weeks 15 Oct 2026). Discuss leptospirosis as near-core for a Woodlands park dog.",
} as const;

export interface WobblesAge {
  born: boolean;
  days: number;
  weeks: number;
  remDays: number;
  months: number;
}

export function wobblesAgeServer(now: Date = new Date()): WobblesAge {
  const dob = new Date(WOBBLES_PROFILE.dob + "T12:00:00");
  const ms = new Date(now).setHours(12, 0, 0, 0) - dob.getTime();
  const days = Math.floor(ms / 86400000);
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
  const target = new Date(WOBBLES_PROFILE.homecoming + "T12:00:00").getTime();
  const today = new Date(now).setHours(12, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}

export function currentStage(now: Date = new Date()): string {
  const age = wobblesAgeServer(now);
  const toHome = daysUntilHomecoming(now);
  if (!age.born) return "Not born yet \u2014 the family is preparing the flat and reading up.";
  if (toHome > 0) {
    if (age.weeks < 8)
      return `${age.weeks} weeks old, still with his litter at the breeder in Queensland (${toHome} days until he arrives in Singapore). The breeder handles ENS/enrichment; the family is puppy-proofing and shopping.`;
    return `${age.weeks} weeks old, still at the breeder in Queensland for export prep (${toHome} days until homecoming on 24 Sep 2026; Protech C3 shots 11 Aug / 25 Aug / 8 Sep). Admin sprint: AVS import permit, PALS licence, Jet Pets flight 23 Sep.`;
  }
  const daysHome = -toHome;
  if (age.weeks < 16) {
    if (daysHome <= 3)
      return `Just landed in Singapore (day ${daysHome + 1} home, ${age.weeks} weeks old) \u2014 decompression bubble: quiet flat, toilet-spot repetition, no visitors.`;
    return `${age.weeks} weeks old, ${daysHome} days home \u2014 socialisation sprint (highest leverage until ~16 weeks, then continues): carried outings, 100-things list, day-one skills (name, sit, crate, recall games).`;
  }
  if (age.months < 6)
    return `${age.months} months old \u2014 junior, pre coat change: daily 2-minute brush ritual, loose-lead walking, park ground-contact after SingVet confirms the \u226516-week core dose.`;
  if (age.months < 12)
    return `${age.months} months old \u2014 coat change season (6\u201312 months): matting peaks, daily line brushing of the 5 hotspots, adolescent boundary-testing.`;
  return `${age.months} months old \u2014 adult: brush most days, professional groom every 4\u20136 weeks, watch weight and coat condition.`;
}

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

export function buildWobblesContext(now: Date = new Date()): string {
  const age = wobblesAgeServer(now);
  const ageLine = age.born
    ? `${age.weeks} weeks ${age.remDays} days old (${age.months} months), born ${WOBBLES_PROFILE.dob}`
    : `not born yet (due ${WOBBLES_PROFILE.dob})`;
  return [
    `Name: ${WOBBLES_PROFILE.name} (Paddy). Do not call him Wobbles.`,
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

  return `You are "Ask Paddington", the private family assistant inside Paddington's Handbook \u2014 a keepsake app Marcus and Chesa use to raise their Cavoodle puppy, Paddington (Paddy). Today's date is ${now.toISOString().slice(0, 10)}. Call him Paddington or Paddy, never Wobbles.

## Paddington's profile (verified facts \u2014 always ground answers in these)
${buildWobblesContext(now)}

## Household source of truth (curated 27 Aug 2026 — ground answers here; Never-claim and Vet-only are hard rules)
${ASK_KNOWLEDGE_PACK}

## Paddington's memory book (facts you have learned from past family conversations)
${memoryBlock}

## How to answer
- Be warm, practical and concise \u2014 you are talking to first-time puppy parents on their phones. Prefer short paragraphs or tight bullet lists; use markdown.
- Always tailor advice to Paddington specifically: his exact age today, toy-Cavoodle size, fleece coat, HDB-flat life in Woodlands, Singapore climate (hot, humid, thunderstorms), and the family's weekly rhythm.
- Ground care, medical, and Singapore-law answers in the household source of truth first. If it conflicts with generic dog-internet, follow the pack.
- Use the memory book: if the family told you something before (his weight, what treat works, a quirk), build on it rather than asking again.
- If a question needs information you don't have (e.g. his current weight and none is in memory), give the general answer for his age/breed and ask one short follow-up question.
- Singapore specifics matter: AVS/NParks rules, PALS licensing, HDB-approved breeds, no off-leash in void decks, early-morning or evening walks to beat the heat.

## Safety guardrails (non-negotiable)
- You are not a vet. For anything that could be a medical emergency \u2014 toxin ingestion (chocolate, xylitol, grapes, macadamia nuts, raw yeast dough, lilies), repeated vomiting or diarrhoea, collapse, seizures, breathing trouble, bloat, heatstroke, not eating for 24h+ in a young puppy \u2014 tell them to contact a vet immediately and give first-aid holding steps only. 24h near Woodlands: Westside Emergency Vet Serangoon Garden 6931 0095; VES Whitley 6266 0232. Resident GP (not yet registered): SingVet Woodlands 6365 0308.
- Never diagnose; describe possibilities and always defer to the vet for medication, dosing, or persistent symptoms.
- For puppies under 16 weeks, and until the >=16-week core dose is done in Singapore, flag vaccine limits before recommending ground contact in public areas.`;
}
