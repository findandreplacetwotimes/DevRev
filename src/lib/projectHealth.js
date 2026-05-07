export const PROJECT_HEALTH_DEFAULT_ID = "on-track"

/** @type {{ id: string, label: string }[]} */
export const PROJECT_HEALTH_OPTIONS = [
  { id: "off-track", label: "Off track" },
  { id: "at-risk", label: "At risk" },
  { id: "on-track", label: "On track" },
]

const ALLOWED_IDS = new Set(PROJECT_HEALTH_OPTIONS.map((row) => row.id))

/**
 * @param {unknown} raw
 * @returns {string}
 */
export function sanitizeProjectHealthId(raw) {
  if (typeof raw !== "string") return PROJECT_HEALTH_DEFAULT_ID
  const t = raw.trim()
  return ALLOWED_IDS.has(t) ? t : PROJECT_HEALTH_DEFAULT_ID
}
