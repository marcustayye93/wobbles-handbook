# Purchased haul mapping — 26 Jul 2026

Current DB ticks (shared_state key "shopping"): collar-tag, harness, kong-lickmat, lead, puppy-proof, puzzle (user already ticked some).

## Mapping user's purchased items → plan items

| Purchased | Plan item | Action |
|---|---|---|
| Blue padded harness (Ruffwear Front Range-style) | `harness` (w3) | already ticked; update label to reflect actual product |
| TUG retractable leash | `lead` (w3) | ticked; update label (plan said "no retractables" — keep note to use a fixed short lead for training walks, retractable for sniffy decompression walks later) |
| Ruffwear Front Range collar | `collar-tag` (w3) | ticked; keep ID-tag engraving as remaining sub-note? Collar bought, tag still needed → split: mark collar bought, add new item `id-tag` for engraved tag + licence disc (NOT bought) |
| TropiClean Fresh Breath kit (TripleFlex brush + gel) | no existing item! dental was never in plan | add new item `dental-kit` (w5 grooming kit), bought |
| KONG Brush (cleaning brush for KONGs) | none | add `kong-brush` (w6), bought |
| Trixie slow-feed mat | none (bowls exist) | add `slow-feeder` (w5), bought |
| LickiMat UFO | `kong-lickmat` covers "lick mat" | ticked already; relabel to actual products (KONG Puppy + KONG Classic + LickiMat UFO) |
| Snuffle mat | `puzzle` (w6 "beginner puzzle feeder / snuffle mat") | already ticked |
| KONG Squid, KONG Classic pink, KONG Teething Stick, KONG Puppy | `chew-toys` (w6 chew + teething toys ×6) + `kong-lickmat` | mark `chew-toys` bought; relabel to reflect the actual arsenal |
| Beeztees teal tug, mop-style toy, fleece rope tug | part of `chew-toys` count | covered |
| Rabbit-skin natural chew 85g | `chew-edibles` (w8) | mark bought early |

## Decisions
- Update shoppingPlan.ts labels of bought items to reflect real products (keepsake accuracy) while keeping stable ids.
- Add new bought items: dental-kit (w5), kong-brush (w6), slow-feeder (w5).
- Split collar-tag: collar bought; NEW item `id-tag` (engraved ID tag + AVS licence disc holder) in w3 — NOT bought → appears in catch-up.
- DB update: set chew-toys=true, chew-edibles=true, dental-kit=true, kong-brush=true, slow-feeder=true (keep existing trues).
- Priority view: page already has "Catch-up" (overdue from past weeks) + this-week ordering. Add a "Still to buy — in priority order" summary? The timeline already orders by week; catch-up shows overdue. Good enough; ensure remaining items list correct.

## Remaining (not bought) after update, in plan order
w1: crate-iata, home-crate, playpen-gates, measure-corner (all overdue — top priority)
w2: bed-mat, blankets, snuggle-toy, white-noise (this week 27 Jul–2 Aug)
w3: id-tag (new), carry-sling
w4: insurance, avs-course, vet-shortlist, post-blanket
w5: bowls, grooming-tools, nail-styptic, food-scale
w6: (chew-toys bought, kong-lickmat bought, puzzle bought) → puppy-proof already ticked → w6 complete
w7: pads-cleaner, poo-bags, wipes-towels, import-licence
w8: breeder-food, training-treats, flight-confirm (chew-edibles bought)
w9: fresh-extras, frozen-kongs, setup-flat, changi-kit
