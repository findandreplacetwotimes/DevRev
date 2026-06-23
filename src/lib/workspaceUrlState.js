import { COMPUTER_NAV_ITEM_ID } from "../components/NavPanel"
import { isBranchedChatVariant, isComputerChatVariant, isProjectMainChatId, projectMainChatId } from "./relatedChats"
import { resolveProjectForWorkspaceChat } from "./projectsApi"
import {
  CANVAS_INDEX_TAB_ID,
  canvasTabIdFromLocation as canvasTabIdFromLocationImpl,
  isCanvasIndexPath,
  tabIdFromHref,
} from "./canvasTabs"

export { isCanvasIndexPath, CANVAS_INDEX_TAB_ID }
export { tabIdFromHref as canvasTabIdFromHref }

/** @param {string} pathname @param {string} [search] */
export function canvasTabIdFromLocation(pathname, search = "") {
  return canvasTabIdFromLocationImpl(pathname, search)
}

/** Query keys owned by workspace shell (chat + record panel). */
export const WORKSPACE_QUERY_KEYS = ["chat", "projectChat", "id", "record"]

export const PERSON_CHAT_IDS = ["chat-arjun", "chat-sneha", "chat-rohan", "chat-leela"]

const COMPUTER_FALLBACK = {
  selectedNavItemId: null,
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
    const computerId = searchParams.get("id")
    if (computerId && isComputerChatVariant(computerId)) {
      return {
        fromUrl: true,
        shouldRewriteUrl: false,
        selectedNavItemId: computerId,
        chatVariant: computerId,
        projectChatId: null,
        recordPanelOpen,
      }
    }

    return {
      fromUrl: true,
      shouldRewriteUrl: false,
      selectedNavItemId: null,
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
      const pendingVariant = requestedProjectId
        ? projectMainChatId(requestedProjectId)
        : projectMainChatId("Project-0001")
      return {
        fromUrl: true,
        shouldRewriteUrl: false,
        pendingProjects: true,
        selectedNavItemId: pendingVariant,
        chatVariant: pendingVariant,
        projectChatId: requestedProjectId,
        recordPanelOpen,
      }
    }

    if (requestedProjectId && projectExists(requestedProjectId)) {
      const variant = projectMainChatId(requestedProjectId)
      return {
        fromUrl: true,
        shouldRewriteUrl: false,
        selectedNavItemId: variant,
        chatVariant: variant,
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

  if (chat === "new") {
    return {
      fromUrl: true,
      shouldRewriteUrl: false,
      selectedNavItemId: null,
      chatVariant: "new-chat",
      projectChatId: null,
      recordPanelOpen,
    }
  }

  if (chat === "group") {
    const groupId = searchParams.get("id")
    if (groupId && typeof groupId === "string" && groupId.startsWith("chat-group-")) {
      return {
        fromUrl: true,
        shouldRewriteUrl: false,
        selectedNavItemId: groupId,
        chatVariant: groupId,
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

  if (chat === "branch") {
    const branchId = searchParams.get("id")
    if (branchId && isBranchedChatVariant(branchId)) {
      return {
        fromUrl: true,
        shouldRewriteUrl: false,
        selectedNavItemId: branchId,
        chatVariant: branchId,
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

  if (chatVariant === "new-chat") {
    next.set("chat", "new")
  } else if (typeof chatVariant === "string" && chatVariant.startsWith("chat-group-")) {
    next.set("chat", "group")
    next.set("id", chatVariant)
  } else if (isBranchedChatVariant(chatVariant)) {
    next.set("chat", "branch")
    next.set("id", chatVariant)
  } else if (isComputerChatVariant(chatVariant)) {
    next.set("chat", "computer")
    next.set("id", chatVariant)
  } else if (chatVariant === "ai") {
    next.set("chat", "computer")
  } else if (selectedNavItemId === COMPUTER_NAV_ITEM_ID) {
    next.set("chat", "computer")
  } else if (selectedNavItemId === "build-team" || chatVariant === "build-team") {
    next.set("chat", "build-team")
  } else if (isProjectMainChatId(chatVariant) || isProjectMainChatId(selectedNavItemId)) {
    const pid =
      projectChatId ||
      (isProjectMainChatId(chatVariant) ? chatVariant.slice("chat-project-".length) : null)
    next.set("chat", "project")
    if (pid) next.set("projectChat", pid)
  } else if (typeof chatVariant === "string" && chatVariant.startsWith("chat-")) {
    next.set("chat", "person")
    next.set("id", chatVariant)
  }

  if (recordPanelOpen === true) next.set("record", "open")
  else if (recordPanelOpen === false) next.set("record", "closed")

  return next
}

export function canvasIndexHref(searchParams) {
  return hrefWithWorkspaceParams("/canvas", searchParams)
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
