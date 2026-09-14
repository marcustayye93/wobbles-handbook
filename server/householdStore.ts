import fs from "node:fs";
import path from "node:path";

const DATA_DIR = process.env.HOUSEHOLD_DATA_DIR || path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "household.json");
const PHOTO_DIR = path.join(DATA_DIR, "photos");

type TrackerRow = {
  id: number; trackerId: string; date: string; time: string | null;
  option: string | null; value: string | null; note: string | null;
  createdBy: number | null; createdByName: string | null; createdAt: string;
};
type SharedRow = { id: number; stateKey: string; value: unknown; updatedBy: number | null; updatedAt: string };
type PhotoRow = {
  id: number; fileKey: string; url: string; thumbUrl: string; caption: string | null;
  date: string; placeId: string | null; createdBy: number | null; createdByName: string | null;
  createdAt: string; mimeType: string;
};
type ConvoRow = { id: number; title: string; createdBy: number | null; createdByName: string | null; createdAt: string; updatedAt: string };
type MsgRow = { id: number; conversationId: number; role: "user" | "assistant"; content: string; authorName: string | null; createdAt: string };
type MemRow = { id: number; fact: string; category: string; sourceConversationId: number | null; active: number; createdAt: string };
type Store = {
  next: Record<string, number>;
  trackers: TrackerRow[]; shared: SharedRow[]; photos: PhotoRow[];
  conversations: ConvoRow[]; messages: MsgRow[]; memory: MemRow[];
};

function empty(): Store {
  return { next: { trackers: 1, shared: 1, photos: 1, conversations: 1, messages: 1, memory: 1 },
    trackers: [], shared: [], photos: [], conversations: [], messages: [], memory: [] };
}
let cache: Store | null = null;
function ensureDirs() { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.mkdirSync(PHOTO_DIR, { recursive: true }); }
function load(): Store {
  if (cache) return cache;
  ensureDirs();
  if (fs.existsSync(STORE_PATH)) {
    try { cache = JSON.parse(fs.readFileSync(STORE_PATH, "utf8")); return cache!; } catch { /* reset */ }
  }
  cache = empty(); save(); return cache;
}
function save() {
  ensureDirs();
  const tmp = STORE_PATH + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(cache ?? empty(), null, 2));
  fs.renameSync(tmp, STORE_PATH);
}
function alloc(kind: string) { const s = load(); const id = s.next[kind] ?? 1; s.next[kind] = id + 1; return id; }

