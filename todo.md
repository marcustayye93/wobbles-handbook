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
- [x] Screenshot, checkpoint (4cc29ca3), push GitHub, deliver

# Map tab: places, visits, photos, journal (user request)

- [x] Data model: places content file (client/src/content/places.ts — Home Blk 587, park next to block, Woodlands Waterfront, Admiralty Park, Sembawang dog run with OneMap-verified coords + blurbs) + shared place-log state (client/src/lib/placeLog.ts: visits, journal entries per place, normalization)
- [x] Map integration: template MapView (Google Maps via Forge proxy), keepsake emoji pins per park, tap pin or list card opens place sheet; explored-count badge overlay
- [x] Place sheet: visit log with dates + person tags, journal entries (add/view), photos tagged to the place via placeId column on photos table (upload with compression reused from PhotoJournal, lightbox viewing)
- [x] Bottom nav: MAP tab with MapPin icon added (6-col layout), route /map registered in App.tsx
- [x] Shared sync: visits/journal via useSharedState("placeLog") in shared_state, photos via photos router with optional placeId — both phones see the same data (verified in code: ParkMap.tsx, placeLog.ts, routers.ts:145/160, schema.ts:82, App.tsx:38 route, AppShell.tsx:16 nav tab)
- [x] Tests: server/placeLog.test.ts (9 tests) — suite 99/99 passing, tsc + production build clean
- [x] Bonus fixes: duplicate React key warning on Home/Memories milestones (2026-08-21 shared by two milestones); Map.tsx hardened against failed script load
- [x] Verified: page layout via screenshot; map tiles blank only in the internal screenshot renderer (Forge maps proxy rejects its 127.0.0.1 origin — confirmed via curl that the public preview/published origin gets HTTP 200 + Maps JS)
- [x] Checkpoint e647fd66 (auto-published), pushed GitHub (main @ e647fd6), delivered

# Training + Grooming tabs (user request 2026-07-22)
- [x] Research: puppy training priority order + start-to-finish Cavoodle grooming workflow, notes saved to /home/ubuntu/TRAINING_GROOMING_RESEARCH.md
- [x] Illustrations: 12 instructional sketches generated in keepsake gouache style (URLs reserved via generation tool, no manual upload needed)
- [x] Research training priorities (potty, name, crate, handling, sit, recall, socialisation, bite inhibition, leash, stay, tricks) + full groom order for Cavoodle puppy
- [x] Generate 12 keepsake gouache instructional illustrations (6 training, 6 grooming) matching app style
- [x] Training tab page (/training): priority-ordered skill curriculum with jump-to index, illustrated how-to steps, Wobbles-specific timing (pad-first HDB potty, pre-vax carry socialisation), links to /trackers/training
- [x] Grooming tab page (/grooming): start-to-finish groom walkthrough with jump-to index, illustrated steps, frequency cheatsheet aligned with care rota, tools list, links to /handbook/grooming-masterclass + /trackers/grooming
- [x] Bottom nav: extend to 8 tabs (Training + Grooming icons) without removing existing tabs; register routes in App.tsx
- [x] Verify: tsc clean, vitest 113/113 passing (14 new content-structure tests), mobile screenshots of both tabs
- [x] Checkpoint 72dee063 (auto-published) + pushed to GitHub (main @ 72dee06)

# Nav consolidation + header fix (user request 2026-07-22)
- [x] Bottom nav: back to 5 tabs (Home, Chapters, Trackers, Map, Memories) — remove Training, Grooming, 100 Things tabs
- [x] Chapters hub: add prominent entries for Training School, Grooming Salon, and 100 Things at the top of /handbook so they are one tap from the Chapters tab
- [x] Active-tab logic: /training, /grooming, /handbook/100-things highlight the Chapters tab; back buttons on Training/Grooming return to /handbook
- [x] Trackers header: fix "Wobbles' Logbook" title clipped by the dog image (constrain image, let title wrap/fit)
- [x] Verify: tsc + 114/114 tests pass, mobile screenshots of /trackers, /handbook, /training, /
- [x] Checkpoint 0103a852 (auto-published) + pushed to GitHub (main @ 0103a85) + delivered

# Illustration repair (user request 2026-07-22)
- [x] Audit all illustration URLs in training.ts and grooming.ts — HTTP-check each, list broken ones
- [x] Regenerate every broken illustration in the same soft watercolor keepsake style (match the blow-dry sketch the user liked)
- [x] Ensure EVERY expandable card (11 training skills + all grooming stages) has a working illustration — generate missing ones too
- [x] Wire new URLs into content files, verify rendering via screenshots of expanded cards
- [x] Checkpoint ec7f83fe (auto-published) + pushed to GitHub (main @ ec7f83f) + delivered

# Social-anxiety training module (user request 2026-07-22)
- [x] Write new "confidence" training skill content — dedicated day-one social-anxiety programme (steps, goal, watch-outs, Wobbles-specific notes)
- [x] Generate matching watercolor illustration for the new module (train-confidence_7ebd9739.png, verified 1920x1440)
- [x] Wire the module into TRAINING_SKILLS (priority 8, after Socialisation sprint; priorities 9-12 rebumped; "Confidence building" added to training tracker choices), tsc clean + 114/114 tests
- [x] Screenshot verify expanded card on /training?open=confidence (illustration renders)
- [x] Checkpoint 54bc6cc5 (auto-published) + pushed to GitHub (main @ 54bc6cc) + delivered

