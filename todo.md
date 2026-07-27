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
- [x] Package new public zip (14.1MB, 44 files named by key) + wrote re-linking prompt with verification loop (/home/ubuntu/prompt-for-other-manus-optimised-images.md)
- [x] Test photo loading: baseline on clone recorded (403s + 6.2MB raw file confirmed); original app verified fast (<0.25s/image); final clone re-test to run after other account applies the prompt and republishes

# Bug fix + feature (user report 2026-07-23 #2)
- [x] Fix bottom nav bar floating up mid-page while scrolling on iOS (removed transform centering on fixed nav in shared BottomNav — applies to all tabs; viewport meta user-scalable=no; 16px min form-field fonts to stop iOS focus auto-zoom)
- [x] Add randomised "100 Things" fact card to Wobbles Today section on Home (date-seeded lib/dailyFact.ts, 2-day rotation, scattered order visiting all 100, links to 100 Things page; 5 new tests, suite 132/132 green, screenshots verified)

# Launch prompt for other account (user request 2026-07-23 #3)
- [x] Gather latest state: commit 023c009 on main (GitHub pushed), zip URL verified HTTP 200 (14.1MB, 44 files matching code key stems)
- [x] Write launch prompt (pull 023c009, upload 44 optimised images, re-link 3 content files, 4-gate verification, publish + report) — /home/ubuntu/prompt-for-other-manus-launch-v2.md

# AI chat assistant (user request 2026-07-24)

- [x] Review webdev-llm-integration skill + existing AIChatBox component
- [x] DB schema: chat conversations + messages tables (household-shared) + ai_memory table (the separate "memory file" of distilled Wobbles facts)
- [x] Backend: tRPC procedures for ask/history with Wobbles context system prompt (age, breed, SG, stage)
- [x] Memory distillation: after each exchange, LLM extracts durable Wobbles facts into the memory store; memory injected into future system prompts
- [x] Memory view UI: page/section where the family can see and delete remembered facts
- [x] Frontend: Ask page with chat UI, streaming/loading states, suggested questions, nav entry
- [x] Login gate: chat only for authenticated users (Manus OAuth already required)
- [x] Vet-safety guardrail in system prompt (recommend vet for medical emergencies)
- [x] Tests: vitest for chat procedures + typecheck; visual verification at mobile viewport
- [x] Checkpoint/publish + push to GitHub, deliver to user (checkpoint ff78f360, GitHub main @ a74e835)

## Phase 8 — Ask Wobbles: AI chat with persistent memory
- [x] Schema: ai_conversations, ai_messages, ai_memory tables (migration 0001 applied)
- [x] DB helpers in server/db.ts (conversations, messages, memory CRUD)
- [x] server/aiChat.ts: Wobbles profile/stage context, system prompt with memory book, structured-JSON memory distillation (max 5 facts/turn, dedupe, 200-fact cap)
- [x] tRPC ai router: send, conversations, messages, deleteConversation, memory, forgetMemory (all protected)
- [x] Every conversation saved server-side in separate tables — family-shared, resumable, deletable
- [x] Ask page (/ask): chat thread, starter prompts, History sheet, Memory book sheet with forget
- [x] Home entry points: sparkle header button + "Ask Wobbles anything" card
- [x] Vitest: server/ai.test.ts 14 tests (title, prompt, distill parsing, dedupe) — suite 146/146 green
- [x] Mobile screenshots verified (/ask empty state + composer, Home entries)

# Intelligent feeding & toilet insights — trend engine (user request 2026-07-24)

- [x] Review tracker data model + feeding/toilet entry shapes and UI
- [x] Insights engine (client/src/lib/insights.ts): toilet morning anchor (circular mean of timed morning wees), success rate + direction of travel, accident hotspot clustering, meal→toilet gap correlation
- [x] Feeding insights: meal-time regularity (steady/drifting per meal), appetite trend + drop alerts vs baseline, missed-meal detection, daily rhythm
- [x] Predictions: nextToiletWindow() — morning anchor window + post-meal window from median gap, each with actionable recommendation (never stale summaries)
- [x] Surface insights in feeding + toilet tracker pages (TrackerInsights component: "What the data says" cards with tones good/watch/action + evidence)
- [x] Predictive nudges wired into Wobbles Today (⏰ toilet-window nudge from insights engine, top of data-driven nudges)
- [x] Vitest specs: server/insights.test.ts 22 tests (circular mean midnight wrap, anchors, clusters, gaps, appetite drop, predictions, pending copy) — suite 168/168 green, tsc clean
- [x] Visual verification (mobile: toilet, feeding, Home) + pending-copy grammar fixes
- [x] "Trends pending" placeholder when data is insufficient — per-insight statistical minimums (5 timed morning wees/3 days, 8 logs/3 days for success rate, 5 meal→toilet pairs, 6 timed meals, 3-day baselines), each showing exactly how many more logs unlock it
- [x] Checkpoint/publish + push to GitHub, deliver (checkpoint 97e2f3d5 auto-published, GitHub main @ 97e2f3d)

