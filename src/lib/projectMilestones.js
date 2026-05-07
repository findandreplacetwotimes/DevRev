import { sanitizeProjectHealthId } from "./projectHealth"

/**
 * Group under a project: shared target due + health for all issues assigned to this milestone (`id`).
 *
 * @typedef {object} ProjectMilestone
 * @property {string} id — stable within the project (e.g. `Project-0001:m1`)
 * @property {string} title
 * @property {string | null} dueDateId
 * @property {string} healthId
 */

/**
 * @param {unknown} raw
 * @returns {import("./projectMilestones").ProjectMilestone | null}
 */
export function sanitizeProjectMilestone(raw) {
  if (!raw || typeof raw !== "object") return null

  const id = typeof raw.id === "string" ? raw.id.trim() : ""
  if (!id) return null

  const rawTitle = typeof raw.title === "string" ? raw.title.trim() : ""
  const title = rawTitle.length > 0 ? rawTitle : "Milestone"

  let dueDateId = null
  if (typeof raw.dueDateId === "string" && raw.dueDateId.trim()) dueDateId = raw.dueDateId.trim()
  else if (raw.dueDateId === null || typeof raw.dueDateId === "undefined") dueDateId = null
  else return null

  return {
    id,
    title,
    dueDateId,
    healthId: sanitizeProjectHealthId(raw.healthId),
  }
}

/**
 * @param {unknown} raw
 * @returns {import("./projectMilestones").ProjectMilestone[]}
 */
export function sanitizeProjectMilestonesArray(raw) {
  if (!Array.isArray(raw)) return []
  const seen = new Set()
  /** @type {import("./projectMilestones").ProjectMilestone[]} */
  const out = []
  for (const item of raw) {
    const m = sanitizeProjectMilestone(item)
    if (!m || seen.has(m.id)) continue
    seen.add(m.id)
    out.push(m)
  }
  return out
}

/** Display + persisted title: `Milestone 1`, `Milestone 2`, … by order on the project. */
export function milestoneLabelAtIndex(indexZeroBased) {
  return `Milestone ${indexZeroBased + 1}`
}

/**
 * @param {import("./projectMilestones").ProjectMilestone[] | undefined} milestones
 * @param {string | null | undefined} milestoneId
 * @returns {string | null}
 */
export function milestoneOrdinalLabel(milestones, milestoneId) {
  if (!milestoneId || !Array.isArray(milestones)) return null
  const idx = milestones.findIndex((m) => m.id === milestoneId)
  if (idx < 0) return null
  return milestoneLabelAtIndex(idx)
}

/**
 * Normalize stored `title` so every milestone follows Milestone # (order within the project).
 * @param {import("./issuesApi").Project[]} projects
 * @returns {import("./issuesApi").Project[]}
 */
export function applySequentialMilestoneTitles(projects) {
  return projects.map((p) => ({
    ...p,
    milestones: (p.milestones ?? []).map((m, i) => ({
      ...m,
      title: milestoneLabelAtIndex(i),
    })),
  }))
}