# Timeline alignment audit (user request 2026-07-22)
- [x] Audit all date sources: WOBBLES dob/homecoming, wobblesToday stages, dailyEngine activity pools, care rota anchors, training startWhen/startWeeks, milestones
- [x] Training School: all hands-on skills now startWeeks 12+ (his age on homecoming day) — nothing shows actionable before 18 Sep 2026
- [x] Wobbles Today + nudges: pre-homecoming stages (litter socialisation → breeder export prep) show prep-only guidance; hands-on rota/nudges only fire post-homecoming
- [x] Care rota anchors re-anchored post-homecoming: bath fortnightly from Mon 21 Sep, parasite dose on the 18th monthly, park-night alternation from 19 Sep
- [x] Confidence Club + other module copy reframed relative to 12-week homecoming (18 Sep)
- [x] Tests updated for new anchors + stages; tsc clean; 114/114 tests green; mobile screenshots verified
- [x] Checkpoint (auto-publish) + push GitHub + deliver

# Homecoming date correction + regulation check (user request 2026-07-22)
- [x] Research Singapore rules — governing agency is AVS/NParks (not NEA): dogs must be at least 12 weeks old at import into Singapore, so earliest homecoming for DOB 26 Jun 2026 is 18 Sep 2026 (not 6 weeks)
- [x] Updated WOBBLES.homecoming to 2026-09-18 with the regulation basis documented in code comments and the Singapore chapter
- [x] Recalculated milestones (vaccines at breeder, import licence, flight day = homecoming day, socialisation window to ~16 Oct) around new homecoming

# Pre-homecoming shopping countdown (user request 2026-07-23)
- [x] Content model: 9-week purchase schedule (Mon 20 Jul → Fri 18 Sep 2026) in client/src/content/shoppingPlan.ts — 36 items: crate/pen week 1, comfort/gear/admin mid-plan, consumables, food (breeder-confirmed brand) week 8, perishables + landing prep final week
- [x] Existing checklist shopping items mapped into the sequenced plan with why-this-week buying notes (Puppy Arrival checklist kept as the final-day sweep; separate tick storage, cross-referenced in page footer)
- [x] Shared progress via useSharedState("shopping") — both phones sync; completion toast when all 36 items done
- [x] UI: /handbook/shopping page — dashed week timeline, "this week" badge with auto-open + auto-scroll, progress ring hero with days-to-homecoming, catch-up section for slipped items; entry card on Handbook index
- [x] Home integration: pre-homecoming nudge shows this week's remaining item count (or catch-up count when behind)
- [x] Tests: server/shoppingPlan.test.ts (13 tests — structure, Monday alignment, week bucketing, overdue logic); tsc clean; suite 127/127 green; mobile screenshots verified
- [x] Checkpoint (auto-publish) + push GitHub + deliver

# Audit of other account's published clone (user request 2026-07-23)
- [x] Browsed https://wobbleapp-br7rmbvj.manus.space page by page — verdict: from-scratch static brochure app, NOT a clone of the repo (top nav, emoji-only, placeholder pages, our routes 404)
- [x] Compared against original: missing all interactive features (trackers, quick log, shopping countdown, memories, search, OAuth/shared sync), all illustrations, 8-chapter handbook, Singapore chapter; minor profile fact errors
- [x] Consolidated into one corrective prompt with verification gates (127 tests, route checklist, screenshot proof) instructing a discard-and-true-clone
- [x] Delivered audit report + corrective prompt to user

# Asset transfer to other account (user request 2026-07-23)
- [x] Enumerated 44 /manus-storage/ keys in code; all matched to local originals in webdev-static-assets
- [x] Zipped all 44 illustrations named exactly by storage key (278 MB)
- [x] Uploaded zip to public CDN URL (verified HTTP 200, no auth) so the other Manus fetches it directly
- [x] Wrote follow-up prompt: curl+unzip, upload under identical keys, zero code changes, 44-key verification loop, no placeholder substitution
- [x] Delivered zip + prompt to user

# Re-audit of republished clone (user request 2026-07-23)
- [x] Verify routes, illustrations, login gate, and residual old-build pages on wobbleapp-br7rmbvj.manus.space (all routes serve our app with cache-buster; stale CDN cache on a few plain URLs)
- [x] Report verification results + any remaining fixes to user (delivered /home/ubuntu/wobbles-clone-reaudit-report.md)

# Image weight optimisation (user report 2026-07-23: photos hang on loading)
- [x] Diagnose: measure file sizes + load times of illustrations on clone and original (clone serves raw 6MB PNGs; most clone keys 403 broken; each proxied request adds 2-11s presign latency)
- [x] Resize/compress all 44 illustrations to web-optimised versions (277.9MB -> 14.1MB total; 900px cards / 1200px heroes, pngquant 50-80, quality visually verified)
- [x] Re-upload optimised images to primary app storage + re-link 45 refs in 3 content files (tsc clean, 127/127 tests, screenshots verified)
- [ ] Package new public zip + write re-linking prompt for the other Manus account
- [ ] Test photo loading on clone link after other account replaces images
