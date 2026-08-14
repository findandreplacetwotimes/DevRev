import {
  projectChatHeaderTitleFromName,
  projectGroupLabelFromName,
  slugifyName,
} from "./workspaceLabels"

/** UI copy when `title` is empty. */
export const EMPTY_PROJECT_TITLE_PLACEHOLDER = "No title"

/** Default workspace project when none is in scope. */
export const DEFAULT_PROJECT_ID = "Project-0001"

/** Map legacy name-based URL segments to project ids. */
const LEGACY_NAME_SEGMENT_TO_ID = {
  core: DEFAULT_PROJECT_ID,
}

/** @typedef {import("./issuesApi").Issue} Issue */
/** @typedef {import("./issuesApi").Project} Project */

/** Label source for nav group / chat chrome — prefers document `title`. */
export function projectNavLabelTitle(project) {
  if (!project || typeof project !== "object") return ""
  const trimmed = typeof project.title === "string" ? project.title.trim() : ""
  if (trimmed) return trimmed
  const name = typeof project.name === "string" ? project.name.trim() : ""
  if (name) return name
  return typeof project.id === "string" ? project.id : ""
}

/** Canonical record id for a project (`Project-0001`). */
export function projectPathId(project) {
  if (!project || typeof project.id !== "string" || !project.id.trim()) return DEFAULT_PROJECT_ID
  return project.id.trim()
}

/** Lowercase URL path segment (`project-0001`). */
export function projectUrlSegment(projectOrId, projects) {
  if (projectOrId && typeof projectOrId === "object") {
    return projectPathId(projectOrId).toLowerCase()
  }
  return normalizeProjectPathId(projectOrId, projects).toLowerCase()
}

/**
 * Canonicalize a `/project/:segment` value to a project id.
 * @param {string} segment
 * @param {Project[]} [projects]
 */
export function normalizeProjectPathId(segment, projects) {
  if (!segment || typeof segment !== "string") return DEFAULT_PROJECT_ID
  const decoded = decodeURIComponent(segment).trim()
  const idMatch = /^Project-(\d+)$/i.exec(decoded)
  if (idMatch) return `Project-${idMatch[1].padStart(4, "0")}`

  const legacy = LEGACY_NAME_SEGMENT_TO_ID[decoded.toLowerCase()]
  if (legacy) return legacy

  const list = Array.isArray(projects) ? projects : []
  const fromNameSlug = list.find((p) => slugifyName(projectName(p)) === decoded.toLowerCase())
  if (fromNameSlug) return fromNameSlug.id

  return decoded
}

/**
 * @param {string} pathId
 * @param {Project[]} projects
 * @returns {Project | null}
 */
export function projectByPathId(pathId, projects) {
  const normalized = normalizeProjectPathId(pathId, projects)
  const list = Array.isArray(projects) ? projects : []
  return list.find((p) => p.id === normalized) ?? null
}

/** @deprecated Use projectByPathId */
export function projectBySlug(slug, projects) {
  return projectByPathId(slug, projects)
}

/** Short name fallback (not used for nav labels). */
export function projectName(project) {
  if (!project || typeof project !== "object") return ""
  const explicit = typeof project.name === "string" ? project.name.trim() : ""
  if (explicit) return explicit
  const title = typeof project.title === "string" ? project.title.trim() : ""
  if (title) {
    const firstWord = title.split(/\s+/)[0]
    if (firstWord) return firstWord
  }
  const id = typeof project.id === "string" ? project.id : ""
  const m = /^Project-(\d+)$/i.exec(id)
  return m ? `Project ${m[1]}` : id || "Project"
}

/** @deprecated Use projectPathId */
export function projectSlug(project) {
  return projectPathId(project)
}

export function projectGroupLabel(project) {
  return projectGroupLabelFromName(projectNavLabelTitle(project))
}

export function projectChatHeaderTitle(project) {
  return projectChatHeaderTitleFromName(projectNavLabelTitle(project))
}

/** Visible project name — matches projects table / listings (same string when title is edited). */
export function projectDisplayTitle(project) {
  if (!project || typeof project !== "object") return ""
  const trimmed = typeof project.title === "string" ? project.title.trim() : ""
  return trimmed.length > 0 ? trimmed : EMPTY_PROJECT_TITLE_PLACEHOLDER
}

/**
 * Which project drives the workspace project-chat lane (nav label, header, message thread).
 * With a single row use it; with legacy multi-project storage prefer `Project-0001`, else first id lexically.
 */
export function resolveProjectForWorkspaceChat(projects) {
  if (!Array.isArray(projects) || projects.length === 0) return null
  if (projects.length === 1) return projects[0]
  const preferred = projects.find((p) => p && p.id === "Project-0001")
  if (preferred) return preferred
  return [...projects].sort((a, b) => String(a.id).localeCompare(String(b.id)))[0]
}

/**
 * Issues whose `projectId` matches the project (project **scope** size = `length`).
 * @param {Project} project
 * @param {Issue[]} issues
 */
export function issuesLinkedToProject(project, issues) {
  return issues.filter((i) => i.projectId === project.id)
}

/**
 * Linked issues assigned to a milestone on the project.
 * @param {string} projectId
 * @param {string} milestoneId
 * @param {Issue[]} issues
 */
export function issuesForMilestone(projectId, milestoneId, issues) {
  return issues.filter((i) => i.projectId === projectId && i.milestoneId === milestoneId)
}

/**
 * Counts for planning: total linked, per milestone, and linked-but-not-on-any milestone row.
 * @param {Project} project
 * @param {Issue[]} issues
 */
export function projectScopeSummary(project, issues) {
  const linked = issuesLinkedToProject(project, issues)
  const milestoneIds = new Set((project.milestones ?? []).map((m) => m.id))
  /** @type {Record<string, number>} */
  const perMilestone = {}
  for (const id of milestoneIds) perMilestone[id] = 0
  let inKnownMilestone = 0
  for (const issue of linked) {
    const mid = issue.milestoneId
    if (mid && milestoneIds.has(mid)) {
      perMilestone[mid] += 1
      inKnownMilestone += 1
    }
  }
  return {
    totalLinked: linked.length,
    perMilestone,
    unassignedToMilestone: linked.length - inKnownMilestone,
  }
}

/**
 * Stable ticket chip from id `Project-0001`.
 * @param {string} id
 */
export function ticketChipFromProjectId(id) {
  const m = /^Project-(\d+)$/i.exec(String(id).trim())
  return { ticketPrefix: "Project", ticketNumber: m ? m[1] : "" }
}

/** Breadcrumb `-####` fragment (leading hyphen). */
export function projectBreadcrumbProjectSuffix(id) {
  const { ticketNumber } = ticketChipFromProjectId(id)
  if (ticketNumber) return `-${ticketNumber}`
  const s = String(id ?? "").trim()
  if (/^Project-/i.test(s)) return `-${s.replace(/^Project-/i, "")}`
  return `-${s}`
}

/** @deprecated Legacy name-slug URLs map to project ids. */
export function projectSlugFromLegacyId(projectId) {
  if (!projectId || typeof projectId !== "string") return null
  const decoded = projectId.trim()
  if (/^Project-\d+$/i.test(decoded)) return decoded
  return LEGACY_NAME_SEGMENT_TO_ID[decoded.toLowerCase()] ?? null
}
