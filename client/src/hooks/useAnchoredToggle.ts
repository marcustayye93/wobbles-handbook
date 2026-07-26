/**
 * useAnchoredToggle — accordion toggle that never lets the page jump.
 *
 * The problem: on accordion pages (one card open at a time), tapping card B
 * while card A above it is open collapses A's tall content. Everything above
 * the tapped card shrinks, so the viewport visually "flies" upward and the
 * user loses their place. Naive fixes that always scrollIntoView on collapse
 * cause a different jarring jump when the header was already visible.
 *
 * The fix: measure the tapped card's on-screen position (viewport-relative
 * top) BEFORE the state change, then keep re-pinning the card to that exact
 * visual position on every animation frame while the accordion's ~200ms
 * height transition plays (see components/Collapse.tsx). If the card would
 * end up hidden under the sticky header, settle it just below the header
 * instead. Because card bodies now animate rather than snap, a single-frame
 * correction is not enough — the layout shifts continuously for the whole
 * transition, so we anchor for its full duration plus a small buffer.
 */
export const HEADER_CLEARANCE = 80; // matches scroll-mt-20 used on cards
const ANCHOR_DURATION_MS = 260; // Collapse transition (200ms) + buffer

export function anchoredToggle(
  cardId: string,
  applyStateChange: () => void,
  headerClearance: number = HEADER_CLEARANCE
) {
  const el = document.getElementById(cardId);
  const beforeTop = el?.getBoundingClientRect().top ?? null;
  applyStateChange();
  if (beforeTop === null) return;

  // Keep the tapped card exactly where the user's thumb was, unless that
  // would leave its header under/above the sticky header — then settle it
  // just below the header.
  const targetTop = beforeTop < headerClearance ? headerClearance : beforeTop;
  const start = performance.now();

  const pin = (now: number) => {
    const after = document.getElementById(cardId);
    if (after) {
      const delta = after.getBoundingClientRect().top - targetTop;
      if (Math.abs(delta) > 0.5) {
        window.scrollBy({ top: delta, behavior: "auto" });
      }
    }
    if (now - start < ANCHOR_DURATION_MS) {
      requestAnimationFrame(pin);
    }
  };
  requestAnimationFrame(pin);
}
