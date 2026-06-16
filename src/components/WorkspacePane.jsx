import { useMemo } from "react"
import { Outlet, Routes, Route } from "react-router-dom"
import { WorkspaceOutletProvider } from "../context/WorkspaceOutletContext"
import { renderWorkspaceRoutes } from "../routes/workspaceRoutes"
import { DEFAULT_TEAM_ID, teamUrlSegment } from "../lib/teams"

function routeToLocation(route) {
  const qIdx = route.indexOf("?")
  const pathname = qIdx >= 0 ? route.slice(0, qIdx) : route
  const search = qIdx >= 0 ? route.slice(qIdx) : ""
  return { pathname, search, hash: "" }
}

export function WorkspacePane({
  route,
  paneId,
  focused = false,
  onPaneFocus,
  outletContext,
  defaultTeam,
  className = "",
  style,
}) {
  const location = useMemo(() => routeToLocation(route), [route])
  const teamSegment = defaultTeam ?? encodeURIComponent(teamUrlSegment(DEFAULT_TEAM_ID))

  const paneContext = useMemo(
    () => ({
      ...outletContext,
      paneId,
      navigateInSession: (href, navItemId) => outletContext.navigateInSession?.(href, navItemId, paneId),
    }),
    [outletContext, paneId]
  )

  return (
    <WorkspaceOutletProvider value={paneContext}>
      <div
        className={`flex h-full min-h-0 min-w-0 flex-col bg-white ${focused ? "ring-1 ring-inset ring-[var(--border-subtle)]" : ""} ${className}`.trim()}
        style={style}
        onPointerDown={() => onPaneFocus?.(paneId)}
      >
        <Routes location={location}>
          <Route path="/" element={<Outlet />}>
            {renderWorkspaceRoutes(teamSegment)}
          </Route>
        </Routes>
      </div>
    </WorkspaceOutletProvider>
  )
}
