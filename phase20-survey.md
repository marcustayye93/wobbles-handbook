# Phase 20 — Codebase survey notes (for blueprint + build)

User grant: build can run 5+ hours; be meticulous; final product must be strong.
Constraints: NO new bottom-nav tabs; each of 7 upgrades extends an existing page/feature. Execute one upgrade at a time, audit, don't stop until final version checkpointed + auto-published (auto-publish ON, project wobbles-handbook, path /home/ubuntu/wobbles-handbook, live at wobblesapp-2cxvdpqb.manus.space).

## Existing pages (client/src/pages/)
About, Ask, CaretakerGuide, Checklists, ComponentShowcase, Grooming, Growth, HandbookIndex, Health, Home, HundredThings, Journey, Memories, NotFound, SectionReader, Shopping, Singapore, TrackerPage, TrackersHub, Training, TrickDetail.
Bottom nav (7 tabs, from TrickDetail obs): HOME /, GROWTH /growth, HEALTH /health, JOURNEY /journey, LOGS /trackers, PHOTOS /memories, GUIDES /handbook.

## Content modules (client/src/content/)
caretakerGuide.ts, checklists.ts, grooming.ts, handbookSections.ts, household.ts, hundredThings.ts, shoppingPlan.ts, singapore.ts, training.ts, tricks.ts, types.ts, wobbles.ts (+ places.ts referenced by photos.placeId).

