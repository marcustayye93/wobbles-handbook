/*
 * Ask Paddington — server-side brain. Split across aiPrompt.ts + aiReply.ts.
 */
export {
  WOBBLES_PROFILE,
  wobblesAgeServer,
  daysUntilHomecoming,
  currentStage,
  MEMORY_CATEGORIES,
  buildWobblesContext,
  buildSystemPrompt,
} from "./aiPrompt";
export type { WobblesAge, MemoryCategory } from "./aiPrompt";

export {
  DISTILL_SCHEMA,
  DISTILL_SYSTEM_PROMPT,
  HISTORY_WINDOW,
  normaliseFact,
  dedupeNewFacts,
  parseDistillResponse,
  distillMemory,
  contentToText,
  generateAssistantReply,
  conversationTitle,
} from "./aiReply";
export type { DistilledFact, ChatTurn } from "./aiReply";
