import { Navigate, Route, Routes } from "react-router-dom"
import { AppWorkspaceLayout } from "./components/AppWorkspaceLayout"
import { IssuesListPage } from "./components/IssuesListPage"
import { IssuePage } from "./components/IssuePage"
import { ProjectPage } from "./components/ProjectPage"
import { ProjectsListPage } from "./components/ProjectsListPage"
import { SprintsPage } from "./components/SprintsPage"
import { AboutPage } from "./components/AboutPage"
import { TeamMembersPage } from "./components/TeamMembersPage"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppWorkspaceLayout />}>
        <Route index element={<Navigate to="/issues" replace />} />
        <Route path="sprints" element={<SprintsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="team-members" element={<TeamMembersPage />} />
        <Route path="issues" element={<IssuesListPage />} />
        <Route path="issues/:issueId" element={<IssuePage />} />
        <Route path="projects" element={<ProjectsListPage />} />
        <Route path="projects/:projectId" element={<ProjectPage />} />
      </Route>
    </Routes>
  )
}