## Key facts
- WOBBLES: dob 2026-06-26, homecoming 2026-09-24, parasite preventive monthly on 24th, breeder Doghouse QLD, Singapore Woodlands. wobblesAge() returns {days, weeks, remDays, months, born}.
- MILESTONES: static array ends at first birthday 2027-06-26. Icon = lucide hint string.
- Stage engine client/src/lib/wobblesToday.ts (314 lines): wobblesToday() returns TodayStage {stage,title,text,focus,expect,training,link,linkLabel}; stages: countdown → neonatal/litter → breeder export prep → just landed → socialisation sprint → junior <6mo → coat change 6-12mo → "Adult" (terminal catch-all). todaysBrief() daily layer + todaysNudges(entriesByTracker, readProgress, now, settings, shoppingTicks) max ~4 nudges, care rota first.
- Trackers (client/src/lib/trackers.ts, 12): weight, feeding, toilet, walk, sleep, shower, alone, stool, vaccines, social, grooming, training. TRACKER_GROUPS: daily/health/growing. TrackerMeta interface at top ~line 8-40 (id, emoji?, options?...). getTracker(id), TRACKER_GROUPS at line ~334.
- DB schema (drizzle/schema.ts): users, trackerEntries (trackerId varchar32, date, time, option varchar64, value varchar32, note, createdBy/Name), sharedState (stateKey unique + json value; patch merge exists), photos (fileKey, url, caption, date, placeId, createdBy/Name), aiConversations, aiMessages, aiMemory.
- Routers (server/routers.ts): system, auth, trackers (list w/ limit max 5000 default 2000, add, remove, importLegacy), sharedState (all/set/patch), photos (list, upload base64→storagePut wobbles-photos/, max 5MB, remove), ai (send/conversations/messages/deleteConversation/memory/forgetMemory). familyProcedure from server/family.ts.
- server/db.ts has helpers; server/digest.ts weeklyDigest + /api/scheduled/weeklyDigest with sdk.authenticateRequest isCron; Heartbeat cron exists (Sundays 09:00 UTC, task_uid n4mYxSTP2fsSNtr2xLryY9). Heartbeat SDK in server/_core/sdk.ts + heartbeat.ts.
- Offline: react-query persistence localStorage superjson 7d; OfflineBanner; service worker; SyncIndicator component.
- useSyncedData.ts hook wraps sharedState; useSharedState diffs maps and patches.
- Tests: 221 passing (vitest, server/*.test.ts + client/src/hooks/useSyncedData.test.ts). tsc watch clean. NOTE: stale devserver error about "@/pages/Growth" import is old noise (tsc reports 0 errors).
- Design: keepsake gouache style, paper bg #F8F3EB, ink navy #22364D, sienna #B4512E/#C66A3D, moss #6B7C5A, Cormorant display font, sticker-card/keepsake-card/btn-ink CSS classes, PageShell + Eyebrow from components/AppShell, press-scale, fade-up.
- QuickLogSheet supports initialTracker + initialOption + initialNote. ScrollToTop mounted in App.tsx.
- Ask page = AI with live context; aiMemory injected.
- storagePut(relKey, data, contentType) from server/storage.ts.
- manus-upload-file --webdev for static assets → /manus-storage/... URLs.

## 7 upgrades mapping (no new tabs; extend existing)
U1 life-stage engine → extend wobblesToday.ts stages (adolescent 6-18mo, young adult 1.5-4y, mature 4-8y, senior 8-12y, geriatric 12+) + stage-aware nudges + Growth page stage strip. Content data file client/src/content/lifeStages.ts.
U2 export/backup → About page (reachable from Home; About.tsx 168 lines) gains "Data & backup" section: one-tap full JSON export (client fetches trackers.list limit 5000 + sharedState.all + photos.list + new export router) + CSV per tracker; monthly scheduled export notification via new heartbeat cron endpoint /api/scheduled/monthlyBackup with owner notification.
U3 medical vault → Health page tabs/sections: documents (new table medicalDocuments + S3 upload like photos but any mime incl pdf), medications (new table medications w/ recurring schedule + next-due computation, nudges), symptom log (new tracker id "symptom" in TRACKERS — reuses trackerEntries!). Health.tsx 414 lines.
U4 year-scale views → Logs (TrackersHub) month/year rollup view + On This Day card on Home + Memories; annual report generator (client-rendered keepsake summary page/section per year, maybe /growth annual report section) — reuse digest-style aggregation server-side via new router or client aggregation from entries.
U5 lifetime milestones → generator function in wobbles.ts/lifetime.ts producing recurring milestones (birthdays, annual boosters from 2027-06-26, monthly parasite → maybe too noisy, licence renewal annually, dental) merged into MILESTONES consumers (Growth timeline + Home coming-up). Pure client-side deterministic generation.
U6 memories albums/search → Memories.tsx (189 lines): year chapters grouping, caption/date search input, filter by placeId maybe.
U7 senior/QoL → handbook new sections in handbookSections.ts (senior care chapter(s), gated/flagged by stage) + QoL tracker (new tracker id "qol" with 1-5 scores) surfaced in Health when stage >= senior... but content should exist now; UI shows "unlocks later" tastefully. HandbookIndex + SectionReader render from handbookSections.ts data.

## Design decisions to hold
- New trackers (symptom, qol) reuse existing trackerEntries table + TRACKERS meta — zero schema change for those.
- New tables needed: medicalDocuments, medications. Use pnpm db:push per README (drizzle-kit generate then apply via webdev_execute_sql).
- All new UI must match keepsake style + 44px touch targets + WCAG contrast (#B4512E not #C66A3D for small text).
- Keep routers <150 lines: new server/routers/ files or new sub-routers in separate files (server/medical.ts, server/export.ts).
- Tests: extend vitest for new routers + stage engine + milestone generator + export shape.
- Nav: no new bottom tabs. Health gains internal sections; About gains backup; Growth gains lifetime timeline; Memories gains albums/search.
- Blueprint file: /home/ubuntu/wobbles-handbook/docs/lifetime-blueprint.md (also deliver to user).
- Phase plan: blueprint → U1 → U2 → U3 → U4 → U5 → U6 → U7 → audit → final checkpoint/GitHub/deliver. Checkpoint after each major upgrade.

## Detailed survey (post-compaction, verified)

### wobblesToday.ts (314 lines) — stage engine exact shape
`wobblesToday(now): TodayStage` — chain: !born countdown → pre-homecoming (<8w litter, 8-12w export prep) → daysHome<=3 decompression → weeks<16 socialisation sprint → months<6 junior → months<12 coat change → terminal "Adult" fallback (line 131-140). U1 replaces the terminal fallback with: adolescent 12-18mo, young adult 18mo-4y, mature 4-8y, senior 8-12y, geriatric 12y+. Each returns {stage,title,text,focus,expect,training,link,linkLabel}.
`todaysBrief(now, settings)` — household plan; untouched by U1.
`todaysNudges(entriesByTracker, _readProgress, now, settings, shoppingTicks)` — reminders first, care rota, toilet prediction, brush gap>=2d (Chesa), toilet gap (weeks<20), weight weekly (months<12, Marcus), social (weeks<16), park night (weeks>=18 && months<12). Cap: reminders + 3. U1 adds stage-aware nudges: adult monthly weigh (months>=12, gap>=30), senior vet twice-yearly, birthday-window, dental brush for adults, QoL check-in (senior+, gap>=30 → links Health QoL), medication-due (U3 integration point).
- wobblesAge returns {days, weeks, remDays, months(30.44), born}. Need years too — compute months/12 locally, don't change signature (add `years` field is safe additive).

### wobbles.ts — MILESTONES static ends 2027-06-26 first birthday. Milestone={date,label,detail,icon(lucide hint: star,hand,syringe,badge-check,plane,home,shield,stethoscope,users,scissors,cake)}. daysUntil, formatDate(en-AU) exported. ASSETS has v2 gouache set. CHAPTER_COVERS keyed by slug — new senior chapters need covers (generate 2 gouache covers) or reuse.
- U5: new client/src/content/lifetimeMilestones.ts with generateLifetimeMilestones(fromYear..toYear or horizon): birthdays (6-26 annually), annual core booster (from 2027-06-26, annually ±), annual PALS licence renewal (licence obtained ~2026-09; renew each Sep), dental checks (annual from age 2), senior bloodwork twice-yearly from age 8 — generated deterministically, merged where consumed. Consumers of MILESTONES: Growth timeline page, Home coming-up (nextCountdown + nextMilestones), Health page healthMilestones filter (icons syringe/shield/stethoscope/scissors/cake). Provide `allMilestones(horizonYears)` helper returning static + generated sorted; keep MILESTONES untouched for tests.

### Health.tsx (414 lines) structure: Due today card → Due this week → Parasite preventive (nextParasiteDose exported fn!) → Vaccine & vet schedule (healthMilestones from MILESTONES) → Vet visits & doses (vaccines tracker, QuickLogSheet) → Weight verdict (growthVerdict from lib/growthBand) → Recent poo quality (stool). Ends ~line 414 with QuickLogSheet sheetOpen initialTracker="vaccines" presumably.
- U3 extends Health with: Medical vault (documents upload/list), Medications & preventives (recurring schedules), Symptom log ("something's off" — new tracker id "symptom"). Add as sections + maybe internal anchor tabs at top of Health.

### trackers.ts — TrackerEntry {id,date,time,value?,option?,note?}; TrackerMeta {id,title,emoji,group(daily|health|growing),empty,intro,fields{time?,value?{label,unit,min,max,step},options?{label,choices},note?},chart?{label,unit},tips[]}. 12 trackers. TRACKER_GROUPS line 334. New trackers: "symptom" (health group; options: Vomiting, Diarrhoea, Limping, Scratching, Appetite change, Lethargy, Coughing/sneezing, Eye/ear issue, Skin/coat issue, Other; note; time) and "qol" (health; value 1-5 score? or six mini-options — simplest: value {label:"Score",unit:"/40"}? Better: option choices? Decide in U7 design: use HHHHHMM-style 6 dimensions each 1-5 via QuickLog too complex — use single value 6-30 with guided note, OR store JSON in note. DECISION: qol tracker value = total score 7-35 across 7 dims captured via dedicated QoL form on Health senior section, falls back to simple entry in tracker page.)
- Check TrackerPage renders any TRACKERS entry generically → adding trackers = data-only.

### handbookSections.ts (760 lines) — Section {slug,title,emoji,tagline,readMins,hero?,blocks: Block[]}; Block types: p,h,tip,warn,list,steps,table,img,quote,bars,timeline. 9 sections (first-day, parenting, coat-science, grooming-masterclass, grooming-psychology, haircut-styles, daily-hacks, products, internet-hacks). getSection(slug) at 758. SECTIONS order = HandbookIndex order; Home shows SECTIONS.slice(0,4).
- U1/U7 add sections: "adolescence" (6-18mo survival guide), "adult-rhythm" (young adult maintenance), "prime-years" (mature 4-8 early warning), "golden-years" (senior 8-12), "twilight-care" (geriatric/QoL/end-of-life). Mark with new optional field `stage?: string` + `unlockMonths?: number` so HandbookIndex can group "Growing with Wobbles" and show lock/unlock tastefully (content readable anytime — "written for later" badge rather than hard gate).

### DB schema — trackerEntries option varchar(64), value varchar(32), note text. symptom/qol fit fine. New tables U3: medicalRecords (id, kind enum('document') or general?; title, category enum, date, fileKey, url, mimeType, sizeBytes, note, createdBy/Name, createdAt) and medications (id, name, kind enum('parasite','heartworm','prescription','supplement','other'), dose varchar, frequencyDays int, startDate, endDate?, lastGivenDate?, reminder int(bool), note, active, createdBy/Name, createdAt). Compute next-due client-side from lastGiven + frequencyDays (or logged doses).
- photos table has placeId. Memories.tsx 189 lines — U6 adds year chapters + search + place filter.

### routers.ts (305 lines) — trackers.list(limit max5000 default 2000)/add/remove/importLegacy; sharedState.all/set/patch; photos.list/upload(base64 5MB)/remove; ai.*. familyProcedure from server/family.ts (51 lines). server/db.ts 374 lines. server/digest.ts 195 lines has weeklyDigest + cron auth pattern (sdk.authenticateRequest isCron) — reuse for U2 monthly backup.
- Keep routers.ts small: create server/medical.ts (medicalRouter), server/exportData.ts (exportRouter + snapshot builder), mount in routers.ts.

### U2 design: exportRouter.snapshot → JSON {exportedAt, wobbles profile, trackerEntries all, sharedState, photos manifest (url+caption+date), aiMemory facts, medicalRecords, medications}. Client About page "Data & backup" section: Download JSON (blob), Download tracker CSV (client-generated), photo manifest CSV. Monthly cron: reuse heartbeat — add /api/scheduled/monthlyBackup endpoint building same snapshot, storagePut to backups/wobbles-backup-YYYY-MM.json, notifyOwner with link. Register heartbeat schedule via SDK (check server/_core/heartbeat.ts + existing weekly digest schedule registration mechanism — grep how weekly digest cron was registered: task_uid n4mYxSTP2fsSNtr2xLryY9 Sundays 09:00 UTC).

### U4 design: TrackersHub (133 lines) add view toggle Week|Month|Year rollups (client aggregation over entries; counts per tracker per month, weight avg). Home "On this day" card (photos + entries matching MM-DD from ≥1yr ago; hidden until data exists — will show from 2027). Annual report: /growth annual section or dedicated route /annual-report/:year? NO new tab — put "Year in review" card on Growth page linking to route /growth/year/:year (registered route, reachable from Growth). Generates keepsake summary client-side from all data.

### U6 design: Memories year chapters (group by year, sticky headers), search input (caption match, debounced), filter chips (year, place). Photos list currently all photos; fine client-side to thousands.

### Audit phase: pnpm test, tsc --noEmit, screenshots of Home/Health/Growth/Memories/About/Handbook, browser walkthrough of new flows, todo.md check, checkpoint + push github main (remote 'github' exists, branch main).

### Assets needed (generate before UI): gouache chapter covers for new handbook chapters (adolescence, golden-years) — optional, can reuse existing hero/parenting covers if generation budget tight. DECISION: generate 2 covers max in U1/U7, reuse for others.

### Blueprint file to write: docs/lifetime-blueprint.md in repo + deliver copy to user at end.
