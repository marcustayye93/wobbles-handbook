/*
 * Shopping countdown plan — structural and helper-logic tests.
 * Guards the week sequencing (no gaps, Mon–Sun ranges, ends on homecoming),
 * unique item ids for the shared tick map, and the currentWeek/overdueItems
 * date logic used by the /handbook/shopping page and Home nudges.
 */
import { describe, it, expect } from "vitest";
import {
  SHOPPING_WEEKS,
  SHOPPING_TOTAL,
  HOMECOMING_ISO,
  weekStatus,
  currentWeek,
  weekRangeLabel,
  overdueItems,
  toISODate,
} from "../client/src/content/shoppingPlan";

const d = (iso: string) => new Date(iso + "T12:00:00");

describe("shopping plan structure", () => {
  it("has 9 weeks covering 20 Jul → 18 Sep 2026 with no gaps", () => {
    expect(SHOPPING_WEEKS).toHaveLength(9);
    expect(SHOPPING_WEEKS[0].start).toBe("2026-07-20");
    expect(SHOPPING_WEEKS[SHOPPING_WEEKS.length - 1].end).toBe(HOMECOMING_ISO);
    for (let i = 1; i < SHOPPING_WEEKS.length; i++) {
      const prevEnd = new Date(SHOPPING_WEEKS[i - 1].end + "T12:00:00");
      const nextStart = new Date(SHOPPING_WEEKS[i].start + "T12:00:00");
      const gapDays = (nextStart.getTime() - prevEnd.getTime()) / 86400000;
      expect(gapDays).toBe(1); // contiguous weeks
    }
  });

  it("every week starts on a Monday", () => {
    for (const w of SHOPPING_WEEKS) {
      expect(d(w.start).getDay()).toBe(1);
    }
  });

  it("final week ends on homecoming Friday 18 Sep 2026", () => {
    const last = SHOPPING_WEEKS[SHOPPING_WEEKS.length - 1];
    expect(last.end).toBe("2026-09-18");
    expect(d(last.end).getDay()).toBe(5); // Friday
  });

  it("item ids are unique across the whole plan", () => {
    const ids = SHOPPING_WEEKS.flatMap((w) => w.items.map((it) => it.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(SHOPPING_TOTAL);
    expect(SHOPPING_TOTAL).toBeGreaterThanOrEqual(30);
  });

  it("sequences big items early and perishables last", () => {
    // IATA crate is in week 1; fresh food is in the final week
    expect(SHOPPING_WEEKS[0].items.some((it) => it.id === "crate-iata")).toBe(true);
    const last = SHOPPING_WEEKS[SHOPPING_WEEKS.length - 1];
    expect(last.items.some((it) => it.id === "fresh-extras")).toBe(true);
    // Food buying only happens after the consumables week (breeder confirms brand late)
    const foodWeekIdx = SHOPPING_WEEKS.findIndex((w) => w.items.some((it) => it.id === "breeder-food"));
    expect(foodWeekIdx).toBeGreaterThanOrEqual(7);
  });
});

describe("weekStatus / currentWeek", () => {
  it("classifies past, current and future relative to a pinned date", () => {
    const now = d("2026-08-12"); // Wednesday of week 4
    expect(weekStatus(SHOPPING_WEEKS[0], now)).toBe("past");
    expect(weekStatus(SHOPPING_WEEKS[3], now)).toBe("current");
    expect(weekStatus(SHOPPING_WEEKS[8], now)).toBe("future");
    expect(currentWeek(now).id).toBe("w4");
  });

  it("falls back to the first week before the plan starts", () => {
    expect(currentWeek(d("2026-07-01")).id).toBe("w1");
  });

  it("falls back to the last week after homecoming", () => {
    expect(currentWeek(d("2026-10-01")).id).toBe("w9");
  });

  it("week boundaries are inclusive", () => {
    expect(weekStatus(SHOPPING_WEEKS[0], d("2026-07-20"))).toBe("current");
    expect(weekStatus(SHOPPING_WEEKS[0], d("2026-07-26"))).toBe("current");
    expect(weekStatus(SHOPPING_WEEKS[0], d("2026-07-27"))).toBe("past");
  });
});

describe("overdueItems", () => {
  it("returns unticked items only from past weeks", () => {
    const now = d("2026-08-05"); // week 3 current, weeks 1-2 past
    const none = overdueItems({}, now);
    const pastIds = SHOPPING_WEEKS.slice(0, 2).flatMap((w) => w.items.map((it) => it.id));
    expect(none.map((o) => o.item.id)).toEqual(pastIds);

    const ticks = Object.fromEntries(pastIds.map((id) => [id, true]));
    expect(overdueItems(ticks, now)).toHaveLength(0);
  });

  it("is empty before the plan starts", () => {
    expect(overdueItems({}, d("2026-07-19"))).toHaveLength(0);
  });
});

describe("labels & dates", () => {
  it("weekRangeLabel renders compact ranges", () => {
    expect(weekRangeLabel(SHOPPING_WEEKS[0])).toContain("Jul");
    const crossMonth = SHOPPING_WEEKS.find((w) => w.start.slice(5, 7) !== w.end.slice(5, 7));
    if (crossMonth) {
      const label = weekRangeLabel(crossMonth);
      expect(label).toMatch(/[A-Z][a-z]{2}.*[A-Z][a-z]{2}/s);
    }
  });

  it("toISODate round-trips", () => {
    expect(toISODate(d("2026-09-18"))).toBe("2026-09-18");
  });
});
