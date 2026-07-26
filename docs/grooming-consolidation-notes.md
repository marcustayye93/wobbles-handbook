# Grooming consolidation — analysis notes (26 Jul)

## User request
Consolidate the overlapping guides ("Coat Signs"[= Coat Science], "Grooming Master Class", "Grooming Psychology", "Hairstylist Style Guide"[= Haircut Style Guide]) into ONE consolidated "Home Grooming Master Class" — a step-by-step home grooming guide (bath + haircut) with concrete specifics:
- Station/bath setup, equipment laid out
- How many lathers, attention areas when showering, water temperature
- Blow-dry technique and directions, protecting skin at ears
- Clipper lengths: body vs legs vs tail — all pre-stated
- Nails: multiple short GRINDING sessions per week (not groom-day-only); using a GRINDER (new purchase), not clipper → add grinder to the shopping/to-do list
- User asked: before executing, do I think it makes sense? → Phase 2 = reply with recommendation and get approval.

## Current state (verified in code)
### Guides tab (/handbook) sections in client/src/content/handbookSections.ts (SECTIONS array, 9 sections):
1. first-day, 2. parenting, 3. coat-science (L188–267), 4. grooming-masterclass (L270–393), 5. grooming-psychology (L396–470), 6. haircut-styles (L473–554), 7. daily-hacks, 8. products, 9. internet-hacks
- coat-science: fleece coat types table, coat-change timeline, humidity warning, mat hotspots, comb test, red fade. ~7 min read.
- grooming-masterclass: line brushing steps, dematting decision tree, mat-safe bath&dry workflow (5 steps), clipper technique list, blade numbers tip (#10=1.5mm sanitary, #7F=3mm, #5F=6mm, #4F=9.5mm, never below #5/6mm on body), grooming calendar table. ~12 min.
- grooming-psychology: cooperative care, chin-rest protocol, lick-mat method, dryer desensitisation, clipper conditioning ladder (7 rungs), stress signals, day-one handling tip. ~9 min.
- haircut-styles: 5 styles table (puppy cut 1–2.5cm, teddy 2.5–5cm, lamb, summer ≤1.25cm never below 6mm, asian fusion), Singapore pick tip, how to talk to a groomer, teddy-bear-at-home steps. ~7 min.

### SEPARATE Grooming Salon page (/grooming, client/src/pages/Grooming.tsx) driven by client/src/content/grooming.ts GROOM_STEPS — a 10-stage step-by-step walkthrough ALREADY exists:
setup(0) brush(1) prebath(2) bath(3) dry(4) ears(5) nails(6) teeth(7) face(8) finish(9). Has GROOM_KIT checklist + GROOM_FREQUENCY cheatsheet + per-stage watchOut + puppyNote + gouache images (GROOM_IMGS manus-storage URLs). Linked from HandbookIndex (L221 sticker card "Grooming Salon").
- nails stage currently: CLIPPER-centric (45° clip, quick, styptic), mentions grinders only in puppyNote. Needs rewrite to grinder-first, multiple short sessions per week.
- bath stage: lukewarm wrist-tested, dilute 1:3, face stays dry — but NO lather count, no explicit temp guidance beyond wrist test.
- dry stage: LOW heat 20–30cm, fluff-dry w/ slicker; no explicit direction-of-airflow-vs-growth detail (masterclass says brush WITH airflow in growth direction).
- NO clipping/haircut stage in the salon walkthrough (face tidy only; body clipping lives in handbook sections).

### Shopping list: client/src/content/shoppingPlan.ts (need to check structure for adding nail grinder). Checklists page also exists (checklists.ts).

## Overlap map (why consolidation makes sense)
- Line brushing: masterclass + salon brush stage (duplicated).
- Bath workflow: masterclass 5-step + salon bath stage (duplicated, slightly different details).
- Dry: masterclass fluff-dry + salon dry stage + psychology dryer desensitisation (3 places).
- Clippers: masterclass technique/blades + haircut-styles teddy-at-home + psychology clipper ladder (3 places).
- Ears: salon ears stage + masterclass calendar + coat-science hotspot (3 places).
- Nails: salon nails stage + masterclass calendar (2 places, both clipper-first → outdated vs user's grinder decision).

## My recommendation (to present in Phase 2)
YES to consolidation, with one nuance: keep a thin "Coat Science" (why-it-mats theory + red fade + coat-change timeline) as background reading OR fold as a collapsible intro chapter; everything ELSE (masterclass + psychology + haircut styles) merges into ONE reorganised step-by-step "Home Grooming Master Class" structured as the actual groom-day sequence with exact numbers. Best implementation: rebuild the EXISTING /grooming Grooming Salon page as the consolidated guide (it already has the step-by-step skeleton + illustrations + deep links), retire the 3–4 handbook sections, and redirect their slugs. Keep psychology as a per-stage "confidence" note + one prep chapter (cooperative care foundations) rather than a separate guide. Add specifics: 2 lathers, 37–38°C lukewarm, blow-dry with growth direction, ear protection (cotton ball + Happy Hoodie), clipper lengths body 13mm/#4F-ish guard, legs/tail longer w/ guard or scissor, per user's spec. Grinder-first nail routine (2–3 short sessions/week) + add grinder to shopping list + a redirect for old slugs in SectionReader getSection.

## Things to check before building (Phase 3)
- shoppingPlan.ts structure for grinder item
- SectionReader.tsx / getSection redirects for retired slugs; search index (SearchDialog) references
- wobblesToday/nudges references to grooming sections (grep "grooming-masterclass|haircut-styles|grooming-psychology|coat-science" across client/src)
- GROOM_FREQUENCY + care rota (household.ts) nail entries to update to grinder cadence

## Build-phase code findings (verified 26 Jul, pre-build)

USER APPROVED plan. Extra request: fix collapse-scroll alignment — collapsing an expanded card should scroll viewport back to the collapsed header.

### References to retiring slugs (must update)
- wobblesToday.ts L117: link /handbook/grooming-psychology → /grooming ; L128 coat-science stays
- Grooming.tsx L210 footer link → remove
- wobbles.ts CHAPTER_COVERS keys L26-31 (keep coat-science, prune others optional)
- household.ts L133/142/151 links → /grooming ; nails task L137-144 rewrite grinder cadence
- SectionReader.tsx: add redirect for retired slugs → /grooming
- HandbookIndex.tsx L221 card "Grooming Salon" → "Home Grooming Master Class"

### Collapse bug fix targets
- Grooming.tsx L107 + Training.tsx L112: setOpen(isOpen?null:slug) with no scroll on collapse; cards have ids + scroll-mt-20. Fix: on collapse scroll card into view (rAF, behavior auto).

### Shopping list: shoppingPlan.ts week L181 items: nail-styptic L198 "Puppy nail clippers + styptic powder" → "Puppy nail grinder..." keep id.
### Tests: server/trainingGrooming.content.test.ts (GROOM_STEPS), server/dailyEngine.test.ts (household nails) — update after edits.
### GROOM_FREQUENCY nails row → "Grind 2–3× a week, 60-sec sessions" / Mon-Wed-Sat. GROOM_KIT L357 → grinder-first.
### New stages: clip stage after dry (body 13mm/#4F guard, legs+tail 16-19mm or scissor finish, order neck→back→sides→chest→legs→sanitary→tail, blade heat, two-session rule). Style guide table as section on page. Bath: 37-38°C, TWO lathers, cotton ball ears. Dry: with growth direction, Happy Hoodie.
### handbookSections.ts: remove grooming-masterclass/grooming-psychology/haircut-styles (SECTIONS 9→6), keep coat-science. Home.tsx SECTIONS.slice(0,4) fine.

## Progress log (build)
- DONE: grooming.ts fully rewritten — 11 stages (setup0 brush1 prebath2 bath3 dry4 clip5 ears6 nails7 teeth8 face9 finish10), new optional `confidence` field on GroomStep, GROOM_KIT 13 items (grinder + clippers + cotton balls + Happy Hoodie), GROOM_FREQUENCY 9 rows (nails = grinder 2–3×/wk Mon/Wed/Sat; body clip row added), new exports: HAIRCUT_STYLES (5), GROOMER_BRIEF (6 strings), BLADE_GUIDE (5 rows). clip stage has NO img (no illustration yet — optional gen later or leave).
- TODO next: Grooming.tsx page update (title "Home Grooming Master Class", render confidence note (violet/blue box, e.g. Sparkles icon), style-guide + blade table + groomer brief sections after walkthrough, remove footer masterclass link, collapse-scroll fix); handbookSections.ts remove 3 sections; SectionReader redirect map {grooming-masterclass, grooming-psychology, haircut-styles} → /grooming; household.ts 3 links + nails grinder rewrite (label keep "Nail check..." Monday? tests expect nails on Mondays only — keep Monday task but reword label/detail to grinder session + note Wed/Sat sessions too); wobblesToday L117 link; HandbookIndex card title; shoppingPlan nail-styptic label→grinder; Training.tsx collapse fix too; tests update (trainingGrooming.content.test.ts add checks for clip stage order brush<bath<dry<clip, nails grinder mention, HAIRCUT_STYLES; dailyEngine tests unchanged since nails stays Monday rota task).
