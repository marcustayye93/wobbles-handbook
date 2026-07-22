# Shared-Data Full-Stack Upgrade — todo

(UX-audit todo fully complete, shipped at checkpoint bc01a9e3.)

## Phase 1 — Upgrade & schema
- [x] webdev_add_feature web-db-user
- [x] Read the injected fullstack README/guides (db, storage, auth)
- [x] Design schema: tracker_entries, shared_state (checklists/hundred/readProgress), photos (household-shared, not per-user)
- [x] Push schema to database

## Phase 2 — Backend API
- [x] tRPC routers: trackers (list/add/remove/importLegacy), sharedState (all/set), photos (list/upload/remove)
- [x] S3 storage helper for photo upload
- [x] Shared-household model: all authenticated users see the same data (single family app)

## Phase 3 — Frontend migration
- [x] Auth gate: require login (private 2-person app); friendly keepsake-styled login screen
- [x] Replace localStorage hooks for trackers/checklists/hundred/progress with tRPC queries + mutations (optimistic updates)
- [x] One-time localStorage import on first login (server empty + local data present → import, guarded by local flag + server-side skip)
- [x] Wire QuickLogSheet, TodayTimeline, TrackerPage, TrackersHub, Checklists, HundredThings, SectionReader progress, Home, Memories firsts to server data

## Phase 4 — Memories photos
- [x] Photo upload (camera/gallery) with caption + date, stored in S3 (client-side compression)
- [x] Photo journal feed on Memories with keepsake styling (polaroid grid + viewer)
- [x] Delete photo support

## Phase 5 — Test & ship
- [x] tsc clean, pnpm build succeeds, vitest 10/10 passing (auth + CRUD flows); Home nudges migrated to server feed
- [x] Mobile screenshot pass (Home, Trackers, Feeding, Memories, Handbook, Checklists, 100 Things)
- [x] Checkpoint saved (afb36adc)
- [ ] Push to GitHub

## Phase 6 — Deliver
- [ ] Explain login flow for both spouses + data safety story
