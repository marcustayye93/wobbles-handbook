import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

/* Mock the db layer so tests run without a live database. */
vi.mock("./db", () => ({
  listTrackerEntries: vi.fn(async () => [
    { id: 1, trackerId: "feeding", date: "2026-07-22", time: "08:00", option: "Breakfast" },
  ]),
  addTrackerEntry: vi.fn(async () => 42),
  addTrackerEntriesBulk: vi.fn(async () => undefined),
  deleteTrackerEntry: vi.fn(async () => undefined),
  hasAnyTrackerEntries: vi.fn(async () => false),
  getAllSharedState: vi.fn(async () => [
    { id: 1, stateKey: "checklist", value: { a: true }, updatedBy: 1, updatedAt: new Date() },
  ]),
  setSharedState: vi.fn(async () => undefined),
  patchSharedState: vi.fn(async () => ({})),
  appendImportAuditLog: vi.fn(async () => undefined),
  listPhotos: vi.fn(async () => []),
  addPhoto: vi.fn(async () => 7),
  getPhotoById: vi.fn(async () => undefined),
  deletePhoto: vi.fn(async () => undefined),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn(async (key: string) => ({
    key: `${key}_abc123`,
    url: `/manus-storage/${key}_abc123`,
  })),
}));

import { appRouter } from "./routers";
import * as db from "./db";
import { storagePut } from "./storage";

/**
 * No-login era: identity comes from the `x-wobbles-profile` header, not a
 * session. `profile` mirrors what the device picker sends.
 */
function createCtx(profile?: string): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: profile ? { "x-wobbles-profile": profile } : {},
    } as unknown as TrpcContext["req"],
    res: { clearCookie: () => undefined } as unknown as TrpcContext["res"],
  } as TrpcContext;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("trackers router", () => {
  it("lists household entries for a picked profile", async () => {
    const caller = appRouter.createCaller(createCtx("Marcus"));
    const rows = await caller.trackers.list();
    expect(rows).toHaveLength(1);
    expect(rows[0]?.trackerId).toBe("feeding");
  });

  it("allows access without any profile header (no login required)", async () => {
    const caller = appRouter.createCaller(createCtx());
    const rows = await caller.trackers.list();
    expect(rows).toHaveLength(1);
  });

  it("stamps new entries with the device profile", async () => {
    const caller = appRouter.createCaller(createCtx("Marcus"));
    const result = await caller.trackers.add({
      trackerId: "toilet",
      date: "2026-07-22",
      time: "09:30",
      option: "Wee",
    });
    expect(result.id).toBe(42);
    expect(db.addTrackerEntry).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: 9001, createdByName: "Marcus" }),
    );
  });

  it("attributes profile-less requests to the Family fallback", async () => {
    const caller = appRouter.createCaller(createCtx());
    await caller.trackers.add({ trackerId: "toilet", date: "2026-07-22" });
    expect(db.addTrackerEntry).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: 9000, createdByName: "Family" }),
    );
  });

  it("rejects malformed dates", async () => {
    const caller = appRouter.createCaller(createCtx("Chesa"));
    await expect(
      caller.trackers.add({ trackerId: "toilet", date: "22/07/2026" }),
    ).rejects.toThrow();
  });

  it("imports legacy entries only when the household is empty", async () => {
    const caller = appRouter.createCaller(createCtx("Marcus"));
    const result = await caller.trackers.importLegacy({
      entries: [{ trackerId: "feeding", date: "2026-07-20", option: "Dinner" }],
    });
    expect(result).toEqual({ imported: 1, skipped: false });

    vi.mocked(db.hasAnyTrackerEntries).mockResolvedValueOnce(true);
    const second = await caller.trackers.importLegacy({
      entries: [{ trackerId: "feeding", date: "2026-07-20" }],
    });
    expect(second).toEqual({ imported: 0, skipped: true });
    expect(db.addTrackerEntriesBulk).toHaveBeenCalledTimes(1);
  });
});

describe("sharedState router", () => {
  it("returns state as a key/value map", async () => {
    const caller = appRouter.createCaller(createCtx("Chesa"));
    const map = await caller.sharedState.all();
    expect(map).toEqual({ checklist: { a: true } });
  });

  it("persists state changes with the editing profile id", async () => {
    const caller = appRouter.createCaller(createCtx("Chesa"));
    await caller.sharedState.set({ key: "hundred", value: ["a", "b"] });
    expect(db.setSharedState).toHaveBeenCalledWith("hundred", ["a", "b"], 9002);
  });
});

describe("photos router", () => {
  it("uploads a photo to storage and records metadata", async () => {
    const caller = appRouter.createCaller(createCtx("Caretaker"));
    const png = Buffer.from("fake-image-bytes").toString("base64");
    const result = await caller.photos.upload({
      fileName: "first day.png",
      mimeType: "image/png",
      dataBase64: png,
      caption: "First day home",
      date: "2026-09-18",
    });
    expect(result.id).toBe(7);
    expect(storagePut).toHaveBeenCalledWith(
      "wobbles-photos/first_day.png",
      expect.any(Buffer),
      "image/png",
    );
    expect(db.addPhoto).toHaveBeenCalledWith(
      expect.objectContaining({ caption: "First day home", date: "2026-09-18", createdBy: 9003 }),
    );
  });

  it("rejects non-image mime types", async () => {
    const caller = appRouter.createCaller(createCtx("Caretaker"));
    await expect(
      caller.photos.upload({
        fileName: "notes.txt",
        mimeType: "text/plain",
        dataBase64: "aGk=",
        date: "2026-09-18",
      }),
    ).rejects.toThrow();
  });
});
