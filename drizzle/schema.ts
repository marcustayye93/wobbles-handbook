import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/* ============================================================
 * Wobbles' Handbook — household-shared data.
 * This is a private family app: every authenticated user sees
 * and edits the SAME data (no per-user partitioning).
 * ============================================================ */

/** One row per tracker log entry (feeding, toilet, weight, ...). */
export const trackerEntries = mysqlTable("tracker_entries", {
  id: int("id").autoincrement().primaryKey(),
  /** Tracker id from client TRACKERS: feeding | toilet | grooming | weight | poo | health | social | training */
  trackerId: varchar("trackerId", { length: 32 }).notNull(),
  /** ISO date YYYY-MM-DD (local to the family) */
  date: varchar("date", { length: 10 }).notNull(),
  /** hh:mm local time, optional */
  time: varchar("time", { length: 5 }),
  /** Chosen option label, optional (e.g. "Wee", "Breakfast") */
  option: varchar("option", { length: 64 }),
  /** Numeric value, optional (e.g. weight in kg) stored as string to avoid float drift */
  value: varchar("value", { length: 32 }),
  note: text("note"),
  /** Who logged it (users.id) — for "logged by" display */
  createdBy: int("createdBy"),
  createdByName: varchar("createdByName", { length: 120 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrackerEntryRow = typeof trackerEntries.$inferSelect;
export type InsertTrackerEntry = typeof trackerEntries.$inferInsert;

/**
 * Generic key/value store for shared app state that was previously in
 * localStorage: checklist ticks, 100-things done set, reading progress,
 * Singapore step ticks. One row per state key, JSON value.
 * Keys mirror the old localStorage keys (without the "wobbles:" prefix).
 */
export const sharedState = mysqlTable("shared_state", {
  id: int("id").autoincrement().primaryKey(),
  stateKey: varchar("stateKey", { length: 128 }).notNull().unique(),
  value: json("value").notNull(),
  updatedBy: int("updatedBy"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SharedStateRow = typeof sharedState.$inferSelect;

/** Photo journal entries on the Memories page. Bytes live in S3; row stores the key/url. */
export const photos = mysqlTable("photos", {
  id: int("id").autoincrement().primaryKey(),
  fileKey: varchar("fileKey", { length: 256 }).notNull(),
  url: varchar("url", { length: 512 }).notNull(),
  caption: text("caption"),
  /** ISO date YYYY-MM-DD the photo is "about" (defaults to upload day) */
  date: varchar("date", { length: 10 }).notNull(),
  /** Optional place tag (id from client/src/content/places.ts) for Wobbles' Map */
  placeId: varchar("placeId", { length: 64 }),
  createdBy: int("createdBy"),
  createdByName: varchar("createdByName", { length: 120 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PhotoRow = typeof photos.$inferSelect;
export type InsertPhoto = typeof photos.$inferInsert;

/* ============================================================
 * Ask Wobbles AI — persistent chat + distilled memory.
 * Conversations/messages keep the full family chat history;
 * aiMemory is the dedicated "memory file": durable facts about
 * Wobbles distilled from conversations and injected into future
 * system prompts so the assistant learns him over time.
 * ============================================================ */

/** One row per chat conversation (household-shared, like everything else). */
export const aiConversations = mysqlTable("ai_conversations", {
  id: int("id").autoincrement().primaryKey(),
  /** Short title derived from the first user message */
  title: varchar("title", { length: 200 }).notNull(),
  createdBy: int("createdBy"),
  createdByName: varchar("createdByName", { length: 120 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AiConversationRow = typeof aiConversations.$inferSelect;

/** Every message in every conversation is persisted here. */
export const aiMessages = mysqlTable("ai_messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  /** Which family member sent it (for user messages) */
  authorName: varchar("authorName", { length: 120 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiMessageRow = typeof aiMessages.$inferSelect;

/**
 * Wobbles' memory book — durable facts the AI has learned about
 * Wobbles from family conversations (weights, quirks, what worked
 * in training, health notes). Active facts are injected into the
 * system prompt of every future conversation.
 */
export const aiMemory = mysqlTable("ai_memory", {
  id: int("id").autoincrement().primaryKey(),
  /** A single durable fact, e.g. "Wobbles weighed 2.1kg on 3 Oct 2026" */
  fact: text("fact").notNull(),
  /** health | training | food | behaviour | routine | grooming | other */
  category: varchar("category", { length: 32 }).default("other").notNull(),
  /** Conversation the fact was learned from (nullable if added manually) */
  sourceConversationId: int("sourceConversationId"),
  /** Soft delete: 1 = injected into prompts, 0 = forgotten by the family */
  active: int("active").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiMemoryRow = typeof aiMemory.$inferSelect;
