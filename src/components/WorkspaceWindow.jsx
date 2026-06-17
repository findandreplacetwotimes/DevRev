import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useIssues } from "../context/IssuesContext"
import { routeForNavItemId } from "../lib/navDestinations"
import { buildPaneOutletContext } from "../lib/workspacePaneContext"
import { NavPanel } from "./NavPanel"
import { WorkspacePane } from "./WorkspacePane"

export function WorkspaceWindow({
  route,
  selectedNavItemId,
  paneId,
  isMainPane = false,
  baseOutletContext,
  defaultTeam,
  className = "",
  style,
}) {
  const { projects, issues } = useIssues()
  const columnRef = useRef(null)
  const [paneWidth, setPaneWidth] = useState(0)

  useLayoutEffect(() => {
    const el = columnRef.current
    if (!el || typeof ResizeObserver === "undefined") return undefined

    const ro = new ResizeObserver((entries) => {
      setPaneWidth(entries[0]?.contentRect?.width ?? 0)
    })

    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const isNarrow = paneWidth > 0 && paneWidth < 700

  const paneOutletContext = useMemo(
    () =>
      buildPaneOutletContext({
        baseContext: baseOutletContext,
        route,
        paneId,
        paneWidth,
        projects,
        issues,
      }),
    [baseOutletContext, route, paneId, paneWidth, projects, issues]
  )

  const handleNavSelectItem = useCallback(
    (itemId) => {
      const href = routeForNavItemId(itemId, paneOutletContext.navContext)
      if (!href) return
      paneOutletContext.navigateInSession?.(href, itemId)
    },
    [paneOutletContext]
  )

  return (
    <div
      ref={columnRef}
      className={`flex h-full min-h-0 min-w-0 items-stretch ${className}`.trim()}
      style={style}
      data-pane-id={paneId}
      data-main-pane={isMainPane || undefined}
    >
      {!isNarrow ? (
        <NavPanel
          selectedItemId={selectedNavItemId}
          onSelectItem={handleNavSelectItem}
          activeTeam={paneOutletContext.activeTeam}
          activeProject={paneOutletContext.activeProject}
          projectId={paneOutletContext.navContext.projectId}
          teamId={paneOutletContext.navContext.teamId}
          scope={paneOutletContext.workspaceScope.scope}
        />
      ) : null}
      <WorkspacePane
        route={route}
        outletContext={paneOutletContext}
        defaultTeam={defaultTeam}
        className="min-w-0 flex-1"
      />
    </div>
  )
}
