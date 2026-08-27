/**
 * Locked product copy. Kills: Revolution Plus, ENS % framing is handled in
 * StoryBlocks, 5-min-per-month walk-as-science, fully-protected / park-cleared
 * around 22 Sep, import licence "valid 30 days".
 */
export function fixProductCopy(text: string): string {
  return text
    .replace(/, or a spot-on drip like Revolution Plus/gi, "")
    .replace(/Revolution Plus/gi, "a vet-chosen monthly chew")
    .replace(
      /Puppy rule of thumb: ~5 minutes of structured walking per month of age, up to twice a day — but sniffing time is free/,
      "Skip the old 5-minutes-per-month walk rule — it is not science. Short, frequent outings and sniffing time matter more",
    )
    .replace(
      /11 Aug, 25 Aug and 8 Sep 2026 — all three shots done in Australia before export, so he's fully protected ~22 Sep, a day or two before the flight/,
      "C3 dose 3 is 8 Sep in Australia. That is NOT the 16-week core — he is NOT fully vaccinated and NOT park-cleared at landing",
    )
    .replace(
      /His Protech C3 course finishes on 8 Sep in Australia, so he lands fully protected \(immunity ~22 Sep, two weeks after dose 3\)\. Still, hold off on public ground until the first SG vet visit \(~28 Sep\) confirms he's clear — and ask the vet about a 16-week booster, since his third dose was given at 10\.5 weeks\./,
      "C3 dose 3 is 8 Sep in Australia — he is NOT fully vaccinated and NOT park-cleared. Carry-socialise. Ground and park wait for the ≥16-week core (~15 Oct) plus a Singapore vet nod.",
    )
    .replace(
      /Once the SG vet signs off at the first visit \(~28 Sep — his Protech C3 course finished back on 8 Sep\)/,
      "Once the ≥16-week core (~15 Oct) is done and the Singapore vet nods",
    )
    .replace(/\bvalid for 30 days\b/g, "valid for 90 days")
    .replace(/\bvalid 30 days\b/g, "valid 90 days")
    .replace(/only valid 30 days/g, "valid 90 days")
    .replace(
      /His C3 course finished at 10\.5 weeks \(8 Sep\) — ask the SG vet at the first visit about a 16-week booster, which many vets recommend when the last dose was before 16 weeks\./,
      "Dose 3 on 8 Sep is not full protection. Book the ≥16-week core (~15 Oct) with SingVet, then wait for the vet's nod before public grass.",
    );
}
