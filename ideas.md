# Wobbles' Handbook — Design Brainstorm

## Three Candidate Directions

### 1. Storybook Picture-Book
A warm, illustrated children's-book aesthetic — soft paper textures, hand-drawn dividers, serif storybook headings — treating Wobbles' first year like a treasured keepsake album.
**Probability:** 0.07

### 2. Blenheim Field Guide
A vintage naturalist's field-guide style — cream parchment, botanical-plate illustrations, stamp motifs, index-card trackers — framing Cavapoo care like an explorer's journal.
**Probability:** 0.03

### 3. Puppy Pastel Clinic
An ultra-clean pastel medical-app look — mint and blush, rounded neumorphic cards — like a paediatric health app but for a puppy.
**Probability:** 0.02

---

## CHOSEN: Storybook Picture-Book (expanded)

**Design Movement:** Contemporary children's picture-book illustration meets modern mobile app design — think Beatrix Potter warmth with the polish of a premium habit-tracking app. Soft editorial illustration, generous paper-cream fields, and rounded "sticker" cards.

**Core Principles:**
1. *Keepsake warmth* — every screen should feel like a page from Wobbles' baby book, not a utility app.
2. *Blenheim palette fidelity* — colors are literally drawn from Wobbles' photos: chestnut-red patches, warm white coat, pink puppy nose, cream towel background.
3. *Soft geometry* — organic blob shapes, large rounded corners (1.25rem+), no hard edges; paw and bone motifs used sparingly as punctuation.
4. *Content-first readability* — the handbook text is long-form; typography and spacing must make reading on a phone genuinely pleasant.

**Color Philosophy:** The palette is an extraction of Wobbles himself. Base: warm cream (#FDF8F2-ish, oklch warm white) like his coat and the towel he lies on. Primary: chestnut/russet (his ear patches, ~oklch(0.55 0.13 40)). Accents: soft blush pink (his nose), sage green (grass/garden, used for success states), warm honey (highlights). Deep warm brown for text instead of black. The emotional intent: cuddly, safe, trustworthy — how a first-time puppy parent wants to feel.

**Layout Paradigm:** Vertical scroll pages with a fixed bottom tab bar (Home, Handbook, Trackers, Singapore, Wobbles). Home is a scrapbook-style scroll: overlapping photo card, age ticker, "this week" guidance. Handbook chapters open as full-screen readable pages with sticky chapter headers and a progress thread down the left edge. Asymmetric card stacks — cards tilt ±1deg alternately like taped-in photos.

**Signature Elements:**
1. *The red-parti blob* — an organic chestnut blob shape behind photos and section heroes, echoing Wobbles' patches.
2. *Paw-print bullet* — tiny paw glyph replaces bullets/checkmarks in checklists.
3. *Stitched divider* — a dashed "hand-stitched" line between sections, like a sewn keepsake book.

**Interaction Philosophy:** Gentle and forgiving. Big touch targets (min 48px), soft spring scale on press (0.97), instant tab switches, swipe-friendly. Trackers are one-thumb loggable: giant preset buttons, no typing required for common entries.

**Animation:** Entrances fade+rise 12px over 250ms ease-out with 40ms stagger; tab icon does a tiny 1.05 bounce on select; checklist paw stamps in with a 180ms scale from 0.95; no continuous animation. Respect prefers-reduced-motion.

**Typography System:** Display: "Fraunces" (soft, warm serif with storybook character) for page titles and chapter numbers, weights 600/700 with optical size. Body: "Nunito" (rounded, extremely legible sans) 400/600/700. Chapter labels in Nunito 700 small-caps letterspaced. Line-height 1.65 for reading sections.

**Brand Essence:** A hand-made digital baby book and field manual for one specific puppy — for first-time pet parents who want expert care knowledge wrapped in love. Adjectives: tender, trustworthy, meticulous.

**Brand Voice:** Warm second-person, addressed to Wobbles' family, expert but never clinical. Examples: "Week one is for hearts, not haircuts — just let him fall in love with the brush." / "Log tonight's dinner — future-you at the vet will be grateful."

**Wordmark & Logo:** "Wobbles'" in Fraunces italic 700 with a chestnut paw-print replacing the apostrophe dot; app icon = illustrated Wobbles face (from his photo) inside a cream squircle with chestnut blob background.

**Signature Brand Color:** Chestnut russet — oklch(0.55 0.13 40) — the exact warm red of his ear patches; used for the tab bar active state, primary buttons, and the wordmark.

## Style Decisions
- 9:16 mobile-first: max content width 28rem centered; bottom tab bar with safe-area padding; PWA standalone display.
- Charts use warm palette (chestnut, honey, sage, blush) on cream, never default blues.

---

## Style Decisions (Redesign v2 — user-approved ChatGPT mockup template, 2026-07-22)

This supersedes conflicting details above. Ground truth = the two mockup images in /home/ubuntu/upload (2614987A home cover; 09EFA7F4 four screens: chapter cover, reading view, trackers hub, 100 things).

**Palette:** Paper #F8F3EB (base bg), Warm Ivory #FFFDF8 (cards), Chestnut #6B3F2A (headings-adjacent, illustration fur), Rich Fur #8C4F34, **Ink Navy #22364D** (display headings, bottom nav bar, primary buttons, FAB), **Burnt Sienna #C66A3D** (eyebrow labels, accents, active tab, countdown numeral), Moss #7B8C6A (success/progress secondary), Warm Grey #9C9288 (captions). Deep navy text for display, warm dark brown-grey for body.

**Typography:** Display = Cormorant Garamond (600/700, tight leading, high contrast serif — matches mockup's Canela-like look, NOT Inter). Body = Nunito Sans 400/600/700. Eyebrows = letter-spaced uppercase 11-12px sienna. Scale: hero 44-52, section 30-34, card title 20-22, body 17, caption 13.

**Surfaces:** cards radius 28px, buttons 20px (navy pill w/ white text), chips 999px; single shadow 0 12px 32px rgba(34,54,77,0.10); paper-grain texture overlay on bg; masking-tape motif on keepsake cards (countdown card, diagrams); max one decorative treatment per screen.

**Nav:** ink-navy rounded-top bottom bar, 5 tabs — Home, Chapters, Trackers, 100 Things, Memories — sienna/white active state, cream inactive icons; hidden in chapter reading view (immersive).

**Illustration:** gouache/watercolour Wobbles character (white coat, chestnut ears + eye patches, white blaze, expressive dark eyes, oversized floppy ears), occupying 35-60% of hero screens; pencil-line spot illustrations (dog bed, plants) on paper; illustrations are layout elements, not thumbnails.

**Key screens:** Home = full-bleed cover (badge wordmark, huge serif title, tagline, taped countdown card, hero illustration, peeking "Right Now" ivory card w/ navy CTA). Chapters = collectible full-bleed covers w/ progress ring + read time. Reader = top progress line, "x of n" step, large serif section headings, taped diagram cards. Trackers = grouped Daily Care / Health & Vet / Milestones & Memories, last-logged per card, navy FAB. 100 Things = large progress ring "34 of 100", encouragement, category chips, celebratory rows, Surprise Me navy button.
