/*
 * U5 — Lifetime milestone generator specs.
 * The generator is pure (no clock, no storage), so every expectation here is
 * exact: birthdays every 26 Jun, boosters, PALS renewals, dental checks from
 * 2028, senior bloodwork from age 8 (2034), stage thresholds, and the
 * merge/dedup semantics of allMilestones().
 */
import { describe, expect, it } from "vitest";
import {
  generateLifetimeMilestones,
  allMilestones,
} from "../client/src/content/lifetimeMilestones";
import { MILESTONES, WOBBLES } from "../client/src/content/wobbles";

describe("generateLifetimeMilestones", () => {
  it("is deterministic — two calls produce identical output", () => {
    const a = generateLifetimeMilestones();
    const b = generateLifetimeMilestones();
    expect(a).toEqual(b);
  });

  it("produces one birthday per year over the default 16-year horizon", () => {
    const birthdays = generateLifetimeMilestones().filter((m) =>
      /^Wobbles turns \d+/.test(m.label),
    );
    expect(birthdays).toHaveLength(16);
    // Every birthday falls on 26 June.
    for (const b of birthdays) expect(b.date.slice(5)).toBe("06-26");
    // First is age 1 in 2027, last is age 16 in 2042.
    expect(birthdays[0].date).toBe("2027-06-26");
    expect(birthdays[0].label).toContain("turns 1");
    expect(birthdays[birthdays.length - 1].date).toBe("2042-06-26");
    expect(birthdays[birthdays.length - 1].label).toContain("turns 16");
  });

  it("respects a custom horizon", () => {
    const short = generateLifetimeMilestones(3);
    const birthdays = short.filter((m) => /^Wobbles turns \d+/.test(m.label));
    expect(birthdays).toHaveLength(3);
    expect(short.every((m) => m.date <= "2029-12-31")).toBe(true);
  });

  it("pairs an annual booster + health check with every birthday", () => {
    const boosters = generateLifetimeMilestones().filter((m) =>
      m.label.startsWith("Annual booster"),
    );
    expect(boosters).toHaveLength(16);
    for (const b of boosters) {
      expect(b.date.slice(5)).toBe("06-26");
      expect(b.icon).toBe("syringe");
    }
  });

  it("schedules PALS licence renewal every 1 September", () => {
    const pals = generateLifetimeMilestones().filter(
      (m) => m.label === "PALS dog licence renewal",
    );
    expect(pals).toHaveLength(16);
    for (const p of pals) expect(p.date.slice(5)).toBe("09-01");
    expect(pals[0].date).toBe("2027-09-01");
  });

  it("starts annual dental checks in January 2028 (not 2027)", () => {
    const dental = generateLifetimeMilestones().filter(
      (m) => m.label === "Annual dental check",
    );
    expect(dental.length).toBeGreaterThan(0);
    expect(dental[0].date).toBe("2028-01-15");
    expect(dental.some((m) => m.date.startsWith("2027-"))).toBe(false);
  });

  it("starts senior bloodwork at age 8 (2034), twice yearly", () => {
    const blood = generateLifetimeMilestones().filter((m) =>
      m.label.startsWith("Senior bloodwork"),
    );
    // Ages 8..16 inclusive = 9 years × 2 panels.
    expect(blood).toHaveLength(18);
    const sorted = [...blood].sort((a, b) => a.date.localeCompare(b.date));
    expect(sorted[0].date).toBe("2034-06-26");
    expect(blood.some((m) => m.date < "2034-01-01")).toBe(false);
    // Each qualifying year has exactly one mid-year + one end-of-year panel.
    const in2034 = blood.filter((m) => m.date.startsWith("2034-"));
    expect(in2034.map((m) => m.date).sort()).toEqual([
      "2034-06-26",
      "2034-12-15",
    ]);
  });

  it("places life-stage thresholds on the correct dates", () => {
    const all = generateLifetimeMilestones();
    const find = (label: string) => all.find((m) => m.label === label);
    expect(find("Adolescence begins")?.date).toBe("2027-06-26");
    expect(find("Young adult")?.date).toBe("2027-12-26");
    expect(find("Prime years begin")?.date).toBe("2030-06-26");
    expect(find("Senior years begin")?.date).toBe("2034-06-26");
    expect(find("Golden twilight begins")?.date).toBe("2038-06-26");
    for (const label of [
      "Adolescence begins",
      "Young adult",
      "Prime years begin",
      "Senior years begin",
      "Golden twilight begins",
    ]) {
      expect(find(label)?.icon).toBe("star");
    }
  });

  it("returns milestones sorted ascending by date then label", () => {
    const all = generateLifetimeMilestones();
    for (let i = 1; i < all.length; i++) {
      const cmp =
        all[i - 1].date.localeCompare(all[i].date) ||
        all[i - 1].label.localeCompare(all[i].label);
      expect(cmp).toBeLessThanOrEqual(0);
    }
  });
});

describe("allMilestones", () => {
  it("contains every hand-written first-year milestone", () => {
    const merged = allMilestones();
    const keys = new Set(merged.map((m) => `${m.date}|${m.label}`));
    for (const m of MILESTONES) {
      expect(keys.has(`${m.date}|${m.label}`)).toBe(true);
    }
  });

  it("has no duplicate date+label pairs after the merge", () => {
    const merged = allMilestones();
    const keys = merged.map((m) => `${m.date}|${m.label}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("static entries win on collisions (object identity preserved)", () => {
    const merged = allMilestones();
    for (const staticM of MILESTONES) {
      const found = merged.find(
        (m) => m.date === staticM.date && m.label === staticM.label,
      );
      expect(found).toBe(staticM);
    }
  });

  it("is sorted ascending by date then label", () => {
    const merged = allMilestones();
    for (let i = 1; i < merged.length; i++) {
      const cmp =
        merged[i - 1].date.localeCompare(merged[i].date) ||
        merged[i - 1].label.localeCompare(merged[i].label);
      expect(cmp).toBeLessThanOrEqual(0);
    }
  });

  it("spans from birth to the 16th birthday", () => {
    const merged = allMilestones();
    expect(merged[0].date <= WOBBLES.dob).toBe(true);
    expect(merged[merged.length - 1].date >= "2042-06-26").toBe(true);
  });

  it("respects a shorter horizon while keeping the static first year", () => {
    const merged = allMilestones(2);
    expect(merged.some((m) => m.date.startsWith("2026-"))).toBe(true);
    expect(merged.every((m) => m.date <= "2028-12-31")).toBe(true);
  });
});
