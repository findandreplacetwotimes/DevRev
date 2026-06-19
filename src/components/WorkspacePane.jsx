import { useMemo } from "react"
import { Routes } from "react-router-dom"
import { WorkspaceOutletProvider } from "../context/WorkspaceOutletContext"
import { renderWorkspaceRoutes } from "../routes/workspaceRoutes"
import { DEFAULT_TEAM_ID, teamUrlSegment } from "../lib/teams"

function routeToLocation(route) {
  const qIdx = route.indexOf("?")
  const pathname = qIdx >= 0 ? route.slice(0, qIdx) : route
  const search = qIdx >= 0 ? route.slice(qIdx) : ""
  return { pathname, search, hash: "" }
}

export function WorkspacePane({ route, outletContext, defaultTeam, className = "", style }) {
  const location = useMemo(() => routeToLocation(route), [route])
  const teamSegment = defaultTeam ?? encodeURIComponent(teamUrlSegment(DEFAULT_TEAM_ID))

  return (
    <WorkspaceOutletProvider value={outletContext}>
      <div className={`flex h-full min-h-0 min-w-0 flex-col bg-white ${className}`.trim()} style={style}>
        <Routes location={location}>{renderWorkspaceRoutes(teamSegment)}</Routes>
      </div>
    </WorkspaceOutletProvider>
  )
}
