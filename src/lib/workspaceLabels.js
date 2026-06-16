/** @typedef {'team' | 'project'} LabelType */

/**
 * @typedef {object} TeamEntity
 * @property {'team'} type
 * @property {string} id — stable URL segment (`Team-0001`)
 * @property {string} name
 * @property {string} slug — legacy name slug for migration only
 * @property {string | null} dataTeam
 */

/** @type {TeamEntity[]} */
export const TEAM_ENTITIES = [
  { type: "team", id: "Team-0001", name: "Build", slug: "build", dataTeam: null },
  { type: "team", id: "Team-0002", name: "Core", slug: "core", dataTeam: "Core" },
  { type: "team", id: "Team-0003", name: "Growth", slug: "growth", dataTeam: "Growth" },
  { type: "team", id: "Team-0004", name: "Platform", slug: "platform", dataTeam: "Platform" },
  { type: "team", id: "Team-0005", name: "Design", slug: "design", dataTeam: "Design" },
  { type: "team", id: "Team-0006", name: "Infrastructure", slug: "infrastructure", dataTeam: "Infrastructure" },
]

export const DEFAULT_TEAM_ID = "Team-0001"

const LEGACY_TEAM_SLUGS = {
  "build-team": "build",
}

/** Map legacy name slugs to team ids. */
const LEGACY_SLUG_TO_TEAM_ID = Object.fromEntries(
  TEAM_ENTITIES.map((t) => [t.slug, t.id])
)
LEGACY_SLUG_TO_TEAM_ID["build-team"] = DEFAULT_TEAM_ID

export function slugifyName(name) {
  return String(name ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
}

export function normalizeTeamSlug(slug) {
  if (!slug || typeof slug !== "string") return null
  const normalized = slug.trim().toLowerCase()
  return LEGACY_TEAM_SLUGS[normalized] ?? normalized
}

/** @deprecated Use defaultTeamId */
export function defaultTeamSlug() {
  return "build"
}

export function defaultTeamId() {
  return DEFAULT_TEAM_ID
}

/** Canonical record id for a team entity or path/id input (`Team-0001`). */
export function teamPathId(team) {
  if (!team) return DEFAULT_TEAM_ID
  if (typeof team === "string") {
    const resolved = teamById(team)
    return resolved?.id ?? DEFAULT_TEAM_ID
  }
  if (typeof team.id === "string" && team.id.trim()) return team.id.trim()
  const bySlug = team.slug ? teamBySlug(team.slug) : null
  return bySlug?.id ?? DEFAULT_TEAM_ID
}

/** Lowercase URL path segment (`team-0001`). */
export function teamUrlSegment(teamOrId) {
  if (teamOrId && typeof teamOrId === "object") {
    return teamPathId(teamOrId).toLowerCase()
  }
  return normalizeTeamPathId(teamOrId).toLowerCase()
}

/**
 * Canonicalize a `/team/:segment` value to a team id.
 * @param {string} segment
 */
export function normalizeTeamPathId(segment) {
  if (!segment || typeof segment !== "string") return DEFAULT_TEAM_ID
  const decoded = decodeURIComponent(segment).trim()
  const idMatch = /^Team-(\d+)$/i.exec(decoded)
  if (idMatch) return `Team-${idMatch[1].padStart(4, "0")}`

  const legacySlug = normalizeTeamSlug(decoded)
  if (legacySlug && LEGACY_SLUG_TO_TEAM_ID[legacySlug]) {
    return LEGACY_SLUG_TO_TEAM_ID[legacySlug]
  }

  const byNameSlug = TEAM_ENTITIES.find((t) => slugifyName(t.name) === decoded.toLowerCase())
  if (byNameSlug) return byNameSlug.id

  return decoded
}

/**
 * @param {string} pathId
 * @returns {TeamEntity}
 */
export function teamById(pathId) {
  const normalized = normalizeTeamPathId(pathId)
  return (
    TEAM_ENTITIES.find((t) => t.id === normalized) ??
    TEAM_ENTITIES.find((t) => t.slug === normalizeTeamSlug(pathId)) ??
    TEAM_ENTITIES.find((t) => t.id === DEFAULT_TEAM_ID) ??
    TEAM_ENTITIES[0]
  )
}

/** @deprecated Use teamById */
export function teamBySlug(slug) {
  const normalized = normalizeTeamSlug(slug) ?? defaultTeamSlug()
  return (
    TEAM_ENTITIES.find((t) => t.slug === normalized) ??
    TEAM_ENTITIES.find((t) => t.slug === defaultTeamSlug()) ??
    TEAM_ENTITIES[0]
  )
}

export function teamIdFromDataTeam(dataTeam) {
  if (!dataTeam || typeof dataTeam !== "string") return null
  const match = TEAM_ENTITIES.find((t) => t.dataTeam === dataTeam.trim())
  return match?.id ?? null
}

/** @deprecated Use teamIdFromDataTeam */
export function teamSlugFromDataTeam(dataTeam) {
  const id = teamIdFromDataTeam(dataTeam)
  return id ? teamById(id).slug : null
}

export function teamGroupLabel(team) {
  const entity =
    team?.id ? teamById(team.id) :
    team?.slug ? teamBySlug(team.slug) :
    team?.name ? teamBySlug(slugifyName(team.name)) :
    teamById(DEFAULT_TEAM_ID)
  return `${entity.name} team`
}

export function teamLabelForSlug(teamSlug) {
  return teamGroupLabel(teamBySlug(teamSlug))
}

export function teamLabelForId(teamId) {
  return teamGroupLabel(teamById(teamId))
}

export function teamChatNavLabel() {
  return "Team chat"
}

export function teamChatHeaderTitle(team) {
  const entity = team?.id
    ? teamById(team.id)
    : team?.name
      ? team
      : teamBySlug(team?.slug ?? defaultTeamSlug())
  return `${entity.name} Team Chat`
}

export function projectGroupLabelFromName(name) {
  const trimmed = String(name ?? "").trim()
  return trimmed ? `${trimmed} Project` : "Project"
}

export function projectChatNavLabel() {
  return "Project chat"
}

export function projectChatHeaderTitleFromName(name) {
  const trimmed = String(name ?? "").trim()
  return trimmed ? `${trimmed} Project chat` : "Project chat"
}
