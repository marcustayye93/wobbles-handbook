/*
 * RETIRED — the app now syncs all family data through the server
 * (see client/src/hooks/useSyncedData.ts). This module used to hold the
 * on-device localStorage state hook; the only remaining touch-points with
 * localStorage are inside useSyncedData's one-time legacy importer, which
 * reads the old "wobbles:*" keys directly.
 *
 * Date helpers moved to client/src/lib/dates.ts.
 * This file is kept only so stale imports fail loudly in review rather than
 * silently re-introducing device-local state. Do not add new exports here.
 */
export {};
