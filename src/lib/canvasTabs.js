import { EMPTY_ISSUE_TITLE_PLACEHOLDER } from "./issuesApi"
import { projectDisplayTitle } from "./projectsApi"

export const CANVAS_INDEX_TAB_ID = "canvas-index"
export const CANVAS_INDEX_PATH = "/canvas"

const LS_CANVAS_TABS = "devrev.canvasTabs.v1"

function issueDisplayTitle(issue, fallbackId = "") {
  if (!issue || typeof issue !== "object") return fallbackId
  const trimmed = typeof issue.title === "string" ? issue.title.trim() : ""
  return trimmed.length > 0 ? trimmed : EMPTY_ISSUE_TITLE_PLACEHOLDER
}

function isEntityDocHref(pathname) {
  return /^\/projects\/[^/?#]+$/.test(pathname) || /^\/issues\/[^/?#]+$/.test(pathname)
}

/** @typedef {{ id: string, routeId?: string, label: string, href?: string, state?: object, leadingIcon?: string, closable?: boolean }} CanvasTab */

let canvasTabInstanceCounter = 0

export function createCanvasTabInstanceId() {
  canvasTabInstanceCounter += 1
  return `canvas-tab-${Date.now()}-${canvasTabInstanceCounter}`
}

export function routeIdFromHref(href) {
  return tabIdFromHref(href)
}

export function createCanvasIndexTab() {
  return {
    id: CANVAS_INDEX_TAB_ID,
    label: "Pages",
    leadingIcon: "canvas",
    closable: false,
  }
}

/**
 * Normalize href to a stable tab id (pathname + project tab query when present).
 * @param {string} href
 */
export function tabIdFromHref(href) {
  if (!href || typeof href !== "string") return ""
  const hashIndex = href.indexOf("#")
  const withoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href
  const [pathname, query = ""] = withoutHash.split("?")
  if (pathname === CANVAS_INDEX_PATH) return CANVAS_INDEX_TAB_ID

  const params = new URLSearchParams(query)
  const tab = params.get("tab")
  if (tab && pathname.startsWith("/projects/")) {
    return `${pathname}?tab=${tab}`
  }
  return pathname
}

/**
 * @param {string} pathname
 * @param {string} [search] — leading `?` optional
 */
export function canvasTabIdFromLocation(pathname, search = "") {
  if (pathname === CANVAS_INDEX_PATH) return CANVAS_INDEX_TAB_ID
  const query = search.startsWith("?") ? search.slice(1) : search
  const href = query ? `${pathname}?${query}` : pathname
  return tabIdFromHref(href)
}

export function isCanvasIndexPath(pathname) {
  return pathname === CANVAS_INDEX_PATH
}

export function isDocCanvasPath(pathname) {
  if (!pathname || pathname === CANVAS_INDEX_PATH || pathname === "/") return false
  return (
    pathname.startsWith("/issues") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/sprints") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/team-members")
  )
}

/**
 * @param {string} href
 * @param {{ issues?: object[], projects?: object[] }} [context]
 */
