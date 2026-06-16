import { migrateLegacyRoute, navItemIdForLocation, navIconForNavItemId, parseWorkspaceRoute, routeForNavItemId, tabTitleForRoute } from "./navDestinations"
import { DEFAULT_TEAM_ID, teamIssuesHref } from "./teams"

export const LS_SESSIONS = "devrev.workspace.sessions.v2"
export const LS_SESSIONS_LEGACY = "devrev.workspace.sessions.v1"
export const LS_ACTIVE_SESSION_ID = "devrev.workspace.activeSessionId.v1"

export const COMPUTER_NAV_ITEM_ID = "computer"
export const INITIAL_SPLIT_LEFT_WIDTH_PX = 651

const CHAT_NAV_ITEM_IDS = new Set([
  COMPUTER_NAV_ITEM_ID,
  "team:chat",
  "project:chat",
  "build-team",
  "chat-project",
  "chat-arjun",
  "chat-sneha",
  "chat-rohan",
  "chat-leela",
])

const CHAT_VARIANT_BY_NAV = {
  [COMPUTER_NAV_ITEM_ID]: "ai",
  "team:chat": "build-team",
  "project:chat": "chat-project",
  "build-team": "build-team",
  "chat-project": "chat-project",
  "chat-arjun": "chat-arjun",
  "chat-sneha": "chat-sneha",
  "chat-rohan": "chat-rohan",
  "chat-leela": "chat-leela",
}

const TAB_TITLE_BY_CHAT_NAV = {
  [COMPUTER_NAV_ITEM_ID]: "Computer",
  "chat-arjun": "Arjun",
  "chat-sneha": "Sneha",
  "chat-rohan": "Rohan",
  "chat-leela": "Leela",
}

function titleContextFromRoute(route) {
  const pathname = route?.split("?")[0] ?? ""
  const parsed = parseWorkspaceRoute(pathname)
  if (parsed.scope === "team") {
    return { teamId: parsed.teamId }
  }
  if (parsed.scope === "project" && parsed.projectId) {
    return { projectId: parsed.projectId }
  }
  return {}
}

function normalizeNavItemId(selectedNavItemId) {
  let id = selectedNavItemId
  if (id === "page:issues") id = "team:page:issues"
  if (id === "page:sprints") id = "team:page:sprints"
  if (id === "page:projects") id = "team:page:projects"
  if (id === "about") id = "team:page:about"
  if (id === "page:project-overview") id = "project:page:overview"
  if (id === "page:project-scope") id = "project:page:overview"
  if (id === "build-team") id = "team:chat"
  if (id === "chat-project") id = "project:chat"
  return id
}

function resolveRouteAndNavItemId(route, selectedNavItemId, teamId = DEFAULT_TEAM_ID) {
  let resolvedRoute = route
  let resolvedNavItemId = selectedNavItemId

  if (!resolvedRoute && resolvedNavItemId) {
    resolvedRoute = routeForNavItemId(resolvedNavItemId, { teamId }) ?? "/computer"
  }

  resolvedRoute = migrateLegacyRoute(resolvedRoute)

  if (!resolvedNavItemId && resolvedRoute) {
    const [pathname, query] = resolvedRoute.split("?")
    const search = query ? `?${query}` : ""
    const parsed = parseWorkspaceRoute(pathname)
    resolvedNavItemId = navItemIdForLocation(pathname, search, {
      teamId: parsed.teamId ?? teamId,
      projectId: parsed.projectId,
    })
  }

  resolvedNavItemId = normalizeNavItemId(resolvedNavItemId)

  if (!resolvedRoute) resolvedRoute = "/computer"
  if (!resolvedNavItemId) resolvedNavItemId = COMPUTER_NAV_ITEM_ID

  return { route: resolvedRoute, selectedNavItemId: resolvedNavItemId }
}

export function createSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function createDefaultSession(overrides = {}) {
  return {
    id: createSessionId(),
    kind: "single",
    tabTitle: "Computer",
    selectedNavItemId: COMPUTER_NAV_ITEM_ID,
    route: "/computer",
    ...overrides,
  }
}

export function createDefaultSplitSession(overrides = {}) {
  const teamId = DEFAULT_TEAM_ID
  return {
    id: createSessionId(),
    kind: "split",
    leftRoute: "/computer",
    leftNavItemId: COMPUTER_NAV_ITEM_ID,
    rightRoute: teamIssuesHref(teamId),
    rightNavItemId: "team:page:issues",
    focusedPane: "right",
    splitLeftWidthPx: INITIAL_SPLIT_LEFT_WIDTH_PX,
    ...overrides,
  }
}

export function isSplitSession(session) {
  return session?.kind === "split"
}

export function isChatNavItemId(navItemId) {
  return CHAT_NAV_ITEM_IDS.has(navItemId)
}

export function chatVariantForNavItem(navItemId) {
  return CHAT_VARIANT_BY_NAV[navItemId] ?? "ai"
}

export function chatNavItemForVariant(variant) {
  const entry = Object.entries(CHAT_VARIANT_BY_NAV).find(([, value]) => value === variant)
  return entry?.[0] ?? COMPUTER_NAV_ITEM_ID
}

