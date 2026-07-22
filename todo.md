# ChatGPT UX Audit — Appraisal & Implementation Plan

(The previous redesign-v2 todo is fully complete and shipped at checkpoint d341a36e; this file now tracks the UX-audit follow-up.)

## Appraisal (expert web dev view)

| # | Finding | Verdict | Rationale |
|---|---------|---------|-----------|
| 1 | Action-first Home order | ACCEPT | Quick actions + today's timeline high on Home; keep hero as identity anchor |
| 2 | Quick Actions row on Home | ACCEPT | One-tap chips → bottom sheet; maps to existing trackers |
| 3 | Unified daily timeline | ACCEPT | "Today" feed merging all tracker entries chronologically on Home |
| 4 | "Wobbles Today" upgraded Right Now | ACCEPT (light) | Stage-aware focus/behaviour/training data by age week; already have age engine |
| 5 | Smart contextual cards | ACCEPT (merged into 4) | Rule-based nudges: no toilet logs, brush due, resume chapter |
| 6 | Tracker cards as quick-entry surfaces | ACCEPT | Show last entry on hub cards; quick-add button opens sheet, row opens full page |
| 7 | Simplify FAB → direct quick log sheet | ACCEPT | FAB opens QuickLogSheet with tracker grid + inline mini-form |
| 8 | Global search | ACCEPT | Client-side index over chapters/100 things/checklists/singapore; header icon → dialog |
| 9 | Expand Memories into combined feed | ACCEPT (light) | Merge tracker "firsts"/highlights + milestones into timeline |
| 10 | Lock Screen widgets | REJECT | Not possible in a PWA; native-only API |
| 11 | Apple Watch app | REJECT | Native-only; out of scope for web app |
| 12 | Live Activities | REJECT | Native-only (iOS ActivityKit) |
| 13 | Smart Suggestions engine | PARTIAL | Simple rule-based nudges only (covered by 4/5); no fake "AI" |
| V | Max one decorative motif per screen, more whitespace | ACCEPT | Restraint pass where motifs stack |

## Implementation todo

- [ ] Build QuickLogSheet component (vaul drawer): tracker grid + inline mini-form per tracker, saves via existing trackers lib
- [ ] Wire FAB (Trackers hub) to QuickLogSheet directly
- [ ] Home: add Quick Actions row opening QuickLogSheet with preselected tracker
- [ ] Build unified "Today" timeline component (merges all tracker entries, newest first) on Home under Quick Actions
- [ ] Upgrade Right Now → "Wobbles Today": stage data (focus, expect, training tip) + rule-based nudge chips
- [ ] Trackers hub: show last-entry summary on each card; quick-add opens sheet
- [ ] Global search: build index + SearchDialog, trigger from Home header + Chapters page
- [ ] Memories: fold tracker highlights into the timeline feed
- [ ] Restraint pass: reduce decorative motif stacking where it occurs
- [ ] tsc + mobile screenshots
- [ ] Checkpoint + push to GitHub
- [ ] Deliver with accepted/rejected table