export function resolveDocTabMeta(href, { issues, projects } = {}) {
  if (!href || typeof href !== "string") {
    return { label: "Page", leadingIcon: "team" }
  }

  const hashIndex = href.indexOf("#")
  const withoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href
  const [pathname, query = ""] = withoutHash.split("?")

  if (pathname.startsWith("/projects/")) {
    const projectId = decodeURIComponent(pathname.split("/")[2] || "")
    const project = projects?.find((row) => row.id === projectId)
    return {
      label: projectDisplayTitle(project) || projectId,
      leadingIcon: "project",
    }
  }

  const issueMatch = /^\/issues\/([^/?#]+)/.exec(pathname)
  if (issueMatch) {
    const issueId = decodeURIComponent(issueMatch[1])
    const issue = issues?.find((row) => row.id === issueId)
    return { label: issueDisplayTitle(issue, issueId), leadingIcon: "team" }
  }

  if (pathname === "/issues") return { label: "Issues", leadingIcon: "team" }
  if (pathname === "/projects") return { label: "Projects", leadingIcon: "team" }
  if (pathname === "/sprints") return { label: "Sprints", leadingIcon: "team" }
  if (pathname === "/about") return { label: "About", leadingIcon: "team" }
  if (pathname === "/team-members") return { label: "Team", leadingIcon: "team" }

  const segment = pathname.split("/").filter(Boolean).pop()
  return {
    label: segment ? decodeURIComponent(segment) : "Page",
    leadingIcon: "team",
  }
}

/**
 * @param {string} href
 * @param {{ issues?: object[], projects?: object[] }} [context]
 * @param {{ label?: string, leadingIcon?: string, state?: object }} [meta]
 */
function buildDocTabFields(href, context, meta = {}) {
  const hashIndex = href.indexOf("#")
  const withoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href
  const pathname = withoutHash.split("?")[0]
  const resolved = resolveDocTabMeta(href, context)
  const label = isEntityDocHref(pathname)
    ? resolved.label || meta.label || routeIdFromHref(href) || "Page"
    : meta.label || resolved.label || routeIdFromHref(href) || "Page"
  return {
    href,
    routeId: routeIdFromHref(href),
    label,
    leadingIcon: meta.leadingIcon || resolved.leadingIcon,
    state: meta.state,
  }
}

/**
 * @param {object} link
 * @param {string} [link.href]
 * @param {string} [link.title]
 * @param {string} [link.key]
 * @param {string} [link.leadingIcon]
 * @param {object} [link.state]
 * @param {{ issues?: object[], projects?: object[] }} [context]
 */
export function createDocTabFromLink(link, context) {
  const href = link?.href ?? ""
  return {
    id: createCanvasTabInstanceId(),
    ...buildDocTabFields(
      href,
      context,
      {
        label: link?.title,
        leadingIcon: link?.leadingIcon,
        state: link?.state,
      }
    ),
    closable: true,
  }
}

/**
 * @param {object} link
 * @param {{ issues?: object[], projects?: object[] }} [context]
 */
export function docTabPatchFromLink(link, context) {
  const href = link?.href ?? ""
  return buildDocTabFields(href, context, {
    label: link?.title,
    leadingIcon: link?.leadingIcon,
    state: link?.state,
  })
}

/**
 * @param {string} pathname
 * @param {string} [search]
 * @param {{ label?: string, leadingIcon?: string, state?: object }} [meta]
 * @param {{ issues?: object[], projects?: object[] }} [context]
 */
export function createDocTabFromLocation(pathname, search = "", meta = {}, context) {
  const query = search.startsWith("?") ? search.slice(1) : search
  const href = query ? `${pathname}?${query}` : pathname
  return {
    id: createCanvasTabInstanceId(),
    ...buildDocTabFields(href, context, meta),
    closable: true,
  }
}

/** @param {CanvasTab[]} tabs @param {CanvasTab} tab */
export function addCanvasTab(tabs, tab) {
  if (!tab?.id) return tabs
  return [...tabs, tab]
}

/** @param {CanvasTab[]} tabs @param {string} tabId @param {Partial<CanvasTab>} patch */
export function updateCanvasTab(tabs, tabId, patch) {
  if (!tabId) return tabs
  return tabs.map((row) => (row.id === tabId ? { ...row, ...patch } : row))
}

/**
 * @param {CanvasTab[]} tabs
 * @param {string} tabId
 * @param {string} pathname
 * @param {string} [search]
 * @param {{ issues?: object[], projects?: object[] }} [context]
 * @param {{ label?: string, leadingIcon?: string, state?: object }} [meta]
 */
export function patchCanvasTabFromLocation(tabs, tabId, pathname, search = "", context, meta = {}) {
  const query = search.startsWith("?") ? search.slice(1) : search
  const href = query ? `${pathname}?${query}` : pathname
  return updateCanvasTab(tabs, tabId, buildDocTabFields(href, context, meta))
}

/** @param {CanvasTab[]} tabs @param {string} routeId */
export function findTabByRouteId(tabs, routeId) {
  if (!routeId) return null
  return tabs.find((row) => row.id !== CANVAS_INDEX_TAB_ID && row.routeId === routeId) ?? null
}

/** @param {CanvasTab | null | undefined} tab */
function migrateStoredTab(tab) {
  if (!tab || tab.id === CANVAS_INDEX_TAB_ID) return tab
  const href = tab.href || (typeof tab.id === "string" && tab.id.startsWith("/") ? tab.id : "")
  if (typeof tab.id === "string" && tab.id.startsWith("canvas-tab-")) {
    return {
      ...tab,
      routeId: tab.routeId || routeIdFromHref(href),
      href: href || tab.href,
    }
  }
  return {
    ...tab,
    id: createCanvasTabInstanceId(),
    routeId: routeIdFromHref(href),
    href,
  }
}

/** @param {CanvasTab[]} tabs @param {CanvasTab} tab */
export function upsertCanvasTab(tabs, tab) {
  if (!tab?.id) return tabs
  const index = tabs.findIndex((row) => row.id === tab.id)
  if (index === -1) return [...tabs, tab]
  const next = [...tabs]
  next[index] = { ...next[index], ...tab }
  return next
}

/** @param {CanvasTab[]} tabs @param {string} tabId */
export function closeCanvasTab(tabs, tabId) {
  if (!tabId || tabId === CANVAS_INDEX_TAB_ID) return tabs
  return tabs.filter((row) => row.id !== tabId)
}

/** @param {CanvasTab[]} tabs @param {string} href */
export function findTabForHref(tabs, href) {
  const routeId = routeIdFromHref(href)
  return findTabByRouteId(tabs, routeId)
}

export function ensureIndexTab(tabs) {
  if (tabs.some((row) => row.id === CANVAS_INDEX_TAB_ID)) return tabs
  return [createCanvasIndexTab(), ...tabs]
}

export function docTabsOnly(tabs) {
  return tabs.filter((row) => row.id !== CANVAS_INDEX_TAB_ID)
}

function loadStore() {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(LS_CANVAS_TABS)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

function saveStore(store) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(LS_CANVAS_TABS, JSON.stringify(store))
  } catch {
    /* ignore */
  }
}

/** @param {string} rootChatId @param {CanvasTab[]} tabs */
export function saveCanvasTabsForChat(rootChatId, tabs) {
  if (!rootChatId) return
  const store = loadStore()
  store[rootChatId] = docTabsOnly(tabs).map((tab) => ({
    id: tab.id,
    routeId: tab.routeId || routeIdFromHref(tab.href || ""),
    label: tab.label,
    href: tab.href,
    state: tab.state,
    leadingIcon: tab.leadingIcon,
    closable: tab.closable !== false,
  }))
  saveStore(store)
}

/** @param {string} rootChatId @returns {CanvasTab[]} */
export function loadCanvasTabsForChat(rootChatId) {
  const indexTab = createCanvasIndexTab()
  if (!rootChatId) return [indexTab]
  const store = loadStore()
  const saved = Array.isArray(store[rootChatId]) ? store[rootChatId].map(migrateStoredTab) : []
  return ensureIndexTab([indexTab, ...saved])
}
