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

## Weekly digest (owner notification, Sundays)

- [x] server/digest.ts: buildWeeklyDigest() — query last-7-day tracker entries + photos, compose summary (weight trend, toilet success rate, meals, training/social/grooming counts, photo count, Wobbles age)
- [x] /api/scheduled/weeklyDigest Express handler with cron auth (sdk.authenticateRequest, isCron check — 403 on any non-cron), idempotent, try/catch JSON error on 500
- [x] Mount handler in server/_core/index.ts before Vite/static fallthrough (verified live: unauthenticated POST → 403)
- [x] Vitest tests: digest composition (counts, trend, empty week) + handler auth rejection (server/digest.test.ts — 13 tests; suite 46/46 passing)
- [x] Checkpoint 8e46acfb saved, pushed to GitHub (8e46acf), Heartbeat cron created: task_uid n4mYxSTP2fsSNtr2xLryY9, "0 0 9 * * 0" (Sundays 09:00 UTC ≈ 17:00 SGT), next run 2026-07-26
- [x] Project published: auto-publish is now enabled — every checkpoint (latest 18ff7124) deploys to wobblesapp-2cxvdpqb.manus.space, so the Heartbeat callback can reach the production URL
- [x] Digest verification (sandbox-side complete): live endpoint reachable and correctly rejecting unauthenticated calls (POST → 401), heartbeat job enabled with next run 2026-07-26 09:00 UTC (17:00 SGT), zero runs so far as expected; final notification-arrival confirmation happens on first cron run (or user's optional Run Now in Settings → Schedules) — user informed in delivery

## Photo journal polish

- [x] Month grouping: photos grouped under sticky month headers with photo count + Wobbles age that month (client/src/lib/photoGroups.ts, sticky z-30 headers with paper gradient)
- [x] Full-screen lightbox (client/src/components/PhotoLightbox.tsx): tap to open, swipe left/right + arrow keys/desktop buttons to navigate, caption/date/age/added-by overlay, close via X / swipe-down / Esc, body scroll lock, reduced-motion-safe entrance
- [x] Lightbox preserves confirm-before-delete flow; viewer tracked by photo id (not index) so optimistic deletes/reorders can't misalign it
- [x] Offline/local-cache behaviour and sync indicators untouched (only viewer/grid rendering changed; upload dialog + mutations intact)
- [x] Tests: photoGroups.test.ts (11 tests) — suite 57/57 passing, tsc clean, production build clean; debug-agent review applied (arrow positioning, viewerId, z-index)
- [x] Mobile screenshot verification of Memories page (empty state; populated grid/lightbox needs real photos to fully verify) + checkpoint + push to GitHub

## Singapore personalisation (Blk 587 Woodlands Drive 16, 730587)

- [x] Research: AVS/Singapore vaccine protocol, licensing (2024 Rules, Pet Ownership Course, PALS), parasite prevention norms (monthly chews/spot-ons), Woodlands parks & dog runs — saved to /home/ubuntu/SG_PERSONALISATION_RESEARCH.md
- [x] Toilet tracker: replace generic options with apartment-first set — wee on pad / wee outside / poo on pad / poo outside (+ accident indoors); keep old data rendering compatible; update success-rate logic (digest + UI) to count pad AND outside as success
- [x] Routine: encode daily rhythm — 7:15–7:30am toilet walk (sunrise ~7am), evening walk after sunset (~7pm), park socialisation 7pm every other day; surface on Home (Wobbles Today / nudges) once he's fully vaccinated + settled-in gating
- [x] Location content: nearby small park (walkable) vs bigger parks needing car (e.g. dog runs); Woodlands context in handbook content
- [x] Health calendar: align milestones to Singapore AVS standards — vaccine doses, licensing deadline, sterilisation discussion, annual boosters, monthly heartworm + tick/flea preventive recurring entries in milestones/calendar
- [x] Weekly digest: update toilet stats wording for pad/outside split
- [x] Tests updated (toilet options, digest stats), suite 58/58 passing, tsc + build clean
- [x] Mobile screenshots (Home, Toilet tracker, About, Singapore), checkpoint b64f985e saved (auto-published), delivered
- [x] GitHub push: token refreshed, pushed to marcustayye93/wobbles-handbook main @ e741ff0 (includes SG personalisation + daily engine)

# Wobbles Today daily engine (user request)

- [x] Audit current wobblesToday.ts: 7 stage variants, text only changed per stage (weeks number aside)
- [x] Household schedule model: WEEK_PLAN in client/src/content/household.ts (Marcus WFH Mon/Fri + office Tue-Thu; Chesa home most days, maybe-office Tue/Thu; Sunday = Wobbles focus day)
- [x] Care rota reminders: careTasksFor(date) — bath fortnightly Mondays (anchor 24 Aug), nails + ears every Monday, parasite dose on the 21st, teeth Tue/Thu/Sat; shown in Today's plan card + as nudges
- [x] Rotating daily activity/enrichment ideas: 4 pools (prep 6, home 10, office 7, weekend 6) picked deterministically by date + day type — different idea every day
- [x] Per-person nudges: care tasks and data nudges carry Marcus/Chesa owner tags rendered on Home
- [x] Tests for the daily engine: server/dailyEngine.test.ts (16 tests), suite 74/74 passing, tsc clean
- [x] Screenshots (mobile Home full-page), checkpoint, deliver

# Household settings modal (user request)

- [x] Data model: householdSettings in shared_state — per-person weekly presence (Mon–Sun home/office/maybe-office) + one-off reminders {id, date, text, person?} in client/src/lib/householdSettings.ts with normalizeSettings guard
- [x] Engine: dayPlanWithSettings + todaysBrief/todaysNudges accept settings; one-off reminders surface as 📌 entries in the plan card and as top-priority nudges (survive the 3-nudge cap)
- [x] Settings modal UI: sliders button on Home header → HouseholdSettingsSheet drawer with tap-to-cycle weekly grid per person, Reset to usual week, reminder add form (text/date/Both-Marcus-Chesa) + upcoming list with delete + collapsed past
- [x] Persist via useSharedState("household-settings") — optimistic local write + server sync, both spouses see the same schedule
- [x] Tests: server/householdSettings.test.ts (11 tests) — suite 85/85 passing, tsc + production build clean
- [x] Screenshots (mobile Home), checkpoint, deliver

# Reminder checkboxes + celebration (user request)

- [x] Model: add `done?: boolean` (or doneAt) to Reminder in householdSettings.ts; normalizeSettings tolerates missing/garbage done values
- [x] Engine: remindersFor/todaysBrief expose done state; done reminders drop out of nudge stickers but stay on the plan card (struck through)
- [x] UI: tappable checkbox on each reminder row in the plan card, optimistic shared-state toggle so both phones sync; settings sheet upcoming list shows ✅ + strike-through for done reminders
- [x] Celebration: when the last of today's reminders is ticked, show a small confetti/paw celebration animation (reduced-motion safe, fires only on the completing toggle, not on page load)
- [x] Tests: done-state normalization + engine filtering (3 new tests in householdSettings.test.ts), suite 88/88 passing, tsc + build clean
- [x] Screenshot, checkpoint, deliver

# Auto-archive done reminders (user request)

- [x] Engine: split rule — a done reminder is archived (moves to past list) once its date is before today; today's done reminders stay in upcoming/plan card (still tickable) but render struck-through. Undone past reminders keep flowing to past as before.
- [x] Past list rendering: preserve and show done state (✅ vs 📌, strike-through on done text) so archived history is honest; person tag + done count in the collapsed summary
- [x] Settings sheet: upcoming list stays tidy automatically; past collapsed section gains done markers; no manual archive button needed
- [x] Tests: archive split logic (done today stays upcoming, done yesterday goes past with done preserved, undone yesterday goes past + normalize round-trip), suite 90/90 passing, tsc + build clean
- [ ] Screenshot, checkpoint, push GitHub, deliver
