# Wobbles' Handbook — Design Overhaul & Sync TODO

## Phase 7 — Grok review prompt
- [ ] Make GitHub repo public or note access requirement so Grok can read it (confirm with user preference — keep private, prompt tells Grok what's inside)
- [ ] Write comprehensive Grok analysis prompt: repo review, gold-standard UI research (baby-tracker/pet/habit apps), recommendations; embed user's critiques (cheap feel, no chapter imagery, 9:16 mobile format, random tracker order, photo dislike)
- [ ] Deliver prompt to user as a copy-paste-ready file

## Phase 8 — Design overhaul
- [ ] NOW: Generate 2D cartoon sketch of Wobbles (red-parti Cavoodle, Blenheim markings) — replace all photo usages (Home hero, About, wobbles.ts ASSETS), then checkpoint + deliver
- [ ] WAIT FOR GROK FEEDBACK before doing the rest below (user instruction 2026-07-22):
- [ ] Rework colour scheme + typography for a premium feel (revise ideas.md Style Decisions, index.css tokens)
- [ ] Add full-bleed 9:16 image underlays: chapter heroes become full-screen covers, image-rich section layouts
- [ ] Reorder trackers meaningfully (daily-care frequency: meals, stool, weight, training, grooming, teeth, vet, firsts) with grouping labels
- [ ] Incorporate accepted Grok/user feedback when it arrives

## Phase 9 — Review & deliver redesign
- [ ] Screenshot pass at 390x844, fix issues
- [ ] Checkpoint, push to GitHub (github remote, main)
- [ ] Deliver

## Phase 10 — Full-stack sync
- [ ] webdev_add_feature web-db-user
- [ ] DB schema: tracker_entries, checklist_ticks, hundred_things_ticks (shared household data)
- [ ] tRPC routes + replace useLocalStorage with synced hooks; one-time localStorage migration on first login
- [ ] Manus OAuth sign-in for user + wife

## Phase 11 — Test & final delivery
- [ ] Test two-device sync flows, checkpoint, push, deliver
