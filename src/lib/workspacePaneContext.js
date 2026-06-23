import { parseWorkspaceRoute } from "./navDestinations"
import {
  projectByPathId,
  projectChatHeaderTitle,
  projectNavLabelTitle,
  projectPathId,
  resolveProjectForWorkspaceChat,
} from "./projectsApi"
import { DEFAULT_TEAM_ID, normalizeTeamPathId, teamById } from "./workspaceLabels"

export function resolveWorkspaceScopeFromRoute(route, projects) {
  const pathname = route?.split("?")[0] ?? ""
  const parsed = parseWorkspaceRoute(pathname)

  const teamId =
    parsed.scope === "team"
      ? normalizeTeamPathId(parsed.teamId) ?? DEFAULT_TEAM_ID
      : parsed.teamId ?? null

  const projectIdParam =
    parsed.scope === "project" ? parsed.projectId ?? null : parsed.projectId ?? null

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
}

export function buildPaneOutletContext({ baseContext, route, paneId, paneWidth, projects, issues }) {
  const workspaceScope = resolveWorkspaceScopeFromRoute(route, projects)

  const activeTeamId =
    workspaceScope.isTeamContext && workspaceScope.teamId ? workspaceScope.teamId : DEFAULT_TEAM_ID

  const activeProject =
    workspaceScope.isProjectContext && workspaceScope.project
      ? workspaceScope.project
      : resolveProjectForWorkspaceChat(projects)

  const activeProjectId = activeProject ? projectPathId(activeProject) : workspaceScope.projectId
  const activeTeam = teamById(activeTeamId)

  const navContext = {
    teamId: activeTeamId,
    projectId: activeProjectId,
    scope: workspaceScope.scope,
  }

  const titleContext = {
    teamId: activeTeamId,
    projectName: activeProject ? projectNavLabelTitle(activeProject) : undefined,
    issues,
    projects,
  }

  const linkedProjectChat = activeProject
    ? {
        projectId: activeProject.id,
        title: projectChatHeaderTitle(activeProject),
      }
    : null

  const breadcrumbsMenuEnabled = paneWidth > 0 && paneWidth < 700

  return {
    ...baseContext,
    paneId,
    workspaceScope,
    navContext,
    titleContext,
    activeTeam,
    activeProject,
    linkedProjectChat,
    breadcrumbsMenuEnabled,
    navigateInSession: (href, navItemId) => baseContext.navigateInSession?.(href, navItemId, paneId),
  }
}
