import { Navigate, Route, Routes } from "react-router-dom"
import { AppWorkspaceLayout } from "./components/AppWorkspaceLayout"
import { TeamAgentWorkspace } from "./components/TeamAgentWorkspace"
import { DEFAULT_TEAM_ID, teamUrlSegment } from "./lib/teams"
import { renderWorkspaceRoutes } from "./routes/workspaceRoutes"

export default function App() {
  const defaultTeam = encodeURIComponent(teamUrlSegment(DEFAULT_TEAM_ID))

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/workspace" replace />} />
      <Route path="/workspace" element={<TeamAgentWorkspace />} />
      <Route element={<AppWorkspaceLayout />}>{renderWorkspaceRoutes(defaultTeam)}</Route>
    </Routes>
  )
}
