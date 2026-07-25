/*
 * U2 — Data export & backup tests.
 * Pure composition (composeSnapshot, entriesToCsv, csvField) plus the
 * monthlyBackupHandler cron gate, with sdk/storage/notification mocked.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  composeSnapshot,
  csvField,
  entriesToCsv,
  type SnapshotTrackerRow,
} from "./exportData";

/* ------------------------------------------------------------------ */
/* Fixtures                                                             */
/* ------------------------------------------------------------------ */

const entry = (over: Partial<SnapshotTrackerRow> = {}): SnapshotTrackerRow => ({
  id: 1,
  trackerId: "feeding",
  date: "2026-08-30",
  time: "08:00",
  option: "Breakfast",
  value: null,
  note: null,
  createdByName: "Sam",
  ...over,
});

/* ------------------------------------------------------------------ */
/* composeSnapshot                                                      */
/* ------------------------------------------------------------------ */

describe("composeSnapshot", () => {
  it("assembles all sections with correct counts", () => {
    const snap = composeSnapshot(
      [entry(), entry({ id: 2, trackerId: "weight", value: "3.2" })],
      [
        { stateKey: "checklist", value: { a: true } },
        { stateKey: "readingProgress", value: { intro: true } },
      ],
      [{ id: 1, date: "2026-08-30", caption: "First nap", url: "/manus-storage/x.jpg" }],
      [{ id: 1, fact: "Loves carrots", category: "food" }],
      new Date("2026-09-01T10:00:00Z"),
    );

    expect(snap.meta.app).toBe("Wobbles' Handbook");
    expect(snap.meta.exportedAt).toBe("2026-09-01T10:00:00.000Z");
    expect(snap.meta.dog.name).toBe("Wobbles");
    expect(snap.meta.dog.dob).toBe("2026-06-26");
    expect(snap.meta.counts).toEqual({
      trackerEntries: 2,
      sharedStateKeys: 2,
      photos: 1,
      aiMemoryFacts: 1,
    });
    expect(snap.trackerEntries).toHaveLength(2);
    expect(snap.sharedState).toEqual({
      checklist: { a: true },
      readingProgress: { intro: true },
    });
    expect(snap.photos[0].caption).toBe("First nap");
    expect(snap.aiMemory[0].fact).toBe("Loves carrots");
  });

  it("handles a completely empty household", () => {
    const snap = composeSnapshot([], [], [], []);
    expect(snap.meta.counts).toEqual({
      trackerEntries: 0,
      sharedStateKeys: 0,
      photos: 0,
      aiMemoryFacts: 0,
    });
    expect(snap.sharedState).toEqual({});
  });
});

/* ------------------------------------------------------------------ */
/* CSV                                                                  */
/* ------------------------------------------------------------------ */

describe("csvField", () => {
  it("passes plain values through", () => {
    expect(csvField("hello")).toBe("hello");
    expect(csvField(null)).toBe("");
    expect(csvField(undefined)).toBe("");
  });

  it("quotes commas, quotes, and newlines per RFC 4180", () => {
    expect(csvField("a,b")).toBe('"a,b"');
    expect(csvField('say "hi"')).toBe('"say ""hi"""');
    expect(csvField("line1\nline2")).toBe('"line1\nline2"');
    expect(csvField("cr\rlf")).toBe('"cr\rlf"');
  });
});

describe("entriesToCsv", () => {
  it("emits a header plus one line per entry, ending with a newline", () => {
    const csv = entriesToCsv([entry(), entry({ id: 2, note: "ate well, fast" })]);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("tracker,date,time,option,value,note,logged_by");
    expect(lines[1]).toBe("feeding,2026-08-30,08:00,Breakfast,,,Sam");
    expect(lines[2]).toBe('feeding,2026-08-30,08:00,Breakfast,,"ate well, fast",Sam');
    expect(csv.endsWith("\n")).toBe(true);
  });

  it("handles zero entries (header only)", () => {
    expect(entriesToCsv([])).toBe("tracker,date,time,option,value,note,logged_by\n");
  });
});

/* ------------------------------------------------------------------ */
/* monthlyBackupHandler — cron gate + happy path                        */
/* ------------------------------------------------------------------ */

const authenticateRequest = vi.fn();
vi.mock("./_core/sdk", () => ({
  sdk: { authenticateRequest: (...args: unknown[]) => authenticateRequest(...args) },
}));

const notifyOwner = vi.fn(async () => true);
vi.mock("./_core/notification", () => ({
  notifyOwner: (...args: unknown[]) => notifyOwner(...args),
}));

const storagePut = vi.fn(async (key: string) => ({
  key,
  url: `/manus-storage/${key}`,
}));
vi.mock("./storage", () => ({
  storagePut: (...args: unknown[]) => storagePut(...(args as [string])),
}));

vi.mock("./db", () => ({
  listTrackerEntries: vi.fn(async () => [
    { id: 1, trackerId: "feeding", date: "2026-08-30", time: "08:00", option: null, value: null, note: null, createdByName: "Sam" },
  ]),
  getAllSharedState: vi.fn(async () => [{ stateKey: "checklist", value: {} }]),
  listPhotos: vi.fn(async () => []),
  listActiveAiMemory: vi.fn(async () => []),
}));

import { monthlyBackupHandler } from "./scheduled";

function mockRes() {
  const res: Record<string, unknown> = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res as unknown as import("express").Response & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
}

const mockReq = () =>
  ({ originalUrl: "/api/scheduled/monthlyBackup", headers: {} }) as unknown as import("express").Request;

describe("monthlyBackupHandler", () => {
  beforeEach(() => {
    authenticateRequest.mockReset();
    notifyOwner.mockClear();
    storagePut.mockClear();
  });

  it("rejects unauthenticated callers with 403", async () => {
    authenticateRequest.mockRejectedValue(new Error("no token"));
    const res = mockRes();
    await monthlyBackupHandler(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "cron-only" });
    expect(storagePut).not.toHaveBeenCalled();
  });

  it("rejects non-cron identities with 403", async () => {
    authenticateRequest.mockResolvedValue({ isCron: false, openId: "someone" });
    const res = mockRes();
    await monthlyBackupHandler(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(storagePut).not.toHaveBeenCalled();
  });

  it("stores a month-named backup and notifies the owner for cron callers", async () => {
    authenticateRequest.mockResolvedValue({ isCron: true });
    const res = mockRes();
    await monthlyBackupHandler(mockReq(), res);

    expect(storagePut).toHaveBeenCalledTimes(1);
    const key = storagePut.mock.calls[0][0] as string;
    expect(key).toMatch(/^backups\/wobbles-backup-\d{4}-\d{2}\.json$/);

    expect(notifyOwner).toHaveBeenCalledTimes(1);
    const payload = notifyOwner.mock.calls[0][0] as { title: string; content: string };
    expect(payload.title).toContain("backup saved");
    expect(payload.content).toContain("1 tracker entries");

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ ok: true, delivered: true }),
    );
  });
});
