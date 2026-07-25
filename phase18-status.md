# Phase 18 status — Sit trick video integration

## Done
- Generated 8s gouache Sit trick video (approved by user): /home/ubuntu/webdev-static-assets/trick-sit-video.mp4 (with audio, 1.8MB)
- Processed muted lightweight loop: ffmpeg -an, h264 crf26, 960x540, faststart → /home/ubuntu/webdev-static-assets/trick-sit-loop.mp4 (545KB, 8.0s, video-only stream)
- Uploaded: Storage Path = /manus-storage/trick-sit-loop_bc0e1fa2.mp4

## Requirements (user)
- Video below "How to train it" section (line ~165-183 in client/src/pages/TrickDetail.tsx, the Steps section)
- No sound for ALL videos (muted, no audio track — done at encode level)
- Lightweight loopable mp4 in code (autoPlay muted loop playsInline)
- ALL trick videos go in that same slot below How to train it

## To do
- tricks.ts: add optional `video?: string` field to Trick interface; set video on sit trick = "/manus-storage/trick-sit-loop_bc0e1fa2.mp4"
- TrickDetail.tsx: after Steps section (How to train it), add "Watch it in action" section rendered only when trick.video exists: <video src autoPlay muted loop playsInline poster={trick.image} className keepsake-card rounded>
- Check server/tricks or content tests: caretakerGuide.content.test.ts exists; check if tricks content test exists, update if needed
- pnpm test + tsc
- Verify /journey/tricks/sit renders video
- Checkpoint (auto-publish), git push github main
- Update prompt for other Manus account? User didn't explicitly re-ask this time — mention in delivery that other account needs similar update; previous pattern: they want prompt. Include short prompt in delivery message or file.

## Key facts
- Repo: marcustayye93/wobbles-handbook, remote name "github", branch main
- Live site: wobblesapp-2cxvdpqb.manus.space
- Sit trick image: /manus-storage/trick-sit_a79cad14.webp
- Trick detail route: /journey/tricks/:id
- Known stale vite error about @/pages/Growth in logs (from Jul 25 15:02, pre-existing/stale; tsc clean)
