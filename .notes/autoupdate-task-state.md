# Auto-update feature — task state (2026-07-27)

## User request
Build "item 3": auto-update mechanism so the PWA detects new deployments and reloads itself (no manual hard-refresh).

## Implementation (DONE, all code in working tree, NOT yet checkpointed)
1. `vite.config.ts`: added `vitePluginBuildVersion()` — emits `/version.json` `{buildId}` at build (generateBundle) + serves it in dev (configureServer middleware); `define: { __APP_BUILD_ID__: JSON.stringify(BUILD_ID) }`. BUILD_ID = `build-<ts36>` or env BUILD_ID.
2. `client/src/lib/autoUpdate.ts`: startAutoUpdate() — polls /version.json (no-store) on launch (+3s), visibilitychange→visible, online, and every 5 min; compares with __APP_BUILD_ID__; guards reload loop with sessionStorage key `wobbles-reloaded-for`; defers if user typing; on update: SW reg.update(), caches.delete all, location.reload().
3. `client/src/main.tsx`: imports startAutoUpdate; bottom block now `if (import.meta.env.PROD) { register sw.js with updateViaCache:'none'; startAutoUpdate(); }`.
4. `client/public/sw.js`: cache bumped to `wobbles-handbook-v3`; added bypass `if (url.pathname === "/version.json") return;`.

## Important findings
- IMPORTANT: this app has NO login (family-private by URL) — main.tsx says "No login in this app"; earlier message to user about login redirect was based on template default. Production root responded with redirect earlier though (maybe manus privacy setting).
- BUILD-STRIP BUG root cause found: my shell session has `NODE_ENV=development` exported, so `pnpm vite build` set import.meta.env.PROD=false → SW/autoUpdate block dead-code-eliminated. With `env -u NODE_ENV pnpm build` the bundle contains sw.js, wobbles-reloaded-for, and the inlined buildId matching version.json. Real deployment builds are fine (they don't inherit my shell env).
- Verified: tsc clean, 339/339 vitest pass.

## Current problem (unresolved)
Dev preview renders a BLANK page (screenshots blank at /, /handbook/shopping/peto-run; browser_navigate also blank, zero elements, no console errors, no error logs in .manus-logs). HTML serves fine via curl; /src/main.tsx transform loads; autoUpdate.ts transforms fine (define NOT applied in dev serve? raw __APP_BUILD_ID__ remains but it's inside try/catch so OK).
- Blankness started after vite.config.ts change ("Re-optimizing dependencies because vite config has changed").
- Possible causes to try: hard restart dev server (webdev_restart_server), clear node_modules/.vite (already did once), check if `rm -rf dist` or memory pressure OOM-killed something, check if page just needs longer to load (deps reoptimizing on first hit).
- NOTE: memory pressure warning appeared earlier; repeated builds may have caused it. dist/ folders were cleaned.

## Remaining steps
1. Fix blank dev preview (likely restart dev server).
2. Screenshot verify.
3. Mark todo.md items [x] (added under "# Auto-update mechanism (user...").
4. webdev_save_checkpoint (auto-publishes).
5. git push github main.
6. Deliver result message.

## Post-deploy verification (2026-07-27)
- Checkpoint 755899fb saved (auto-published), pushed github main @ 755899f.
- Production /version.json returns 302 → manus.im/app-auth for UNAUTHENTICATED curl. This is the platform-level privacy gate (site visibility restricted), NOT an app bug. Logged-in users' browsers hold the session cookie, so their fetch of /version.json succeeds (fetch with credentials: same-origin default — verify autoUpdate uses credentialed fetch!).
- CHECK: autoUpdate.ts fetch must include credentials (same-origin is fetch default, OK) and must handle non-JSON (302→HTML login page) gracefully — it try/catches, so worst case: no update detected while logged out, which is fine.
