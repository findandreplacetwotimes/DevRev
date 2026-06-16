import { Navigate, Route } from "react-router-dom"
import { AboutPage } from "../components/AboutPage"
import { ChatPage } from "../components/ChatPage"
import { IssuePage } from "../components/IssuePage"
import { IssuesListPage } from "../components/IssuesListPage"
import { ProjectPage } from "../components/ProjectPage"
import { ProjectsListPage } from "../components/ProjectsListPage"
import { SprintsPage } from "../components/SprintsPage"
import { TeamMembersPage } from "../components/TeamMembersPage"
import {
  LegacyAboutRedirect,
  LegacyBuildTeamChatRedirect,
  LegacyIssuesRedirect,
  LegacyProjectChatRedirect,
  LegacyProjectRedirect,
  LegacySprintsRedirect,
} from "../components/LegacyRouteRedirects"

/** Child routes — must be invoked as `{renderWorkspaceRoutes(team)}`, not a custom Route child component. */
export function renderWorkspaceRoutes(defaultTeam) {
  return (
    <>
      <Route index element={<Navigate to={`/team/${defaultTeam}/issues`} replace />} />

      <Route path="computer" element={<ChatPage />} />
      <Route path="arjun" element={<ChatPage />} />
      <Route path="sneha" element={<ChatPage />} />
      <Route path="rohan" element={<ChatPage />} />
      <Route path="leela" element={<ChatPage />} />

      <Route path="team/:teamId">
        <Route path="issues" element={<IssuesListPage />} />
        <Route path="issues/:issueId" element={<IssuePage />} />
        <Route path="projects" element={<ProjectsListPage />} />
        <Route path="sprints" element={<SprintsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="chat" element={<ChatPage />} />
      </Route>

      <Route path="project/:projectId">
        <Route index element={<ProjectPage />} />
        <Route path="scope" element={<ProjectPage />} />
        <Route path="brief" element={<ProjectPage />} />
        <Route path="links" element={<ProjectPage />} />
        <Route path="activity" element={<ProjectPage />} />
        <Route path="issues/:issueId" element={<IssuePage />} />
        <Route path="chat" element={<ChatPage />} />
      </Route>

      <Route path="team-members" element={<TeamMembersPage />} />

      <Route path="issues/*" element={<LegacyIssuesRedirect />} />
      <Route path="projects/*" element={<LegacyProjectRedirect />} />
      <Route path="sprints" element={<LegacySprintsRedirect />} />
      <Route path="about" element={<LegacyAboutRedirect />} />
      <Route path="build-team" element={<LegacyBuildTeamChatRedirect />} />
      <Route path="project-chat" element={<LegacyProjectChatRedirect />} />
    </>
  )
}
