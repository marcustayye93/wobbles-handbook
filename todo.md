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
- [x] Push to GitHub (marcustayye93/wobbles-handbook main @ efcce90)

## Phase 6 — Deliver
- [x] Explain login flow for both spouses + data safety story (final delivery message)

## Phase 7 — Grok audit fine-tuning
- [x] Offline resilience: react-query cache persistence (localStorage, superjson-serialized, 7-day maxAge) + OfflineBanner + upgraded service worker (cache-first hashed assets, SPA shell fallback) + mutation retry
- [x] sharedState conflict safety: server-side sharedState.patch merge procedure (delta entries + deletes); useSharedState diffs maps and patches only changes
- [x] Dead code cleanup: date helpers moved to lib/dates.ts, useLocalStorage.ts retired (legacy import reads localStorage directly), useLogVersion shim already gone
- [x] Type safety: removed `as never` casts in useSyncedData.ts (PhotoJournal pending in photo UX item)
- [x] Legacy import robustness: server-side audit log (legacyImportLog in shared_state, hidden from client map, last 50 records)
- [x] trackers.list limit support (default 2000, max 5000) to prevent long-term bloat
- [x] Photo UX: inline delete confirmation (Keep/Remove, 44px targets), compressing/uploading phases on save button, oversized-file pre-check + resize explainer copy
- [x] Sync indicators: SyncIndicator component (syncing/saved/offline) added to TrackersHub, Checklists, HundredThings headers
- [x] Touch targets: Checklists reset/print buttons + Home search button enlarged to 44px, PhotoJournal delete/keep buttons min-h-44px
- [x] Contrast pass (WCAG-checked): small sienna text #C66A3D (3.4:1) darkened to #B4512E (4.6:1) in AppShell label, Home tagline/dt, Singapore timing, About links; Home stage label moss #7B8C6A → #6B7C5A (4.1:1); remaining #C66A3D uses are decorative icons/large text only
- [x] Sync indicator added to Home header (with Trackers/Checklists/HundredThings)
- [x] Client-side vitest tests for shared-state merge logic and legacy import guard (client/src/hooks/useSyncedData.test.ts — 14 tests covering diffMaps delta, patch-vs-set routing, legacy import sanitisation/guard, row adapter; plus server/sync.audit.test.ts — 9 router tests; suite 33/33 passing)
