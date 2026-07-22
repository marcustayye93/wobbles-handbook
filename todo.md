# Shared-Data Full-Stack Upgrade — todo

(UX-audit todo fully complete, shipped at checkpoint bc01a9e3.)

## Phase 1 — Upgrade & schema
- [ ] webdev_add_feature web-db-user
- [ ] Read the injected fullstack README/guides (db, storage, auth)
- [ ] Design schema: tracker_entries, checklist_state, hundred_things_state, read_progress, photos (household-shared, not per-user)
- [ ] Push schema to database

## Phase 2 — Backend API
- [ ] tRPC routers: trackers (list/add/delete), checklists (toggle), hundred (toggle), progress (set), photos (upload/list/delete)
- [ ] S3 storage helper for photo upload
- [ ] Shared-household model: all authenticated users see the same data (single family app)

## Phase 3 — Frontend migration
- [ ] Auth gate: require login (private 2-person app); friendly keepsake-styled login screen
- [ ] Replace localStorage hooks for trackers/checklists/hundred/progress with tRPC queries + mutations (optimistic updates)
- [ ] One-time localStorage import on first login (server empty + local data present → import then clear)
- [ ] Wire QuickLogSheet, TodayTimeline, TrackerPage, TrackersHub, Checklists, HundredThings, SectionReader progress, Home, Memories firsts to server data

## Phase 4 — Memories photos
- [ ] Photo upload (camera/gallery) with caption + date, stored in S3
- [ ] Photo journal feed on Memories with keepsake styling
- [ ] Delete photo support

## Phase 5 — Test & ship
- [ ] tsc + build clean; test auth + CRUD flows
- [ ] Mobile screenshot pass
- [ ] Checkpoint + push to GitHub

## Phase 6 — Deliver
- [ ] Explain login flow for both spouses + data safety story
