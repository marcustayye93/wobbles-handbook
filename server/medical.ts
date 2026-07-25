/**
 * U3 — Medical vault: vet paperwork (S3 documents), medication schedules,
 * and the pure next-due maths shared by server tests and (conceptually)
 * the Health page UI. Household-shared like everything else in the app.
 */
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { router } from "./_core/trpc";
import { familyProcedure } from "./family";

/* ============================================================
 * Pure medication schedule maths (unit-tested)
 * ============================================================ */

export interface MedScheduleShape {
  frequencyDays: number;
  startDate: string; // YYYY-MM-DD
  endDate?: string | null;
  lastGivenDate?: string | null;
  active: number;
}

const DAY_MS = 86_400_000;

function parseISO(d: string): Date {
  return new Date(`${d}T00:00:00`);
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Next due date for a medication, or null when it never comes due
 * (archived, or the course has ended). Never given yet → due from
 * startDate (or today if the start is already past).
 */
export function nextDueDate(med: MedScheduleShape, todayISOStr: string): string | null {
  if (!med.active) return null;
  const freq = Math.max(1, Math.round(med.frequencyDays || 1));
  let due: string;
  if (med.lastGivenDate) {
    due = toISO(new Date(parseISO(med.lastGivenDate).getTime() + freq * DAY_MS));
  } else {
    due = med.startDate <= todayISOStr ? todayISOStr : med.startDate;
  }
  if (med.endDate && due > med.endDate) return null;
  return due;
}

/** Signed days until due: negative = overdue, 0 = today, positive = upcoming. */
export function daysUntilDue(med: MedScheduleShape, todayISOStr: string): number | null {
  const due = nextDueDate(med, todayISOStr);
  if (!due) return null;
  return Math.round((parseISO(due).getTime() - parseISO(todayISOStr).getTime()) / DAY_MS);
}

/** Human chip label for the medicine cabinet. */
export function dueChipLabel(med: MedScheduleShape, todayISOStr: string): string {
  const days = daysUntilDue(med, todayISOStr);
  if (days === null) return med.active ? "course ended" : "archived";
  if (days < -1) return `${-days} days overdue`;
  if (days === -1) return "1 day overdue";
  if (days === 0) return "due today";
  if (days === 1) return "due tomorrow";
  return `due in ${days} days`;
}

/* ============================================================
 * Router
 * ============================================================ */

const RECORD_CATEGORIES = [
  "vaccine-cert",
  "vet-report",
  "lab-result",
  "insurance",
  "licence",
  "prescription",
  "receipt",
  "other",
] as const;

const MED_KINDS = ["parasite", "heartworm", "prescription", "supplement", "other"] as const;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const medicalRouter = router({
  records: router({
    list: familyProcedure.query(() => db.listMedicalRecords()),
    /** File a document: base64 payload ≤ ~8 MB decoded, stored under medical/ in S3. */
    upload: familyProcedure
      .input(
        z.object({
          title: z.string().min(1).max(160),
          category: z.enum(RECORD_CATEGORIES),
          recordDate: isoDate,
          fileName: z.string().min(1).max(180),
          mimeType: z.string().min(3).max(80),
          dataBase64: z.string().max(11_500_000),
          note: z.string().max(1000).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.dataBase64, "base64");
        if (buffer.length > 8 * 1024 * 1024) {
          throw new Error("Document too large after decoding (max 8 MB)");
        }
        const safeName = input.fileName.replace(/[^\w.\-]+/g, "_").slice(-80);
        const { key, url } = await storagePut(`medical/${safeName}`, buffer, input.mimeType);
        const id = await db.addMedicalRecord({
          title: input.title,
          category: input.category,
          recordDate: input.recordDate,
          fileKey: key,
          url,
          mimeType: input.mimeType,
          sizeBytes: buffer.length,
          note: input.note,
          createdBy: ctx.member.id,
          createdByName: ctx.member.name,
        });
        return { id, url } as const;
      }),
    remove: familyProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await db.deleteMedicalRecord(input.id);
        return { success: true } as const;
      }),
  }),

  meds: router({
    list: familyProcedure.query(() => db.listMedications()),
    add: familyProcedure
      .input(
        z.object({
          name: z.string().min(1).max(120),
          kind: z.enum(MED_KINDS),
          dose: z.string().max(120).optional(),
          frequencyDays: z.number().int().min(1).max(730),
          startDate: isoDate,
          endDate: isoDate.optional(),
          note: z.string().max(1000).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const id = await db.addMedication({
          ...input,
          active: 1,
          createdBy: ctx.member.id,
          createdByName: ctx.member.name,
        });
        return { id } as const;
      }),
    update: familyProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          name: z.string().min(1).max(120).optional(),
          kind: z.enum(MED_KINDS).optional(),
          dose: z.string().max(120).nullable().optional(),
          frequencyDays: z.number().int().min(1).max(730).optional(),
          startDate: isoDate.optional(),
          endDate: isoDate.nullable().optional(),
          active: z.number().int().min(0).max(1).optional(),
          note: z.string().max(1000).nullable().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { id, ...patch } = input;
        await db.updateMedication(id, patch);
        return { success: true } as const;
      }),
    /** One-tap "Given today" — stamps lastGivenDate. */
    markGiven: familyProcedure
      .input(z.object({ id: z.number().int().positive(), date: isoDate }))
      .mutation(async ({ input }) => {
        await db.updateMedication(input.id, { lastGivenDate: input.date });
        return { success: true } as const;
      }),
    remove: familyProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await db.deleteMedication(input.id);
        return { success: true } as const;
      }),
  }),
});
