/**
 * @typedef {import("./projectMilestones").ProjectMilestone} ProjectMilestone
 */

/**
 * @typedef {object} Issue
 * @property {string} id
 * @property {string} team
 * @property {string} title
 * @property {string} description
 * @property {string | null} ownerId
 * @property {string | null} dueDateId
 * @property {string} priority
 * @property {string} createdDate — ISO date `YYYY-MM-DD` (immutable)
 * @property {string} sprint
 * @property {string} stage
 * @property {string | null} projectId — `Project-####` or null when not in a project scope
 * @property {string | null} milestoneId — id of a milestone on `projectId`, or null
 */

/**
 * Mirrors Issue attributes; ids are `Project-0001`, `Project-0002`, … (four digits).
 * Projects carry `healthId`; **scope** is issues with `projectId` here, grouped by `milestones`.
 * @typedef {object} Project
 * @property {string} id
 * @property {string} team
 * @property {string} title
 * @property {string} description
 * @property {string | null} ownerId
 * @property {string | null} dueDateId
 * @property {string} sprint
 * @property {string} stage
 * @property {string} healthId
 * @property {ProjectMilestone[]} milestones
 */

/**
 * Sprint planning object used by sprint board filters.
 * @typedef {object} Sprint
 * @property {string} id
 * @property {string} startDate — ISO date `YYYY-MM-DD`
 * @property {string} endDate — ISO date `YYYY-MM-DD` (derived from `startDate` + 14 days)
 */

export const ISSUES_API_PATH = "/api/issues"

/** UI copy when `title` is empty. */
export const EMPTY_ISSUE_TITLE_PLACEHOLDER = "No title"

/**
 * Stable ticket chip from id `Issue-0001`.
 * @param {string} id
 */
export function ticketChipFromIssueId(id) {
  const m = /^Issue-(\d+)$/i.exec(String(id).trim())
  return { ticketPrefix: "Issue", ticketNumber: m ? m[1] : "" }
}

/** Breadcrumb `-####` fragment (leading hyphen); Figma `5662:256686` pairs with `"Issue"` label. */
export function issueBreadcrumbIssueSuffix(id) {
  const { ticketNumber } = ticketChipFromIssueId(id)
  if (ticketNumber) return `-${ticketNumber}`
  const s = String(id ?? "").trim()
  if (/^Issue-/i.test(s)) return `-${s.replace(/^Issue-/i, "")}`
  return `-${s}`
}

