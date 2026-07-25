# Phase 13 verification status (2026-07-25)

## Done & verified
- ProfileGate (AuthGate.tsx rewritten): screenshot confirms picker renders on all routes
  when no profile chosen — hero image, "Who's holding the phone?", 3 cards (Marcus/Chesa/Caretaker),
  footer note. Looks correct on 375x812.
- server/family.ts + routers using ctx.member — tsc clean (exit 0).
- Tests: 215/215 green (was 206 pre-phase). New: server/family.test.ts (9 tests).
  Updated household.test.ts + sync.audit.test.ts to header-based identity
  (Marcus→9001, Chesa→9002, Caretaker→9003, no header→9000 "Family").
- Ask.tsx uses useProfile(); HouseholdSettingsSheet has "Who's logging on this phone"
  profile switcher section (3-button grid, toast on switch).
- DashboardLayout.tsx still uses useAuth but tsc = 0 errors (unused component, compiles fine) — leave as-is.

## Remaining
1. Screenshot Home/Ask/Trackers WITH a profile set (picker blocks all routes; need to
   seed localStorage wobbles-profile=Marcus via browser or accept picker screenshot as proof).
2. Update todo.md Phase 13 items to [x].
3. webdev_save_checkpoint (auto-publishes).
4. git push github HEAD:main (remote name: github).
5. Result message: no login, first-open picker, remembered per device, switch in
   Household settings sheet (equalizer button on Home), data still in Manus cloud.