export function listTrackerEntries(limit = 2000) {
  return [...load().trackers].sort((a, b) => b.date.localeCompare(a.date) || (b.time || "").localeCompare(a.time || "") || b.id - a.id)
    .slice(0, limit).map((r) => ({ ...r, createdAt: new Date(r.createdAt) }));
}
export function addTrackerEntry(entry: any): number {
  const s = load(); const id = alloc("trackers");
  s.trackers.push({ id, trackerId: entry.trackerId, date: entry.date, time: entry.time ?? null, option: entry.option ?? null,
    value: entry.value ?? null, note: entry.note ?? null, createdBy: entry.createdBy ?? null, createdByName: entry.createdByName ?? null,
    createdAt: new Date().toISOString() });
  save(); return id;
}
export function addTrackerEntriesBulk(entries: any[]) { for (const e of entries) addTrackerEntry(e); }
export function deleteTrackerEntry(id: number) { const s = load(); s.trackers = s.trackers.filter((r) => r.id !== id); save(); }
export function hasAnyTrackerEntries() { return load().trackers.length > 0; }
export function getAllSharedState() { return load().shared.map((r) => ({ ...r, updatedAt: new Date(r.updatedAt) })); }
export function setSharedState(stateKey: string, value: unknown, updatedBy?: number) {
  const s = load(); const existing = s.shared.find((r) => r.stateKey === stateKey);
  if (existing) { existing.value = value; existing.updatedBy = updatedBy ?? null; existing.updatedAt = new Date().toISOString(); }
  else s.shared.push({ id: alloc("shared"), stateKey, value, updatedBy: updatedBy ?? null, updatedAt: new Date().toISOString() });
  save();
}
export function getSharedState(stateKey: string) {
  const row = load().shared.find((r) => r.stateKey === stateKey);
  return row ? { ...row, updatedAt: new Date(row.updatedAt) } : undefined;
}
export function patchSharedState(stateKey: string, entries: Record<string, unknown>, deletes: string[], updatedBy?: number) {
  const existing = getSharedState(stateKey);
  const base = existing && existing.value && typeof existing.value === "object" && !Array.isArray(existing.value)
    ? { ...(existing.value as Record<string, unknown>) } : {};
  const merged = { ...base, ...entries };
  for (const k of deletes) delete merged[k];
  setSharedState(stateKey, merged, updatedBy);
  return merged;
}
export interface ImportAuditEntry { at: string; by: number; byName: string | null; count: number; }
export async function appendImportAuditLog(entry: ImportAuditEntry) {
  const existing = getSharedState("legacyImportLog");
  const log: ImportAuditEntry[] = Array.isArray(existing?.value) ? existing!.value as ImportAuditEntry[] : [];
  log.push(entry); setSharedState("legacyImportLog", log.slice(-50), entry.by);
}
export function listPhotos() {
  return [...load().photos].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id).map((r) => ({ ...r, createdAt: new Date(r.createdAt) }));
}
export function addPhoto(photo: any): number {
  const s = load(); const id = alloc("photos");
  s.photos.push({ id, fileKey: photo.fileKey, url: photo.url, thumbUrl: photo.thumbUrl || photo.url, caption: photo.caption ?? null,
    date: photo.date, placeId: photo.placeId ?? null, createdBy: photo.createdBy ?? null, createdByName: photo.createdByName ?? null,
    createdAt: new Date().toISOString(), mimeType: photo.mimeType || "image/jpeg" });
  save(); return id;
}
export function updatePhotoUrls(id: number, url: string, thumbUrl: string) {
  const row = load().photos.find((p) => p.id === id);
  if (row) { row.url = url; row.thumbUrl = thumbUrl; save(); }
}
export function getPhotoById(id: number) {
  const row = load().photos.find((p) => p.id === id);
  return row ? { ...row, createdAt: new Date(row.createdAt) } : undefined;
}
export function deletePhoto(id: number) {
  const s = load(); s.photos = s.photos.filter((p) => p.id !== id); save();
  for (const name of [`${id}.bin`, `${id}.thumb`]) {
    const p = path.join(PHOTO_DIR, name); if (fs.existsSync(p)) fs.unlinkSync(p);
  }
}
export function writePhotoBlobs(id: number, original: Buffer, thumb: Buffer) {
  ensureDirs();
  fs.writeFileSync(path.join(PHOTO_DIR, `${id}.bin`), original);
  fs.writeFileSync(path.join(PHOTO_DIR, `${id}.thumb`), thumb);
}
export function readPhotoBlob(id: number, kind: "original" | "thumb") {
  const p = path.join(PHOTO_DIR, kind === "thumb" ? `${id}.thumb` : `${id}.bin`);
  return fs.existsSync(p) ? fs.readFileSync(p) : null;
}
export function createAiConversation(title: string, createdBy?: number, createdByName?: string | null) {
  const s = load(); const id = alloc("conversations"); const now = new Date().toISOString();
  s.conversations.push({ id, title, createdBy: createdBy ?? null, createdByName: createdByName ?? null, createdAt: now, updatedAt: now });
  save(); return id;
}
export function listAiConversations(limit = 100) {
  return [...load().conversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, limit)
    .map((r) => ({ ...r, createdAt: new Date(r.createdAt), updatedAt: new Date(r.updatedAt) }));
}
export function getAiConversation(id: number) {
  const row = load().conversations.find((c) => c.id === id);
  return row ? { ...row, createdAt: new Date(row.createdAt), updatedAt: new Date(row.updatedAt) } : undefined;
}
export function touchAiConversation(id: number) {
  const row = load().conversations.find((c) => c.id === id);
  if (row) { row.updatedAt = new Date().toISOString(); save(); }
}
export function deleteAiConversation(id: number) {
  const s = load(); s.messages = s.messages.filter((m) => m.conversationId !== id);
  s.conversations = s.conversations.filter((c) => c.id !== id); save();
}
export function addAiMessage(msg: { conversationId: number; role: "user" | "assistant"; content: string; authorName?: string | null }) {
  const s = load(); const id = alloc("messages");
  s.messages.push({ id, conversationId: msg.conversationId, role: msg.role, content: msg.content, authorName: msg.authorName ?? null, createdAt: new Date().toISOString() });
  save(); return id;
}
export function listAiMessages(conversationId: number, limit = 500) {
  return load().messages.filter((m) => m.conversationId === conversationId).sort((a, b) => a.id - b.id).slice(0, limit)
    .map((r) => ({ ...r, createdAt: new Date(r.createdAt) }));
}
export function lastAiMessagePreview(conversationId: number) {
  const rows = listAiMessages(conversationId); return rows[rows.length - 1];
}
export function listActiveAiMemory() {
  return load().memory.filter((m) => m.active === 1).sort((a, b) => b.id - a.id).map((r) => ({ ...r, createdAt: new Date(r.createdAt) }));
}
export function countActiveAiMemory() { return load().memory.filter((m) => m.active === 1).length; }
export function addAiMemoryFacts(facts: { fact: string; category: string; sourceConversationId?: number | null }[]) {
  const s = load();
  for (const f of facts) s.memory.push({ id: alloc("memory"), fact: f.fact, category: f.category, sourceConversationId: f.sourceConversationId ?? null, active: 1, createdAt: new Date().toISOString() });
  save();
}
export function forgetAiMemoryFact(id: number) { const row = load().memory.find((m) => m.id === id); if (row) { row.active = 0; save(); } }
export function counts() { const s = load(); return { trackers: s.trackers.length, photos: s.photos.length }; }
