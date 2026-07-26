# Session notes — grooming page jump on expand/collapse

## Bug report
User: "When I open and close the victory lap tab or any tab, the whole page
moves out — something wrong with the alignment."

## Diagnosis (in progress)
- Stage cards on /grooming: `toggle(slug, isOpen)` collapses/expands.
- On COLLAPSE we call `scrollIntoView({ block: "start" })` with `scroll-mt-20`.
  On iOS Safari this snaps the whole page abruptly and can fight the sticky
  header — feels like the page "moves out".
- Also `scrollIntoView` on collapse fires even when the card header is already
  fully visible (e.g. bottom card "victory lap"), causing an unnecessary jump.
- Expand (open) doesn't scroll at all, but opening one card while another is
  open above can shift content because `open` is single-slug: opening card B
  closes card A above → content above shrinks → viewport content shifts up.
  Actually toggle() only opens the tapped card; setOpen(isOpen ? null : slug)
  closes the previous card implicitly — THIS is the big jump: when you tap
  "victory lap" while an earlier card is open, that card's expanded content
  (image + steps) collapses above you, pulling the page up by its height.

## Fix plan
1. Keep independent open state? No — preserve accordion, but compensate:
   when opening a card, if a currently-open card is ABOVE it, adjust scroll
   position by the height delta (measure before/after with layout effect), or
   simpler: after state change, scrollIntoView the tapped card header
   (behavior "auto", block "nearest"/"start" with scroll-mt).
2. On collapse: only scroll back if the card header is above the viewport top
   (i.e. user is stranded); otherwise do nothing.
3. Use `block: "start"` + existing scroll-mt-20; behavior "auto" to avoid
   smooth-scroll fighting.

## Status
- [x] Grooming.tsx toggle FIXED: measures tapped card's getBoundingClientRect().top
  before setOpen, then after rAF restores that visual position via
  window.scrollBy(delta); if beforeTop < 80 (sticky header), settles at 80.
- [ ] Training.tsx has the SAME buggy toggle pattern (lines 38-47,
  `skill-${slug}` ids) — apply identical anchored-toggle fix. Consider a shared
  hook: extract to client/src/hooks/useAnchoredToggle.ts used by both pages.
- [ ] Also check QoLCheckIn.tsx line 121 collapse scroll (id "qol") — same
  pattern; lower priority, evaluate.
- [ ] tsc + vitest (339 tests currently), screenshot verify
- [ ] checkpoint + push github remote `github main` + deliver

## Key facts
- Live domain: wobblesapp-2cxvdpqb.manus.space; auto-publish on checkpoint.
- GitHub push: `git push github main` (origin is S3, fails in shell — normal).
- todo.md has section "Bug: grooming page jumps on card expand/collapse".
