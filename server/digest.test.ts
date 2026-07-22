/*
 * Weekly digest tests:
 *  - composeDigest(): counts, weight trend, toilet success rate, empty week
 *  - weekWindow(): 7-day inclusive window
 *  - weeklyDigestHandler: rejects non-cron callers, sends notification for cron
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { composeDigest, weekWindow, type DigestTrackerRow } from "./digest";

const WINDOW = { startISO: "2026-07-14", endISO: "2026-07-20" };

function row(partial: Partial<DigestTrackerRow> & { trackerId: string; date: string }): DigestTrackerRow {
  return {
    time: null,
    option: null,
    value: null,
    note: null,
    createdByName: null,
    ...partial,
  };
}

describe("weekWindow", () => {
  it("returns a 7-day inclusive window ending on the given day", () => {
    const { startISO, endISO } = weekWindow(new Date("2026-07-20T09:00:00Z"));
    expect(endISO).toBe("2026-07-20");
    expect(startISO).toBe("2026-07-14");
  });
});

describe("composeDigest", () => {
  it("counts entries per tracker within the window only", () => {
    const rows = [
      row({ trackerId: "feeding", date: "2026-07-15" }),
      row({ trackerId: "feeding", date: "2026-07-16" }),
      row({ trackerId: "feeding", date: "2026-07-01" }), // outside window
      row({ trackerId: "training", date: "2026-07-18", value: "4" }),
      row({ trackerId: "social", date: "2026-07-19", option: "New person" }),
      row({ trackerId: "grooming", date: "2026-07-19", option: "Quick brush (2–5 min)" }),
    ];
    const d = composeDigest(rows, [], WINDOW);
    expect(d.stats.meals).toBe(2);
    expect(d.stats.training).toBe(1);
    expect(d.stats.social).toBe(1);
    expect(d.stats.grooming).toBe(1);
    expect(d.stats.totalEntries).toBe(5);
    expect(d.content).toContain("🍽️ Feeding: 2 meals");
  });

  it("computes toilet success rate from ✅ options", () => {
    const rows = [
      row({ trackerId: "toilet", date: "2026-07-15", option: "Wee outside ✅" }),
      row({ trackerId: "toilet", date: "2026-07-15", option: "Poo outside ✅" }),
      row({ trackerId: "toilet", date: "2026-07-16", option: "Wee accident" }),
      row({ trackerId: "toilet", date: "2026-07-17", option: "Wee outside ✅" }),
    ];
    const d = composeDigest(rows, [], WINDOW);
    expect(d.stats.toilet).toEqual({ successes: 3, accidents: 1, count: 4 });
    expect(d.content).toContain("3/4 outside (75% success, 1 accident)");
  });

  it("reports weight gain across the week (first vs last weigh-in)", () => {
    const rows = [
      row({ trackerId: "weight", date: "2026-07-14", value: "2.10" }),
      row({ trackerId: "weight", date: "2026-07-20", value: "2.45" }),
    ];
    const d = composeDigest(rows, [], WINDOW);
    expect(d.stats.weight.latest).toBe(2.45);
    expect(d.stats.weight.delta).toBe(0.35);
    expect(d.content).toContain("up 0.35 kg");
  });

  it("uses the last pre-week weigh-in as baseline when only one in-week entry exists", () => {
    const rows = [
      row({ trackerId: "weight", date: "2026-07-10", value: "2.00" }), // before window
      row({ trackerId: "weight", date: "2026-07-19", value: "2.30" }),
    ];
    const d = composeDigest(rows, [], WINDOW);
    expect(d.stats.weight.delta).toBe(0.3);
  });

  it("flags weight loss with a vet-call warning", () => {
    const rows = [
      row({ trackerId: "weight", date: "2026-07-14", value: "2.50" }),
      row({ trackerId: "weight", date: "2026-07-20", value: "2.30" }),
    ];
    const d = composeDigest(rows, [], WINDOW);
    expect(d.content).toContain("down 0.2 kg");
    expect(d.content.toLowerCase()).toContain("vet call");
  });

  it("counts only photos dated within the week", () => {
    const photos = [{ date: "2026-07-15" }, { date: "2026-07-19" }, { date: "2026-07-01" }];
    const d = composeDigest([], photos, WINDOW);
    expect(d.stats.photos).toBe(2);
    expect(d.content).toContain("📷 Photos: 2 new memories");
  });

  it("produces a friendly quiet-week message when nothing was logged", () => {
    const d = composeDigest([], [], WINDOW);
    expect(d.stats.totalEntries).toBe(0);
    expect(d.content).toContain("No logs this week");
  });

  it("includes Wobbles' age in the title (dob 2026-06-26)", () => {
    const d = composeDigest([], [], WINDOW);
    // 2026-06-26 → 2026-07-20 = 24 days = 3w 3d
    expect(d.title).toContain("3w 3d");
  });
});

/* ------------------------------------------------------------------ */
/* Scheduled handler auth                                              */
/* ------------------------------------------------------------------ */

