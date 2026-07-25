import { describe, expect, it } from "vitest";
import {
  CORE_DUTIES,
  GUIDE_SECTIONS,
  HANDOVER_KIT,
  TBC,
  isTBC,
  tbcCount,
} from "../client/src/content/caretakerGuide";

describe("caretaker guide content", () => {
  it("has exactly three core duties covering safety, food/water and walks", () => {
    expect(CORE_DUTIES).toHaveLength(3);
    const titles = CORE_DUTIES.map((d) => d.title.toLowerCase()).join(" ");
    expect(titles).toContain("safe");
    expect(titles).toContain("water");
    expect(titles).toContain("walk");
  });

  it("hands over the four confirmed items: IATA crate, pee pad, bowls, kibble", () => {
    expect(HANDOVER_KIT).toHaveLength(4);
    const names = HANDOVER_KIT.map((k) => k.name.toLowerCase()).join(" | ");
    expect(names).toContain("iata");
    expect(names).toContain("pee pad");
    expect(names).toContain("bowl");
    expect(names).toContain("kibble");
  });

  it("has unique section ids and non-empty items", () => {
    const ids = GUIDE_SECTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of GUIDE_SECTIONS) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.intro.length).toBeGreaterThan(0);
      expect(s.items.length).toBeGreaterThan(0);
      for (const it of s.items) {
        expect(it.label.length).toBeGreaterThan(0);
        expect(it.value.length).toBeGreaterThan(0);
      }
    }
  });

  it("covers the essential handover topics", () => {
    const ids = GUIDE_SECTIONS.map((s) => s.id);
    for (const required of [
      "profile",
      "contacts",
      "routine",
      "feeding",
      "toilet",
      "walks",
      "house",
      "health",
    ]) {
      expect(ids).toContain(required);
    }
  });

  it("marks unknown details as To be confirmed and counts them", () => {
    expect(isTBC(TBC)).toBe(true);
    expect(isTBC("something known")).toBe(false);
    const manual = GUIDE_SECTIONS.reduce(
      (sum, s) => sum + s.items.filter((i) => i.value === TBC).length,
      0
    );
    expect(tbcCount()).toBe(manual);
    // The template starts as a placeholder — several details are still open.
    expect(tbcCount()).toBeGreaterThan(5);
  });

  it("keeps kibble brand and vet contacts as TBC placeholders for now", () => {
    const feeding = GUIDE_SECTIONS.find((s) => s.id === "feeding")!;
    const kibble = feeding.items.find((i) => i.label.toLowerCase().includes("kibble"))!;
    expect(kibble.value).toBe(TBC);

    const contacts = GUIDE_SECTIONS.find((s) => s.id === "contacts")!;
    const vet = contacts.items.find((i) => i.label.toLowerCase().includes("regular vet"))!;
    expect(vet.value).toBe(TBC);
  });
});
