/** @typedef {{ id: string, label: string, iconName?: string, initial?: string, memberCount?: number }} NavChatItemDef */
/** @typedef {{ id: string, label: string, sectionLabel?: boolean, builtin?: boolean, itemIds: string[] }} NavFolder */

/** @type {Record<string, NavChatItemDef>} */
export const NAV_CHAT_CATALOG = {
  "build-team": { id: "build-team", label: "Build team", iconName: "chat" },
  "chat-arjun": { id: "chat-arjun", label: "Arjun Patel", initial: "A" },
  "chat-sneha": { id: "chat-sneha", label: "Sneha Sharma", initial: "S" },
  "chat-rohan": { id: "chat-rohan", label: "Rohan Verma", initial: "R" },
  "chat-leela": { id: "chat-leela", label: "Leela Nair", initial: "L" },
}

export const NAV_CHAT_DRAG_MIME = "application/x-devrev-nav-chat"
export const NAV_FOLDER_DRAG_MIME = "application/x-devrev-nav-folder"
export const NAV_FOLDER_OTHER_ID = "folder-other"
export const NAV_FOLDER_PROJECTS_ID = "folder-projects"

export const NEW_CHAT_VARIANT = "new-chat"

/** @param {string} variant */
export function isBranchedChatVariant(variant) {
  return typeof variant === "string" && variant.startsWith("chat-branch-")
}

/** @param {string | null | undefined} itemId */
export function isNavChatArchivable(itemId) {
  if (typeof itemId !== "string" || itemId.length === 0) return false
  if (itemId === "build-team") return false
  if (itemId.startsWith("chat-project-")) return false
  if (itemId === "chat-project") return false
  return true
}

/** @param {string} variant */
export function chatVariantToNavItemId(variant) {
  if (variant === "ai") return null
  if (variant === NEW_CHAT_VARIANT) return null
  return variant
}

/** @param {string} variant */
export function isDynamicGroupChatVariant(variant) {
  return (
    (typeof variant === "string" && variant.startsWith("chat-group-")) || isBranchedChatVariant(variant)
  )
}

/**
 * @param {NavFolder[]} folders
 * @param {string} folderId
 * @param {string} itemId
 */
export function prependNavChatItem(folders, folderId, itemId) {
  return folders.map((folder) => {
    if (folder.id !== folderId) return folder
    if (folder.itemIds.includes(itemId)) return folder
    return { ...folder, itemIds: [itemId, ...folder.itemIds] }
  })
}

/**
 * @param {NavFolder[]} folders
 * @param {string} folderId
 * @param {string} itemId
 */
export function appendNavChatItem(folders, folderId, itemId) {
  return folders.map((folder) => {
    if (folder.id !== folderId) return folder
    if (folder.itemIds.includes(itemId)) return folder
    return { ...folder, itemIds: [...folder.itemIds, itemId] }
  })
}

/**
 * @param {{ label: string, initial?: string }[]} participants
 * @returns {{ title: string, avatarInitial: string | null, memberCount: number | null }}
 */
export function resolveGroupChatDisplay(participants) {
  const count = Array.isArray(participants) ? participants.length : 0
  if (count === 0) {
    return { title: "Group chat", avatarInitial: null, memberCount: null }
  }
  if (count === 1) {
    const person = participants[0]
    const initial = (person.initial ?? person.label?.[0] ?? "?").toUpperCase()
    return { title: person.label, avatarInitial: initial, memberCount: null }
  }
  const title = participants.map((p) => p.label).join(", ")
  return { title, avatarInitial: null, memberCount: count }
}

/** @deprecated use resolveGroupChatDisplay */
export function buildGroupChatTitle(participants) {
  return resolveGroupChatDisplay(participants).title
}
/** @returns {NavFolder[]} */
export function createInitialNavFolders() {
  return [
    {
      id: "folder-projects",
      label: "Projects",
      sectionLabel: true,
      builtin: true,
      itemIds: [],
    },
    {
      id: "folder-other",
      label: "Other",
      sectionLabel: true,
      builtin: true,
      itemIds: ["build-team", "chat-arjun", "chat-sneha", "chat-rohan", "chat-leela"],
    },
  ]
}

