# Session notes — Grooming masterclass card on Guides page

## Status: implementation complete, verified

- User asked: home-grooming masterclass should be one of the big illustrated
  chapter cards on the Guides page (/handbook), like the screenshots of
  Chapter 1/2/3 cards.
- Done in `client/src/pages/HandbookIndex.tsx`:
  - Added a full-width illustrated cover card for the Home Grooming Master Class
    at the END of the "Chapter covers" list, labelled
    "Chapter {PUPPY_SECTIONS.length + 1} · Masterclass", 14 min read,
    tagline "Fortnightly bath + basic trim, start to finish".
  - Reuses existing cover image `CHAPTER_COVERS["grooming-masterclass"]`
    (/manus-storage/v2-ch-grooming_dda950a4_32b8bac4.png) — verified HTTP 200.
    No new image generation needed.
  - Removed the old small "Home Grooming Master Class" sticker row from the
    Skill guides section (removed Scissors import too) to avoid duplication.
- Done in `client/src/pages/Grooming.tsx`:
  - Added scroll-based reading progress (same pattern as SectionReader,
    rounded to 5%, furthest point) saved via useReadProgress() under the
    shared key "grooming" → drives the progress ring on the new card.
- tsc clean, 339/339 vitest pass, mobile full-page screenshot verified:
  card renders after "Best of the Internet" with cover, chapter label,
  title, read time, tagline.
- Remaining: checkpoint + GitHub push + delivery (todo.md items).
