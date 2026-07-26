# Session notes — digital-first checklists + bath-time trim (26 Jul)

User request: (1) never print anything — checklist reminders must live digitally in daily/weekly flows; (2) basic grooming trim every time we bathe him so coat is held at controlled length (no big occasional haircuts).

## Done
- Checklists.tsx: print framing fully removed (button, import, hidden block, classes, copy).
- HandbookIndex.tsx: "Family Checklists · tick together, synced to both phones"; Printer import dropped.
- checklists.ts: header comment digital; emergency item "saved on both phones + pinned in this app"; bath-day → "Bath + Trim Day", cadence "Every 2 weeks — bath always ends with a basic trim", added BASIC TRIM items (eyes/face, paws, sanitary, 13mm/16-19mm top-up, photo+treat); grooming-day → "Grooming Day (full session)", cadence "Every bath is a groom — fortnightly Mondays", maintenance-trim reframe; monthly list: two bath+trim sessions, paw/sanitary double-check, coat-length audit replaces "book groom 4–6 wks".
- household.ts: Monday WEEK_PLAN note + bath rota task label "Bath + basic trim day" with trim detail appended (id "bath" unchanged — tests safe).

## Remaining
NONE — all done:
- grooming.ts: GROOM_FREQUENCY bath row → "Bath + blow-dry + basic trim" every 2 weeks; body-clip row → "Basic trim (home)" every bath; professional groom → optional shaping only; teddy upkeep → held by fortnightly bath trim; clip puppyNote reframed (home maintenance plan).
- handbookSections.ts adult-coat timeline → fortnightly home bath + trim, pro grooms optional.
- Grooming.tsx subtitle → "Fortnightly bath + basic trim...".
- AppShell/PawFab print: classes stripped.
- Tests: 5 new content tests in trainingGrooming.content.test.ts — 328 all green. Screenshots verified.
5. Also checklists.ts bath-day cadence text used on Checklists page chip.
6. Check wobblesToday/dailyEngine tests referencing "Bath day (every other Monday)" label — grep "Bath day" in tests before renaming label/id (keep id "bath" unchanged!).
7. Tests: npx vitest run (was 323 green); tsc; screenshots /handbook/checklists, /handbook (card), /grooming, / (Monday rota not today but Health shows rota).
8. Checkpoint + git push github main (use `gh auth setup-git` then `git push github main`; origin push fails by design).

## Key facts
- Checklists page route: /handbook/checklists; grooming page: /grooming
- careTasksFor in client/src/content/household.ts (~line 96+); bath anchored 2026-09-28 fortnightly Mondays
- Tests live in server/*.test.ts; dailyEngine.test.ts has rota tests
- Push remote: `github` = marcustayye93/wobbles-handbook
