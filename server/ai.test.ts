/*
 * Ask Paddington — unit tests for the pure helpers in server/aiChat.ts.
 * The LLM calls themselves are network-bound, so we test everything around
 * them: prompt assembly, memory dedupe/normalisation, distill parsing, and
 * conversation titling.
 */
import { describe, expect, it } from "vitest";
import type { AiMemoryRow } from "../drizzle/schema";
import {
  buildSystemPrompt,
  buildPaddingtonContext,
  classifyAskIntent,
  conversationTitle,
  dedupeNewFacts,
  lockedFactsReply,
  parseDistillResponse,
  wobblesAgeServer,
  contentToText,
  singaporeTodayIso,
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

describe("buildPaddingtonContext", () => {
  it("includes the core profile facts", () => {
    const ctx = buildPaddingtonContext();
    expect(ctx).toContain("Paddington");
    expect(ctx).toContain("Cavoodle");
    expect(ctx).toContain("Singapore");
  });
});

describe("buildSystemPrompt", () => {
  it("contains no memory section when the book is empty", () => {
    const prompt = buildSystemPrompt([]);
    expect(prompt).toContain("Paddington");
    expect(prompt).toContain("nothing recorded yet");
  });

  it("embeds memory facts so answers can personalise", () => {
    const prompt = buildSystemPrompt([
      mem(1, "Paddington weighed 2.1kg on 20 Jul 2026", "health"),
      mem(2, "He loves freeze-dried chicken treats", "food"),
    ]);
    expect(prompt).toContain("memory book");
    expect(prompt).toContain("[health] Paddington weighed 2.1kg on 20 Jul 2026");
    expect(prompt).toContain("freeze-dried chicken treats");
  });
});

describe("parseDistillResponse", () => {
  it("parses a valid JSON payload and keeps valid categories", () => {
    const facts = parseDistillResponse(
      JSON.stringify({
        facts: [
          { fact: "Paddington is scared of the vacuum", category: "behaviour" },
          { fact: "Dinner moved to 6pm", category: "routine" },
        ],
      }),
    );
    expect(facts).toHaveLength(2);
    expect(facts[0]).toEqual({ fact: "Paddington is scared of the vacuum", category: "behaviour" });
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
    const existing = [mem(1, "Paddington loves chicken treats!", "food")];
    const kept = dedupeNewFacts(
      [
        { fact: "Paddington loves chicken treats", category: "food" },
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
      fact: `Unique fact number ${i} about Paddington`,
      category: "other",
    }));
    expect(dedupeNewFacts(many, [])).toHaveLength(5);
  });

  it("drops overlong facts", () => {
    const kept = dedupeNewFacts([{ fact: "x".repeat(600), category: "other" }], []);
    expect(kept).toEqual([]);
  });
});

describe("classifyAskIntent", () => {
  it("treats 'Full schedule please' as a schedule question", () => {
    expect(classifyAskIntent("Full schedule please")).toBe("schedule");
  });

  it("classifies Shiro, vaccines, and flight separately", () => {
    expect(classifyAskIntent("When can he meet Shiro?")).toBe("shiro");
    expect(classifyAskIntent("Is dose 3 park-cleared?")).toBe("vaccines");
    expect(classifyAskIntent("What time is QF51?")).toBe("flight");
  });
});

describe("wobblesAgeServer — Singapore calendar", () => {
  it("matches Home age just after Singapore midnight (not UTC yesterday)", () => {
    // 20 Sep 2026 00:30 SGT = 19 Sep 16:30 UTC. Host-TZ math would be 12w 1d.
    const justAfterMidnightSgt = new Date("2026-09-19T16:30:00.000Z");
    expect(singaporeTodayIso(justAfterMidnightSgt)).toBe("2026-09-20");
    const age = wobblesAgeServer(justAfterMidnightSgt);
    expect(age).toMatchObject({ born: true, weeks: 12, remDays: 2 });
  });
});

describe("contentToText", () => {
  it("joins array parts with line breaks, not commas", () => {
    const text = contentToText([
      { text: "Quiet flat." },
      { text: "Toilet spot." },
      { text: "No visitors." },
    ]);
    expect(text).toBe("Quiet flat.\nToilet spot.\nNo visitors.");
    expect(text).not.toMatch(/,/);
  });
});

describe("lockedFactsReply", () => {
  const preHome = new Date("2026-09-19T02:00:00Z");

  it("answers a schedule ask with the 23 Sep plan, not a fact-sheet dump", () => {
    const reply = lockedFactsReply("Full schedule please", preHome);
    expect(reply).not.toMatch(/model is offline/i);
    expect(reply).not.toMatch(/You asked:/);
    expect(reply).toMatch(/23 Sep/);
    expect(reply).toMatch(/QF51/);
    expect(reply).toMatch(/First 3 days/);
    expect(reply).toMatch(/16 Oct/);
    expect(reply).not.toMatch(/24 Sep/);
  });

  it("keeps Shiro as the parents' dog, not a Woodlands housemate", () => {
    const reply = lockedFactsReply("What's the plan with Shiro?", preHome);
    expect(reply).toMatch(/not a Woodlands housemate/i);
    expect(reply).toMatch(/landed house/i);
  });

  it("does not treat C3 dose 3 as park-cleared", () => {
    const reply = lockedFactsReply("When can he go on the grass?", preHome);
    expect(reply).toMatch(/not.*park-cleared/i);
    expect(reply).toMatch(/16 Oct/);
  });

  it("answers the fourth vaccination as 16 Oct at SingVet, not a C3 recap", () => {
    const reply = lockedFactsReply(
      "When is Paddington scheduled for his fourth vaccination in the SingVet clinic? When should that be?",
      preHome,
    );
    expect(reply).toMatch(/Friday 16 October 2026/);
    expect(reply).toMatch(/SingVet/);
    expect(reply).toMatch(/not\*\* the fourth vaccination/i);
    expect(reply).not.toMatch(/Vaccines — locked dates/);
    expect(reply.indexOf("16 October")).toBeLessThan(reply.indexOf("7 Aug") === -1 ? Infinity : reply.indexOf("7 Aug"));
  });
});
