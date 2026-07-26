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
 * top) BEFORE the state change, let React re-render, then restore that exact
 * visual position by scrolling the window by the delta. If the card would end
 * up hidden under the sticky header, settle it just below the header instead.
 */
export const HEADER_CLEARANCE = 80; // matches scroll-mt-20 used on cards

export function anchoredToggle(
  cardId: string,
  applyStateChange: () => void,
  headerClearance: number = HEADER_CLEARANCE
) {
  const el = document.getElementById(cardId);
  const beforeTop = el?.getBoundingClientRect().top ?? null;
  applyStateChange();
  requestAnimationFrame(() => {
    const after = document.getElementById(cardId);
    if (!after || beforeTop === null) return;
    const rect = after.getBoundingClientRect();
    // Keep the tapped card exactly where the user's thumb was, unless that
    // would leave its header under/above the sticky header — then settle it
    // just below the header.
    const targetTop = beforeTop < headerClearance ? headerClearance : beforeTop;
    const delta = rect.top - targetTop;
    if (Math.abs(delta) > 1) {
      window.scrollBy({ top: delta, behavior: "auto" });
    }
  });
}
