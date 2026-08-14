import {
  DEFAULT_TEAM_ID,
  defaultTeamId,
  normalizeTeamPathId,
  teamUrlSegment,
  projectChatNavLabel,
  teamById,
  teamChatHeaderTitle,
  teamChatNavLabel,
} from "./workspaceLabels"
import {
  DEFAULT_PROJECT_ID,
  normalizeProjectPathId,
  projectBreadcrumbProjectSuffix,
  projectByPathId,
  projectDisplayTitle,
  projectPathId,
  projectSlugFromLegacyId,
  projectUrlSegment,
} from "./projectsApi"
import { EMPTY_ISSUE_TITLE_PLACEHOLDER, issueBreadcrumbIssueSuffix } from "./issuesApi"
import {
  projectBasePath,
  projectChatHref,
  teamAboutHref,
  teamBasePath,
  teamChatHref,
  teamIssuesHref,
  teamProjectsHref,
  teamSprintsHref,
} from "./teams"

const PROJECT_TAB_SEGMENTS = {
  Overview: "",
  Scope: "/scope",
  Brief: "/brief",
  Links: "/links",
  Activity: "/activity",
}

export function teamPageDestinations(teamIdParam) {
  const teamId = normalizeTeamPathId(teamIdParam) ?? DEFAULT_TEAM_ID
  const base = teamBasePath(teamId)
  return [
    { id: "team:page:issues", label: "Issues", iconName: "page", href: `${base}/issues` },
    { id: "team:page:sprints", label: "Sprints", iconName: "page", href: `${base}/sprints` },
    { id: "team:page:projects", label: "Projects", iconName: "page", href: `${base}/projects` },
  ]
}

export function teamMenuDestinations(teamIdParam) {
  const teamId = normalizeTeamPathId(teamIdParam) ?? DEFAULT_TEAM_ID
  return [
    ...teamPageDestinations(teamId),
    { id: "team:page:about", label: "About", iconName: "page", href: teamAboutHref(teamId) },
  ]
}

/** @deprecated Use teamPageDestinations */
export const BUILD_TEAM_PAGE_DESTINATIONS = teamPageDestinations(DEFAULT_TEAM_ID)

/** @deprecated Use teamMenuDestinations */
export const BUILD_TEAM_MENU_DESTINATIONS = teamMenuDestinations(DEFAULT_TEAM_ID)

export function projectPageDestinations(projectIdParam) {
  const projectId = projectIdParam || DEFAULT_PROJECT_ID
  const base = projectBasePath(projectId)
  return [
    { id: "project:page:overview", label: "Overview", iconName: "page", href: base },
  ]
}

export function teamChatDestination(teamIdParam) {
  const teamId = normalizeTeamPathId(teamIdParam) ?? DEFAULT_TEAM_ID
  return {
    id: "team:chat",
    label: teamChatNavLabel(),
    iconName: "chat",
    memberCount: 12,
    href: teamChatHref(teamId),
    variant: "build-team",
  }
}

export function projectChatDestination(projectIdParam) {
  const projectId = projectIdParam || DEFAULT_PROJECT_ID
  return {
    id: "project:chat",
    label: projectChatNavLabel(),
    iconName: "projectChat",
    memberCount: 23,
    href: projectChatHref(projectId),
    variant: "chat-project",
  }
}

export const CHAT_PEOPLE_ITEMS = [
  { id: "chat-arjun", label: "Arjun", initial: "A" },
  { id: "chat-sneha", label: "Sneha", initial: "S" },
  { id: "chat-rohan", label: "Rohan", initial: "R" },
  { id: "chat-leela", label: "Leela", initial: "L" },
]

const chatPersonSlugById = CHAT_PEOPLE_ITEMS.reduce((acc, item) => {
  acc[item.id] = `/${String(item.label).trim().toLowerCase()}`
  return acc
}, {})

/** Global flat chat URLs (Computer + person DMs). */
export const CHAT_DESTINATIONS = [
  { id: "computer", label: "Computer", iconName: "computer", href: "/computer", variant: "ai" },
  ...CHAT_PEOPLE_ITEMS.map((p) => ({
    id: p.id,
    label: p.label,
    initial: p.initial,
    iconName: "person",
    href: chatPersonSlugById[p.id],
    variant: p.id,
  })),
]

/**
 * @param {string} pathname
 * @returns {{ scope: "team" | "project" | "global", teamId?: string, projectId?: string }}
 */
