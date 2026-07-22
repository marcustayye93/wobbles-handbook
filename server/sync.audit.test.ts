/*
 * Tests for the Grok-audit hardening work:
 *  - sharedState.patch conflict-safe merge (entries + deletes, hidden audit key)
 *  - trackers.importLegacy audit logging + one-time guard
 *  - trackers.list pagination bounds
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", () => ({
  listTrackerEntries: vi.fn(async (limit?: number) => {
    void limit;
    return [];
  }),
  addTrackerEntry: vi.fn(async () => 1),
  addTrackerEntriesBulk: vi.fn(async () => undefined),
  deleteTrackerEntry: vi.fn(async () => undefined),
  hasAnyTrackerEntries: vi.fn(async () => false),
  getAllSharedState: vi.fn(async () => [
    { id: 1, stateKey: "checklists", value: { "a:0": true }, updatedBy: 1, updatedAt: new Date() },
    { id: 2, stateKey: "legacyImportLog", value: [{ at: "x", by: 1, byName: "A", count: 3 }], updatedBy: 1, updatedAt: new Date() },
  ]),
  setSharedState: vi.fn(async () => undefined),
  patchSharedState: vi.fn(async (_key: string, entries: Record<string, unknown>, deletes: string[]) => {
    const base: Record<string, unknown> = { "a:0": true, "a:1": true };
    const merged = { ...base, ...entries };
    for (const k of deletes) delete merged[k];
    return merged;
  }),
  appendImportAuditLog: vi.fn(async () => undefined),
  listPhotos: vi.fn(async () => []),
  addPhoto: vi.fn(async () => 1),
  getPhotoById: vi.fn(async () => undefined),
  deletePhoto: vi.fn(async () => undefined),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn(async (key: string) => ({ key, url: `/manus-storage/${key}` })),
}));

import { appRouter } from "./routers";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createCtx(name = "Family Member", id = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id,
    openId: `user-${id}`,
    email: "family@example.com",
    name,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as unknown as TrpcContext["res"],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("sharedState.patch (conflict-safe merge)", () => {
  it("applies only changed entries and deletions via the db merge helper", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.sharedState.patch({
      key: "checklists",
      entries: { "b:2": true },
      deletes: ["a:1"],
    });
    expect(db.patchSharedState).toHaveBeenCalledWith("checklists", { "b:2": true }, ["a:1"], 1);
    expect(result.success).toBe(true);
    // Merge keeps the other spouse's untouched tick, applies add + delete.
    expect(result.value).toEqual({ "a:0": true, "b:2": true });
  });

  it("defaults to empty entries/deletes so a no-op patch is safe", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.sharedState.patch({ key: "hundredThings" });
    expect(db.patchSharedState).toHaveBeenCalledWith("hundredThings", {}, [], 1);
    expect(result.success).toBe(true);
  });

  it("rejects oversized delete batches", async () => {
    const caller = appRouter.createCaller(createCtx());
    await expect(
      caller.sharedState.patch({
        key: "checklists",
        deletes: Array.from({ length: 501 }, (_, i) => `k:${i}`),
      }),
    ).rejects.toThrow();
  });
});

describe("sharedState.all (audit key hidden)", () => {
  it("never exposes the legacyImportLog audit key to clients", async () => {
    const caller = appRouter.createCaller(createCtx());
    const map = await caller.sharedState.all();
    expect(map).toEqual({ checklists: { "a:0": true } });
    expect(Object.keys(map)).not.toContain("legacyImportLog");
  });
});

describe("trackers.importLegacy (audit trail)", () => {
  it("records an audit entry with importer identity and count", async () => {
    const caller = appRouter.createCaller(createCtx("Marcus", 2));
    const result = await caller.trackers.importLegacy({
      entries: [
        { trackerId: "feeding", date: "2026-07-20", option: "Dinner" },
        { trackerId: "toilet", date: "2026-07-21", option: "Wee" },
      ],
    });
    expect(result).toEqual({ imported: 2, skipped: false });
    expect(db.appendImportAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ by: 2, byName: "Marcus", count: 2 }),
    );
  });

  it("skips import and audit when the household already has data", async () => {
    vi.mocked(db.hasAnyTrackerEntries).mockResolvedValueOnce(true);
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.trackers.importLegacy({
      entries: [{ trackerId: "feeding", date: "2026-07-20" }],
    });
    expect(result).toEqual({ imported: 0, skipped: true });
    expect(db.addTrackerEntriesBulk).not.toHaveBeenCalled();
    expect(db.appendImportAuditLog).not.toHaveBeenCalled();
  });
});

describe("trackers.list (pagination bounds)", () => {
  it("uses the default limit of 2000 when none is given", async () => {
    const caller = appRouter.createCaller(createCtx());
    await caller.trackers.list();
    expect(db.listTrackerEntries).toHaveBeenCalledWith(2000);
  });

  it("honours an explicit limit within bounds", async () => {
    const caller = appRouter.createCaller(createCtx());
    await caller.trackers.list({ limit: 100 });
    expect(db.listTrackerEntries).toHaveBeenCalledWith(100);
  });

  it("rejects limits above the 5000 cap", async () => {
    const caller = appRouter.createCaller(createCtx());
    await expect(caller.trackers.list({ limit: 5001 })).rejects.toThrow();
  });
});
