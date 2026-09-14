export {
  listTrackerEntries, addTrackerEntry, addTrackerEntriesBulk, deleteTrackerEntry, hasAnyTrackerEntries,
  getAllSharedState, setSharedState, getSharedState, patchSharedState, appendImportAuditLog,
  listPhotos, addPhoto, getPhotoById, deletePhoto,
  createAiConversation, listAiConversations, getAiConversation, touchAiConversation, deleteAiConversation,
  addAiMessage, listAiMessages, lastAiMessagePreview, listActiveAiMemory, countActiveAiMemory,
  addAiMemoryFacts, forgetAiMemoryFact,
} from "./householdStore";
export async function getDb() { return null; }
export async function upsertUser(): Promise<void> { return; }
export async function getUserByOpenId() { return undefined; }