const authenticateRequestMock = vi.fn();
const notifyOwnerMock = vi.fn();

vi.mock("./_core/sdk", () => ({
  sdk: { authenticateRequest: (...args: unknown[]) => authenticateRequestMock(...args) },
}));
vi.mock("./_core/notification", () => ({
  notifyOwner: (...args: unknown[]) => notifyOwnerMock(...args),
}));
vi.mock("./db", () => ({
  listTrackerEntries: vi.fn().mockResolvedValue([]),
  listPhotos: vi.fn().mockResolvedValue([]),
}));

function mockRes() {
  const res: { statusCode: number; body?: unknown; status: (c: number) => typeof res; json: (b: unknown) => typeof res } = {
    statusCode: 200,
    status(c: number) {
      res.statusCode = c;
      return res;
    },
    json(b: unknown) {
      res.body = b;
      return res;
    },
  };
  return res;
}

describe("weeklyDigestHandler", () => {
  beforeEach(() => {
    authenticateRequestMock.mockReset();
    notifyOwnerMock.mockReset();
  });

  it("rejects non-cron callers with 403 and does not notify", async () => {
    const { weeklyDigestHandler } = await import("./scheduled");
    authenticateRequestMock.mockResolvedValue({ isCron: false, id: 1 });
    const res = mockRes();
    await weeklyDigestHandler({ originalUrl: "/api/scheduled/weeklyDigest" } as never, res as never);
    expect(res.statusCode).toBe(403);
    expect(notifyOwnerMock).not.toHaveBeenCalled();
  });

  it("builds the digest and notifies the owner for cron callers", async () => {
    const { weeklyDigestHandler } = await import("./scheduled");
    authenticateRequestMock.mockResolvedValue({ isCron: true, taskUid: "t_123" });
    notifyOwnerMock.mockResolvedValue(true);
    const res = mockRes();
    await weeklyDigestHandler({ originalUrl: "/api/scheduled/weeklyDigest" } as never, res as never);
    expect(res.statusCode).toBe(200);
    expect(notifyOwnerMock).toHaveBeenCalledOnce();
    const payload = notifyOwnerMock.mock.calls[0][0] as { title: string; content: string };
    expect(payload.title).toContain("Wobbles' week in review");
    expect((res.body as { ok: boolean }).ok).toBe(true);
  });

  it("returns 403 when authentication itself fails (no session cookie)", async () => {
    const { weeklyDigestHandler } = await import("./scheduled");
    authenticateRequestMock.mockRejectedValue(new Error("Invalid session cookie"));
    const res = mockRes();
    await weeklyDigestHandler({ originalUrl: "/api/scheduled/weeklyDigest" } as never, res as never);
    expect(res.statusCode).toBe(403);
    expect(notifyOwnerMock).not.toHaveBeenCalled();
  });

  it("returns a JSON-encoded 500 when notification delivery throws", async () => {
    const { weeklyDigestHandler } = await import("./scheduled");
    authenticateRequestMock.mockResolvedValue({ isCron: true, taskUid: "t_123" });
    notifyOwnerMock.mockRejectedValue(new Error("notification backend down"));
    const res = mockRes();
    await weeklyDigestHandler({ originalUrl: "/api/scheduled/weeklyDigest" } as never, res as never);
    expect(res.statusCode).toBe(500);
    expect((res.body as { error: string }).error).toContain("notification backend down");
    expect((res.body as { timestamp: string }).timestamp).toBeTruthy();
  });
});
