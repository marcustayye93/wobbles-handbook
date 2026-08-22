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

export async function weeklyDigestHandler(req: Request, res: Response) {
  let user;
  try {
    user = await sdk.authenticateRequest(req);
  } catch {
    res.status(403).json({ error: "cron-only" });
    return;
  }
  if (!user.isCron) {
    res.status(403).json({ error: "cron-only" });
    return;
  }

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
