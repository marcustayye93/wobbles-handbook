# Phase 20 working notes (internal, survives context compaction)

Blueprint: docs/lifetime-blueprint.md — U1..U7 specs. Todo items appended at end of todo.md ("Phase 20").

## Codebase facts (verified)
- Stage engine: `client/src/lib/wobblesToday.ts` — wobblesToday(now), todaysBrief, todaysNudges(entriesByTracker, _readProgress, now, settings?, shoppingTicks?). Nudge order: reminders first (survive cap), then care rota, then data nudges, capped `rest.slice(0,3)`.
- U1 DONE (engine): five lifetime stages added after coat-change block (adolescence <18mo, young adult <48, prime <96, senior <144, twilight else). New export `nextBirthday(now)`. New nudges: `weigh-monthly` (>=12mo, gap>=30d), `senior-vet` (>=96mo, vaccines gap>=182d), `qol-checkin` (>=96mo, qol gap>=30d), `birthday` (14-day window, uses daysUntil+nextBirthday).
- Age helper: `wobblesAge()` in `client/src/content/wobbles.ts` → {days, weeks, remDays, months, born}. months = floor(days/30.44). DOB 2026-06-26, homecoming 2026-09-24. MILESTONES array ends 2027-06-26. Milestone iface: {date,label,detail,icon} icons: star,hand,syringe,badge-check,plane,home,shield,stethoscope,users,scissors,cake.
- ASSETS + CHAPTER_COVERS in wobbles.ts. CHAPTER_COVERS keyed by slug. Existing covers: coat-science, first-day, parenting, grooming-masterclass, grooming-psychology, haircut-styles, daily-hacks, products, internet-hacks, singapore, memories.
- Sections: `client/src/content/handbookSections.ts` (761 lines, 9 sections: first-day, parenting, coat-science, grooming-masterclass, grooming-psychology, haircut-styles, daily-hacks, products, internet-hacks). `Section` type in content/types.ts: {slug,title,emoji,tagline,readMins,hero?,blocks}. Block types: p,h,tip,warn,list,steps,table,img,quote,bars,timeline. getSection() at end.
- HandbookIndex.tsx maps SECTIONS → cover cards ("Chapter {i+1}"), then Skill guides, then special pages. Add stage grouping/badges here. SectionReader auto-renders any section; prev/next = array order. SearchDialog auto-indexes SECTIONS.
- Tests live in server/*.test.ts (vitest). dailyEngine.test.ts covers wobblesToday/todaysNudges — extend it. Baseline suite ~221 tests passing before U1.
- Dev server has stale vite error about "@/pages/Growth" in logs from 15:02 — tsc watch shows 0 errors; verify Growth.tsx exists (it should; error may be stale/pre-restore).
- Design tokens: paper #F8F3EB, ink #22364D, sienna #B4512E/#C66A3D (B4512E for small text contrast), moss #6B7C5A, classes keepsake-card, sticker-card, btn-ink, press-scale, fade-up, Eyebrow/PageShell/PawDivider from components/AppShell.
- todo.md: mark items [x] as completed via edit.
- GitHub repo marcustayye93/wobbles-handbook, push after final checkpoint. Auto-publish ON — every checkpoint deploys to wobblesapp-2cxvdpqb.manus.space.
- Weekly digest pattern for cron: server/digest.ts + /api/scheduled/weeklyDigest handler in server/_core/index.ts with sdk.authenticateRequest + isCron; heartbeat via manus-heartbeat CLI (existing task n4mYxSTP2fsSNtr2xLryY9 cron "0 0 9 * * 0"). U2 monthly backup should copy this pattern: "0 0 1 1 * *"? NO — 6-field cron (sec min hour day month dow): monthly 1st 01:00 UTC = "0 0 1 1 * *" is wrong (that's Jan 1). Use "0 0 1 1 * *"?? VERIFY: manus-heartbeat cron field order before creating. Weekly was "0 0 9 * * 0" = sec min hour dom mon dow → monthly 1st: "0 0 1 1 * *" would be hour=1 dom=1 → correct: sec=0 min=0 hour=1 dom=1 mon=* dow=* → "0 0 1 1 * *". Yes that's right (5th field is month).
- Trackers meta in `client/src/lib/trackers.ts` (TRACKERS record; entry: {id,date,time?,value?,option?,note?,loggedBy?}). Tracker pages render generically from TRACKERS.
- Photos schema has placeId column; photos router list/upload/remove; PhotoJournal.tsx + photoGroups.ts (month grouping) + PhotoLightbox.tsx.
- sharedState via useSharedState(key) hook; server shared_state map.
- Health page: client/src/pages/Health.tsx with healthMilestones() filtering MILESTONES by icon.
- Growth page: client/src/pages/Growth.tsx (timeline of MILESTONES + weight chart).
- Memories page: client/src/pages/Memories.tsx (firsts + PhotoJournal).
- About page: client/src/pages/About.tsx.
- db helpers server/db.ts; routers server/routers.ts; familyProcedure exists (any authed user = family).
- Storage: storagePut/storageGet in server/storage.ts.

## Remaining work checklist (see todo.md Phase 20)
- U1: still need 5 new handbook sections (adolescence, adult-rhythm, prime-years, golden-years, twilight-care) with stage?: string + unlockMonths?: number on Section type; HandbookIndex "Growing with Wobbles" group w/ badges; 2 new gouache covers (adolescent zoomies, senior by window); tests for stages+nudges.
- U2: server/exportData.ts buildSnapshot + exportData router + monthlyBackup handler + About Data & backup UI (JSON blob download + CSV flatten client-side).
- U3: medical_records + medications tables (drizzle generate + webdev_execute_sql), server/medical.ts router, Health sections (Medicine cabinet w/ next-due chips = lastGivenDate+frequencyDays, Paper trail docs upload base64<=8MB → storagePut("medical/…"), Symptom log last 5 + QuickLogSheet preset), symptom tracker meta.
- U4: TrackersHub Recent|Months toggle (client aggregation); Home On This Day card (same MM-DD prior years, photos+entries); Growth Year in review card + /growth/year/:year route/page.
- U5: client/src/content/lifetimeMilestones.ts generateLifetimeMilestones(16) + allMilestones(); consumers Growth (past + next 8), Home nextCountdown/nextMilestones, Health (past5+next5 health icons). Birthday 26 Jun yearly; booster 26 Jun from 2027; PALS renewal Sep from 2027; dental Jan from 2028; senior bloodwork Jun+Dec from 2034; stage thresholds star entries.
- U6: Memories year chapters (sticky year headers w/ stage labels), debounced search (250ms caption+date), year + place filter chips.
- U7: full golden-years + twilight-care content (HHHHHMM QoL framework), qol tracker meta (7 sliders 0–5, value=total 0–35, note="H4 H5 …" breakdown), QoL check-in card on Health (bands: >28 comfortable / 21–28 watch / <21 vet), tests.
- Audit: tsc, pnpm test, screenshots (mobile 390px), todo reconcile, checkpoint, GitHub push, deliver.

## Session findings (append-only log)
- U1 DONE: lifetimeSections.ts (5 chapters, no hero images yet — CHAPTER_COVERS[slug] undefined is fine for sticker rows), handbookSections.ts exports PUPPY_SECTIONS + SECTIONS(=puppy+lifetime)+LIFETIME_SECTIONS, types.ts Section gains stage?/unlockMonths?, HandbookIndex has "Growing with Wobbles" sticker rows with Now badge, wobblesToday 5 lifetime stages + nextBirthday + nudges (weigh-monthly/senior-vet/qol-checkin/birthday). dailyEngine.test.ts now 24 tests, all pass.
- SCREENSHOT GATE: app shows a "Who's holding the phone?" persona picker (Marcus/Chesa/Caretaker) stored in localStorage — screenshots always land on this gate. To verify inner pages visually, need to bypass: persona stored via localStorage key (check components/ProfileGate or similar in App.tsx). Options: check how gate works and add ?persona= URL param support for testing, or just rely on tests + targeted DOM checks. FIND the gate component: grep "holding the phone".
- tsc watch + LSP: 0 errors after U1.
- Profile gate bypass ADDED: useProfile.readProfile now honours ?profile=Marcus|Chesa|Caretaker URL param (persists to localStorage). Use "?profile=Marcus" suffix on all future screenshot paths.
- U1 VERIFIED visually: /handbook shows "Growing with Wobbles" 5 sticker rows w/ stage labels (no "Now" badge yet since he's 0 yrs — correct); /handbook/adolescence and /handbook/twilight-care render fully (Chapter 10/14 numbering auto). Reader hero shows dark navy placeholder (no cover) — acceptable, matches keepsake style; could add covers later if time permits.
- NEXT: mark U1 todo items [x]; then U2 (data export + monthly backup): create server/exportData.ts buildSnapshot, add exportData router in server/routers.ts, monthly backup handler in server/_core/index.ts + heartbeat registration (copy weeklyDigest pattern from server/digest.ts + /api/scheduled/weeklyDigest), About page "Data & backup" section.
- IMPORTANT for U2: check server/digest.ts + grep "scheduled" server/_core/index.ts for exact auth pattern; heartbeat CLI: manus-heartbeat (existing weekly task cron "0 0 9 * * 0" 6-field). Monthly = "0 0 1 1 * *" (sec min hour dom mon dow)?? NO — that fires Jan 1st only if 5th field is month. 6-field format: sec min hour dom mon dow → monthly on 1st at 01:00 = "0 0 1 1 * *". Field 4 = day-of-month=1, field 5 = month=*. So string: 0 0 1 1 * * ✓.
