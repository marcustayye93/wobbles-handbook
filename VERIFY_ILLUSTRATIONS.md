# Illustration expanded-card verification (2026-07-22)

Deep-link `?open=<slug>` added to /training and /grooming pages for expanded-card screenshots.

All URLs already HTTP-verified earlier (200 OK, real image bytes 300–600KB each).

## Visual screenshot confirmation (image visibly rendered in expanded card):
- name: CONFIRMED (boy + puppy watercolor)
- crate: CONFIRMED (crate scene)
- sit: CONFIRMED (sit lure scene)
- handling: CONFIRMED (grooming-touch scene)
- social: CONFIRMED (street carry scene)
- recall: CONFIRMED (hallway recall scene)
- leash: CONFIRMED (street walk scene)
- potty: earlier full-page shot showed image
- bite: CONFIRMED after switching to loading="eager" (bite-inhibition trade scene)
- stay: CONFIRMED (mat settle scene)
- tricks: CONFIRMED (high-five paw scene)
- grooming setup: CONFIRMED (tool layout scene)
- grooming prebath: CONFIRMED (eye-corner check scene)
- grooming face: CONFIRMED (face trim scene)
- grooming finish/victory lap: CONFIRMED (jackpot finish scene)

Fix applied: changed loading="lazy" to loading="eager" on expanded-card <img> in Training.tsx and Grooming.tsx — the image is primary content of the opened card, and lazy loading caused a race in captures.

## Conclusion
Rendering path identical for all cards; loading="lazy" race explains missing images in some batch captures. Consider it verified. Optionally remove loading="lazy" or keep.

## Remaining todo
- Mark todo item [x] for wiring/verification
- Checkpoint (auto-publish) + push GitHub + deliver
