/*
 * Ask Wobbles — server-side brain for the family AI assistant.
 *
 * Three jobs:
 *  1. buildWobblesContext(): deterministic profile of Wobbles "today"
 *     (age, life stage, Singapore/Woodlands setup, family rhythm).
 *  2. buildSystemPrompt(): assembles the profile + the distilled memory
 *     book + safety guardrails into the system message for every chat.
 *  3. distillMemory(): after each exchange, a structured-JSON LLM call
 *     extracts NEW durable facts about Wobbles so the assistant
 *     genuinely learns him over time.
 *
 * All Wobbles constants are duplicated (small + stable) rather than
 * imported from client code, keeping the server bundle clean.
 */
import { invokeLLM, type Message } from "./_core/llm";
import type { AiMemoryRow } from "../drizzle/schema";

/* ---------------- Wobbles constants (server copy) ---------------- */

export const WOBBLES_PROFILE = {
  name: "Wobbles",
  pedigreeName: "Paddington",
  breed: "Cavoodle (Cavalier King Charles Spaniel \u00d7 Toy Poodle), toy size",
  colour: "red parti (Blenheim) \u2014 rich red patches on white, fleece coat",
  sex: "male",
  dob: "2026-06-26",
  homecoming: "2026-09-18",
  expectedAdultWeight: "about 8 kg",
  breeder:
    "The Doghouse QLD (Charmaine), Moreton Bay region, Queensland \u2014 RightPaw-verified, raises litters with Puppy Culture + Early Neurological Stimulation",
  parents: "mum Addie (red Toy Poodle-type, curly coat), dad Hughie (Blenheim Cavalier)",
  home: "Blk 587 Woodlands Drive 16, Woodlands, Singapore (HDB flat; park right next door, Woodlands Waterfront within driving distance)",
  family:
    "Marcus (WFH Mon + Fri, office Tue\u2013Thu) and Chesa (home most days, sometimes office Tue/Thu). Monday is grooming day; Sunday is the Wobbles focus day.",
  relocation:
    "Flying from Brisbane to Singapore with Jetpets around 18 Sep 2026 (AVS requires 12 weeks minimum age at export; Singapore is AVS Category A/B-exempt for Australia but needs import permit, PALS dog licence, and microchip/vaccination paperwork).",
} as const;

/* ---------------- Age + stage (server-side, deterministic) ---------------- */

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

/** Compact life-stage line matching the app's stage engine. */
export function currentStage(now: Date = new Date()): string {
  const age = wobblesAgeServer(now);
  const toHome = daysUntilHomecoming(now);
  if (!age.born) return "Not born yet \u2014 the family is preparing the flat and reading up.";
  if (toHome > 0) {
    if (age.weeks < 8)
      return `${age.weeks} weeks old, still with his litter at the breeder in Queensland (${toHome} days until he arrives in Singapore). The breeder handles ENS/enrichment; the family is puppy-proofing and shopping.`;
    return `${age.weeks} weeks old, still at the breeder in Queensland for export prep (${toHome} days until homecoming on 18 Sep 2026). Admin sprint: AVS import permit, PALS licence, Jetpets booking.`;
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
    `Name: ${WOBBLES_PROFILE.name} (pedigree name ${WOBBLES_PROFILE.pedigreeName})`,
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

  return `You are "Ask Wobbles", the private family assistant inside Wobbles' Handbook \u2014 a keepsake app Marcus and Chesa use to raise their Cavoodle puppy, Wobbles. Today's date is ${now.toISOString().slice(0, 10)}.

## Wobbles' profile (verified facts \u2014 always ground answers in these)
${buildWobblesContext(now)}

## Wobbles' memory book (facts you have learned from past family conversations)
${memoryBlock}

## How to answer
- Be warm, practical and concise \u2014 you are talking to first-time puppy parents on their phones. Prefer short paragraphs or tight bullet lists; use markdown.
- Always tailor advice to Wobbles specifically: his exact age today, toy-Cavoodle size, fleece coat, HDB-flat life in Woodlands, Singapore climate (hot, humid, thunderstorms), and the family's weekly rhythm.
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
          "NEW durable facts about Wobbles or his family's care setup learned from this exchange. Empty if nothing new and durable.",
        items: {
          type: "object",
          properties: {
            fact: {
              type: "string",
              description:
                "One self-contained fact, past-tense/dated where possible, e.g. 'Wobbles weighed 2.1 kg on 3 Oct 2026'.",
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

export const DISTILL_SYSTEM_PROMPT = `You maintain the long-term memory book for a family's Cavoodle puppy, Wobbles. Given one exchange from their chat with the puppy-care assistant, extract NEW durable facts about Wobbles or the family's care setup that would help answer future questions.

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
    console.warn("[AskWobbles] memory distillation failed:", err);
    return [];
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
      .join("");
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
  const res = await invokeLLM({ messages, maxTokens: 1400 });
  const text = contentToText(res.choices[0]?.message?.content).trim();
  if (!text) throw new Error("Empty reply from the assistant");
  return text;
}

/** Title for a new conversation, derived from the first user message. */
export function conversationTitle(firstMessage: string): string {
  const firstLine = firstMessage.split("\n")[0] ?? "";
  const clean = firstLine.replace(/\s+/g, " ").trim();
  if (!clean) return "New conversation";
  return clean.length <= 60 ? clean : clean.slice(0, 57).trimEnd() + "\u2026";
}
