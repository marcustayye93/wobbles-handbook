/*
 * Ask Wobbles — unit tests for the pure helpers in server/aiChat.ts.
 * The LLM calls themselves are network-bound, so we test everything around
 * them: prompt assembly, memory dedupe/normalisation, distill parsing, and
 * conversation titling.
 */
import { describe, expect, it } from "vitest";
import type { AiMemoryRow } from "../drizzle/schema";
import {
  buildSystemPrompt,
  buildWobblesContext,
  conversationTitle,
  dedupeNewFacts,
  parseDistillResponse,
} from "./aiChat";

const mem = (id: number, fact: string, category = "other"): AiMemoryRow =>
  ({
    id,
    fact,
    category,
    sourceConversationId: null,
    active: 1,
    createdAt: new Date(),
  }) as unknown as AiMemoryRow;

describe("conversationTitle", () => {
  it("uses the first line of the message", () => {
    expect(conversationTitle("How much food?\nHe is hungry")).toBe("How much food?");
  });

  it("truncates long titles to 60 chars with an ellipsis", () => {
    const long = "a".repeat(100);
    const title = conversationTitle(long);
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title.endsWith("…")).toBe(true);
  });

  it("falls back for empty input", () => {
    expect(conversationTitle("   ")).toBe("New conversation");
  });
});

describe("buildWobblesContext", () => {
  it("includes the core profile facts", () => {
    const ctx = buildWobblesContext();
    expect(ctx).toContain("Wobbles");
    expect(ctx).toContain("Cavoodle");
    expect(ctx).toContain("Singapore");
  });
});

describe("buildSystemPrompt", () => {
  it("contains no memory section when the book is empty", () => {
    const prompt = buildSystemPrompt([]);
    expect(prompt).toContain("Wobbles");
    expect(prompt).toContain("nothing recorded yet");
  });

  it("embeds memory facts so answers can personalise", () => {
    const prompt = buildSystemPrompt([
      mem(1, "Wobbles weighed 2.1kg on 20 Jul 2026", "health"),
      mem(2, "He loves freeze-dried chicken treats", "food"),
    ]);
    expect(prompt).toContain("memory book");
    expect(prompt).toContain("[health] Wobbles weighed 2.1kg on 20 Jul 2026");
    expect(prompt).toContain("freeze-dried chicken treats");
  });
});

describe("parseDistillResponse", () => {
  it("parses a valid JSON payload and keeps valid categories", () => {
    const facts = parseDistillResponse(
      JSON.stringify({
        facts: [
          { fact: "Wobbles is scared of the vacuum", category: "behaviour" },
          { fact: "Dinner moved to 6pm", category: "routine" },
        ],
      }),
    );
    expect(facts).toHaveLength(2);
    expect(facts[0]).toEqual({ fact: "Wobbles is scared of the vacuum", category: "behaviour" });
  });

  it("coerces unknown categories to 'other'", () => {
    const facts = parseDistillResponse(
      JSON.stringify({ facts: [{ fact: "Something new", category: "astrology" }] }),
    );
    expect(facts[0]?.category).toBe("other");
  });

  it("survives malformed JSON by returning no facts", () => {
    expect(parseDistillResponse("not json at all")).toEqual([]);
    expect(parseDistillResponse(JSON.stringify({ nope: true }))).toEqual([]);
  });

  it("drops empty or non-string facts", () => {
    const facts = parseDistillResponse(
      JSON.stringify({ facts: [{ fact: "   ", category: "food" }, { fact: 42, category: "food" }] }),
    );
    expect(facts).toEqual([]);
  });
});

describe("dedupeNewFacts", () => {
  it("drops facts already in the memory book (case/punctuation-insensitive)", () => {
    const existing = [mem(1, "Wobbles loves chicken treats!", "food")];
    const kept = dedupeNewFacts(
      [
        { fact: "wobbles loves chicken treats", category: "food" },
        { fact: "He sleeps in the laundry", category: "routine" },
      ],
      existing,
    );
    expect(kept).toHaveLength(1);
    expect(kept[0]?.fact).toBe("He sleeps in the laundry");
  });

  it("dedupes within the same batch", () => {
    const kept = dedupeNewFacts(
      [
        { fact: "Crate is in the living room", category: "routine" },
        { fact: "crate is in the living room.", category: "routine" },
      ],
      [],
    );
    expect(kept).toHaveLength(1);
  });

  it("caps a single turn at 5 facts", () => {
    const many = Array.from({ length: 9 }, (_, i) => ({
      fact: `Unique fact number ${i} about Wobbles`,
      category: "other",
    }));
    expect(dedupeNewFacts(many, [])).toHaveLength(5);
  });

  it("drops overlong facts", () => {
    const kept = dedupeNewFacts([{ fact: "x".repeat(600), category: "other" }], []);
    expect(kept).toEqual([]);
  });
});
