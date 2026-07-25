# Wobbles' Handbook — Lifetime Blueprint

**The design specification for future-proofing the app from puppyhood through Wobbles' whole life (12–16 years).**

This document specifies seven upgrades (U1–U7) that transform Wobbles' Handbook from a puppy-arrival companion into a lifelong keepsake and care system. The guiding principles are: no new bottom-nav tabs (every feature extends an existing page), the keepsake gouache design language is preserved everywhere (paper `#F8F3EB`, ink navy `#22364D`, sienna `#B4512E`/`#C66A3D`, moss `#6B7C5A`, Cormorant display serif, `keepsake-card` / `sticker-card` / `btn-ink` / `press-scale` / `fade-up`), all touch targets stay ≥44 px, and the app must remain useful and delightful whether Wobbles is 4 months or 14 years old.

---

## The lifetime problem

Today the app's intelligence ends at Wobbles' first birthday. The stage engine falls back to a generic "Adult" card, the milestone timeline stops at 26 Jun 2027, the handbook has no chapters written for the adult, senior, or geriatric years, all tracker views assume days-to-weeks of data (not years), the family's data lives only in the database with no export path, and there is nowhere to file vet paperwork, medication schedules, or "something's off" observations — the things that dominate dog ownership after the puppy year.

| # | Upgrade | Extends | Core deliverable |
|---|---------|---------|------------------|
| U1 | Life-stage engine | Home, Guides | Five post-puppy stages with stage-aware nudges and life-stage chapters |
| U2 | Data export & backup | About | One-tap JSON/CSV export + automatic monthly backup |
| U3 | Medical vault | Health | Document vault, medication schedules, symptom log |
| U4 | Year-scale views | Trackers, Home, Growth | Month/year rollups, On This Day, Year in Review |
| U5 | Lifetime milestones | Growth, Home, Health | Generated recurring milestones for every year of his life |
| U6 | Memories at scale | Memories | Year chapters, search, and filters for thousands of photos |
| U7 | Senior & QoL care | Guides, Health | Golden-years content + structured quality-of-life check-in |

---

## U1 — Life-stage engine extension

**Problem.** `wobblesToday()` in `client/src/lib/wobblesToday.ts` returns a terminal "Adult" fallback after 12 months. `todaysNudges()` has no nudges for adult or senior life.

**Stages.** The terminal fallback is replaced by five stages keyed off `wobblesAge().months`:

| Stage | Age window | Card theme | Link target |
|-------|-----------|------------|-------------|
| Adolescence | 12–18 mo | Teenage brain, boundary testing, keep training | `/handbook/adolescence` |
| Young adult | 18 mo – 4 y | Settled rhythm: monthly weigh, annual booster, dental habit | `/handbook/adult-rhythm` |
| Prime years | 4 – 8 y | Subtle-change watching, weight drift, dental checks | `/handbook/prime-years` |
| Senior | 8 – 12 y | Twice-yearly vet, comfort adjustments, QoL check-ins | `/handbook/golden-years` |
| Golden twilight | 12 y + | Comfort-first care, QoL tracking, cherishing every day | `/handbook/twilight-care` |

Each returns the standard `{stage, title, text, focus, expect, training, link, linkLabel}` shape so Home's "Wobbles today" card needs zero UI changes.

**Stage-aware nudges** (added inside `todaysNudges`, respecting the existing reminders-plus-three cap):

- **Adult monthly weigh** (months ≥ 12): if the latest weight entry is >30 days old → "Monthly weigh-in is due — adults drift quietly." → `/trackers/weight`.
- **Adult dental brush** (months ≥ 12): brush-gap logic already exists for grooming; extend intro copy — no new nudge needed beyond existing brush nudge remaining active for adults (remove any `months<12` gating that would silence it).
- **Senior vet rhythm** (months ≥ 96): if no `vaccines` tracker entry in the last 182 days → "Seniors see the vet twice a year — book the check-up." → `/health`.
- **Birthday window** (any age ≥ 1): within 14 days before his birthday → "Wobbles turns N on 26 Jun — plan the birthday walk 🎂" → `/growth`.
- **QoL check-in** (months ≥ 96): if no `qol` tracker entry in the last 30 days → "Monthly quality-of-life check-in — 5 quiet minutes." → `/health#qol` (U7 dependency; nudge ships in U7).

**Handbook chapters.** `Section` gains two optional fields: `stage?: string` (display label, e.g. "12–18 months") and `unlockMonths?: number` (age in months when the chapter becomes "current"). Five new sections are appended to `SECTIONS`: `adolescence`, `adult-rhythm`, `prime-years`, `golden-years`, `twilight-care`. Content is always readable — HandbookIndex groups them under a "Growing with Wobbles" heading with a soft "written for later" badge when `wobblesAge().months < unlockMonths`, and a "now" badge for the current stage. Two new gouache covers are generated (adolescent Wobbles mid-zoomies; senior Wobbles grey-muzzled by a window); `adult-rhythm` and `prime-years` reuse existing covers (`daily-hacks` kit / hero) and `twilight-care` shares the senior cover.

