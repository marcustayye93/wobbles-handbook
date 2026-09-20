/*
 * Dog-friendly places. Renders the Sep 2026 verified dataset verbatim.
 * Distances only when a home pin exists. No invented policy.
 */
import dataset from "@/data/dog-friendly.json";

export type PlaceKind = "dog-run" | "beach" | "park" | "cafe" | "mall" | "staycation";
export type LeashRule = "off-leash" | "leashed";

export interface DogFriendlyPlace {
  id: string;
  kind: PlaceKind;
  name: string;
  address: string;
  leash: LeashRule;
  notes: string;
  travel: {
    lat: number;
    lng: number;
    nearestMrt?: string;
    region: string;
    zone: string;
    coordsApproximate?: boolean;
  };
  sourceUrls: string[];
  observedDate: string;
}

export const KIND_LABEL: Record<PlaceKind, string> = {
  "dog-run": "dog run",
  beach: "beach",
  park: "park",
  cafe: "cafe",
  mall: "mall",
  staycation: "staycation",
};

export const LEASH_BLURB =
  "Dogs must be kept on a leash in public places (no prescribed length in law), except inside fenced dog runs. Leash violations can carry a fine of up to S$5,000 under the Animals and Birds (Licensing and Control of Cats and Dogs) Rules 2024.";

export const PLANNING_BLURB =
  "Planning for later. Paddington should only visit these places after his 16-week core on Friday 16 Oct 2026 plus SingVet's clearance. Not for this week.";

export const DOG_FRIENDLY_PLACES: DogFriendlyPlace[] = dataset.places as DogFriendlyPlace[];

const EARTH_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance in km. */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function formatKm(km: number): string {
  if (km < 1) return `${Math.round(km * 10) / 10} km`;
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}

export function searchDogPlaces(
  places: DogFriendlyPlace[],
  query: string,
): DogFriendlyPlace[] {
  const q = query.trim().toLowerCase();
  if (!q) return places;
  return places.filter((p) => {
    const hay = `${p.name} ${p.travel.region} ${KIND_LABEL[p.kind]} ${p.kind}`.toLowerCase();
    return hay.includes(q);
  });
}

export function withDistances(
  places: DogFriendlyPlace[],
  origin: { lat: number; lng: number } | null,
): { place: DogFriendlyPlace; km: number | null }[] {
  if (!origin) return places.map((place) => ({ place, km: null }));
  return [...places]
    .map((place) => ({ place, km: haversineKm(origin, place.travel) }))
    .sort((a, b) => (a.km ?? 0) - (b.km ?? 0));
}
