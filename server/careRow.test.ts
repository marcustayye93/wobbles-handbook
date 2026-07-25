/*
 * CareRow — tests for the one-tap care row's smart defaults. The key
 * invariant: every default option string MUST exactly match one of that
 * tracker's option choices, or the saved entry would carry an orphan label.
 */
import { describe, expect, it } from "vitest";
import { CARE_ACTIONS, defaultOptionFor } from "../client/src/components/CareRow";
import { getTracker } from "../client/src/lib/trackers";

describe("CARE_ACTIONS wiring", () => {
  it("covers the five most-used loggers in order", () => {
    expect(CARE_ACTIONS.map((a) => a.trackerId)).toEqual([
      "walk",
      "feeding",
      "toilet",
      "sleep",
      "shower",
    ]);
  });

  it("every action points at a real tracker", () => {
    for (const a of CARE_ACTIONS) {
      expect(getTracker(a.trackerId), a.trackerId).toBeTruthy();
    }
  });

  it("every default option (any hour) is a valid choice for its tracker", () => {
    for (const a of CARE_ACTIONS) {
      const meta = getTracker(a.trackerId)!;
      const choices = meta.fields.options?.choices ?? [];
      for (let hour = 0; hour < 24; hour++) {
        const opt = a.defaultOption?.(hour);
        if (opt !== undefined) {
          expect(choices, `${a.trackerId} @ ${hour}h → "${opt}"`).toContain(opt);
        }
      }
    }
  });
});

describe("defaultOptionFor — time-of-day smarts", () => {
  it("walk: morning before noon, evening after", () => {
    expect(defaultOptionFor("walk", 8)).toBe("Morning walk");
    expect(defaultOptionFor("walk", 18)).toBe("Evening walk");
  });

  it("meal: breakfast / lunch / dinner windows", () => {
    expect(defaultOptionFor("feeding", 7)).toBe("Breakfast");
    expect(defaultOptionFor("feeding", 12)).toBe("Lunch");
    expect(defaultOptionFor("feeding", 18)).toBe("Dinner");
  });

  it("sleep: night after 8pm or before 6am, nap otherwise", () => {
    expect(defaultOptionFor("sleep", 21)).toBe("Night — slept through");
    expect(defaultOptionFor("sleep", 3)).toBe("Night — slept through");
    expect(defaultOptionFor("sleep", 14)).toBe("Nap (crate)");
  });

  it("returns undefined for unknown trackers", () => {
    expect(defaultOptionFor("nope", 10)).toBeUndefined();
  });
});
