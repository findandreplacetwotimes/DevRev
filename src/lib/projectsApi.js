/** UI copy when `title` is empty. */
export const EMPTY_PROJECT_TITLE_PLACEHOLDER = "No title"

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

/** @typedef {import("./issuesApi").Issue} Issue */
/** @typedef {import("./issuesApi").Project} Project */

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
