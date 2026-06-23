export const TEAM_ROOT_CHAT_ID = "build-team"
export const LS_RELATED_CHATS = "devrev.relatedChats.v1"

/** @typedef {{ type: "team" } | { type: "project"; projectId: string } | { type: "group" } | { type: "computer" }} RelatedChatContext */
/** @typedef {{ id: string, label: string, initial?: string }} RelatedChatParticipant */
/**
 * @typedef {Object} RelatedChatRecord
 * @property {string} id
 * @property {string} title
 * @property {RelatedChatParticipant[]} participants
 * @property {RelatedChatContext} context
 * @property {string | null} parentChatId
 * @property {string} rootChatId
 * @property {number} createdAt
 */

/** @typedef {Record<string, RelatedChatRecord>} RelatedChatRegistry */

/** @param {string} projectId */
export function projectMainChatId(projectId) {
  return `chat-project-${projectId}`
}

/** @param {string | null | undefined} id */
export function isProjectMainChatId(id) {
  return typeof id === "string" && id.startsWith("chat-project-") && id !== "chat-project"
}

/** @param {string | null | undefined} variant */
export function isBranchedChatVariant(variant) {
  return typeof variant === "string" && variant.startsWith("chat-branch-")
}

/** @param {string | null | undefined} id */
export function isBranchedChatId(id) {
  return isBranchedChatVariant(id)
}

/** @param {string | null | undefined} variant */
export function isComputerChatVariant(variant) {
  return typeof variant === "string" && variant.startsWith("chat-computer-")
}

/** @param {string | null | undefined} id */
export function isComputerChatId(id) {
  return isComputerChatVariant(id)
}

/** @param {string | null | undefined} variant */
export function isGroupChatVariant(variant) {
  return typeof variant === "string" && variant.startsWith("chat-group-")
}

/** @param {string | null | undefined} id */
export function isGroupChatId(id) {
  return isGroupChatVariant(id)
}

/** @param {string | null | undefined} id */
export function isPersistedNavChatId(id) {
  return isGroupChatId(id) || isBranchedChatId(id) || isComputerChatId(id)
}

/** @param {string | null | undefined} id */
export function isRelatedFamilyMainChatId(id) {
  return id === TEAM_ROOT_CHAT_ID || isProjectMainChatId(id)
}

/** @param {string | null | undefined} id */
export function isMainChatArchivable(id) {
  return !isRelatedFamilyMainChatId(id)
}

/** @param {string | null | undefined} itemId */
export function isNavChatArchivable(itemId) {
  if (typeof itemId !== "string" || itemId.length === 0) return false
  if (itemId === TEAM_ROOT_CHAT_ID) return false
  if (isProjectMainChatId(itemId)) return false
  if (itemId === "chat-project") return false
  return true
}

/**
 * @param {string | null | undefined} variant
 * @param {RelatedChatRegistry} registry
 */
export function resolveRootChatId(variant, registry) {
  if (!variant || typeof variant !== "string") return null
  if (variant === TEAM_ROOT_CHAT_ID) return TEAM_ROOT_CHAT_ID
  if (isProjectMainChatId(variant)) return variant
  const record = registry[variant]
  if (record?.rootChatId) return record.rootChatId
  return null
}

/**
 * @param {string | null | undefined} variant
 * @param {RelatedChatRegistry} registry
 */
export function isRelatedChatFamilyMember(variant, registry) {
  return resolveRootChatId(variant, registry) != null
}

/**
 * @param {string | null | undefined} variant
 * @param {RelatedChatRegistry} registry
 */
export function canBranchFromChat(variant, registry) {
  if (!variant || variant === "ai" || variant === "new-chat") return false
  if (isComputerChatVariant(variant)) return false
  if (variant === TEAM_ROOT_CHAT_ID) return true
  if (isProjectMainChatId(variant)) return true
  if (isBranchedChatVariant(variant) && registry[variant]) return true
  return false
}

/**
 * @param {string} rootChatId
 * @param {RelatedChatRegistry} registry
 * @returns {RelatedChatRecord[]}
 */
export function getRelatedChatFamily(rootChatId, registry) {
  const main = registry[rootChatId]
  if (!main) return []
  const branches = Object.values(registry)
    .filter((row) => row.rootChatId === rootChatId && row.id !== rootChatId)
    .sort((a, b) => a.createdAt - b.createdAt)
  return [main, ...branches]
}

/**
 * @param {string | null | undefined} variant
 * @param {RelatedChatRegistry} registry
 */
export function supportsChatActionsMenu(variant, registry) {
  if (isNavChatArchivable(variant)) return true
  return canBranchFromChat(variant, registry)
}

/**
 * @param {string | null | undefined} variant
 * @param {RelatedChatRegistry} registry
 */