export function tabTitleForNavItem(navItemId, route, titleContext) {
  if (navItemId?.startsWith("team:page:") || navItemId?.startsWith("project:page:") || navItemId?.startsWith("page:")) {
    return tabTitleForRoute(route, titleContext)
  }
  if (route && isChatNavItemId(navItemId)) {
    return tabTitleForRoute(route, titleContext ?? titleContextFromRoute(route))
  }
  return TAB_TITLE_BY_CHAT_NAV[navItemId] ?? "Computer"
}

/** @deprecated Use tabTitleForNavItem */
export function tabLabelForNavItem(navItemId, route) {
  const title = tabTitleForNavItem(navItemId, route)
  return { tabPrefix: title, tabSuffix: undefined }
}

function legacySessionTabLabel(session) {
  const prefix = session?.tabPrefix ?? "Computer"
  const suffix = session?.tabSuffix
  if (!suffix) return prefix
  if (suffix.startsWith(`-${prefix}`)) return suffix.slice(1)
  return `${prefix}${suffix}`
}

function normalizeSplitSession(session) {
  const left = resolveRouteAndNavItemId(session.leftRoute, session.leftNavItemId)
  const right = resolveRouteAndNavItemId(session.rightRoute, session.rightNavItemId)
  const focusedPane = session.focusedPane === "left" ? "left" : "right"
  const splitLeftWidthPx =
    typeof session.splitLeftWidthPx === "number" && Number.isFinite(session.splitLeftWidthPx)
      ? session.splitLeftWidthPx
      : INITIAL_SPLIT_LEFT_WIDTH_PX

  return {
    id: session.id,
    kind: "split",
    leftRoute: left.route,
    leftNavItemId: left.selectedNavItemId,
    rightRoute: right.route,
    rightNavItemId: right.selectedNavItemId,
    focusedPane,
    splitLeftWidthPx,
  }
}

export function normalizeSession(session) {
  if (!session || typeof session.id !== "string") return session

  if (session.kind === "split") {
    return normalizeSplitSession(session)
  }

  const storedTabTitle =
    typeof session.tabTitle === "string" && session.tabTitle.trim() ? session.tabTitle.trim() : legacySessionTabLabel(session)

  const storedRoute = typeof session.route === "string" ? session.route : null
  const storedSelectedNavItemId = typeof session.selectedNavItemId === "string" ? session.selectedNavItemId : null

  let route = storedRoute
  let selectedNavItemId = storedSelectedNavItemId

  if ((!route || !selectedNavItemId) && typeof session.chatVariant === "string") {
    const legacyNavItemId = chatNavItemForVariant(session.chatVariant)
    selectedNavItemId = legacyNavItemId
    route = routeForNavItemId(legacyNavItemId, { teamId: DEFAULT_TEAM_ID })
  }

  const resolved = resolveRouteAndNavItemId(route, selectedNavItemId)

  return {
    id: session.id,
    kind: "single",
    tabTitle: storedTabTitle || tabTitleForRoute(resolved.route, titleContextFromRoute(resolved.route)),
    selectedNavItemId: resolved.selectedNavItemId,
    route: resolved.route,
  }
}

export function sessionTabLabel(session) {
  if (isSplitSession(session)) return null
  if (typeof session?.tabTitle === "string" && session.tabTitle.trim()) {
    return session.tabTitle.trim()
  }
  return legacySessionTabLabel(session)
}

export function sessionTabIcons(session) {
  if (!isSplitSession(session)) return null
  return {
    left: navIconForNavItemId(session.leftNavItemId),
    right: navIconForNavItemId(session.rightNavItemId),
  }
}

export function focusedPaneRoute(session) {
  if (!isSplitSession(session)) return session?.route ?? "/computer"
  return session.focusedPane === "left" ? session.leftRoute : session.rightRoute
}

export function activeNavItemIdForSession(session) {
  if (!session) return COMPUTER_NAV_ITEM_ID
  if (isSplitSession(session)) {
    return session.focusedPane === "left" ? session.leftNavItemId : session.rightNavItemId
  }
  return session.selectedNavItemId ?? COMPUTER_NAV_ITEM_ID
}

export function loadSessions() {
  if (typeof window === "undefined") return null
  try {
    const rawV2 = window.localStorage.getItem(LS_SESSIONS)
    if (rawV2) {
      const parsed = JSON.parse(rawV2)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((s) => s && typeof s.id === "string")
      }
    }
    const rawV1 = window.localStorage.getItem(LS_SESSIONS_LEGACY)
    if (!rawV1) return null
    const parsed = JSON.parse(rawV1)
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    return parsed.filter((s) => s && typeof s.id === "string")
  } catch {
    return null
  }
}

export function saveSessions(sessions) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(LS_SESSIONS, JSON.stringify(sessions))
  } catch {
    /* ignore */
  }
}

export function loadActiveSessionId() {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(LS_ACTIVE_SESSION_ID)
  } catch {
    return null
  }
}

export function saveActiveSessionId(sessionId) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(LS_ACTIVE_SESSION_ID, sessionId)
  } catch {
    /* ignore */
  }
}

export function loadWorkspaceSessionState() {
  const stored = loadSessions()
  const sessions = (stored?.length ? stored : [createDefaultSession()]).map(normalizeSession)
  const activeId = loadActiveSessionId()
  const activeSession = sessions.find((s) => s.id === activeId) ?? sessions[0]
  return { sessions, activeSessionId: activeSession.id }
}

export function persistWorkspaceSessionState(sessions, activeSessionId) {
  saveSessions(sessions)
  saveActiveSessionId(activeSessionId)
}