export function parseWorkspaceRoute(pathname) {
  if (!pathname || typeof pathname !== "string") {
    return { scope: "global" }
  }

  const teamMatch = /^\/team\/([^/]+)(?:\/|$)/.exec(pathname)
  if (teamMatch) {
    return {
      scope: "team",
      teamId: decodeURIComponent(teamMatch[1]),
      projectId: undefined,
    }
  }

  const projectMatch = /^\/project\/([^/]+)(?:\/|$)/.exec(pathname)
  if (projectMatch) {
    return {
      scope: "project",
      projectId: decodeURIComponent(projectMatch[1]),
      teamId: undefined,
    }
  }

  return { scope: "global" }
}

function resolveProjectIdFromContext(context, projects) {
  if (context?.projectId) {
    const id = String(context.projectId).trim()
    if (/^Project-\d+$/i.test(id)) return normalizeProjectPathId(id, projects)
    return projectSlugFromLegacyId(id) ?? normalizeProjectPathId(id, projects)
  }
  if (context?.projectSlug) {
    const segment = String(context.projectSlug).trim()
    if (/^Project-\d+$/i.test(segment)) return segment
    return projectSlugFromLegacyId(segment) ?? normalizeProjectPathId(segment, projects)
  }
  return undefined
}

function normalizeNavContext(context, projects) {
  if (typeof context === "string") {
    const projectId = resolveProjectIdFromContext({ projectId: context }, projects) ?? DEFAULT_PROJECT_ID
    return {
      teamId: DEFAULT_TEAM_ID,
      projectId,
    }
  }
  const projectId = resolveProjectIdFromContext(context, projects) ?? DEFAULT_PROJECT_ID
  return {
    teamId: normalizeTeamPathId(context?.teamId ?? context?.teamSlug) ?? DEFAULT_TEAM_ID,
    projectId,
  }
}

export function issueHref(issueId, context = {}, projects) {
  const normalized = normalizeNavContext(context, projects)
  const { teamId, projectId } = normalized
  const scope = context?.scope
  const encodedIssue = encodeURIComponent(issueId)
  if (scope === "project" && projectId) {
    return `${projectBasePath(projectId)}/issues/${encodedIssue}`
  }
  return `${teamBasePath(teamId)}/issues/${encodedIssue}`
}

/**
 * Issue detail breadcrumbs — project pictogram when opened from a project; team bolt from Issues/Sprints.
 *
 * @param {object} params
 * @param {{ id: string, projectId?: string | null }} params.issue
 * @param {string} [params.teamId]
 * @param {import("./issuesApi").Project[] | null} [params.projects]
 * @param {string | null} [params.sourceProjectId] — `location.state` from project-scoped navigation
 * @param {boolean} [params.sourceSprints]
 * @param {string} [params.scope] — workspace scope from URL (`team` | `project`)
 * @param {string | null} [params.scopeProjectId]
 */
export function buildIssueBreadcrumbSegments({
  issue,
  teamId,
  projects = null,
  sourceProjectId = null,
  sourceSprints = false,
  scope = "team",
  scopeProjectId = null,
}) {
  const resolvedTeamId = teamId ?? DEFAULT_TEAM_ID
  const issueLeaf = {
    label: "Issue",
    suffix: issueBreadcrumbIssueSuffix(issue.id),
    showIcon: false,
  }

  const trimmedSource =
    typeof sourceProjectId === "string" && sourceProjectId.trim().length > 0 ? sourceProjectId.trim() : null
  const effectiveProjectId = trimmedSource ?? (scope === "project" && scopeProjectId ? scopeProjectId : null)

  if (effectiveProjectId) {
    const projectRecord = (projects ?? []).find((row) => row.id === effectiveProjectId) ?? { id: effectiveProjectId }
    const pathId = projectPathId(projectRecord)
    return {
      segments: [
        {
          label: "Projects",
          href: teamProjectsHref(resolvedTeamId),
          iconName: "project",
          showIcon: true,
          showLabel: false,
        },
        {
          label: "Project",
          suffix: projectBreadcrumbProjectSuffix(projectRecord.id),
          href: projectOverviewHref(pathId),
          showIcon: false,
        },
        issueLeaf,
      ],
      projectId: projectRecord.id,
    }
  }

  if (sourceSprints) {
    return {
      segments: [
        {
          label: "Sprints",
          href: teamSprintsHref(resolvedTeamId),
          iconName: "team",
          showIcon: true,
        },
        issueLeaf,
      ],
      projectId: issue.projectId ?? null,
    }
  }

  return {
    segments: [
      {
        label: "Issues",
        href: teamIssuesHref(resolvedTeamId),
        iconName: "team",
        showIcon: true,
      },
      issueLeaf,
    ],
    projectId: issue.projectId ?? null,
  }
}

