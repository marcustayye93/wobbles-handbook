/*
 * Family access layer — Paddington's Handbook is a private household app with
 * NO login (user-confirmed 2026-07-25). Access control is simply keeping the
 * URL private. Every request carries an `x-wobbles-profile` header set by the
 * client from its device-remembered profile picker (Marcus / Chesa / Caretaker).
 *
 * All data continues to live in the Manus cloud database + S3 storage —
 * nothing is device-only — so the Paddington AI can always retrieve the full
 * history of trackers, photos and memories regardless of which device wrote it.
 *
 * Attribution: entries are stamped with a stable numeric id per profile plus
 * the profile display name, feeding the existing createdBy/createdByName
 * columns without any schema change. If a Manus OAuth session happens to be
 * present (legacy cookie), it is ignored in favour of the picked profile so
 * the label in the journal always matches who is holding the phone.
 */
import { publicProcedure } from "./_core/trpc";

export const FAMILY_PROFILES = ["Marcus", "Chesa", "Caretaker"] as const;
export type FamilyProfile = (typeof FAMILY_PROFILES)[number];

/** Stable attribution ids — never reuse or renumber (existing rows keep old OAuth ids). */
const PROFILE_IDS: Record<FamilyProfile, number> = {
  Marcus: 9001,
  Chesa: 9002,
  Caretaker: 9003,
};

export type FamilyMember = { id: number; name: FamilyProfile | "Family" };

export function resolveProfile(headerValue: unknown): FamilyMember {
  const raw = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  if (typeof raw === "string") {
    const match = FAMILY_PROFILES.find(
      (p) => p.toLowerCase() === raw.trim().toLowerCase(),
    );
    if (match) return { id: PROFILE_IDS[match], name: match };
  }
  // Unknown/missing header (old cached client, curl, etc.) — still allowed,
  // attributed neutrally to the household.
  return { id: 9000, name: "Family" };
}

/**
 * Drop-in replacement for the old `protectedProcedure`: never throws
 * UNAUTHORIZED, and injects `ctx.member` for attribution.
 */
export const familyProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const member = resolveProfile(ctx.req.headers["x-wobbles-profile"]);
  return next({ ctx: { ...ctx, member } });
});
