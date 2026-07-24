import { and, asc, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  aiConversations,
  aiMemory,
  aiMessages,
  InsertPhoto,
  InsertTrackerEntry,
  InsertUser,
  photos,
  sharedState,
  trackerEntries,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/* ============================================================
 * Wobbles' Handbook — household-shared queries.
 * All authenticated users read/write the same data.
 * ============================================================ */

function requireDb<T>(db: T | null): asserts db is T {
  if (!db) throw new Error("Database not available");
}

/* ---- Tracker entries ---- */

export async function listTrackerEntries(limit = 2000) {
  const db = await getDb();
  requireDb(db);
  return db
    .select()
    .from(trackerEntries)
    .orderBy(desc(trackerEntries.date), desc(trackerEntries.time), desc(trackerEntries.id))
    .limit(limit);
}

export async function addTrackerEntry(entry: InsertTrackerEntry): Promise<number> {
  const db = await getDb();
  requireDb(db);
  const [result] = await db.insert(trackerEntries).values(entry);
  return result.insertId;
}

export async function addTrackerEntriesBulk(entries: InsertTrackerEntry[]) {
  if (entries.length === 0) return;
  const db = await getDb();
  requireDb(db);
  await db.insert(trackerEntries).values(entries);
}

export async function deleteTrackerEntry(id: number) {
  const db = await getDb();
  requireDb(db);
  await db.delete(trackerEntries).where(eq(trackerEntries.id, id));
}

export async function hasAnyTrackerEntries(): Promise<boolean> {
  const db = await getDb();
  requireDb(db);
  const rows = await db.select({ id: trackerEntries.id }).from(trackerEntries).limit(1);
  return rows.length > 0;
}

/* ---- Shared key/value state ---- */

export async function getAllSharedState() {
  const db = await getDb();
  requireDb(db);
  return db.select().from(sharedState);
}

export async function setSharedState(stateKey: string, value: unknown, updatedBy?: number) {
  const db = await getDb();
  requireDb(db);
  await db
    .insert(sharedState)
    .values({ stateKey, value, updatedBy })
    .onDuplicateKeyUpdate({ set: { value, updatedBy } });
}

export async function getSharedState(stateKey: string) {
  const db = await getDb();
  requireDb(db);
  const rows = await db.select().from(sharedState).where(eq(sharedState.stateKey, stateKey)).limit(1);
  return rows[0];
}

/**
 * Conflict-safe shallow merge for map-valued shared state (checklists,
 * 100-things, reading progress). Instead of replacing the whole map with a
 * client snapshot (last-write-wins, can drop the other spouse's concurrent
 * ticks), this applies only the changed entries and deletions server-side.
 */
export async function patchSharedState(
  stateKey: string,
  entries: Record<string, unknown>,
  deletes: string[],
  updatedBy?: number,
) {
  const db = await getDb();
  requireDb(db);
  const existing = await getSharedState(stateKey);
  const base =
    existing && existing.value && typeof existing.value === "object" && !Array.isArray(existing.value)
      ? (existing.value as Record<string, unknown>)
      : {};
  const merged: Record<string, unknown> = { ...base, ...entries };
  for (const k of deletes) delete merged[k];
  await db
    .insert(sharedState)
    .values({ stateKey, value: merged, updatedBy })
    .onDuplicateKeyUpdate({ set: { value: merged, updatedBy } });
  return merged;
}

/** Import audit entry stored under shared_state key "legacyImportLog". */
export interface ImportAuditEntry {
  at: string;
  by: number;
  byName: string | null;
  count: number;
}

export async function appendImportAuditLog(entry: ImportAuditEntry) {
  const existing = await getSharedState("legacyImportLog");
  const log: ImportAuditEntry[] = Array.isArray(existing?.value)
    ? (existing.value as ImportAuditEntry[])
    : [];
  log.push(entry);
  await setSharedState("legacyImportLog", log.slice(-50), entry.by);
}

/* ---- Photos ---- */

export async function listPhotos() {
  const db = await getDb();
  requireDb(db);
  return db.select().from(photos).orderBy(desc(photos.date), desc(photos.createdAt));
}

export async function addPhoto(photo: InsertPhoto): Promise<number> {
  const db = await getDb();
  requireDb(db);
  const [result] = await db.insert(photos).values(photo);
  return result.insertId;
}

export async function getPhotoById(id: number) {
  const db = await getDb();
  requireDb(db);
  const rows = await db.select().from(photos).where(eq(photos.id, id)).limit(1);
  return rows[0];
}

export async function deletePhoto(id: number) {
  const db = await getDb();
  requireDb(db);
  await db.delete(photos).where(eq(photos.id, id));
}

/* ---- Ask Wobbles AI: conversations, messages, memory ---- */

export async function createAiConversation(
  title: string,
  createdBy?: number,
  createdByName?: string | null,
): Promise<number> {
  const db = await getDb();
  requireDb(db);
  const [result] = await db
    .insert(aiConversations)
    .values({ title, createdBy, createdByName: createdByName ?? null });
  return result.insertId;
}

export async function listAiConversations(limit = 100) {
  const db = await getDb();
  requireDb(db);
  return db
    .select()
    .from(aiConversations)
    .orderBy(desc(aiConversations.updatedAt), desc(aiConversations.id))
    .limit(limit);
}

export async function getAiConversation(id: number) {
  const db = await getDb();
  requireDb(db);
  const rows = await db.select().from(aiConversations).where(eq(aiConversations.id, id)).limit(1);
  return rows[0];
}

export async function touchAiConversation(id: number) {
  const db = await getDb();
  requireDb(db);
  await db
    .update(aiConversations)
    .set({ updatedAt: new Date() })
    .where(eq(aiConversations.id, id));
}

export async function deleteAiConversation(id: number) {
  const db = await getDb();
  requireDb(db);
  await db.delete(aiMessages).where(eq(aiMessages.conversationId, id));
  await db.delete(aiConversations).where(eq(aiConversations.id, id));
}

export async function addAiMessage(msg: {
  conversationId: number;
  role: "user" | "assistant";
  content: string;
  authorName?: string | null;
}): Promise<number> {
  const db = await getDb();
  requireDb(db);
  const [result] = await db
    .insert(aiMessages)
    .values({ ...msg, authorName: msg.authorName ?? null });
  return result.insertId;
}

export async function listAiMessages(conversationId: number, limit = 500) {
  const db = await getDb();
  requireDb(db);
  return db
    .select()
    .from(aiMessages)
    .where(eq(aiMessages.conversationId, conversationId))
    .orderBy(asc(aiMessages.id))
    .limit(limit);
}

/** Last message per conversation for history previews (single query per convo list is fine at family scale). */
export async function lastAiMessagePreview(conversationId: number) {
  const db = await getDb();
  requireDb(db);
  const rows = await db
    .select()
    .from(aiMessages)
    .where(eq(aiMessages.conversationId, conversationId))
    .orderBy(desc(aiMessages.id))
    .limit(1);
  return rows[0];
}

export async function listActiveAiMemory() {
  const db = await getDb();
  requireDb(db);
  return db
    .select()
    .from(aiMemory)
    .where(eq(aiMemory.active, 1))
    .orderBy(desc(aiMemory.id));
}

export async function countActiveAiMemory(): Promise<number> {
  const db = await getDb();
  requireDb(db);
  const rows = await db
    .select({ n: sql<number>`count(*)` })
    .from(aiMemory)
    .where(eq(aiMemory.active, 1));
  return Number(rows[0]?.n ?? 0);
}

export async function addAiMemoryFacts(
  facts: { fact: string; category: string; sourceConversationId?: number | null }[],
) {
  if (facts.length === 0) return;
  const db = await getDb();
  requireDb(db);
  await db.insert(aiMemory).values(
    facts.map((f) => ({
      fact: f.fact,
      category: f.category,
      sourceConversationId: f.sourceConversationId ?? null,
    })),
  );
}

/** Soft-delete: the family can make the assistant "forget" a fact. */
export async function forgetAiMemoryFact(id: number) {
  const db = await getDb();
  requireDb(db);
  await db.update(aiMemory).set({ active: 0 }).where(and(eq(aiMemory.id, id), eq(aiMemory.active, 1)));
}
