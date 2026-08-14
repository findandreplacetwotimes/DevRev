import { useMemo } from "react"
import { useLocation, useParams } from "react-router-dom"
import { useIssues } from "../context/IssuesContext"
import { parseWorkspaceRoute } from "../lib/navDestinations"
import { projectByPathId } from "../lib/projectsApi"
import { DEFAULT_TEAM_ID, normalizeTeamPathId, teamById } from "../lib/workspaceLabels"

/**
 * Derives team/project scope from the current URL.
 */
export function useWorkspaceScope() {
  const location = useLocation()
  const params = useParams()
  const { projects } = useIssues()

  return useMemo(() => {
    const parsed = parseWorkspaceRoute(location.pathname)
    const teamId =
      parsed.scope === "team"
        ? normalizeTeamPathId(params.teamId ?? parsed.teamId) ?? DEFAULT_TEAM_ID
        : parsed.teamId ?? null

    const projectIdParam =
      parsed.scope === "project"
        ? params.projectId ?? parsed.projectId ?? null
        : parsed.projectId ?? null

    const project = projectIdParam && projects ? projectByPathId(projectIdParam, projects) : null
    const projectId = project?.id ?? (projectIdParam ? projectIdParam : null)
    const team = teamId ? teamById(teamId) : null

    return {
      scope: parsed.scope,
      teamId,
      projectId,
      team,
      project,
      isTeamContext: parsed.scope === "team",
      isProjectContext: parsed.scope === "project",
    }
  }, [location.pathname, params.teamId, params.projectId, projects])
}
