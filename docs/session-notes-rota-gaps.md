# Session notes — adding 10 approved rota gap items (26 Jul 2026)

User approved all 10 candidate gaps from docs/rota-inventory.md. Implementation status:

## Done
1. `client/src/content/checklists.ts`:
   - Daily list += "Afternoon water top-up + hydration check", "Paw-pad check after walks"
   - Weekly list += sanitary/bum check, food-quantity review, crate+pen deep-clean, toy safety audit, training progression review, photo/memory prompt, human jobs (poo bags/puppy cam/enzyme cleaner)
   - Monthly list: parasite line notes dose day 24th; added flea/tick topical + collar expiry check line
2. `client/src/content/household.ts` careTasksFor():
   - New `daily?: boolean` flag on CareTask (standing everyday habits, excluded from capped nudges)
   - Wed (dow 3): `sanitary` (Chesa), `training-review` (Chesa)
   - Fri (dow 5): `food-review` (Marcus), `human-jobs` (both)
   - Sat (dow 6): `crate-clean` (Marcus), `toy-audit` (Chesa)
   - Sun (dow 0): `photo-prompt` (both)
   - Every day (pushed LAST, daily:true): `hydration`, `paw-check` (both)

## All done (09:49) — links fixed to /handbook/checklists + /memories; 323 tests pass; screenshots verified Home/Health/Checklists.

## Remaining
- [ ] wobblesToday.ts: in todaysNudges() care loop, skip tasks with `task.daily` (like teeth) so the 3-nudge cap isn't consumed by everyday habits. Line ~299: `if (task.id === "teeth") continue;` → also `if (task.daily) continue;`
- [ ] Health.tsx footer copy (lines ~425-429) describes old rota only — update to mention new weekly jobs + daily anchors
- [ ] Health.tsx "Due this week" preview iterates careTasksFor per day — daily tasks will now show every day; consider filtering `daily` tasks out of the week preview (keep in Due today)
- [ ] Add tests to server/dailyEngine.test.ts: new ids on Wed/Fri/Sat/Sun, daily tasks present every day + flagged, nudges exclude daily tasks, existing cap test still passes
- [ ] Run `npx tsc --noEmit` + `npx vitest run` (was 316 tests)
- [ ] Update todo.md, checkpoint (auto-publishes), push to GitHub, deliver

Key constraints: nudges capped at 3 + pinned; teeth excluded from nudges (shows in day plan); all tasks deterministic by date.