# Phase 10 — Teardown improvements (user-approved 2026-07-25)
NOTE: tracker sync P0 from the report was already shipped earlier (tracker_entries + useSyncedData, checkpoint afb36adc) — inventory notes were stale. Real work is the Home redesign + P1 features.

- [x] New log types: walk, sleep, shower/bath as first-class trackers (schema already generic — added TRACKERS defs + options + tips)
- [x] Alone-time tracker: duration + reaction (calm/whined/barked/distressed) + note
- [x] Home redesign: one-tap care row at very top (Walk, Meal, Toilet, Sleep, Shower) — single tap logs instantly with undo toast; long-press opens detail sheet; today-count badges
- [x] Home redesign: "Due today" section near top (daily plan card: rota + tips + field note) with tick-off
- [x] Home slimming: removed "Start reading" promos + old quick-actions grid; single Chapters doorway card; Wobbles Today kept compact below the action zone
- [x] Growth band overlay on weight chart: toy-Cavoodle expected min/max corridor by age (lib/growthBand.ts) + on-track/below/above verdict card with grace margin
- [x] Floating paw FAB on all pages (PageShell) opening QuickLogSheet; hidden on Home (care row covers it) and hideNav pages
- [x] Insights/timeline handle new log types gracefully (generic tracker feed; insights remain feeding/toilet-gated)
- [x] Tests for new trackers, growth band math, care-row logging (growthBand.test.ts 19, careRow.test.ts 7); suite 194/194 green + tsc clean
- [x] Mobile screenshots, checkpoint 779c8aee (auto-published), GitHub push (main @ 779c8ae), delivered

# Phase 11 — Nav restructure: Growth/Health/Journey tabs, remove Map (user request 2026-07-25 #2)

- [x] Remove Map feature entirely: page, route, nav entry, placeLog router/tests/db helpers
- [x] Rename "Chapters" tab to "Guides" (label + any headings referencing Chapters)
- [x] Bottom nav restructure: Home · Growth · Health · Journey · Trackers · Memories · Guides (7 compact items)
- [x] Recalibrate growth band to 6 kg adult peak (update lib/growthBand.ts + WOBBLES predicted weight + tests)
- [x] Growth tab: blue expected-weight curve + orange actual weigh-in line on one chart, weight verdict, age/milestone timeline (orange line + legend hidden until first weigh-in exists — per user note)
- [x] Health tab: vet visits + vaccine log + parasite schedule + medical records in one place; full due-today AND due-this-week reminders with tick-off
- [x] Home slimming: shorten due-today strip (link to Health for full view); remove field note, today's idea, "pick up where you left off" resume nudge
- [x] Trick library content: 12 tricks with step-by-step training instructions (client/src/content/tricks.ts)
- [x] Generate gouache-style trick illustrations (Wobbles likeness), size-optimised, uploaded via manus-upload-file --webdev (12 images, /manus-storage/trick-*.png)
- [x] Journey tab: trick grid → trick detail pages (illustration + instructions + times-practiced counter + tap-to-log practice)
- [x] Practice counters count matching existing Training Log entries + new practice logs (synced via tracker_entries; option exact match + note keyword match)
- [x] Journey tab: broader journey section (socialisation sprint card + milestone road timeline)
- [x] Update tests (placeLog removed, growthBand updated, tricks.content.test.ts 13 new tests); suite 206/206 green + tsc clean
- [x] Mobile screenshots (Growth, Health, Journey, TrickDetail, Home), checkpoint afd164ee (auto-published), GitHub push (main @ afd164e), delivered

# Phase 12 — Breeder vaccine schedule + Jet Pets flight (user info 2026-07-25 #3)