export function projectOverviewHref(projectIdParam) {
  return projectBasePath(projectIdParam || DEFAULT_PROJECT_ID)
}

export function projectTabHref(projectIdParam, tabLabel) {
  const suffix = PROJECT_TAB_SEGMENTS[tabLabel] ?? ""
  return `${projectBasePath(projectIdParam || DEFAULT_PROJECT_ID)}${suffix}`
}

export function routeForNavItemId(navItemId, context, projects) {
  if (!navItemId || typeof navItemId !== "string") return null
  const { teamId, projectId } = normalizeNavContext(context, projects)

  const globalChat = CHAT_DESTINATIONS.find((d) => d.id === navItemId)
  if (globalChat) return globalChat.href

  if (navItemId === "team:chat" || navItemId === "build-team") {
    return teamChatDestination(teamId).href
  }
  if (navItemId === "project:chat" || navItemId === "chat-project") {
    return projectChatDestination(projectId).href
  }

  if (navItemId.startsWith("team:page:")) {
    return teamMenuDestinations(teamId).find((d) => d.id === navItemId)?.href ?? null
  }
  if (navItemId.startsWith("project:page:")) {
    return projectPageDestinations(projectId).find((d) => d.id === navItemId)?.href ?? null
  }

  if (navItemId === "page:issues") return teamPageDestinations(teamId).find((d) => d.id === "team:page:issues")?.href
  if (navItemId === "page:sprints") return teamPageDestinations(teamId).find((d) => d.id === "team:page:sprints")?.href
  if (navItemId === "page:projects") return teamPageDestinations(teamId).find((d) => d.id === "team:page:projects")?.href
  if (navItemId === "about") return teamAboutHref(teamId)
  if (navItemId === "page:project-overview") return projectPageDestinations(projectId).find((d) => d.id === "project:page:overview")?.href
  if (navItemId === "page:project-scope") return projectTabHref(projectId, "Scope")

  return null
}

export function chatVariantForRoute(route) {
  if (!route || typeof route !== "string") return null
  const pathname = route.split("?")[0]

  const global = CHAT_DESTINATIONS.find((d) => d.href === pathname)
  if (global) return global.variant

  if (/^\/team\/[^/]+\/chat$/.test(pathname)) return "build-team"
  if (/^\/project\/[^/]+\/chat$/.test(pathname)) return "chat-project"

  return null
}

/** Tab icon mapping — group chats use team/project pictograms; person DMs use avatars. */
export function navIconForNavItemId(navItemId) {
  if (navItemId === "computer") return { type: "icon", iconName: "computer" }
  if (navItemId === "team:chat" || navItemId === "build-team") return { type: "icon", iconName: "team" }
  if (navItemId === "project:chat" || navItemId === "chat-project") return { type: "icon", iconName: "project" }
  if (typeof navItemId === "string" && navItemId.startsWith("team:page:")) {
    return { type: "icon", iconName: "team" }
  }
  if (typeof navItemId === "string" && navItemId.startsWith("project:page:")) {
    return { type: "icon", iconName: "project" }
  }
  if (navItemId === "page:issues" || navItemId === "page:sprints" || navItemId === "page:projects" || navItemId === "about") {
    return { type: "icon", iconName: "team" }
  }
  if (navItemId === "page:project-overview" || navItemId === "page:project-scope") {
    return { type: "icon", iconName: "project" }
  }
  const person = CHAT_PEOPLE_ITEMS.find((item) => item.id === navItemId)
  if (person) return { type: "avatar", initial: person.initial }
  return { type: "icon", iconName: "computer" }
}

function allDestinationsForContext(context, projects) {
  const { teamId, projectId } = normalizeNavContext(context, projects)
  return [
    ...teamMenuDestinations(teamId),
    ...projectPageDestinations(projectId),
    teamChatDestination(teamId),
    projectChatDestination(projectId),
    ...CHAT_DESTINATIONS,
  ]
}

export function findDestinationByHref(href, context, projects) {
  const all = allDestinationsForContext(context, projects)
  return all.find((item) => item.href === href) ?? null
}