/**
 * @param {NavFolder[]} folders
 * @param {string} itemId
 * @param {string} targetFolderId
 * @param {number | null} targetIndex insert before this index; null appends
 */
export function moveNavChatItem(folders, itemId, targetFolderId, targetIndex = null) {
  const next = folders.map((folder) => ({ ...folder, itemIds: [...folder.itemIds] }))
  const sourceFolder = next.find((folder) => folder.itemIds.includes(itemId))
  const targetFolder = next.find((folder) => folder.id === targetFolderId)
  if (!sourceFolder || !targetFolder) return folders

  const fromIndex = sourceFolder.itemIds.indexOf(itemId)
  if (fromIndex === -1) return folders

  sourceFolder.itemIds.splice(fromIndex, 1)

  let insertAt = targetIndex ?? targetFolder.itemIds.length
  if (sourceFolder.id === targetFolder.id && fromIndex < insertAt) {
    insertAt -= 1
  }
  insertAt = Math.max(0, Math.min(insertAt, targetFolder.itemIds.length))
  targetFolder.itemIds.splice(insertAt, 0, itemId)
  return next
}

/**
 * Remove a chat from all nav folders (archive / delete).
 * @param {NavFolder[]} folders
 * @param {string} itemId
 */
export function removeNavChatItemFromFolders(folders, itemId) {
  return folders.map((folder) => ({
    ...folder,
    itemIds: folder.itemIds.filter((id) => id !== itemId),
  }))
}

/**
 * Reorders any folder in the nav list.
 * @param {NavFolder[]} folders
 * @param {string} folderId
 * @param {number} targetIndex insert before this index in the full folder list
 */
export function moveNavFolder(folders, folderId, targetIndex) {
  const fromIndex = folders.findIndex((entry) => entry.id === folderId)
  if (fromIndex === -1) return folders
  if (fromIndex === targetIndex || fromIndex + 1 === targetIndex) return folders

  const next = [...folders]
  const [folder] = next.splice(fromIndex, 1)
  let insertAt = targetIndex
  if (fromIndex < targetIndex) insertAt -= 1
  insertAt = Math.max(0, Math.min(insertAt, next.length))
  next.splice(insertAt, 0, folder)
  return next
}

const DEFAULT_NEW_FOLDER_LABEL = /^New folder( \d+)?$/

/**
 * @param {NavFolder[]} folders
 * @param {string} folderId
 * @param {string} label
 */
export function renameNavFolder(folders, folderId, label) {
  const nextLabel = label.trim()
  if (!nextLabel) return folders
  return folders.map((folder) => (folder.id === folderId ? { ...folder, label: nextLabel } : folder))
}

/** @param {NavFolder[]} folders @param {string} folderId */
export function removeNavFolder(folders, folderId) {
  return folders.filter((folder) => folder.id !== folderId)
}

/** @param {string} label */
export function isDefaultNewFolderLabel(label) {
  return DEFAULT_NEW_FOLDER_LABEL.test(label)
}

/** @param {NavFolder} folder */
export function isNavFolderDraggable() {
  return true
}

/** @param {NavFolder} folder */
export function isNavFolderRenamable(folder) {
  return folder.id !== NAV_FOLDER_OTHER_ID
}

/** @param {NavFolder} folder */
export function isNavFolderDeletable(folder) {
  return folder.id !== NAV_FOLDER_OTHER_ID
}

/**
 * Deletes a custom folder and moves its chats into Other.
 * @param {NavFolder[]} folders
 * @param {string} folderId
 */
export function deleteNavFolder(folders, folderId) {
  const folder = folders.find((entry) => entry.id === folderId)
  if (!folder || folder.id === NAV_FOLDER_OTHER_ID) return folders

  const otherFolder = folders.find((entry) => entry.id === NAV_FOLDER_OTHER_ID)
  const chatsToMove = folder.itemIds

  return folders
    .filter((entry) => entry.id !== folderId)
    .map((entry) => {
      if (entry.id !== NAV_FOLDER_OTHER_ID) return entry
      const mergedIds = [...entry.itemIds]
      for (const itemId of chatsToMove) {
        if (!mergedIds.includes(itemId)) mergedIds.push(itemId)
      }
      return { ...entry, itemIds: mergedIds }
    })
}
