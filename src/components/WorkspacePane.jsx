import { useMemo } from "react"
import { Routes } from "react-router-dom"
import { WorkspaceOutletProvider } from "../context/WorkspaceOutletContext"
import { renderWorkspaceRoutes } from "../routes/workspaceRoutes"

function routeToLocation(route) {
  const qIdx = route.indexOf("?")
  const pathname = qIdx >= 0 ? route.slice(0, qIdx) : route
  const search = qIdx >= 0 ? route.slice(qIdx) : ""
  return { pathname, search, hash: "" }
}

export function WorkspacePane({ route, outletContext, className = "", style }) {
  const location = useMemo(() => routeToLocation(route), [route])

  return (
    <WorkspaceOutletProvider value={outletContext}>
      <div className={`flex h-full min-h-0 min-w-0 flex-col bg-white ${className}`.trim()} style={style}>
        <Routes location={location}>{renderWorkspaceRoutes()}</Routes>
      </div>
    </WorkspaceOutletProvider>
  )
}