export function resolveBranchDraftFromVariant(variant, registry) {
  if (!canBranchFromChat(variant, registry)) return null
  if (variant === TEAM_ROOT_CHAT_ID) {
    return {
      parentChatId: TEAM_ROOT_CHAT_ID,
      rootChatId: TEAM_ROOT_CHAT_ID,
      context: { type: "team" },
    }
  }
  if (isProjectMainChatId(variant)) {
    const projectId = variant.slice("chat-project-".length)
    return {
      parentChatId: variant,
      rootChatId: variant,
      context: { type: "project", projectId },
    }
  }
  const record = registry[variant]
  if (!record) return null
  return {
    parentChatId: record.id,
    rootChatId: record.rootChatId,
    context: record.context,
  }
}

/** @returns {RelatedChatRegistry} */
export function loadRelatedChatRegistry() {
  if (typeof window === "undefined") return createSeedRegistry()
  try {
    const raw = window.localStorage.getItem(LS_RELATED_CHATS)
    if (!raw) return createSeedRegistry()
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") return createSeedRegistry()
    return { ...createSeedRegistry(), ...parsed }
  } catch {
    return createSeedRegistry()
  }
}

/** @param {RelatedChatRegistry} registry */
export function saveRelatedChatRegistry(registry) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(LS_RELATED_CHATS, JSON.stringify(registry))
  } catch {
    /* ignore */
  }
}

/** @returns {RelatedChatRegistry} */
export function createSeedRegistry() {
  const teamMain = createTeamMainRecord()
  const projectMain = createProjectMainRecord("Project-0001", "Build core flow")
  return {
    [teamMain.id]: teamMain,
    [projectMain.id]: projectMain,
  }
}

/** @returns {RelatedChatRecord} */
export function createGroupChatRecord(id, title, participants) {
  return {
    id,
    title,
    participants,
    context: { type: "group" },
    parentChatId: null,
    rootChatId: id,
    createdAt: Date.now(),
  }
}

/** @returns {RelatedChatRecord} */
export function createComputerChatRecord(id) {
  return {
    id,
    title: "Computer",
    participants: [],
    context: { type: "computer" },
    parentChatId: null,
    rootChatId: id,
    createdAt: Date.now(),
  }
}

/** @returns {RelatedChatRecord} */
export function createTeamMainRecord() {
  return {
    id: TEAM_ROOT_CHAT_ID,
    title: "Build team",
    participants: [],
    context: { type: "team" },
    parentChatId: null,
    rootChatId: TEAM_ROOT_CHAT_ID,
    createdAt: 0,
  }
}

/**
 * @param {string} projectId
 * @param {string} title
 * @returns {RelatedChatRecord}
 */
export function createProjectMainRecord(projectId, title) {
  const id = projectMainChatId(projectId)
  return {
    id,
    title,
    participants: [],
    context: { type: "project", projectId },
    parentChatId: null,
    rootChatId: id,
    createdAt: 0,
  }
}

/**
 * @param {RelatedChatRegistry} registry
 * @param {string} projectId
 * @param {string} title
 * @returns {{ registry: RelatedChatRegistry, record: RelatedChatRecord, created: boolean }}
 */
export function ensureProjectMainChatInRegistry(registry, projectId, title) {
  const id = projectMainChatId(projectId)
  if (registry[id]) {
    const existing = registry[id]
    if (existing.title !== title) {
      const updated = { ...existing, title }
      return { registry: { ...registry, [id]: updated }, record: updated, created: false }
    }
    return { registry, record: existing, created: false }
  }
  const record = createProjectMainRecord(projectId, title)
  return { registry: { ...registry, [id]: record }, record, created: true }
}

/**
 * @param {string | null | undefined} variant
 * @param {RelatedChatRegistry} registry
 */
export function resolveProjectIdFromVariant(variant, registry) {
  if (isProjectMainChatId(variant)) return variant.slice("chat-project-".length)
  const record = registry[variant]
  if (record?.context?.type === "project") return record.context.projectId
  return null
}

/**
 * @param {import("./navFolderState").NavChatItemDef} record
 * @returns {import("./navFolderState").NavChatItemDef}
 */
export function relatedChatToNavItem(record) {
  if (record.context?.type === "computer") {
    return { id: record.id, label: "Computer", iconName: "computer" }
  }
  const participants = record.participants ?? []
  if (record.id === TEAM_ROOT_CHAT_ID) {
    return { id: record.id, label: record.title, iconName: "chat" }
  }
  if (isProjectMainChatId(record.id)) {
    return { id: record.id, label: record.title, iconName: "projectChat" }
  }
  if (participants.length === 1) {
    const person = participants[0]
    const initial = (person.initial ?? person.label?.[0] ?? "?").toUpperCase()
    return { id: record.id, label: record.title, initial }
  }
  if (participants.length > 1) {
    return { id: record.id, label: record.title, memberCount: participants.length }
  }
  return { id: record.id, label: record.title, iconName: "chat" }
}

/**
 * @param {RelatedChatRecord | null | undefined} record
 * @returns {{ title: string, participants: RelatedChatParticipant[] } | null}
 */
export function groupChatMetaFromRecord(record) {
  if (!record?.participants?.length) return null
  return { title: record.title, participants: record.participants }
}
