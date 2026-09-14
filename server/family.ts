
import { TRPCError } from "@trpc/server";
import { publicProcedure } from "./_core/trpc";
import { readSession } from "./familyAuth";

export const FAMILY_PROFILES = ["Marcus", "Chesa", "Caretaker"] as const;
export type FamilyProfile = (typeof FAMILY_PROFILES)[number];
const PROFILE_IDS: Record<FamilyProfile, number> = { Marcus: 9001, Chesa: 9002, Caretaker: 9003 };
export type FamilyMember = { id: number; name: FamilyProfile | "Family" };

export function resolveProfile(headerValue: unknown, sessionProfile?: FamilyProfile): FamilyMember {
  const fromSession = sessionProfile ? { id: PROFILE_IDS[sessionProfile], name: sessionProfile } : null;
  const raw = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  if (typeof raw === "string") {
    const match = FAMILY_PROFILES.find((p) => p.toLowerCase() === raw.trim().toLowerCase());
    if (match) return { id: PROFILE_IDS[match], name: match };
  }
  return fromSession ?? { id: 9000, name: "Family" };
}

export const familyProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const session = readSession(ctx.req);
  if (!session) throw new TRPCError({ code: "UNAUTHORIZED", message: "Family code required" });
  const member = resolveProfile(ctx.req.headers["x-wobbles-profile"], session.profile);
  return next({ ctx: { ...ctx, member, session } });
});