- [x] Audit all date-dependent sources: WOBBLES.homecoming, MILESTONES, wobblesToday stages, care rota anchors, shopping plan weeks, Health tab schedule, Growth timeline, handbook/Singapore content, tests
- [x] Verify AVS 12-week import rule still satisfied by 23/24 Sep flight (Wobbles will be 12w6d at export — yes)
- [x] Vaccines: C3 (Protech) #1 on 11 Aug 2026, #2 on 25 Aug, #3 on 8 Sep — replaced estimated vaccine milestones/copy everywhere (brand named, all three at the breeder's vet; fly-ready ~22 Sep noted)
- [x] Flight/homecoming: WOBBLES.homecoming → 2026-09-24 (Jet Pets managed, flies Wed 23, lands Thu 24 Sep); countdowns, fly-ready copy, homecoming milestone text updated
- [x] Re-anchored post-homecoming care rota (bath Mondays from 28 Sep, parasite dose the 24th, park nights from 25 Sep) + socialisation window + first SG vet visit (~28 Sep) + licence deadline
- [x] Shopping plan: final week extended to 24 Sep; HOMECOMING_ISO + copy updated
- [x] Updated affected copy: Wobbles Today stages, Health tab schedule, Singapore chapter, Guides, trackers, AI-chat profile, Jet Pets naming corrected everywhere
- [x] Tests updated (shoppingPlan, dailyEngine anchors) + suite 206/206 green + tsc clean; mobile screenshots (Home, Health, Growth, Singapore, Shopping)
- [x] Checkpoint 3ffc061f (auto-published), GitHub push (main @ 3ffc061), delivered summary of what moved

# Phase 13 — Remove Manus login requirement (user request 2026-07-25 #4)

