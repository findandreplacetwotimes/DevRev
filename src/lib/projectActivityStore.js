const LS_KEY = "devrev.projectActivity.v1"

function loadAll() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return {}
    const p = JSON.parse(raw)
    return p && typeof p === "object" ? p : {}
  } catch {
    return {}
  }
}

function saveAll(data) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data))
  } catch {
    /* ignore quota */
  }
}

/**
 * @typedef {{ id: string, text: string, createdAt: string, source?: string }} ProjectActivityEntry
 */

/**
 * @param {string} projectId
 * @param {string} text
 * @param {string} [source]
 * @returns {ProjectActivityEntry | null}
 */
export function appendProjectActivity(projectId, text, source = "computer-chat") {
  if (!projectId || !String(text ?? "").trim()) return null
  const all = loadAll()
  const list = Array.isArray(all[projectId]) ? all[projectId] : []
  const entry = {
    id: `pa-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    text: String(text).trim(),
    createdAt: new Date().toISOString(),
    source,
  }
  all[projectId] = [entry, ...list]
  saveAll(all)
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("devrev-project-activity", { detail: { projectId } }))
  }
  return entry
}

/**
 * @param {string} projectId
 * @returns {ProjectActivityEntry[]}
 */
export function getProjectActivities(projectId) {
  if (!projectId) return []
  const all = loadAll()
  return Array.isArray(all[projectId]) ? all[projectId] : []
}

/**
 * Remove a single activity entry by id; no-op if `projectId`/`entryId` doesn't match.
 *
 * @param {string} projectId
 * @param {string} entryId
 * @returns {boolean} — `true` when an entry was removed.
 */
export function deleteProjectActivity(projectId, entryId) {
  if (!projectId || !entryId) return false
  const all = loadAll()
  const list = Array.isArray(all[projectId]) ? all[projectId] : []
  const next = list.filter((entry) => entry.id !== entryId)
  if (next.length === list.length) return false
  all[projectId] = next
  saveAll(all)
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("devrev-project-activity", { detail: { projectId } }))
  }
  return true
}
