/*
 * Quality-of-life (HHHHHMM) scoring — pure helpers shared by the Health
 * check-in card and its tests. Based on the Villalobos HHHHHMM scale used
 * in veterinary palliative care, adapted to 0–5 per dimension (35 total).
 */

export interface QolDimension {
  /** short key used in the encoded note, e.g. "Hurt" → "Hu" */
  key: string;
  label: string;
  /** what 5 looks like — anchors the slider */
  high: string;
  /** what 0 looks like */
  low: string;
}

export const QOL_DIMENSIONS: QolDimension[] = [
  {
    key: "Hurt",
    label: "Hurt",
    high: "Comfortable, breathing easy, no signs of pain",
    low: "Pain that medication isn't managing",
  },
  {
    key: "Hunger",
    label: "Hunger",
    high: "Eating happily on his own",
    low: "Refusing food even hand-fed",
  },
  {
    key: "Hydration",
    label: "Hydration",
    high: "Drinking normally",
    low: "Not drinking; needs fluids",
  },
  {
    key: "Hygiene",
    label: "Hygiene",
    high: "Clean, brushed, no soiling",
    low: "Can't stay clean; sores or soiling",
  },
  {
    key: "Happiness",
    label: "Happiness",
    high: "Greets you, wants the ball, joins the family",
    low: "Withdrawn, no joy in the old favourites",
  },
  {
    key: "Mobility",
    label: "Mobility",
    high: "Moves freely, manages his routes",
    low: "Can't get up or move without help",
  },
  {
    key: "MoreGood",
    label: "More good days than bad",
    high: "Good days clearly outnumber bad ones",
    low: "Bad days now outnumber good ones",
  },
];

export const QOL_MAX = QOL_DIMENSIONS.length * 5; // 35

export type QolBand = "comfortable" | "watch" | "vet";

/** Interpretation bands: >28 comfortable · 21–28 watch closely · <21 talk to the vet. */
export function qolBand(total: number): QolBand {
  if (total > 28) return "comfortable";
  if (total >= 21) return "watch";
  return "vet";
}

export function qolBandCopy(band: QolBand): { label: string; text: string } {
  switch (band) {
    case "comfortable":
      return {
        label: "Comfortable",
        text: "He's thriving. File this one as a baseline and enjoy the month.",
      };
    case "watch":
      return {
        label: "Watch closely",
        text: "Quality of life is acceptable but worth watching. Mention the low dimensions at the next vet visit and re-check in a fortnight.",
      };
    case "vet":
      return {
        label: "Talk to the vet",
        text: "The scale says it's time for an honest conversation with the vet about comfort and options — soon, not someday.",
      };
  }
}

/** Sum scores, clamped to 0–5 each. */
export function qolTotal(scores: number[]): number {
  return scores.reduce((sum, s) => sum + Math.min(5, Math.max(0, Math.round(s))), 0);
}

/**
 * Encode per-dimension scores into the tracker-entry note,
 * e.g. "Hurt 4 · Hunger 5 · Hydration 5 · Hygiene 4 · Happiness 4 · Mobility 3 · More good days 4".
 */
export function encodeQolNote(scores: number[]): string {
  return QOL_DIMENSIONS.map((d, i) => `${d.label} ${scores[i] ?? 0}`).join(" · ");
}