**Tests.** `wobblesToday` at synthetic dates (15 mo, 3 y, 6 y, 10 y, 13 y) returns the right stage; nudges fire/suppress correctly around thresholds; new sections pass the existing content-shape specs.

---

## U2 — Data export & backup

**Problem.** Years of family data (tracker entries, photos, AI memory, medical records) have no export path and no automatic backup.

**Server.** New `server/exportData.ts`:

- `buildSnapshot()` — assembles `{ meta: {exportedAt, appVersion, wobbles: WOBBLES-profile summary}, trackerEntries[], sharedState{}, photos[] (metadata + URL), aiMemory[], medicalRecords[], medications[] }` from existing db helpers plus new ones.
- `exportRouter` (mounted as `exportData` in `routers.ts`): `snapshot` (familyProcedure query returning the JSON), `csv` stays client-side (entries are already in the snapshot).
- `/api/scheduled/monthlyBackup` Express handler (cron-authenticated exactly like `weeklyDigest`): builds the snapshot, `storagePut("backups/wobbles-backup-YYYY-MM.json", …)`, then `notifyOwner` with a short stats line. Registered in `server/_core/index.ts`; heartbeat created via `manus-heartbeat create --cron "0 0 1 1 * *"` (01:00 UTC on the 1st monthly) after the checkpoint deploys.

**Client.** About page gains a "Data & backup" keepsake section: **Download everything (JSON)** button (fetches `exportData.snapshot`, triggers a blob download `wobbles-handbook-export-YYYY-MM-DD.json`), **Download tracker log (CSV)** (flattens entries: tracker, date, time, value, option, note, loggedBy), and a quiet explainer that a full backup is also saved automatically on the 1st of each month.

**Tests.** Snapshot builder returns all sections with correct counts against seeded fakes; CSV flattener escapes commas/quotes/newlines; monthly handler rejects non-cron.

---

## U3 — Medical vault

**Problem.** No home for vet paperwork (AVS licence, vaccine certificates, insurance, lab results), no medication schedule beyond the hard-coded parasite 24th, and no structured "something's off" log — the backbone of adult/senior vet visits.

**Schema** (drizzle → generate → apply):

```
medical_records: id pk, title varchar(160), category enum(vaccine-cert, vet-report,
  lab-result, insurance, licence, prescription, receipt, other), recordDate varchar(10),
  fileKey varchar(255), url text, mimeType varchar(80), sizeBytes int, note text,
  createdBy varchar(64), createdByName varchar(64), createdAt timestamp
medications: id pk, name varchar(120), kind enum(parasite, heartworm, prescription,
  supplement, other), dose varchar(120), frequencyDays int, startDate varchar(10),
  endDate varchar(10) null, lastGivenDate varchar(10) null, active int default 1,
  note text, createdBy/Name, createdAt
```

**Server.** `server/medical.ts` → `medicalRouter`: `records.list/upload/remove` (upload takes base64 ≤8 MB like photos, `storagePut("medical/…")`), `meds.list/add/update/markGiven/remove`. All `familyProcedure`. Helpers in `server/db.ts`.

**Trackers.** Add `symptom` tracker (health group): options list (Vomiting, Diarrhoea, Limping, Scratching, Appetite change, Lethargy, Coughing / sneezing, Eye or ear issue, Skin or lump, Other), time + note, tips about when to call the vet. (The `qol` tracker ships in U7.) Tracker pages render any `TRACKERS` entry generically, so this is data-only.

**Health page.** Three new sections after "Vet visits & doses": **Medicine cabinet** (active medications with next-due chips computed from `lastGivenDate + frequencyDays`, "Given today" one-tap, add/edit sheet), **Paper trail** (document list grouped by category with icon, date, size, view/download link; upload sheet with title/category/date/file), **Symptom log** (last 5 symptom entries + "Log a symptom" button opening QuickLogSheet pre-set to `symptom`).

**Tests.** Next-due maths (incl. inactive/ended meds), db helpers via mocks, symptom tracker meta shape.

---

## U4 — Year-scale views

**Problem.** Every tracker view assumes recent data; after a year the lists are unbounded and the story of a month or a year is invisible.

