/*
 * Ask Paddington — chat reply + memory distillation.
 */
import { invokeLLM, type Message } from "./_core/llm";
import type { AiMemoryRow } from "../drizzle/schema";
import {
  MEMORY_CATEGORIES,
  type MemoryCategory,
  buildSystemPrompt,
} from "./aiPrompt";

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

export function normaliseFact(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

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

export function conversationTitle(firstMessage: string): string {
  const firstLine = firstMessage.split("\n")[0] ?? "";
  const clean = firstLine.replace(/\s+/g, " ").trim();
  if (!clean) return "New conversation";
  return clean.length <= 60 ? clean : clean.slice(0, 57).trimEnd() + "\u2026";
}
