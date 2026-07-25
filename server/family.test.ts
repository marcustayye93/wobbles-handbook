/*
 * Family access layer tests — the no-login profile resolution.
 * resolveProfile() must never throw: every request is allowed, and any
 * unrecognisable header falls back to the neutral "Family" attribution.
 */
import { describe, expect, it } from "vitest";
import { FAMILY_PROFILES, resolveProfile } from "./family";

describe("FAMILY_PROFILES", () => {
  it("contains exactly Marcus, Chesa and Caretaker", () => {
    expect(FAMILY_PROFILES).toEqual(["Marcus", "Chesa", "Caretaker"]);
  });
});

describe("resolveProfile", () => {
  it("resolves each valid profile to its stable attribution id", () => {
    expect(resolveProfile("Marcus")).toEqual({ id: 9001, name: "Marcus" });
    expect(resolveProfile("Chesa")).toEqual({ id: 9002, name: "Chesa" });
    expect(resolveProfile("Caretaker")).toEqual({ id: 9003, name: "Caretaker" });
  });

  it("matches case-insensitively and trims whitespace", () => {
    expect(resolveProfile("marcus")).toEqual({ id: 9001, name: "Marcus" });
    expect(resolveProfile("CHESA")).toEqual({ id: 9002, name: "Chesa" });
    expect(resolveProfile("  caretaker  ")).toEqual({ id: 9003, name: "Caretaker" });
  });

  it("falls back to Family (9000) for unknown strings", () => {
    expect(resolveProfile("Wobbles")).toEqual({ id: 9000, name: "Family" });
    expect(resolveProfile("")).toEqual({ id: 9000, name: "Family" });
    expect(resolveProfile("admin")).toEqual({ id: 9000, name: "Family" });
  });

  it("falls back to Family when the header is missing", () => {
    expect(resolveProfile(undefined)).toEqual({ id: 9000, name: "Family" });
    expect(resolveProfile(null)).toEqual({ id: 9000, name: "Family" });
  });

  it("falls back to Family for non-string values", () => {
    expect(resolveProfile(42)).toEqual({ id: 9000, name: "Family" });
    expect(resolveProfile({ name: "Marcus" })).toEqual({ id: 9000, name: "Family" });
  });

  it("uses the first element when Express passes an array header", () => {
    expect(resolveProfile(["Chesa", "Marcus"])).toEqual({ id: 9002, name: "Chesa" });
    expect(resolveProfile([])).toEqual({ id: 9000, name: "Family" });
  });

  it("never throws for any input (no UNAUTHORIZED behaviour remains)", () => {
    for (const v of [undefined, null, 0, false, [], {}, Symbol("x"), () => {}]) {
      expect(() => resolveProfile(v)).not.toThrow();
    }
  });
});
