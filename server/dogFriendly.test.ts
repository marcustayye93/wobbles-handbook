import { describe, expect, it } from "vitest";
import {
  DOG_FRIENDLY_PLACES,
  KIND_LABEL,
  LEASH_BLURB,
  haversineKm,
  searchDogPlaces,
  withDistances,
} from "../client/src/content/dogFriendly";

describe("dog-friendly dataset", () => {
  it("loads 24 places including Woodlands Waterfront and Lazarus", () => {
    expect(DOG_FRIENDLY_PLACES).toHaveLength(24);
    const kinds = new Set(DOG_FRIENDLY_PLACES.map((p) => p.kind));
    expect([...kinds].sort()).toEqual(["beach", "cafe", "dog-run", "mall", "park", "staycation"]);
    expect(DOG_FRIENDLY_PLACES.filter((p) => p.kind === "dog-run")).toHaveLength(7);
    expect(DOG_FRIENDLY_PLACES[0].id).toBe("dog-run-woodlands-waterfront");
    const cabin = DOG_FRIENDLY_PLACES.find((p) => p.id === "stay-tiny-away-lazarus");
    expect(cabin?.kind).toBe("staycation");
    expect(cabin?.notes).toContain("31 Jan 2027");
    expect(cabin?.travel.coordsApproximate).toBe(true);
  });

  it("marks Sembawang Park Dog Run as approximate", () => {
    const p = DOG_FRIENDLY_PLACES.find((x) => x.id === "dog-run-sembawang");
    expect(p?.travel.coordsApproximate).toBe(true);
    expect(p?.name).toBe("Sembawang Park Dog Run");
  });

  it("keeps the statutory leash blurb verbatim", () => {
    expect(LEASH_BLURB).toBe(
      "Dogs must be kept on a leash in public places (no prescribed length in law), except inside fenced dog runs. Leash violations can carry a fine of up to S$5,000 under the Animals and Birds (Licensing and Control of Cats and Dogs) Rules 2024.",
    );
  });
});

describe("search and distance", () => {
  it("searches name, region, and category", () => {
    expect(searchDogPlaces(DOG_FRIENDLY_PLACES, "sentosa").length).toBeGreaterThan(0);
    expect(searchDogPlaces(DOG_FRIENDLY_PLACES, "cafe").every((p) => p.kind === "cafe")).toBe(true);
    expect(searchDogPlaces(DOG_FRIENDLY_PLACES, "punggol").some((p) => p.travel.region === "Punggol")).toBe(
      true,
    );
  });

  it("keeps JSON order and omits km when there is no home pin", () => {
    const rows = withDistances(DOG_FRIENDLY_PLACES, null);
    expect(rows.map((r) => r.place.id)).toEqual(DOG_FRIENDLY_PLACES.map((p) => p.id));
    expect(rows.every((r) => r.km === null)).toBe(true);
  });

  it("sorts nearest-first when an origin is supplied", () => {
    const woodlands = { lat: 1.42845, lng: 103.79529 };
    const rows = withDistances(DOG_FRIENDLY_PLACES, woodlands);
    expect(rows[0].km).not.toBeNull();
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].km!).toBeGreaterThanOrEqual(rows[i - 1].km! - 1e-9);
    }
    expect(haversineKm(woodlands, woodlands)).toBeCloseTo(0, 6);
  });

  it("labels kinds in plain words", () => {
    expect(KIND_LABEL["dog-run"]).toBe("dog run");
    expect(KIND_LABEL.staycation).toBe("staycation");
  });
});
