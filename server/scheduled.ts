/*
 * Scheduled (Heartbeat) callback handlers.
 *
 * /api/scheduled/weeklyDigest — triggered by a project-level Heartbeat cron
 * every Sunday. Builds the week-in-review summary from the household tracker
 * feed and pushes it to the project owner via notifyOwner().
 *
 * Contract (see /home/ubuntu/skills/webdev-periodic-updates/SKILL.md):
 *  - only cron identities may call it (sdk.authenticateRequest → user.isCron)
 *  - idempotent: recomputing and re-sending the same summary is harmless
 *  - errors are JSON-encoded on 500 so the platform Investigate flow can
 *    surface them verbatim
 */
import type { Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { notifyOwner } from "./_core/notification";
import { buildWeeklyDigest } from "./digest";
import { buildSnapshot } from "./exportData";
import { storagePut } from "./storage";

/** Shared cron gate: resolves to the cron identity or sends 403 and returns null. */
async function requireCron(req: Request, res: Response) {
  let user;
  try {
    user = await sdk.authenticateRequest(req);
  } catch {
    res.status(403).json({ error: "cron-only" });
    return null;
  }
  if (!user.isCron) {
    res.status(403).json({ error: "cron-only" });
    return null;
  }
  return user;
}

export async function weeklyDigestHandler(req: Request, res: Response) {
  const user = await requireCron(req, res);
  if (!user) return;

  try {

    const digest = await buildWeeklyDigest();
    const delivered = await notifyOwner({
      title: digest.title,
      content: digest.content,
    });

    res.json({ ok: true, delivered, stats: digest.stats });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      error: err.message ?? "weekly digest failed",
      stack: err.stack,
      context: { url: req.originalUrl },
      timestamp: new Date().toISOString(),
    });
  }
}

/*
 * /api/scheduled/monthlyBackup — triggered by a project-level Heartbeat cron
 * on the 1st of each month. Builds the full data snapshot, stores it in S3
 * under backups/, and notifies the owner with a short stats line.
 * Idempotent: re-running in the same month simply overwrites the same-named
 * backup with fresher data.
 */
export async function monthlyBackupHandler(req: Request, res: Response) {
  const user = await requireCron(req, res);
  if (!user) return;

  try {
    const now = new Date();
    const snapshot = await buildSnapshot(now);
    const yyyyMm = now.toISOString().slice(0, 7);
    const { key, url } = await storagePut(
      `backups/wobbles-backup-${yyyyMm}.json`,
      Buffer.from(JSON.stringify(snapshot, null, 2), "utf8"),
      "application/json",
    );

    const c = snapshot.meta.counts;
    const delivered = await notifyOwner({
      title: `Wobbles' Handbook — ${yyyyMm} backup saved`,
      content:
        `Automatic monthly backup complete: ${c.trackerEntries} tracker entries, ` +
        `${c.photos} photos, ${c.sharedStateKeys} saved lists, ${c.aiMemoryFacts} AI memory facts. ` +
        `Stored safely in the app's cloud storage. You can also download everything anytime ` +
        `from About → Data & backup.`,
    });

    res.json({ ok: true, delivered, key, url, counts: c });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      error: err.message ?? "monthly backup failed",
      stack: err.stack,
      context: { url: req.originalUrl },
      timestamp: new Date().toISOString(),
    });
  }
}
