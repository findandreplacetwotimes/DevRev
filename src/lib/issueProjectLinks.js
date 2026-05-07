/** @typedef {import("./issuesApi").Issue} Issue */
/** @typedef {import("./issuesApi").Project} Project */

/**
 * @param {unknown} raw
 * @returns {string | null}
 */
export function sanitizeIssueProjectId(raw) {
  if (raw === null || typeof raw === "undefined") return null
  if (typeof raw !== "string") return null
  const t = raw.trim()
  if (!t) return null
  const m = /^Project-(\d+)$/i.exec(t)
  if (!m) return null
  const n = Number.parseInt(m[1], 10)
  if (!Number.isFinite(n) || n < 1) return null
  return `Project-${String(n).padStart(4, "0")}`
}

/**
 * @param {unknown} raw
 * @returns {string | null}
 */
export function sanitizeIssueMilestoneId(raw) {
  if (raw === null || typeof raw === "undefined") return null
  if (typeof raw !== "string") return null
  const t = raw.trim()
  return t.length > 0 ? t : null
}

/**
 * Clear bad links: unknown project → drop project + milestone; unknown milestone on project → drop milestone only.
 *
 * @param {Issue[]} issues
 * @param {Project[]} projects
 * @returns {Issue[]}
 */
export function reconcileIssueProjectFields(issues, projects) {
  const byProject = new Map(projects.map((p) => [p.id, new Set((p.milestones ?? []).map((m) => m.id))]))

  return issues.map((issue) => {
    const pid = issue.projectId ?? null
    if (!pid) {
      return { ...issue, projectId: null, milestoneId: null }
    }

    const milestoneIds = byProject.get(pid)
    if (!milestoneIds) {
      return { ...issue, projectId: null, milestoneId: null }
    }

    const mid = issue.milestoneId ?? null
    if (!mid || !milestoneIds.has(mid)) {
      return { ...issue, projectId: pid, milestoneId: null }
    }

    return { ...issue, projectId: pid, milestoneId: mid }
  })
}
