/*
 * Place log — shared family journal for Wobbles' Map.
 * Stored in sharedState under key "placeLog" as a keyed object map
 * { [entryId]: PlaceLogEntry } so two phones can patch independent
 * entries without overwriting each other (same pattern as checklists).
 */

export type PlaceLogKind = "visit" | "journal";

export interface PlaceLogEntry {
  id: string;
  placeId: string;
  kind: PlaceLogKind;
  /** YYYY-MM-DD */
  date: string;
  /** Journal body or optional visit note */
  text?: string;
  /** Display name of whoever logged it */
  by?: string;
  createdAt: number;
}

export type PlaceLogMap = Record<string, PlaceLogEntry>;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Tolerant normalization: drop garbage, coerce fields, never throw. */
export function normalizePlaceLog(raw: unknown): PlaceLogMap {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return {};
  const out: PlaceLogMap = {};
  for (const [id, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v !== "object" || v === null || Array.isArray(v)) continue;
    const e = v as Record<string, unknown>;
    const placeId = typeof e.placeId === "string" ? e.placeId : "";
    const date = typeof e.date === "string" && DATE_RE.test(e.date) ? e.date : "";
    const kind: PlaceLogKind = e.kind === "journal" ? "journal" : "visit";
    if (!placeId || !date) continue;
    out[id] = {
      id,
      placeId,
      kind,
      date,
      text: typeof e.text === "string" && e.text.trim() ? e.text.trim().slice(0, 2000) : undefined,
      by: typeof e.by === "string" && e.by.trim() ? e.by.trim().slice(0, 64) : undefined,
      createdAt: typeof e.createdAt === "number" && Number.isFinite(e.createdAt) ? e.createdAt : 0,
    };
  }
  return out;
}

/** All entries for one place, newest first (date desc, then createdAt desc). */
export function entriesForPlace(log: PlaceLogMap, placeId: string): PlaceLogEntry[] {
  return Object.values(log)
    .filter((e) => e.placeId === placeId)
    .sort((a, b) => (b.date === a.date ? b.createdAt - a.createdAt : b.date.localeCompare(a.date)));
}

/** Number of distinct visit days logged for a place. */
export function visitCount(log: PlaceLogMap, placeId: string): number {
  const days = new Set(
    Object.values(log)
      .filter((e) => e.placeId === placeId && e.kind === "visit")
      .map((e) => e.date),
  );
  return days.size;
}

/** Most recent visit date (YYYY-MM-DD) or undefined. */
export function lastVisit(log: PlaceLogMap, placeId: string): string | undefined {
  let latest: string | undefined;
  for (const e of Object.values(log)) {
    if (e.placeId !== placeId || e.kind !== "visit") continue;
    if (!latest || e.date > latest) latest = e.date;
  }
  return latest;
}

/** Has this place been visited at least once? */
export function hasVisited(log: PlaceLogMap, placeId: string): boolean {
  return Object.values(log).some((e) => e.placeId === placeId && e.kind === "visit");
}

/** Journal entries for a place, newest first. */
export function journalForPlace(log: PlaceLogMap, placeId: string): PlaceLogEntry[] {
  return entriesForPlace(log, placeId).filter((e) => e.kind === "journal");
}

/** Build a new entry (id derived from timestamp + random suffix). */
export function makeEntry(input: {
  placeId: string;
  kind: PlaceLogKind;
  date: string;
  text?: string;
  by?: string;
}): PlaceLogEntry {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  return {
    id,
    placeId: input.placeId,
    kind: input.kind,
    date: input.date,
    text: input.text?.trim() ? input.text.trim().slice(0, 2000) : undefined,
    by: input.by?.trim() ? input.by.trim().slice(0, 64) : undefined,
    createdAt: Date.now(),
  };
}
