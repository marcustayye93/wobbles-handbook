/*
 * Wobbles' Map — pre-pinned places around home (Blk 587 Woodlands Drive 16).
 * Coordinates verified via OneMap (home) and Wikipedia/NParks (parks).
 */

export interface Place {
  id: string;
  name: string;
  area: string;
  emoji: string;
  lat: number;
  lng: number;
  blurb: string;
  tags: string[];
  travel: string;
  isHome?: boolean;
}

export const HOME_CENTER = { lat: 1.42845, lng: 103.79529 };
export const MAP_CENTER = { lat: 1.4462, lng: 103.7985 };
export const MAP_ZOOM = 13;

export const PLACES: Place[] = [
  {
    id: "home-blk-587",
    name: "Home — Blk 587",
    area: "Woodlands Drive 16",
    emoji: "🏠",
    lat: 1.42845,
    lng: 103.79529,
    blurb:
      "Home base. Wobbles' whole world starts here — the lift lobby, the corridor, the void deck bench where he watches Woodlands go by.",
    tags: ["Home", "Void-deck socials"],
    travel: "You're here",
    isHome: true,
  },
  {
    id: "park-next-to-block",
    name: "Park next to the block",
    area: "Woodlands Drive 16",
    emoji: "🌳",
    lat: 1.4288,
    lng: 103.7946,
    blurb:
      "The little neighbourhood park right beside Blk 587 — perfect for the 7:15am toilet walk and the 7pm every-other-day social sessions once he's vaccinated.",
    tags: ["Daily walks", "On foot"],
    travel: "1 min on foot",
  },
  {
    id: "woodlands-waterfront",
    name: "Woodlands Waterfront Park",
    area: "Admiralty Road West",
    emoji: "🌊",
    lat: 1.4527,
    lng: 103.7786,
    blurb:
      "Coastal park with sea views across the Straits of Johor and a dog run that's open 24/7. The big weekend outing — off-leash play once Wobbles is licensed and fully vaccinated.",
    tags: ["Dog run", "Sea views", "24/7"],
    travel: "~5–10 min drive",
  },
  {
    id: "admiralty-park",
    name: "Admiralty Park",
    area: "31 Riverside Road",
    emoji: "🍃",
    lat: 1.4464,
    lng: 103.7807,
    blurb:
      "27 hectares of NParks nature park with mangroves and quiet trails — a calm, shady leashed walk when you want greenery without the crowds.",
    tags: ["Nature park", "Leashed trails"],
    travel: "~10 min drive",
  },
  {
    id: "sembawang-dog-run",
    name: "Sembawang Park dog run",
    area: "Wak Hassan Place",
    emoji: "🐕",
    lat: 1.462,
    lng: 103.8365,
    blurb:
      "A spacious 2,700 m² dog run by the beach with a separate small-dog pen — ideal for a toy Cavoodle's first off-leash sessions with gentle company.",
    tags: ["Dog run", "Small-dog pen", "Beach"],
    travel: "~15 min drive",
  },
];

export function getPlace(id: string): Place | undefined {
  return PLACES.find((p) => p.id === id);
}
