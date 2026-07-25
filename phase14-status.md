# Phase 14 status — Caretaker's Guide under Guides (2026-07-26)

## User request
First tab under Guides = "Caretaker's Guide to Wobbles". Placeholder/template with the
format of all info to pass a caregiver; unknowns marked "To be Confirmed".
Facts: caretaker duties = safety + water/food + at least 1 daily walk; Wobbles LIVES AT
CARETAKER'S HOUSE; handover kit = IATA crate, pee pad, food + water bowl, his kibble.

## Done
- client/src/content/caretakerGuide.ts written: TBC const, isTBC, GuideItem/GuideSection,
  CORE_DUTIES (3), HANDOVER_KIT (4: crate/pad/bowls/kibble), GUIDE_SECTIONS (11 sections:
  profile, contacts, routine, feeding, toilet, walks, house, grooming, health, rules,
  updates), tbcCount().

## Verified (2026-07-26)
- Page + route + first-Guides-entry all built and confirmed live in browser at
  /handbook and /handbook/caretaker: hero card "Start here when we travel" is first
  entry, page renders 3 duties, 4 handover items, 11 sections, 24 TBC badges.
- Tests 221/221 green (new caretakerGuide.content.test.ts, 6 tests), tsc clean.
- Remaining: mark todo Phase 14 [x], checkpoint (auto-publish), git push github HEAD:main, deliver result.

## Original plan (done)
1. Page client/src/pages/CaretakerGuide.tsx — keepsake style (paper bg, sticker-card,
   Eyebrow/PageShell from @/components/AppShell, font-display serif, ink #22364D,
   sienna #B4512E), TBC badge rendering (amber/dashed "To be confirmed"), back link
   to /handbook, mission card (CORE_DUTIES), handover kit list, sections with items.
2. Route in App.tsx: /handbook/caretaker BEFORE /handbook/:slug catch-all.
3. HandbookIndex.tsx: Caretaker's Guide as FIRST entry (before Chapter covers) —
   sticker/hero card with 🤝/HeartHandshake icon + TBC count note.
4. Tests: server/caretakerGuide.content.test.ts (structure, TBC count > 0, unique ids,
   handover kit has 4 items incl crate/pad/bowls/kibble). Suite was 215/215 before.
5. tsc + pnpm test, screenshots (/handbook, /handbook/caretaker mobile 375x812).
   Note: profile picker gates pages — screenshots via webdev_take_screenshot showed
   picker previously; browser has Caretaker profile set in localStorage already.
6. todo.md Phase 14 items → [x]; checkpoint (auto-publish), git push github HEAD:main.

## Key file refs
- HandbookIndex.tsx: header px-5 pt-9, sections use sticker-card p-4 press-scale pattern,
  Eyebrow labels, lucide icons size 21 in w-11 h-11 rounded-2xl tinted squares.
- Stale vite error about @/pages/Growth in logs is old (15:02); tsc clean.
- Dev preview URL: https://3000-i22168gbm4a9qaej7yxot-2e9db576.us2.manus.computer
- Prod: wobblesapp-2cxvdpqb.manus.space; GitHub remote name "github", branch main.