export function navItemIdForLocation(pathname, search = "", context, projects) {
  const parsed = parseWorkspaceRoute(pathname)
  const ctx = {
    ...normalizeNavContext(context, projects),
    scope: parsed.scope,
    teamId: parsed.teamId ?? normalizeNavContext(context, projects).teamId,
    projectId: parsed.projectId ?? normalizeNavContext(context, projects).projectId,
  }

  const full = `${pathname}${search}`
  const exact = findDestinationByHref(full, ctx, projects)
  if (exact) return exact.id
  const pathnameOnly = findDestinationByHref(pathname, ctx, projects)
  if (pathnameOnly) return pathnameOnly.id

  const globalChat = CHAT_DESTINATIONS.find((d) => d.href === pathname)
  if (globalChat) return globalChat.id

  if (parsed.scope === "team") {
    if (pathname.endsWith("/chat")) return "team:chat"
    if (pathname.includes("/issues/")) return "team:page:issues"
    if (pathname.endsWith("/issues")) return "team:page:issues"
    if (pathname.endsWith("/projects")) return "team:page:projects"
    if (pathname.endsWith("/sprints")) return "team:page:sprints"
    if (pathname.endsWith("/about")) return "team:page:about"
  }

  if (parsed.scope === "project" && parsed.projectId) {
    if (pathname.endsWith("/chat")) return "project:chat"
    if (pathname.includes("/issues/")) return "project:page:overview"
    if (pathname.endsWith("/scope")) return "project:page:overview"
    if (pathname.endsWith("/brief")) return "project:page:overview"
    if (pathname.endsWith("/links")) return "project:page:overview"
    if (pathname.endsWith("/activity")) return "project:page:overview"
    return "project:page:overview"
  }

  return "team:page:issues"
}

const LS_ISSUES_ACTIVE_SECTION = "devrev.issues.activeSection.v1"
const LS_SPRINT_ACTIVE_FILTER = "devrev.sprints.activeFilter.v1"
const LS_SPRINT_PAGE_FILTERS = "devrev.sprints.pageFilters.v1"

function issuesListPageTitle() {
  if (typeof window === "undefined") return "Issues"
  try {
    const raw = window.localStorage.getItem(LS_ISSUES_ACTIVE_SECTION)
    if (raw === "backlog") return "Backlog"
  } catch {
    /* ignore */
  }
  return "Issues"
}

function sprintsPageTitle() {
  if (typeof window === "undefined") return "Sprints"
  try {
    const rawFilters = window.localStorage.getItem(LS_SPRINT_PAGE_FILTERS)
    const rawActive = window.localStorage.getItem(LS_SPRINT_ACTIVE_FILTER)
    const parsed = rawFilters ? JSON.parse(rawFilters) : null
    const activeId = rawActive === "filterA" || rawActive === "filterB" ? rawActive : "filterB"
    const sprintId = parsed?.[activeId]?.sprintId
    if (typeof sprintId === "string" && sprintId.trim()) return sprintId.trim()
  } catch {
    /* ignore */
  }
  return "Sprints"
}

function issuePageTitle(issueId, issues) {
  const list = Array.isArray(issues) ? issues : []
  const issue = list.find((row) => row.id === issueId)
  if (!issue) return issueId
  const trimmed = typeof issue.title === "string" ? issue.title.trim() : ""
  return trimmed.length > 0 ? trimmed : EMPTY_ISSUE_TITLE_PLACEHOLDER
}

/**
 * @param {string} route
 * @param {{
 *   teamId?: string
 *   projectName?: string
 *   issues?: import("./issuesApi").Issue[]
 *   projects?: import("./issuesApi").Project[]
 * }} [titleContext]
 */
export function tabTitleForRoute(route, titleContext = {}) {
  const [pathname, queryPart] = (route ?? "").split("?")
  const params = new URLSearchParams(queryPart ?? "")

  if (pathname === "/team-members") return "Team"

  const globalChat = CHAT_DESTINATIONS.find((d) => d.href === pathname)
  if (globalChat) return globalChat.label

  const parsed = parseWorkspaceRoute(pathname)
  const { issues, projects } = titleContext

  if (parsed.scope === "team") {
    const team = teamById(parsed.teamId ?? titleContext.teamId)
    if (pathname.endsWith("/chat")) return teamChatHeaderTitle(team)
    const issueMatch = pathname.match(/\/issues\/([^/]+)$/)
    if (issueMatch) return issuePageTitle(decodeURIComponent(issueMatch[1]), issues)
    if (pathname.endsWith("/issues")) return issuesListPageTitle()
    if (pathname.endsWith("/projects")) return "Projects"
    if (pathname.endsWith("/sprints")) return sprintsPageTitle()
    if (pathname.endsWith("/about")) return "About"
  }

  if (parsed.scope === "project" && parsed.projectId) {
    if (pathname.endsWith("/chat")) {
      const name = titleContext.projectName
      return name ? `${name} Project chat` : "Project chat"
    }
    if (params.get("settings") === "1") return "Settings"
    const issueMatch = pathname.match(/\/issues\/([^/]+)$/)
    if (issueMatch) return issuePageTitle(decodeURIComponent(issueMatch[1]), issues)
    if (pathname.endsWith("/scope")) return "Scope"
    if (pathname.endsWith("/brief")) return "Brief"
    if (pathname.endsWith("/links")) return "Links"
    if (pathname.endsWith("/activity")) return "Activity"
    const project = projectByPathId(parsed.projectId, projects)
    if (project) return projectDisplayTitle(project)
    return titleContext.projectName || "Overview"
  }

  if (!route || route === "/issues") return issuesListPageTitle()
  if (route === "/sprints") return sprintsPageTitle()
  if (route === "/projects") return "Projects"
  if (route === "/about") return "About"

  return "Page"
}

