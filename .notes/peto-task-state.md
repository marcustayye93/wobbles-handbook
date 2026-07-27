# Task state — PetO Brisbane run feature (27 Jul 2026)

User request: list of things to buy at PetO in Brisbane, with specific products, revisitable in the app.

## Done
- Research complete: .notes/peto-brisbane-gaps-2026-07-27.md (stores + verified products) and /home/ubuntu/peto_product_research.json
- Created client/src/content/petoRun.ts — PETO_RUN (11 items, verified peto.com.au products+prices+URLs, priorities grab-first/standard/optional, travel notes), PETO_STORES (7 Brisbane stores), PETO_RUN_DATE_NOTE. Item ids REUSE master shoppingPlan ids (blankets, breeder-food, lead, carry-sling, bowls, grooming-tools, training-treats, poo-bags, pads-cleaner, nail-styptic, snuggle-toy) so ticks share the "shopping" map.

## Remaining steps
1. Create client/src/pages/PetoRun.tsx — Keepsake Field Guide style page (PageShell, PageHeader back="/shopping" or /handbook, keepsake-card, Eyebrow, ProgressRing, useSharedState("shopping"), press-scale). Colors: INK #22364D, SIENNA #C66A3D, RUST #B4512E, MOSS #7B8C6A. Show: hero w/ progress + date note, grab-first section, standard, optional sections, product pick w/ price + link (external a tags), alternatives, travel notes, store list (7 stores, bestFor callouts for Spring Hill + Browns Plains).
2. Register route in client/src/App.tsx (e.g. /peto-run), add entry link on Shopping.tsx page (banner card "Doing a PetO run in Brisbane?" linking to /peto-run).
3. Update todo.md with [x] item.
4. pnpm test (vitest), screenshot verify /peto-run and /shopping (mobile 390x844 default project is mobile-styled).
5. webdev_save_checkpoint (auto-publishes; domain wobblesapp-2cxvdpqb.manus.space).
6. Deliver result message: summary of list + attach manus-webdev://version_id. Note user can tick items; ticks sync with master shopping list.

## Key facts for delivery message
- 7 Brisbane PetO stores; best: Spring Hill (CBD, 8am open), Browns Plains (near breeder direction, DIY wash+vet+groomer).
- ~$280 AUD for core run (blanket ×2 ~$70, lead $17.99, carrier $89.99, bowl $18.99, shampoo+cond $62.98, treats $15.99, poo bags $12.99).
- Heartbeat toy NOT at PetO — order online (eDog AU / Amazon AU).
- Liquids (shampoo, enzyme cleaner) → checked luggage; grinder battery → carry-on.
- PetO perks: price beat by 10%, free 2-hr delivery >$149, Puppy & Kitten Club.
