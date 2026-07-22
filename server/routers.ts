import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { storagePut } from "./storage";

/**
 * Wobbles' Handbook — household-shared API.
 * This is a private family app: every authenticated user reads and
 * writes the SAME household data (no per-user partitioning).
 */

const trackerEntryInput = z.object({
  trackerId: z.string().min(1).max(32),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  option: z.string().max(64).optional(),
  value: z.string().max(32).optional(),
  note: z.string().max(2000).optional(),
});

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  trackers: router({
    /** All tracker entries, newest first (family-shared). */
    list: protectedProcedure.query(() => db.listTrackerEntries()),

    add: protectedProcedure.input(trackerEntryInput).mutation(async ({ ctx, input }) => {
      const id = await db.addTrackerEntry({
        ...input,
        createdBy: ctx.user.id,
        createdByName: ctx.user.name ?? undefined,
      });
      return { id } as const;
    }),

    remove: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await db.deleteTrackerEntry(input.id);
        return { success: true } as const;
      }),

    /**
     * One-time import of legacy localStorage entries from a device.
     * Only runs when the household has no server entries yet, so a
     * second device cannot duplicate the first device's import.
     */
    importLegacy: protectedProcedure
      .input(z.object({ entries: z.array(trackerEntryInput).max(2000) }))
      .mutation(async ({ ctx, input }) => {
        const alreadyHasData = await db.hasAnyTrackerEntries();
        if (alreadyHasData) return { imported: 0, skipped: true } as const;
        await db.addTrackerEntriesBulk(
          input.entries.map(e => ({
            ...e,
            createdBy: ctx.user.id,
            createdByName: ctx.user.name ?? undefined,
          })),
        );
        return { imported: input.entries.length, skipped: false } as const;
      }),
  }),

  sharedState: router({
    /** All shared key/value state (checklists, 100-things, reading progress, SG steps). */
    all: protectedProcedure.query(async () => {
      const rows = await db.getAllSharedState();
      const map: Record<string, unknown> = {};
      for (const row of rows) map[row.stateKey] = row.value;
      return map;
    }),

    set: protectedProcedure
      .input(z.object({ key: z.string().min(1).max(128), value: z.unknown() }))
      .mutation(async ({ ctx, input }) => {
        await db.setSharedState(input.key, input.value ?? null, ctx.user.id);
        return { success: true } as const;
      }),
  }),

  photos: router({
    list: protectedProcedure.query(() => db.listPhotos()),

    /** Upload a photo as base64 (client compresses first). */
    upload: protectedProcedure
      .input(
        z.object({
          fileName: z.string().min(1).max(180),
          mimeType: z.string().regex(/^image\//),
          /** base64 without data: prefix; client-side compressed, max ~5 MB */
          dataBase64: z.string().max(7_500_000),
          caption: z.string().max(500).optional(),
          date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.dataBase64, "base64");
        if (buffer.length > 5 * 1024 * 1024) {
          throw new Error("Photo too large after decoding (max 5 MB)");
        }
        const safeName = input.fileName.replace(/[^\w.\-]+/g, "_").slice(-80);
        const { key, url } = await storagePut(`wobbles-photos/${safeName}`, buffer, input.mimeType);
        const id = await db.addPhoto({
          fileKey: key,
          url,
          caption: input.caption,
          date: input.date,
          createdBy: ctx.user.id,
          createdByName: ctx.user.name ?? undefined,
        });
        return { id, url } as const;
      }),

    remove: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await db.deletePhoto(input.id);
        return { success: true } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