function migrateLegacyProjectPath(pathname, search) {
  const rest = pathname.slice("/projects/".length)
  const legacyId = decodeURIComponent(rest.split("/")[0])
  const projectId = projectSlugFromLegacyId(legacyId) ?? normalizeProjectPathId(legacyId)
  const encoded = encodeURIComponent(projectUrlSegment(projectId))
  const params = new URLSearchParams(search)
  const tab = params.get("tab")
  if (tab === "Scope") return `/project/${encoded}/scope`
  if (tab === "Brief") return `/project/${encoded}/brief`
  if (tab === "Links") return `/project/${encoded}/links`
  if (tab === "Activity") return `/project/${encoded}/activity`
  return `/project/${encoded}${search}`
}

function migrateLegacyProjectNamespacePath(pathname, search) {
  const rest = pathname.slice("/project/".length)
  const segment = decodeURIComponent(rest.split("/")[0])
  const projectId = projectSlugFromLegacyId(segment) ?? normalizeProjectPathId(segment)
  const suffix = rest.includes("/") ? rest.slice(rest.indexOf("/")) : ""
  return `/project/${encodeURIComponent(projectUrlSegment(projectId))}${suffix}${search}`
}

function migrateLegacyTeamPath(pathname, search) {
  const rest = pathname.slice("/team/".length)
  const segment = decodeURIComponent(rest.split("/")[0])
  const teamId = normalizeTeamPathId(segment)
  const suffix = rest.includes("/") ? rest.slice(rest.indexOf("/")) : ""
  return `/team/${encodeURIComponent(teamUrlSegment(teamId))}${suffix}${search}`
}

/** Rewrite legacy flat routes to the new team/project namespaces. */
export function migrateLegacyRoute(route) {
  if (!route || typeof route !== "string") return route
  const [pathname, queryPart] = route.split("?")
  const search = queryPart ? `?${queryPart}` : ""

  if (pathname.startsWith("/team/")) {
    const segment = decodeURIComponent(pathname.slice("/team/".length).split("/")[0])
    const urlSegment = teamUrlSegment(segment)
    if (segment !== urlSegment) {
      return migrateLegacyTeamPath(pathname, search)
    }
  }

  if (pathname === "/issues") return `${teamBasePath(DEFAULT_TEAM_ID)}/issues`
  if (pathname.startsWith("/issues/")) {
    const issueId = pathname.slice("/issues/".length)
    return `${teamBasePath(DEFAULT_TEAM_ID)}/issues/${issueId}${search}`
  }
  if (pathname === "/projects") return `${teamBasePath(DEFAULT_TEAM_ID)}/projects`
  if (pathname.startsWith("/projects/")) {
    return migrateLegacyProjectPath(pathname, search)
  }
  if (pathname.startsWith("/project/")) {
    const segment = decodeURIComponent(pathname.slice("/project/".length).split("/")[0])
    const urlSegment = projectUrlSegment(segment)
    if (segment !== urlSegment) {
      return migrateLegacyProjectNamespacePath(pathname, search)
    }
  }
  if (pathname === "/sprints") return `${teamBasePath(DEFAULT_TEAM_ID)}/sprints`
  if (pathname === "/about") return teamAboutHref(DEFAULT_TEAM_ID)
  if (pathname === "/build-team") return teamChatHref(DEFAULT_TEAM_ID)
  if (pathname === "/project-chat") return projectChatHref(DEFAULT_PROJECT_ID)

  return route
}

/** @deprecated Use tabTitleForRoute */
export function tabLabelForRoute(route) {
  const title = tabTitleForRoute(route)
  return { tabPrefix: title, tabSuffix: undefined }
}
