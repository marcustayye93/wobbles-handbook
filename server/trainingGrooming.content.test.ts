/*
 * Content-structure tests for the Training and Grooming tab data files.
 * These guard the ordering guarantees the UI relies on (priority order,
 * sequential groom stages, unique slugs, non-empty step guides, image URLs).
 */
import { describe, expect, it } from "vitest";
import { TRAINING_SKILLS, TRAINING_RULES, skillStatus } from "../client/src/content/training";
import { GROOM_STEPS, GROOM_KIT, GROOM_FREQUENCY } from "../client/src/content/grooming";
import { CHECKLISTS } from "../client/src/content/checklists";
import { careTasksFor } from "../client/src/content/household";

describe("training curriculum content", () => {
  it("has skills in strict ascending priority order starting at 1", () => {
    const priorities = TRAINING_SKILLS.map((s) => s.priority);
    expect(priorities[0]).toBe(1);
    for (let i = 1; i < priorities.length; i++) {
      expect(priorities[i]).toBe(priorities[i - 1] + 1);
    }
  });

  it("puts potty training first", () => {
    expect(TRAINING_SKILLS[0].slug).toBe("potty");
  });

  it("has unique slugs", () => {
    const slugs = TRAINING_SKILLS.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every skill has at least 3 steps with title and text", () => {
    for (const s of TRAINING_SKILLS) {
      expect(s.steps.length).toBeGreaterThanOrEqual(3);
      for (const step of s.steps) {
        expect(step.title.length).toBeGreaterThan(0);
        expect(step.text.length).toBeGreaterThan(20);
      }
    }
  });

  it("every skill has goal, startWhen, wobbles note and pro tip", () => {
    for (const s of TRAINING_SKILLS) {
      expect(s.goal.length).toBeGreaterThan(10);
      expect(s.startWhen.length).toBeGreaterThan(3);
      expect(s.wobbles.length).toBeGreaterThan(20);
      expect(s.proTip.length).toBeGreaterThan(10);
    }
  });

  it("skill images are valid storage URLs when present", () => {
    for (const s of TRAINING_SKILLS) {
      if (s.img) {
        expect(s.img).toMatch(/^(\/manus-storage\/|https:\/\/)/);
      }
    }
  });

  it("skillStatus respects startWeeks/soonWeeks thresholds", () => {
    const sample = TRAINING_SKILLS[0];
    expect(skillStatus(sample, sample.startWeeks + 1)).toBe("now");
    // a skill far in the future should be "later" for a newborn
    const last = TRAINING_SKILLS[TRAINING_SKILLS.length - 1];
    expect(skillStatus(last, 0)).toBe("later");
  });

  it("covers pre-vaccination carry socialisation for the 8-16 week window", () => {
    const social = TRAINING_SKILLS.find((s) => s.slug === "social");
    expect(social).toBeDefined();
    const allText = [
      social!.short,
      social!.wobbles,
      ...social!.steps.map((st) => `${st.title} ${st.text}`),
    ]
      .join(" ")
      .toLowerCase();
    expect(allText).toMatch(/carr(y|ier|y-socialising)/);
    expect(allText).toMatch(/vaccin/);
  });

  it("has golden rules", () => {
    expect(TRAINING_RULES.length).toBeGreaterThanOrEqual(4);
  });
});

