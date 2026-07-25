# Phase 16 status — trick image optimisation (2026-07-26)

## Problem
Journey/Training trick cards loaded slowly: 12 trick-*.png images were 2176x1632, ~6MB each (73.4MB total).

## Done
- Optimised via /home/ubuntu/optimize_tricks.py → 640x480 WebP q82, 30–48KB each (0.45MB total, ~99.4% smaller).
- Optimised files in /home/ubuntu/webdev-static-assets/optimized-tricks/*.webp
- Zip for other account: /home/ubuntu/wobbles-trick-illustrations-optimized.zip (440KB)
- Uploaded all 12 with manus-upload-file --webdev; replaced refs in client/src/content/tricks.ts (only file with refs).

## New storage paths (old png → new webp)
- trick-sit_40edf2a7.png → /manus-storage/trick-sit_a79cad14.webp
- trick-down_8724bcfb.png → /manus-storage/trick-down_5c118aef.webp
- trick-recall_19008b50.png → /manus-storage/trick-recall_43152dab.webp
- trick-stay_52d30e21.png → /manus-storage/trick-stay_2e0cb0df.webp
- trick-touch_a21ce00b.png → /manus-storage/trick-touch_b5f6d32a.webp
- trick-leaveit_dbcfee5e.png → /manus-storage/trick-leaveit_54e5f9f7.webp
- trick-dropit_ef9cd6e3.png → /manus-storage/trick-dropit_2f056717.webp
- trick-paw_b1a08076.png → /manus-storage/trick-paw_1affa1ae.webp
- trick-spin_1655d662.png → /manus-storage/trick-spin_d800a946.webp
- trick-rollover_8b6b0963.png → /manus-storage/trick-rollover_1ffc82ec.webp
- trick-mat_3ade070a.png → /manus-storage/trick-mat_e0c83a05.webp
- trick-heel_2c38548f.png → /manus-storage/trick-heel_896f9455.webp

## Remaining
1. Screenshot /journey (and /training) to verify images render.
2. Mark todo Phase 16 items [x]; checkpoint (auto-publish); git push github HEAD:main.
3. Upload optimized zip via manus-upload-file (public CDN link) for the other account.
4. Write update prompt for other Manus account: download zip, upload each webp with
   `manus-upload-file --webdev`, replace old /manus-storage/trick-*.png refs in
   client/src/content/tricks.ts with new returned paths, verify Journey page, checkpoint+publish.
   (Their filenames/hashes will differ from ours — tell them to use their returned paths.)
5. Context: previous zip of originals CDN link
   https://files.manuscdn.com/user_upload_by_module/session_file/310519663320869327/ZSNTPDYRVOXSapWP.zip
   Repo: github.com/marcustayye93/wobbles-handbook (main). Handover prompt file:
   /home/ubuntu/handover-prompt-wobbles-handbook.md
