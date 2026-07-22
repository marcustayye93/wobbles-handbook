# Wobbles' Handbook — Premium Redesign (ChatGPT mockup template)

## Design system (locked from mockups + ChatGPT summary + my appraisal)
- Palette: Paper #F8F3EB, Warm Ivory #FFFDF8, Chestnut #6B3F2A, Rich Fur #8C4F34, Ink Navy #22364D (primary accent / nav), Burnt Sienna #C66A3D (CTA accent), Moss #7B8C6A, Warm Grey #9C9288
- Type: Display = high-contrast serif (Cormorant Garamond via Google Fonts), Body = Nunito Sans (NOT Inter per appraisal). Scale: hero ~52, section ~34, card title ~22, body ~17-18, caption ~13-14. Letter-spaced small-caps eyebrows in sienna.
- Spacing: 8px base, 24/32 paddings; radius: cards 28, buttons 20, chips 999
- Shadow: single system 0 12px 32px rgba(34,54,77,0.10)
- Texture: paper grain, masking tape / stitched details sparingly (max one treatment per screen)
- Illustration: consistent gouache/watercolour Wobbles (white coat, chestnut ears + eye patches, white blaze), 35-60% of screen
- Nav: ink-navy rounded bottom bar, 5 tabs: Home, Chapters, Trackers, 100 Things, Memories; hidden in reading view

## Phase 8 — Assets
- [ ] Generate hero cover illustration (Wobbles on navy blanket, matching mockup home cover)
- [ ] Generate chapter cover illustrations (gouache) for the 9 chapters
- [ ] Generate spot illustrations: dog bed + plant (Right Now card), peeking Wobbles (trackers hub), high-five Wobbles (100 Things)
- [ ] Upload all via manus-upload-file --webdev

## Phase 9 — Core redesign
- [ ] index.css: new tokens (ink navy, paper, sienna), fonts, paper-grain util, shadow/radius tokens
- [ ] index.html: add Cormorant Garamond font link
- [ ] BottomNav: ink-navy rounded bar w/ 5 tabs incl. Memories; hidden in reader
- [ ] Home: full-bleed cover — wordmark badge, big serif title, tagline, taped countdown card, hero illustration, Right Now card peeking w/ navy CTA
- [ ] HandbookIndex: collectible chapter covers with progress rings
- [ ] SectionReader: immersive full-bleed cover (illustration, serif title, read time, progress ring), reading view w/ top progress line, larger body type, diagrams as taped cards; hide bottom nav
- [ ] Memories page (new /memories route): milestones + firsts + photo journal placeholder

## Phase 10 — Trackers + 100 Things
- [ ] TrackersHub: groups Daily Care / Health & Vet / Milestones & Memories; last-logged line per card; peeking Wobbles; floating navy quick-log FAB
- [ ] Quick-log bottom sheet with smart defaults from last entry
- [ ] TrackerPage restyle to new tokens
- [ ] HundredThings: big progress ring "X of 100", encouragement, category chips, celebratory ticks, Surprise Me button
- [ ] Checklists + Singapore + About restyle pass

## Phase 11 — Review & ship
- [ ] Mobile screenshots vs mockups; fix contrast/spacing
- [ ] tsc + build clean
- [ ] Checkpoint + push github main
- [ ] Deliver

## Later (after redesign)
- [ ] Full-stack upgrade + two-user shared DB sync (webdev_add_feature web-db-user; tracker_entries, checklist_ticks, hundred_things_ticks; localStorage migration; Manus OAuth)