describe("grooming walkthrough content", () => {
  it("has stages in strict sequential order starting at 0", () => {
    GROOM_STEPS.forEach((g, i) => expect(g.order).toBe(i));
  });

  it("brushes before bathing and dries before finishing tools", () => {
    const idx = (slug: string) => GROOM_STEPS.findIndex((g) => g.slug === slug);
    expect(idx("brush")).toBeLessThan(idx("bath"));
    expect(idx("bath")).toBeLessThan(idx("dry"));
    expect(idx("dry")).toBeLessThan(idx("nails"));
    expect(idx("dry")).toBeLessThan(idx("teeth"));
  });

  it("has unique slugs", () => {
    const slugs = GROOM_STEPS.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every stage has steps, a watch-out and a puppy note", () => {
    for (const g of GROOM_STEPS) {
      expect(g.steps.length).toBeGreaterThanOrEqual(2);
      for (const step of g.steps) {
        expect(step.title.length).toBeGreaterThan(0);
        expect(step.text.length).toBeGreaterThan(20);
      }
      expect(g.watchOut.length).toBeGreaterThan(20);
      expect(g.puppyNote.length).toBeGreaterThan(20);
      expect(g.time.length).toBeGreaterThan(0);
    }
  });

  it("stage images are valid storage URLs when present", () => {
    for (const g of GROOM_STEPS) {
      if (g.img) {
        expect(g.img).toMatch(/^(\/manus-storage\/|https:\/\/)/);
      }
    }
  });

  it("has a usable kit list and frequency cheatsheet", () => {
    expect(GROOM_KIT.length).toBeGreaterThanOrEqual(8);
    for (const k of GROOM_KIT) {
      expect(k.item.length).toBeGreaterThan(0);
      expect(k.note.length).toBeGreaterThan(5);
    }
    expect(GROOM_FREQUENCY.length).toBeGreaterThanOrEqual(6);
    for (const f of GROOM_FREQUENCY) {
      expect(f.task.length).toBeGreaterThan(0);
      expect(f.cadence.length).toBeGreaterThan(3);
      expect(f.rota.length).toBeGreaterThan(0);
    }
  });

  it("bath row includes the basic trim on a fortnightly cadence", () => {
    const bath = GROOM_FREQUENCY.find((f) => f.task.toLowerCase().includes("bath"));
    expect(bath).toBeDefined();
    expect(bath!.task.toLowerCase()).toContain("trim");
    expect(bath!.cadence.toLowerCase()).toContain("2 weeks");
  });
});

describe("digital-first checklists (no printing)", () => {
  it("no checklist item tells the family to print anything", () => {
    for (const c of CHECKLISTS) {
      for (const item of c.items) {
        expect(item.toLowerCase()).not.toContain("print");
      }
    }
  });

  it("bath-day list is fortnightly and ends with the basic trim steps", () => {
    const bath = CHECKLISTS.find((c) => c.id === "bath-day");
    expect(bath).toBeDefined();
    expect(bath!.cadence.toLowerCase()).toContain("2 weeks");
    const all = bath!.items.join(" ").toLowerCase();
    expect(all).toContain("basic trim");
    expect(all).toContain("paw pads");
    expect(all).toContain("sanitary");
    expect(all).toContain("eye corners");
  });

  it("grooming-day list frames every bath as a groom with a maintenance trim", () => {
    const groom = CHECKLISTS.find((c) => c.id === "grooming-day");
    expect(groom).toBeDefined();
    expect(groom!.cadence.toLowerCase()).toContain("every bath");
    expect(groom!.items.join(" ").toLowerCase()).toContain("maintenance trim");
  });

  it("the bath rota task carries the trim in its label and detail", () => {
    // 2026-09-28 is the anchored first bath Monday
    const tasks = careTasksFor(new Date("2026-09-28T00:00:00"));
    const bath = tasks.find((t) => t.id === "bath");
    expect(bath).toBeDefined();
    expect(bath!.label.toLowerCase()).toContain("trim");
    expect(bath!.detail.toLowerCase()).toContain("basic trim");
  });
});

describe("coat length check ritual", () => {
  it("bath-day and grooming-day checklists end with the coat check photo", () => {
    for (const id of ["bath-day", "grooming-day"]) {
      const list = CHECKLISTS.find((c) => c.id === id);
      expect(list).toBeDefined();
      expect(list!.items.join(" ").toLowerCase()).toContain("coat check photo");
    }
  });

  it("the bath rota task tells you to finish with the coat check photo", () => {
    const tasks = careTasksFor(new Date("2026-09-28T00:00:00"));
    const bath = tasks.find((t) => t.id === "bath");
    expect(bath).toBeDefined();
    expect(bath!.detail.toLowerCase()).toContain("coat check photo");
  });

  it("monthly checklist routes coat photos into the coat length check series", () => {
    const monthly = CHECKLISTS.find((c) => c.id === "monthly");
    expect(monthly).toBeDefined();
    expect(monthly!.items.join(" ").toLowerCase()).toContain("coat length check");
  });
});
