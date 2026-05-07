/**
 * Shared Sprint / Stage values stored on Issue and Project.
 * Issue sprint: "Sprint 1".."Sprint 5".
 */

export const ISSUE_DEFAULT_SPRINT = "Sprint 1"
export const ISSUE_DEFAULT_STAGE = "No stage"
export const ISSUE_DEFAULT_PRIORITY = "None"

export const STAGE_ALLOWED = ["No stage", "Triage", "In Progress", "In review"]
export const SPRINT_ALLOWED = ["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4", "Sprint 5"]
export const PRIORITY_ALLOWED = ["None", "P0", "P1", "P2"]

/**
 * @param {unknown} raw
 * @returns {string}
 */
export function sanitizeSprint(raw) {
  if (typeof raw !== "string") return ISSUE_DEFAULT_SPRINT
  const t = raw.trim()
  const sprintNum = /^sprint\s+([1-5])$/i.exec(t)
  if (sprintNum) return `Sprint ${sprintNum[1]}`
  if (SPRINT_ALLOWED.includes(t)) return t
  return ISSUE_DEFAULT_SPRINT
}

/**
 * @param {unknown} raw
 * @returns {string}
 */
export function sanitizeStage(raw) {
  if (typeof raw !== "string") return ISSUE_DEFAULT_STAGE
  const t = raw.trim()
  return STAGE_ALLOWED.includes(t) ? t : ISSUE_DEFAULT_STAGE
}

/**
 * @param {unknown} raw
 * @returns {string}
 */
export function sanitizePriority(raw) {
  if (typeof raw !== "string") return ISSUE_DEFAULT_PRIORITY
  const t = raw.trim().toUpperCase()
  if (t === "NONE") return "None"
  if (t === "P0" || t === "P1" || t === "P2") return t
  return ISSUE_DEFAULT_PRIORITY
}

/**
 * @param {unknown} raw
 * @param {Date} [fallback]
 * @returns {string} ISO date `YYYY-MM-DD`
 */
export function sanitizeCreatedDate(raw, fallback = new Date()) {
  if (typeof raw === "string") {
    const t = raw.trim()
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t)
    if (m) return `${m[1]}-${m[2]}-${m[3]}`
  }
  const y = fallback.getFullYear()
  const m = String(fallback.getMonth() + 1).padStart(2, "0")
  const d = String(fallback.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}