- [x] Audit auth usage: protectedProcedure sites, ctx.user/createdBy attribution, useAuth in UI, login gates (Ask page, sync layer)
- [x] Design passwordless access (user-confirmed: NO PIN/password): one-time device-remembered profile picker with THREE profiles — Marcus / Chesa / Caretaker (for friends dog-sitting while they're overseas); URL privacy is the only gate
- [x] Backend: convert protected procedures to family procedures (no OAuth requirement); profile name passed from client via x-wobbles-profile header for attribution (Marcus→9001, Chesa→9002, Caretaker→9003, fallback 9000 "Family"); data stays in existing tables
- [x] Frontend: first-open profile picker (ProfileGate) stored persistently (localStorage wobbles-profile); removed startLogin/useAuth gates and login redirects; profile switcher in Household settings sheet ("Who's logging on this phone")
- [x] Attribution: entries/photos/chat tagged by selected profile instead of OAuth user id (existing data ids preserved; verified live — Caretaker log stamped createdBy 9003 / "Caretaker")
- [x] Ask/AI chat + memory work under family session (Ask.tsx uses useProfile; ai router on familyProcedure)
- [x] Guarantee cloud persistence: all logs/photos remain in Manus cloud DB + S3 (no device-only storage); Wobbles AI retains full retrieval of trackers, memories, photos under the family session
- [x] Tests updated for new auth model: family.test.ts (9 new), household + sync.audit rewritten for header identity — suite 215/215 green, tsc clean
- [x] Visual verification: picker renders on fresh device, Marcus/Caretaker switching works with toast, one-tap Toilet log stamped "Caretaker" in timeline (test row cleaned up); checkpoint (auto-publish), GitHub push, deliver

# Phase 14 — Caretaker's Guide under Guides (user request 2026-07-26)

- [x] Content model: caretaker handover guide (client/src/content/caretakerGuide.ts) — duties (safety, water, food, 1+ daily walk), what we hand over (IATA crate, pee pad, food + water bowls, his kibble), Wobbles profile, daily routine, feeding amounts, toilet habits, emergency contacts/vet, house rules; 24 unknowns marked "To be confirmed"
- [x] Page: /handbook/caretaker — keepsake-styled structured guide with TBC badges, printable-friendly sections (11 sections)
- [x] Guides hub: Caretaker's Guide as the FIRST entry at top of /handbook ("Start here when we travel" card with live TBC count)
- [x] Tests for content structure (caretakerGuide.content.test.ts, 6 tests); suite 221/221 green + tsc clean
- [x] Screenshots + live browser verification, checkpoint (auto-publish), GitHub push, deliver

# Phase 15 — Handover prompt for other Manus account (user request 2026-07-26)

- [x] Sync GitHub main to latest code (todo.md committed + pushed, main at 1b96879, tree clean)
- [x] Gather project facts: repo URL, stack/features, env/secrets needed, DB schema + seed needs, static assets (56 /manus-storage refs), heartbeat cron, test commands
- [x] Write full handover prompt (/home/ubuntu/handover-prompt-wobbles-handbook.md) so another Manus account can clone, set up, verify, and publish the app
- [x] Deliver the prompt to the user

# Phase 16 — Optimise trick illustrations (user report 2026-07-26: Journey trick cards load too slowly)

- [x] Optimise 12 trick-*.png (~6MB each, 2176x1632) to web-ready WebP 640x480 q82 (30–48KB each; 73.4MB → 0.45MB)
- [x] Package optimised set as zip + upload for the other Manus account (wobbles-trick-illustrations-optimized.zip, 440KB, CDN link delivered)
- [x] Replace trick image references in client/src/content/tricks.ts with optimised uploads; verified /journey renders all 12 webp images
- [x] Checkpoint e4756196 (auto-publish) + GitHub push (main at e475619)
- [x] Write update prompt for the other Manus account and deliver

# Phase 17 — "Sit" trick video (user request 2026-07-26: video instead of photo, same art style, review first)

- [x] Locate the original trick-sit illustration as style/first-frame reference (webdev-static-assets/trick-sit.png used as first keyframe)
- [x] Read video-generator skill and generate an 8s gouache-style video of the Sit trick (lure arc → sit → treat reward; 16:9 720p, soft ambience, 1.8MB, style verified via extracted frames)
- [x] Deliver the video to the user for review (NOT wired into app until approved)

# Phase 18 — Wire Sit trick video into app (user approved 2026-07-26: below "How to train it", muted, lightweight loopable mp4, slot for all tricks)

- [x] Process trick-sit-video.mp4: strip audio, compress to lightweight web mp4 (h264, faststart), verify loop-friendly
- [x] Upload via manus-upload-file --webdev and get storage URL
- [x] Add optional `video` field to trick content model (tricks.ts) with sit video URL
- [x] Trick detail UI: render muted autoplay loop playsinline video below the "How to train it" section (poster = existing illustration), same slot works for all future trick videos
- [x] Tests updated if content schema tests exist; suite green + tsc clean
- [x] Verify on /journey sit detail, checkpoint (auto-publish), GitHub push, deliver

# Phase 18b — Demo videos for ALL tricks (user request 2026-07-26)

- [x] Sit: video generated, processed to muted loop, uploaded (/manus-storage/trick-sit-loop_bc0e1fa2.mp4), wired into tricks.ts + TrickDetail video slot
- [x] Write accurate motion prompts for the 11 remaining tricks (down, recall, stay, touch, leaveit, dropit, paw, spin, rollover + last 2) matching each trick's step content
- [x] Generate gouache-style demo videos for the 11 remaining tricks (reference = each trick's illustration)
- [x] Process all videos into lightweight muted loops (ffmpeg -an, crf26, 960x540, faststart)
- [x] Upload all loops via manus-upload-file --webdev, record storage paths
- [x] Add video fields for all tricks in client/src/content/tricks.ts
- [x] Run pnpm test + tsc, verify a few trick pages in browser
- [x] Checkpoint (auto-publish) + git push github main + deliver

# Phase 19 — One-tap trick logging + scroll-to-top audit (user request 2026-07-26)

- [x] TrickDetail "Log a practice session": open QuickLogSheet on training tracker pre-filled with the trick's name (one-tap log)
- [x] Audit scroll position on route changes across the app (trick pages open mid-scroll)
- [x] Global fix: scroll to top on every route navigation (preserve back/forward feel where sensible)
- [x] Tests + tsc clean, verify in browser (trick page opens at top, prefilled log works)
- [x] Checkpoint (auto-publish) + GitHub push + deliver

# Phase 20 — Lifetime upgrades: all 7 roadmap features (user request 2026-07-26)

- [x] Write full design blueprint for all 7 upgrades (grouped into existing pages, no new bottom-nav tabs)
- [x] U1 Life-stage engine: extend wobblesToday past puppyhood (adolescent/young adult/mature/senior/geriatric), stage-aware nudges, stage content
- [x] U2 Data export & backup: one-tap full JSON/CSV export in About/settings area, monthly scheduled export digest notification
- [x] U3 Medical vault: documents (S3 uploads) + medications/preventives schedules + symptom log — extension of Health page
- [x] U4 Year-scale views: month/year timeline zoom in Logs, On This Day on Home/Memories, annual report generator
- [x] U5 Lifetime milestone generator: recurring boosters/licence/birthday milestones beyond first year (extends Growth/Home coming-up)
- [x] U6 Memories albums & search: year chapters, caption/date search (extends Memories)
- [x] U7 Senior & QoL content: senior handbook chapters + quality-of-life tracker (extends Guides + Health)
- [x] Audit: vitest suite green (316), tsc clean, browser verification of all 7 upgrades, full-page screenshots of all 7 tabs, DB test data cleaned (test QoL entry + test photo removed; user's real photo/AI data preserved)
- [x] Final checkpoint (auto-publish) + GitHub push + delivery — checkpoint 1b88b02b live at wobblesapp-2cxvdpqb.manus.space; pushed to github.com/marcustayye93/wobbles-handbook (main @ 1b88b02)

## Phase 20 — Lifetime upgrades (U1–U7)

- [x] Write docs/lifetime-blueprint.md design spec
- [x] U1: extend stage engine (adolescent/young adult/prime/senior/twilight) + stage-aware nudges
- [x] U1: five life-stage handbook chapters with stage badges in Guides index
- [x] U2: exportData router (JSON snapshot) + About "Data & backup" section (JSON + CSV downloads)
- [x] U2: /api/scheduled/monthlyBackup handler + heartbeat cron (task_uid 62RBnrZnwtrYACy3ccq5ny, next run 2026-08-01T01:00Z)
- [x] U3: medical_records + medications tables, medicalRouter, db helpers
- [x] U3: Health page — Medicine cabinet, Paper trail, Symptom log sections
- [x] U3: symptom tracker definition
- [x] U4: TrackersHub Recent|Months rollup toggle
- [x] U4: Home "On This Day" card
- [x] U4: Growth "Year in review" card + /growth/year/:year report page
- [x] U5: lifetimeMilestones generator + allMilestones(); wire Growth, Home, Health, Journey, YearReview (About/Memories intentionally kept on first-year MILESTONES — narrative "story so far" context); 15 new tests in server/lifetimeMilestones.test.ts (285 total)
- [x] U6: Memories year chapters, search, filter chips — photoGroups.ts year-chapter grouping + yearStageLabel + photoMatches/filterPhotos/photoYears; PhotoJournal debounced search bar, year chips, no-results card, sticky year+month headers; place chips skipped (Map feature removed, 0 photos have placeId); 17 new tests (302 total)
- [x] U7: golden-years + twilight-care full content, QoL check-in card on Health, qol tracker, senior QoL nudge — qol.ts HHHHHMM library (7 dimensions, 0–5 anchors, 35 max, bands: >28 comfortable / 21–28 watch / <21 vet), QoLCheckIn.tsx guided slider card on Health with live band + toast + last-check-in line, qol tracker meta (/35 chart), verified end-to-end in browser (test row cleaned from DB); 14 new tests (316 total)
- [x] Phase 20 audit: tests green, tsc clean, screenshots, todo reconciled
- [x] Phase 20 checkpoint + GitHub push

## Bugfix — production console errors (user report 26 Jul)

- [x] Fix: "No procedure found on path medical.records.list" on published /health — diagnosed as stale server instance during rolling deploy (medical router confirmed present in current build: dist/index.js contains medicalRouter; no such errors in prod logs since 25 Jul 19:08Z boot); added retry (2x) + graceful "Try again" error cards to MedicineCabinet and PaperTrail so transient blips never surface raw console errors
- [x] Fix: "No procedure found on path medical.meds.list" on published /health — same root cause + same resilience fix
- [x] Verify QoL check-in stores a date and it is displayed — yes: each check-in saves a local YYYY-MM-DD date (+ server createdAt timestamp); card shows "Last check-in {date} — N/35" and /trackers/qol plots by date
- [x] Checkpoint (auto-publish) + confirm fix on production

## Grooming guide consolidation (user request 26 Jul)

- [x] Review overlap across Coat Signs, Grooming Master Class, Grooming Psychology, Hairstylist Style Guide (notes in docs/grooming-consolidation-notes.md)
- [x] Present consolidation recommendation to user and confirm approach (approved 26 Jul)
- [x] Build consolidated "Home Grooming Master Class" step-by-step guide (station setup, bath, lather count, water temp, attention areas, blow-dry technique/direction, ear/skin protection, clipper lengths body/legs/tail) — grooming.ts rewritten, 11 stages
- [x] Nail care: multiple short grinding sessions per week (not groom-day-only), using grinder not clipper — grinder-first nail stage + Mon/Wed/Sat rota
- [x] Add nail grinder to the shopping/to-do list (shoppingPlan.ts grooming week)
- [x] Retire/redirect the old overlapping guides (grooming-masterclass, grooming-psychology, haircut-styles → /grooming redirect in SectionReader; coat-science kept as slim background chapter)
- [x] Update Grooming.tsx page title to "Home Grooming Master Class"; add clipping + haircut-styles chapters; psychology as prep chapter + per-stage confidence notes
- [x] Update GROOM_FREQUENCY cheatsheet + household.ts nail rota to grinder cadence (Mon/Wed/Sat short sessions)
- [x] Update all old-slug references (wobblesToday nudge, HandbookIndex card, checklists, products tier table)
- [x] Fix collapse-scroll alignment: collapsing an expanded card/tab scrolls viewport back to the collapsed header (Grooming stages, Training skills, Shopping weeks, QoL check-in; TrackerInsights pending list is short with header in view — left as-is)
- [x] Tests + tsc clean (316/316 green; fixed birthday-nudge cap regression by pinning it with reminders) + screenshots verified (/grooming, /handbook, /handbook/shopping, retired-slug redirect) + checkpoint + GitHub push + delivery

## Shopping update — purchased haul (26 Jul)
- [x] Map user's purchased items (harness, leash, collar, dental kit, KONG brush, slow feeders, LickiMats, snuffle mat, KONG toys x4, tugs/chews) to shoppingPlan items and mark bought (DB shared_state "shopping" updated; labels reflect actual products)
- [x] Add purchased items missing from the plan as bought entries (new items: dental-kit, slow-feeder, kong-brush; KONG Squid/teething stick/tugs folded into chew-toys label; rabbit-skin chew → chew-edibles)
- [x] Ensure Shopping page surfaces remaining items in priority order (week timeline + catch-up section verified; id-tag split out of bought collar so the tag still surfaces as to-buy)
- [x] Tests + checkpoint + delivery with remaining-priority summary (tsc clean, 316/316 tests, checkpoint f3c22d7a auto-published, pushed to GitHub main @ f3c22d7)

## UI fixes + rota review (26 Jul, from user screenshots)
- [x] Fix text overlap in Household settings sheet: DrawerContent now strict flex-column with non-shrinking header (same defensive fix applied to QuickLogSheet)
- [x] Remove the big-ticket week shopping nudge sticker from the Home page (kept only the overdue catch-up nudge; unused import cleaned)
- [x] Verify visually + tests + checkpoint + push (tsc clean, 316/316 tests, checkpoint 59c25aa3 auto-published, pushed to GitHub)
- [x] Compile full inventory of daily + weekly to-do items (care rota, day plan, nudges, checklists, cheatsheet) — docs/rota-inventory.md delivered for user review
## Rota gaps — all 10 approved items added (26 Jul)
- [x] Daily checklist += afternoon water top-up + hydration check, paw-pad check after walks
- [x] Weekly checklist += sanitary check, food-quantity review, crate+pen deep-clean, toy safety audit, training progression review, photo/memory prompt, human jobs (poo bags / puppy cam / enzyme cleaner)
- [x] Monthly checklist += flea/tick topical + collar expiry check (parasite chew line already present)
- [x] Care rota: Wed = sanitary (Chesa) + training review (Chesa); Fri = food review (Marcus) + human jobs (both); Sat = crate clean (Marcus) + toy audit (Chesa); Sun = weekly photo (both)
- [x] Daily anchors (hydration, paw check) in careTasksFor with `daily` flag — shown in Due today, excluded from capped nudges and Health week preview
- [x] Health footer rota copy updated; task links fixed to real routes (/handbook/checklists, /memories)
- [x] Tests: 7 new specs (rota days, daily flags, nudge exclusion), 323/323 green, tsc clean, screenshots verified
## Digital-first checklists + bath-time trim (user request 26 Jul)
- [x] Remove print framing: Checklists page header/subtitle, print button, footer "fridge" copy, hidden print-only block
- [x] HandbookIndex card: "Printable Checklists" → digital wording
- [x] checklists.ts: comments + "printed" emergency item reworded to digital
- [x] Bath = basic groom every time: fold face/eye/paw/sanitary tidy + light all-over trim into the bath-day flow (bath rota task detail, bath-day checklist, grooming-day checklist reframe)
- [x] grooming.ts: GROOM_FREQUENCY rows — bath + maintenance trim every 2 weeks (coat held at constant length); clip cadence reworded from occasional big cuts to fortnightly top-ups
- [x] Tests + tsc + screenshots + checkpoint + GitHub push + delivery

## Coat Length Check photo comparison (user request 26 Jul)
- [x] Review Memories page + photo schema/storage to see how photos are tagged/categorised
- [x] Add "coat check" photo category/series (tag on upload, filterable)
- [x] Comparison view: side-by-side of any two coat-check photos + timeline strip ordered by date with age/days-since labels
- [x] Link from bath-day checklist final step + bath rota task detail to the coat-check capture flow
- [x] Empty state explaining the same-pose ritual (same spot, same angle, after every bath+trim)
- [x] Tests for new logic, tsc clean, screenshots verified
- [x] Checkpoint + GitHub push + delivery

## Grooming masterclass card on Guides page
- [x] Cover illustration: reused existing grooming-masterclass gouache cover (verified live)
- [x] Add masterclass as illustrated chapter card on Guides page (cover, read time, tagline, progress ring)
- [x] Tests + tsc + screenshot verification
- [x] Checkpoint + GitHub push + delivery
## Bug: grooming page jumps on card expand/collapse
- [x] Fix page shift/misalignment when opening/closing stage cards on /grooming (anchoredToggle helper keeps tapped card visually in place; also applied to /training skill cards and the QoL check-in card)
- [x] Verify + checkpoint + GitHub push + delivery (tsc clean, 339 tests green)

## Feature: smooth accordion height transition
- [x] Build reusable ~200ms animated Collapse component (height + opacity, ease-out, prefers-reduced-motion aware)
- [x] Wire into Grooming stage cards + kit checklist, Training skill cards, and QoL check-in card; anchoredToggle now pins the tapped card for the full transition duration
- [x] Verify (tsc clean, 339 tests green, mobile screenshots incl. deep-link ?open=bath) + checkpoint + GitHub push + delivery

## Update: mark user's Taobao purchases in supplies checklist (English)
- [x] Translate all purchased items from the 6 order screenshots into English (notes in .notes/taobao-purchases-2026-07-27.md; non-pet items like artwork/tissue/toilet paper skipped)
- [x] Match purchases to shopping plan: bed-mat, bowls ticked + relabelled; new clippers + toilet-tray items added and ticked; lead, chew-toys, grooming-tools, pads-cleaner labels updated (partial buys stay unticked); GROOM_KIT list updated (slicker/comb, clipper, scissors ✔ bought)
- [x] Verify (tsc clean, 339 tests passing, mobile screenshots of shopping + grooming) + checkpoint + GitHub push + delivery

## Feature: PetO Brisbane shopping list (user request 2026-07-27)
- [x] Determine remaining "still to buy" gaps from shopping plan + grooming kit after Taobao haul
- [x] Research PetO (peto.com.au) Brisbane stores + specific products/prices matching each gap
- [x] Add revisitable "PetO Brisbane run" shopping list to the app (English, tickable, synced)
- [ ] Verify (tsc, tests, screenshots) + checkpoint + GitHub push + delivery

# PetO Brisbane run (user request 2026-07-27)
- [x] Research PetO Brisbane: 7 QLD stores confirmed + 11 gap items verified on peto.com.au (products, prices, links)
- [x] client/src/content/petoRun.ts: PETO_RUN items (priorities, picks, alts, travel notes) + PETO_STORES, ids shared with master shopping plan for synced ticks
- [x] /handbook/shopping/peto-run page (Keepsake style): progress hero, grab-first/core/optional groups, product links, store cards
- [x] Entry banner on Shopping Countdown page linking to the PetO run
- [x] Verify: tsc clean, vitest 339/339 passing, mobile screenshots of both pages
- [ ] Checkpoint + GitHub push + deliver
