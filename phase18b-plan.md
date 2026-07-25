# Phase 18b — Demo videos for ALL 12 tricks (user request 2026-07-26)

User request: "Generate videos for every single trick. Upload the videos in the same formatted location for each trick. Ensure the video accurately shows what the trick is stating to do. Ensure lightweight and loopable version instead of the full video size."

## Approach (proven on Sit — video already approved by user, no per-video approval loop needed)
The Sit video pipeline is the template. For each trick:
1. Generate 8s video with `generate_video` model=gemini-omni-flash-preview, aspect_ratio=landscape, duration 8s, reference image = trick illustration (download the webp first), prompt = gouache storybook style + accurate trick motion. Include in prompt: "Duration: 8 seconds. Aspect ratio: 16:9. Resolution: 720p. Audio: none needed (video will be muted)."
2. Process: `ffmpeg -i in.mp4 -an -vf "scale=960:540" -c:v libx264 -crf 26 -preset slow -movflags +faststart out.mp4` → ~500KB
3. Upload: `cd /home/ubuntu/webdev-static-assets && manus-upload-file --webdev trick-<id>-loop.mp4` → record /manus-storage/ path
4. Wire into tricks.ts `video:` field per trick.

## Code state (ALREADY DONE, uncommitted)
- tricks.ts: `video?: string` added to Trick interface; sit has video: "/manus-storage/trick-sit-loop_bc0e1fa2.mp4"
- TrickDetail.tsx: "Watch it in action" section added between Steps and Pro tip, renders when trick.video exists: <video src poster={trick.image} autoPlay muted loop playsInline preload="metadata" className="w-full aspect-video object-cover"> inside keepsake-card
- tsc clean. No checkpoint saved yet since e4756196.

## Trick roster (12) — illustration storage paths (posters + video refs)
| id | name | image storage path | video status |
|---|---|---|---|
| sit | Sit | /manus-storage/trick-sit_a79cad14.webp | DONE /manus-storage/trick-sit-loop_bc0e1fa2.mp4 |
| down | Down | /manus-storage/trick-down_5c118aef.webp | todo |
| recall | Come (Recall) | /manus-storage/trick-recall_43152dab.webp | todo |
| stay | Stay | /manus-storage/trick-stay_2e0cb0df.webp | todo |
| touch | Touch | /manus-storage/trick-touch_b5f6d32a.webp | todo |
| leaveit | Leave It | /manus-storage/trick-leaveit_54e5f9f7.webp | todo |
| dropit | Drop It | /manus-storage/trick-dropit_2f056717.webp | todo |
| paw | Shake / Paw | /manus-storage/trick-paw_1affa1ae.webp | todo |
| spin | Spin | /manus-storage/trick-spin_d800a946.webp | todo |
| rollover | Roll Over | /manus-storage/trick-rollover_1ffc82ec.webp | todo |
| ??? (11th) | read tricks.ts lines 340+ | ? | todo |
| ??? (12th) | read tricks.ts lines 340+ | ? | todo |

NOTE: tricks.ts has 12 tricks total; last two (after rollover) not yet read — read client/src/content/tricks.ts lines 340-end to get ids/names/images/steps.

## Trick motion summaries (for accurate prompts, from steps in tricks.ts)
- down: from a sit, treat lured from nose straight down to floor between front paws then dragged forward; puppy folds elbows down into sphinx lie-down; treat fed low on floor.
- recall: person crouches with open arms a few metres away, calls happily; puppy runs joyfully to them, arrives to treats+praise celebration.
- stay: puppy holds a sit while handler shows flat palm "stay" hand signal, steps back one step, returns and rewards; puppy remains still.
- touch: flat palm presented near puppy nose; puppy reaches out and boops nose to palm; treat from other hand.
- leaveit: treat on floor/open palm; puppy looks at it then deliberately turns head away / backs off toward handler; rewarded from other hand.
- dropit: puppy holding a toy in mouth; treat presented at nose; puppy opens mouth releasing toy into hand below; gets treat, toy offered back.
- paw: puppy sitting, lifts front paw and places it in a person's open palm, gentle handshake.
- spin: treat held at nose height lured in a wide flat circle; puppy follows nose and twirls a full happy rotation on grippy floor.
- rollover: puppy in a down, treat lured toward shoulder; rolls onto side then all the way over onto back and around to other side, then pops up happily.

## Style block for all video prompts (match Sit video / app aesthetic)
"Hand-painted gouache storybook animation style, soft visible brushstrokes, textured cream paper background (#F8F3EB), palette of ink navy (#22364D), warm sienna (#C66A3D), sage green (#7B8C6A). The puppy is Wobbles, a small fluffy red-and-white parti Cavoodle puppy (apricot/red patches on white, floppy ears, dark button eyes). Gentle, warm, cozy children's-book feel. Smooth subtle animation, gentle looping motion. No text, no watermarks."
Human hands (when needed): simple painted style, warm skin tone, navy sleeve.

## Remaining steps after wiring
- pnpm test + npx tsc --noEmit (expect 221 pass, 0 errors)
- Browser verify a few /journey/tricks/:id pages
- webdev_save_checkpoint (auto-publishes to wobblesapp-2cxvdpqb.manus.space)
- git push github main (remote "github", repo marcustayye93/wobbles-handbook)
- Deliver; note other Manus account needs same update (they need to upload their own copies of the loop mp4s and set their own storage paths in tricks.ts)

## Known non-issues
- Stale vite console error re @/pages/Growth from Jul 25 — pre-existing, tsc clean, ignore.
