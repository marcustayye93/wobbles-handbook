/**
 * U3 — Medical vault tests: pure next-due maths + router surface.
 */
import { describe, expect, it } from "vitest";
import { nextDueDate, daysUntilDue, dueChipLabel, type MedScheduleShape } from "./medical";
import { medicalRouter } from "./medical";

const TODAY = "2026-07-26";

function med(overrides: Partial<MedScheduleShape>): MedScheduleShape {
  return {
    frequencyDays: 30,
    startDate: "2026-07-01",
    endDate: null,
    lastGivenDate: null,
    active: 1,
    ...overrides,
  };
}

describe("nextDueDate", () => {
  it("never given, start already past → due today", () => {
    expect(nextDueDate(med({}), TODAY)).toBe(TODAY);
  });

  it("never given, start in the future → due on the start date", () => {
    expect(nextDueDate(med({ startDate: "2026-08-10" }), TODAY)).toBe("2026-08-10");
  });

  it("given before → due lastGiven + frequency", () => {
    expect(nextDueDate(med({ lastGivenDate: "2026-07-24", frequencyDays: 30 }), TODAY)).toBe(
      "2026-08-23",
    );
  });

  it("daily med given today → due tomorrow", () => {
    expect(nextDueDate(med({ lastGivenDate: TODAY, frequencyDays: 1 }), TODAY)).toBe("2026-07-27");
  });

  it("course ended before next due → null", () => {
    expect(
      nextDueDate(med({ lastGivenDate: "2026-07-20", frequencyDays: 30, endDate: "2026-07-31" }), TODAY),
    ).toBeNull();
  });

  it("archived med → null", () => {
    expect(nextDueDate(med({ active: 0 }), TODAY)).toBeNull();
  });

  it("guards nonsense frequency to at least 1 day", () => {
    expect(nextDueDate(med({ lastGivenDate: TODAY, frequencyDays: 0 }), TODAY)).toBe("2026-07-27");
  });

  it("crosses month boundaries correctly (91-day preventive)", () => {
    expect(nextDueDate(med({ lastGivenDate: "2026-07-01", frequencyDays: 91 }), TODAY)).toBe(
      "2026-09-30",
    );
  });
});

describe("daysUntilDue", () => {
  it("overdue med → negative days", () => {
    expect(daysUntilDue(med({ lastGivenDate: "2026-06-01", frequencyDays: 30 }), TODAY)).toBe(-25);
  });

  it("due today → 0", () => {
    expect(daysUntilDue(med({}), TODAY)).toBe(0);
  });

  it("upcoming → positive days", () => {
    expect(daysUntilDue(med({ lastGivenDate: TODAY, frequencyDays: 30 }), TODAY)).toBe(30);
  });

  it("archived → null", () => {
    expect(daysUntilDue(med({ active: 0 }), TODAY)).toBeNull();
  });
});

describe("dueChipLabel", () => {
  it("labels overdue plural and singular", () => {
    expect(dueChipLabel(med({ lastGivenDate: "2026-06-01", frequencyDays: 30 }), TODAY)).toBe(
      "25 days overdue",
    );
    expect(dueChipLabel(med({ lastGivenDate: "2026-06-25", frequencyDays: 30 }), TODAY)).toBe(
      "1 day overdue",
    );
  });

  it("labels today / tomorrow / future", () => {
    expect(dueChipLabel(med({}), TODAY)).toBe("due today");
    expect(dueChipLabel(med({ lastGivenDate: TODAY, frequencyDays: 1 }), TODAY)).toBe(
      "due tomorrow",
    );
    expect(dueChipLabel(med({ lastGivenDate: TODAY, frequencyDays: 30 }), TODAY)).toBe(
      "due in 30 days",
    );
  });

  it("labels ended course and archived", () => {
    expect(
      dueChipLabel(med({ lastGivenDate: "2026-07-20", frequencyDays: 30, endDate: "2026-07-31" }), TODAY),
    ).toBe("course ended");
    expect(dueChipLabel(med({ active: 0 }), TODAY)).toBe("archived");
  });
});

describe("medicalRouter surface", () => {
  it("exposes records and meds procedures", () => {
    const procs = Object.keys(medicalRouter._def.procedures);
    expect(procs).toEqual(
      expect.arrayContaining([
        "records.list",
        "records.upload",
        "records.remove",
        "meds.list",
        "meds.add",
        "meds.update",
        "meds.markGiven",
        "meds.remove",
      ]),
    );
  });
});
