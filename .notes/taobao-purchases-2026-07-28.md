# Taobao purchases (user screenshots, 28 Jul 2026)

Dog-relevant orders (all 待发货 / awaiting shipment, ship-to SG):
1. Pet dog playpen 白色 120×60×60 cm, 6 panels — ¥130 (paid ¥141.70 incl direct shipping) — PetsLove 宠爱家居馆 → maps to `playpen-gates` (w1)
2. Pet PVC waterproof anti-pee mat 60×120 cm, sea-salt blue stripe — ¥23.69 (paid ¥26.21) — 囍吖旗舰店 → best fit: pen-floor protection; relates to toilet/pads setup; treat as bonus note on `pads-cleaner`? No — it's a floor mat for the pen; attach to `playpen-gates` note as pen flooring.
3. Grooming scissors set (upgraded full steel): 7" curved + 7" straight + 6.5" thinning + comb, with case/finger-guard/oil/cloth — ¥55.46 (paid ¥61.12) — 柒哦宠物用品旗舰店 → maps to `clippers` (already had shears note? clippers item says 7" straight + 6.5" thinning shears ✔ bought 27 Jul — this looks like the ACTUAL scissors order; also mark grooming shears done; also styptic still open under nail-styptic)
4. 奇愈记 detangling leave-in spray 顺毛免洗喷雾 120 ml — ¥83 (paid ¥90.47) — simoopet 森萌宠物用品 → no exact plan item; grooming extra → append to `grooming-tools` note (still needs shampoo & conditioner)
5. KOJIMA thick pet wipes 80 pulls ×5 packs — ¥10.79×5 (paid ¥59.44) — kojima 旗舰店 → maps to `wipes-towels` (w7) — wipes half done, towels still needed
6. Biodegradable poo bags 10 rolls / 150 bags + pill-shaped dispenser — ¥8.71 (paid ¥9.49) — 甜宠屋 → maps to `poo-bags` (w7) — fully covers bags + dispenser

Non-dog household items (ignore): 维达 toilet paper, ceiling fan light 卡曼照明 ¥129, SL.paint artwork.

Note: scissors screenshot (IMG_0497) is the product page of the same 柒哦 order (¥62.91 list, paid ¥55.46/61.12).

Plan updates:
- playpen-gates: mark bought ✔ (white 6-panel 120×60×60 pen + PVC pen mat)
- clippers: already marked bought; update note — shears order now placed (7" straight + 7" curved + 6.5" thinning + comb kit)
- grooming-tools: append detangle spray bought; still needs shampoo/conditioner
- poo-bags: mark bought ✔ (150 biodegradable bags + dispenser)
- wipes-towels: partial — wipes bought (KOJIMA ×5), towels ×3 still needed → keep unticked, update label with ✔ wipes
- nail-styptic: unchanged (grinder + styptic still open)

Tick seeding: shared "shopping" map in shared_state keyed by item id. Seed ticks server-side for playpen-gates and poo-bags via SQL/router? Prior purchases (bed-mat, harness, etc.) were handled by editing labels with "✔ bought" AND (check) whether ticks were pre-seeded in shared_state. Check Shopping.tsx + useSyncedData for how ticks stored; earlier PetO work said "ticks shared with master shopping plan". Approach: update labels/why in content + seed ticks in DB shared_state shopping map so both phones show ticked.

## DB state (shared_state, stateKey='shopping', checked 28 Jul)
Currently true: bed-mat, bowls, chew-edibles, chew-toys, clippers, collar-tag, crate-iata, dental-kit, harness, home-crate, kong-brush, kong-lickmat, lead, puppy-proof, puzzle, slow-feeder, toilet-tray, wipes-towels.
Note: wipes-towels is ALREADY ticked true (user must have ticked). So wipes purchase reinforces it — update label to reflect wipes bought, keep tick.
To seed: playpen-gates=true, poo-bags=true (via JSON_SET on the value column, preserving other keys).

## Final edit plan
1. shoppingPlan.ts label/why edits:
   - playpen-gates → "✔ bought" white 6-panel pen 120×60×60 + PVC waterproof pen mat (sea-salt blue, 60×120)
   - clippers why → add: full-steel shears kit ordered 28 Jul (7" straight + 7" curved + 6.5" thinning + comb, case/oil included)
   - grooming-tools why → add: detangling leave-in spray (奇愈记 120 ml) bought 28 Jul; still needs puppy shampoo + conditioner
   - poo-bags → "✔ bought" 150 biodegradable bags (10 rolls) + dispenser
   - wipes-towels → "✔ wipes bought" KOJIMA thick wipes 80×5; towels ×3 still to grab
2. SQL: UPDATE shared_state SET value = JSON_SET(value, '$."playpen-gates"', true, '$."poo-bags"', true) WHERE stateKey='shopping';
3. PetO run page (petoRun.ts): check for overlapping items — poo bag dispenser (FuzzYard) now covered by Taobao dispenser; grooming detangle spray not on PetO list; update petoRun poo-bag item note/status if such item exists (peto run had "Poo bag dispenser FuzzYard $12.99" — mark as no longer needed).
4. Tests: shoppingPlan content tests may assert labels — check server/*.test.ts or client tests referencing labels.
