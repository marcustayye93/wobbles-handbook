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