- **TrackersHub rollup toggle.** A `Recent | Months` segmented control. Months mode aggregates all entries client-side into per-month cards (newest first): entry counts per tracker group, average weight, walks count, toilet success %, using existing entry hooks. Purely presentational, no schema change.
- **On This Day (Home).** A keepsake card that appears only when there is at least one photo or tracker entry from the same MM-DD in a previous year: "One year ago today…" with the photo (if any) and up to two entry lines. Hidden entirely until 2027 — zero cost now.
- **Year in Review (Growth).** A "Year in review" sticker card on Growth (per completed-or-current year) linking to `/growth/year/:year` (route registered in App.tsx; back link to Growth). The page composes a client-side keepsake annual report: age bracket that year, weight journey (start → end), totals (walks, meals, toilet success %, training sessions, groom sessions, new tricks practised, photos taken), milestones reached that year (from U5's `allMilestones`), and the year's photo strip. Sections render only when data exists.

**Tests.** Month-key aggregation, on-this-day matcher (MM-DD across years, ignores current year), year-report totals from synthetic entries.

---

## U5 — Lifetime milestone generator

**Problem.** `MILESTONES` ends at the first birthday; Home's "Coming up" and Growth's timeline go silent after Jun 2027.

**Design.** New `client/src/content/lifetimeMilestones.ts` — pure, deterministic, no storage:

- `generateLifetimeMilestones(horizonYears = 16): Milestone[]` producing, for each year of life:
  - **Birthday** — 26 Jun yearly ("Wobbles turns N 🎂"), icon `cake`.
  - **Annual core booster + health check** — 26 Jun yearly from 2027 (combined with birthday visit), icon `syringe`.
  - **PALS licence renewal** — each Sep from 2027, icon `badge-check`.
  - **Annual dental check** — each Jan from 2028 (age 1.5+, offset from birthday vet visit), icon `stethoscope`.
  - **Senior bloodwork** — twice yearly (Jun + Dec) from age 8 (2034), icon `stethoscope`.
  - **Stage thresholds** — becomes an adolescent (Jun 2027 is birthday; adolescence starts Jun 2027+... actually 12 mo = birthday), young adult (Dec 2027), prime years (Jun 2030), senior (Jun 2034), golden twilight (Jun 2038), icon `star`.
- `allMilestones(horizonYears?)` — static `MILESTONES` merged with generated ones, de-duplicated by `date+label`, sorted ascending. Static entries always win.

**Consumers.** Growth timeline switches from `MILESTONES` to `allMilestones()` showing past + next 8 upcoming (with a "his whole life is mapped" footnote); Home `nextCountdown`/`nextMilestones` use `allMilestones()` so "Coming up" never empties; Health `healthMilestones()` uses `allMilestones()` filtered to health icons, capped to past 5 + next 5 to stay compact.

**Tests.** Generator determinism, birthday count over horizon, senior bloodwork starts 2034, merge keeps static entries and stays sorted.

---

## U6 — Memories at scale

**Problem.** The photo journal is one flat reverse-chronological list — unusable at year five with thousands of photos.

**Design (all client-side in `Memories.tsx` / `PhotoJournal.tsx`).**

- **Year chapters:** photos grouped by year with a sticky Cormorant year header ("2026 — The puppy year", "2027 — One year old", stage-labelled via the U1 engine), month groups preserved within.
- **Search:** a debounced (250 ms) input filtering by caption text and date fragments ("dec", "2027-03", "beach").
- **Filter chips:** year chips (auto-derived) + place chips (from the existing `placeId`/place data) rendered as sienna sticker chips; combinable with search.
- Empty-state and result-count copy in the keepsake voice.

**Tests.** Grouping by year/month, search matcher (case-insensitive caption + date), combined filter logic.

---

## U7 — Senior & quality-of-life care

**Problem.** The hardest, most important chapter of dog ownership has zero support: senior comfort care and structured quality-of-life tracking.

- **Content:** `golden-years` (senior 8–12: twice-yearly vet, arthritis signs, weight vigilance, comfort adjustments, keeping the spark) and `twilight-care` (12+: comfort-first days, the HHHHHMM quality-of-life framework explained gently, honest conversations with the vet, making every day count) — written in the handbook's warm, specific voice. (Sections are added in U1; U7 fills the senior two with full-depth content and wires the QoL loop.)
- **QoL tracker:** `qol` tracker meta (health group) — a 7-dimension check-in following the HHHHHMM scale (Hurt, Hunger, Hydration, Hygiene, Happiness, Mobility, More-good-days-than-bad), each 0–5, stored as `value` = total (0–35) with the per-dimension breakdown in `note` (e.g. "H4 H5 H5 H4 H4 M3 G4"). A dedicated **QoL check-in card** on Health (visible from age 7 as "worth starting early"; always reachable) with seven labelled slider rows, a live total, gentle interpretation bands (>28 comfortable · 21–28 watch closely · <21 talk to the vet), and a save that writes a `qol` entry. History renders as the standard tracker chart.
- **Nudge:** monthly QoL nudge for senior+ (specified in U1, shipped here).

**Tests.** Score maths and band labels, tracker meta shape, nudge firing at senior age with stale/no QoL entries.

---

## Execution order & quality bar

Upgrades execute U1 → U7 in order (U5 before U6 lets Growth/Home consume the generator while fresh; U7 last as it depends on U1 sections and U3 Health layout). Each upgrade ends with: `tsc --noEmit` clean, `pnpm test` green (current baseline 221 specs, growing), and a visual screenshot check of the affected pages. After U7: full audit (all pages, mobile viewport 390 px, contrast pass), todo.md reconciliation, checkpoint (auto-publishes to wobblesapp-2cxvdpqb.manus.space), and a push to GitHub `main`.
