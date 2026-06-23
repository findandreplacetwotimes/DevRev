import { COMPUTER_NAV_ITEM_ID } from "../components/NavPanel"
import { resolveProjectForWorkspaceChat } from "./projectsApi"

/** Query keys owned by workspace shell (chat + record panel). */
export const WORKSPACE_QUERY_KEYS = ["chat", "projectChat", "id", "record"]

export const PERSON_CHAT_IDS = ["chat-arjun", "chat-sneha", "chat-rohan", "chat-leela"]

const COMPUTER_FALLBACK = {
  selectedNavItemId: COMPUTER_NAV_ITEM_ID,
  chatVariant: "ai",
  projectChatId: null,
}

/**
 * @param {string} pathname
 * @returns {string | null}
 */
export function inferProjectIdFromPathname(pathname) {
  if (typeof pathname !== "string") return null
  const match = /^\/projects\/([^/?#]+)/.exec(pathname)
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * @param {URLSearchParams} searchParams
 * @returns {boolean}
 */
export function hasWorkspaceChatInUrl(searchParams) {
  return searchParams.has("chat")
}

/**
 * @param {object} options
 * @param {URLSearchParams} options.searchParams
 * @param {import("./issuesApi").Project[] | null} options.projects
 * @param {string} options.pathname
 */
export function parseWorkspaceChatState({ searchParams, projects, pathname }) {
  const chat = searchParams.get("chat")
  const record = searchParams.get("record")

  /** @type {boolean | null} */
  let recordPanelOpen = null
  if (record === "open") recordPanelOpen = true
  else if (record === "closed") recordPanelOpen = false

  if (!chat) {
    return {
      fromUrl: false,
      shouldRewriteUrl: false,
      ...COMPUTER_FALLBACK,
      recordPanelOpen,
    }
  }

  const projectExists = (projectId) =>
    Array.isArray(projects) && projects.some((row) => row && row.id === projectId)

  if (chat === "computer") {
    return {
      fromUrl: true,
      shouldRewriteUrl: false,
      selectedNavItemId: COMPUTER_NAV_ITEM_ID,
      chatVariant: "ai",
      projectChatId: null,
      recordPanelOpen,
    }
  }

  if (chat === "build-team") {
    return {
      fromUrl: true,
      shouldRewriteUrl: false,
      selectedNavItemId: "build-team",
      chatVariant: "build-team",
      projectChatId: null,
      recordPanelOpen,
    }
  }

  if (chat === "project") {
    const requestedProjectId =
      searchParams.get("projectChat") ||
      inferProjectIdFromPathname(pathname) ||
      resolveProjectForWorkspaceChat(projects)?.id ||
      null

    if (projects === null) {
      return {
        fromUrl: true,
        shouldRewriteUrl: false,
        pendingProjects: true,
        selectedNavItemId: "chat-project",
        chatVariant: "chat-project",
        projectChatId: requestedProjectId,
        recordPanelOpen,
      }
    }

    if (requestedProjectId && projectExists(requestedProjectId)) {
      return {
        fromUrl: true,
        shouldRewriteUrl: false,
        selectedNavItemId: "chat-project",
        chatVariant: "chat-project",
        projectChatId: requestedProjectId,
        recordPanelOpen,
      }
    }

    return {
      fromUrl: true,
      shouldRewriteUrl: true,
      ...COMPUTER_FALLBACK,
      recordPanelOpen,
    }
  }

  if (chat === "person") {
    const personId = searchParams.get("id")
    if (personId && PERSON_CHAT_IDS.includes(personId)) {
      return {
        fromUrl: true,
        shouldRewriteUrl: false,
        selectedNavItemId: personId,
        chatVariant: personId,
        projectChatId: null,
        recordPanelOpen,
      }
    }

    return {
      fromUrl: true,
      shouldRewriteUrl: true,
      ...COMPUTER_FALLBACK,
      recordPanelOpen,
    }
  }

  return {
    fromUrl: true,
    shouldRewriteUrl: true,
    ...COMPUTER_FALLBACK,
    recordPanelOpen,
  }
}

/**
 * @param {URLSearchParams} searchParams
 * @param {object} state
 * @param {string} state.selectedNavItemId
 * @param {string} state.chatVariant
 * @param {string | null | undefined} state.projectChatId
 * @param {boolean | undefined} state.recordPanelOpen
 */
export function applyWorkspaceChatToSearchParams(searchParams, state) {
  const next = new URLSearchParams(searchParams)
  for (const key of WORKSPACE_QUERY_KEYS) {
    next.delete(key)
  }

  const { selectedNavItemId, chatVariant, projectChatId, recordPanelOpen } = state

  if (selectedNavItemId === COMPUTER_NAV_ITEM_ID || chatVariant === "ai") {
    next.set("chat", "computer")
  } else if (selectedNavItemId === "build-team" || chatVariant === "build-team") {
    next.set("chat", "build-team")
  } else if (selectedNavItemId === "chat-project" || chatVariant === "chat-project") {
    next.set("chat", "project")
    if (projectChatId) next.set("projectChat", projectChatId)
  } else if (typeof chatVariant === "string" && chatVariant.startsWith("chat-")) {
    next.set("chat", "person")
    next.set("id", chatVariant)
  }

  if (recordPanelOpen === true) next.set("record", "open")
  else if (recordPanelOpen === false) next.set("record", "closed")

  return next
}

/**
 * Preserve workspace query params when navigating to another in-app path.
 * @param {string} href
 * @param {URLSearchParams} currentSearchParams
 */
export function hrefWithWorkspaceParams(href, currentSearchParams) {
  if (typeof href !== "string" || !href.startsWith("/")) return href
  const hashIndex = href.indexOf("#")
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : ""
  const withoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href
  const [pathname, hrefQuery = ""] = withoutHash.split("?")
  const merged = new URLSearchParams(hrefQuery)

  for (const key of WORKSPACE_QUERY_KEYS) {
    const value = currentSearchParams.get(key)
    if (value != null && !merged.has(key)) merged.set(key, value)
  }

  const query = merged.toString()
  return query ? `${pathname}?${query}${hash}` : `${pathname}${hash}`
}
