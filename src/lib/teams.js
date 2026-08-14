import { issuesLinkedToProject } from "./projectsApi"
import {
  DEFAULT_TEAM_ID,
  defaultTeamId,
  defaultTeamSlug,
  normalizeTeamPathId,
  teamById,
  teamBySlug,
  teamGroupLabel,
  teamIdFromDataTeam,
  teamLabelForId,
  teamLabelForSlug,
  teamPathId,
  teamSlugFromDataTeam,
  teamUrlSegment,
} from "./workspaceLabels"
import { projectUrlSegment } from "./projectsApi"

export {
  DEFAULT_TEAM_ID,
  defaultTeamId,
  defaultTeamSlug,
  normalizeTeamPathId,
  teamById,
  teamBySlug,
  teamGroupLabel,
  teamIdFromDataTeam,
  teamLabelForId,
  teamLabelForSlug,
  teamPathId,
  teamSlugFromDataTeam,
  teamUrlSegment,
  TEAM_ENTITIES as TEAMS,
} from "./workspaceLabels"
export { projectUrlSegment } from "./projectsApi"

export function dataTeamForTeamId(teamId) {
  return teamById(normalizeTeamPathId(teamId ?? DEFAULT_TEAM_ID)).dataTeam
}

/** @deprecated Use dataTeamForTeamId */
export function dataTeamForSlug(teamSlug) {
  return teamBySlug(teamSlug).dataTeam
}

export function teamBasePath(teamId) {
  return `/team/${encodeURIComponent(teamUrlSegment(teamId))}`
}

export function teamProjectsHref(teamId) {
  return `${teamBasePath(teamId)}/projects`
}

export function teamIssuesHref(teamId) {
  return `${teamBasePath(teamId)}/issues`
}

export function teamSprintsHref(teamId) {
  return `${teamBasePath(teamId)}/sprints`
}

export function teamAboutHref(teamId) {
  return `${teamBasePath(teamId)}/about`
}

export function teamChatHref(teamId) {
  return `${teamBasePath(teamId)}/chat`
}

export function projectBasePath(projectId, projects) {
  return `/project/${encodeURIComponent(projectUrlSegment(projectId, projects))}`
}

export function projectChatHref(projectId) {
  return `${projectBasePath(projectId)}/chat`
}

/**
 * @param {import("./issuesApi").Issue[]} issues
 * @param {string | null | undefined} teamId
 */
export function filterIssuesByTeam(issues, teamId) {
  const list = Array.isArray(issues) ? issues : []
  const dataTeam = dataTeamForTeamId(teamId)
  if (!dataTeam) return list
  return list.filter((row) => row.team === dataTeam)
}

/**
 * @param {import("./issuesApi").Project[]} projects
 * @param {string | null | undefined} teamId
 */
export function filterProjectsByTeam(projects, teamId) {
  const list = Array.isArray(projects) ? projects : []
  const dataTeam = dataTeamForTeamId(teamId)
  if (!dataTeam) return list
  return list.filter((row) => row.team === dataTeam)
}

/**
 * @param {import("./issuesApi").Issue[]} issues
 * @param {string | null | undefined} projectId
 */
export function filterIssuesByProject(issues, projectId) {
  if (!projectId) return []
  const list = Array.isArray(issues) ? issues : []
  return issuesLinkedToProject({ id: projectId }, list)
}
