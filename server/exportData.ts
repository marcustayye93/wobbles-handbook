/*
 * U2 — Data export & backup.
 *
 * buildSnapshot() assembles the family's entire dataset (tracker entries,
 * shared state, photo metadata, AI memory) into a single JSON-serialisable
 * object. Used by the exportData.snapshot tRPC procedure (About page's
 * "Download everything" button) and the monthly backup Heartbeat handler.
 *
 * composeSnapshot() is the pure core so it can be unit-tested without a DB.
 * entriesToCsv() flattens tracker entries into an RFC 4180-safe CSV string.
 */
import {
  listTrackerEntries,
  getAllSharedState,
  listPhotos,
  listActiveAiMemory,
} from "./db";

/* ------------------------------------------------------------------ */
/* Types — structural (subset of drizzle rows) for testability          */
/* ------------------------------------------------------------------ */

export interface SnapshotTrackerRow {
  id: number;
  trackerId: string;
  date: string;
  time: string | null;
  option: string | null;
  value: string | null;
  note: string | null;
  createdByName: string | null;
  createdAt?: Date | string | null;
}

export interface SnapshotSharedStateRow {
  stateKey: string;
  value: unknown;
}

export interface SnapshotPhotoRow {
  id: number;
  date: string;
  caption: string | null;
  url: string;
  [key: string]: unknown;
}

export interface SnapshotMemoryRow {
  id: number;
  fact: string;
  category: string;
}

export interface Snapshot {
  meta: {
    app: string;
    exportedAt: string;
    dog: { name: string; pedigreeName: string; dob: string; breed: string };
    counts: {
      trackerEntries: number;
      sharedStateKeys: number;
      photos: number;
      aiMemoryFacts: number;
    };
  };
  trackerEntries: SnapshotTrackerRow[];
  sharedState: Record<string, unknown>;
  photos: SnapshotPhotoRow[];
  aiMemory: SnapshotMemoryRow[];
}

/* ------------------------------------------------------------------ */
/* Pure composition                                                     */
/* ------------------------------------------------------------------ */

const DOG = {
  name: "Wobbles",
  pedigreeName: "Jaywill Follow The Sun",
  dob: "2026-06-26",
  breed: "Cavoodle (red parti)",
};

export function composeSnapshot(
  entries: SnapshotTrackerRow[],
  state: SnapshotSharedStateRow[],
  photos: SnapshotPhotoRow[],
  memory: SnapshotMemoryRow[],
  now = new Date(),
): Snapshot {
  const sharedState: Record<string, unknown> = {};
  for (const row of state) sharedState[row.stateKey] = row.value;

  return {
    meta: {
      app: "Wobbles' Handbook",
      exportedAt: now.toISOString(),
      dog: DOG,
      counts: {
        trackerEntries: entries.length,
        sharedStateKeys: state.length,
        photos: photos.length,
        aiMemoryFacts: memory.length,
      },
    },
    trackerEntries: entries,
    sharedState,
    photos,
    aiMemory: memory,
  };
}

/* ------------------------------------------------------------------ */
/* CSV flattener (RFC 4180)                                             */
/* ------------------------------------------------------------------ */

/** Quote a CSV field when it contains a comma, quote, or newline. */
export function csvField(value: string | null | undefined): string {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function entriesToCsv(entries: SnapshotTrackerRow[]): string {
  const header = "tracker,date,time,option,value,note,logged_by";
  const lines = entries.map((e) =>
    [
      csvField(e.trackerId),
      csvField(e.date),
      csvField(e.time),
      csvField(e.option),
      csvField(e.value),
      csvField(e.note),
      csvField(e.createdByName),
    ].join(","),
  );
  return [header, ...lines].join("\n") + "\n";
}

/* ------------------------------------------------------------------ */
/* DB-backed builder                                                    */
/* ------------------------------------------------------------------ */

export async function buildSnapshot(now = new Date()): Promise<Snapshot> {
  const [entries, state, photos, memory] = await Promise.all([
    listTrackerEntries(100_000),
    getAllSharedState(),
    listPhotos(),
    listActiveAiMemory(),
  ]);
  return composeSnapshot(
    entries as unknown as SnapshotTrackerRow[],
    state as unknown as SnapshotSharedStateRow[],
    photos as unknown as SnapshotPhotoRow[],
    memory as unknown as SnapshotMemoryRow[],
    now,
  );
}
