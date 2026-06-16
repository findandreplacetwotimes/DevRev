import { Navigate, useLocation, useParams } from "react-router-dom"
import { DEFAULT_PROJECT_ID, normalizeProjectPathId, projectSlugFromLegacyId, projectUrlSegment } from "../lib/projectsApi"
import {
  DEFAULT_TEAM_ID,
  projectBasePath,
  teamAboutHref,
  teamChatHref,
  teamIssuesHref,
  teamProjectsHref,
  teamSprintsHref,
} from "../lib/teams"

export function LegacyIssuesRedirect() {
  return <Navigate to={teamIssuesHref(DEFAULT_TEAM_ID)} replace />
}

export function LegacySprintsRedirect() {
  return <Navigate to={teamSprintsHref(DEFAULT_TEAM_ID)} replace />
}

export function LegacyAboutRedirect() {
  return <Navigate to={teamAboutHref(DEFAULT_TEAM_ID)} replace />
}

export function LegacyBuildTeamChatRedirect() {
  return <Navigate to={teamChatHref(DEFAULT_TEAM_ID)} replace />
}

export function LegacyProjectChatRedirect() {
  return <Navigate to={`${projectBasePath(DEFAULT_PROJECT_ID)}/chat`} replace />
}

export function LegacyProjectRedirect() {
  const location = useLocation()
  const params = useParams()

  const wildcard = params["*"] ?? ""
  const [projectPart, ...rest] = wildcard.split("/").filter(Boolean)

  if (!projectPart) {
    return <Navigate to={teamProjectsHref(DEFAULT_TEAM_ID)} replace />
  }

  const decoded = decodeURIComponent(projectPart)
  const projectId = projectSlugFromLegacyId(decoded) ?? normalizeProjectPathId(decoded)
  const encoded = encodeURIComponent(projectUrlSegment(projectId))
  const tabParams = new URLSearchParams(location.search)
  const tab = tabParams.get("tab")

  if (tab === "Scope") return <Navigate to={`/project/${encoded}/scope`} replace />
  if (tab === "Brief") return <Navigate to={`/project/${encoded}/brief`} replace />
  if (tab === "Links") return <Navigate to={`/project/${encoded}/links`} replace />
  if (tab === "Activity") return <Navigate to={`/project/${encoded}/activity`} replace />

  if (rest.length > 0) {
    return <Navigate to={`${projectBasePath(projectId)}/${rest.join("/")}${location.search}`} replace />
  }

  return <Navigate to={projectBasePath(projectId)} replace />
}
