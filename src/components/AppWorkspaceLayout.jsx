import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useIssues } from "../context/IssuesContext"
import { useWorkspaceScope } from "../hooks/useWorkspaceScope"
import { createSeedMessagesForSession } from "../lib/chatSeedMessages"
import {
  chatVariantForRoute,
  navItemIdForLocation,
  parseWorkspaceRoute,
  routeForNavItemId,
  tabTitleForRoute,
} from "../lib/navDestinations"
import {
  projectChatHeaderTitle,
  projectNavLabelTitle,
  projectPathId,
  resolveProjectForWorkspaceChat,
} from "../lib/projectsApi"
import { DEFAULT_TEAM_ID, teamUrlSegment } from "../lib/teams"
import { teamById } from "../lib/workspaceLabels"
import {
  activeNavItemIdForSession,
  createDefaultSession,
  createDefaultSplitSession,
  focusedPaneRoute,
  isSplitSession,
  loadWorkspaceSessionState,
  persistWorkspaceSessionState,
} from "../lib/workspaceSessions"
import { NavPanel } from "./NavPanel"
import { SessionTabBar } from "./SessionTabBar"
import { SplitWorkspaceView } from "./SplitWorkspaceView"

/**
 * Outer shell: session tabs + nav + main column (single route or split panes per active session).
 */
export function AppWorkspaceLayout() {
  return <AppWorkspaceChrome />
}

function ensureChatMessagesForRoute(sessionId, route, ensureSessionMessages) {
  const variant = chatVariantForRoute(route)
  if (variant) ensureSessionMessages(sessionId, variant)
}

export function AppWorkspaceChrome() {
  const navigate = useNavigate()
  const location = useLocation()
  const { projects, issues } = useIssues()
  const workspaceScope = useWorkspaceScope()

  const parsedRoute = useMemo(() => parseWorkspaceRoute(location.pathname), [location.pathname])
  const defaultTeam = useMemo(() => encodeURIComponent(teamUrlSegment(DEFAULT_TEAM_ID)), [])

  const activeProject = useMemo(() => {
    if (workspaceScope.isProjectContext && workspaceScope.project) {
      return workspaceScope.project
    }
    return resolveProjectForWorkspaceChat(projects)
  }, [projects, workspaceScope.isProjectContext, workspaceScope.project])

  const activeProjectId = useMemo(() => {
    if (activeProject) return projectPathId(activeProject)
    return workspaceScope.projectId
  }, [activeProject, workspaceScope.projectId])

  const activeTeamId = useMemo(() => {
    if (workspaceScope.isTeamContext && workspaceScope.teamId) {
      return workspaceScope.teamId
    }
    return DEFAULT_TEAM_ID
  }, [workspaceScope.isTeamContext, workspaceScope.teamId])

  const activeTeam = useMemo(() => teamById(activeTeamId), [activeTeamId])

  const navContext = useMemo(
    () => ({
      teamId: activeTeamId,
      projectId: activeProjectId,
      scope: parsedRoute.scope,
    }),
    [activeProjectId, activeTeamId, parsedRoute.scope]
  )

  const titleContext = useMemo(
    () => ({
      teamId: activeTeamId,
      projectName: activeProject ? projectNavLabelTitle(activeProject) : undefined,
      issues,
      projects,
    }),
    [activeProject, activeTeamId, issues, projects]
  )

  const linkedProjectChat = useMemo(() => {
    if (!activeProject) return null
    return {
      projectId: activeProject.id,
      title: projectChatHeaderTitle(activeProject),
    }
  }, [activeProject])

  const initialState = useMemo(() => loadWorkspaceSessionState(), [])
  const [sessions, setSessions] = useState(initialState.sessions)
  const [activeSessionId, setActiveSessionId] = useState(initialState.activeSessionId)
  const [sessionMessages, setSessionMessages] = useState({})
  const switchingRef = useRef(false)
  /** When set, location→session sync is skipped until the URL matches (avoids nav flicker). */
  const ownedNavigationRef = useRef(null)

  const chromeRowRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const NAV_PANEL_WIDTH_PX = 220
  const isNarrow = containerWidth > 0 && containerWidth - NAV_PANEL_WIDTH_PX < 700

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? sessions[0],
    [sessions, activeSessionId]
  )

  const currentRoute = `${location.pathname}${location.search}`

  const updateSessions = useCallback(
    (updater, nextActiveId = activeSessionId) => {
      setSessions((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater
        persistWorkspaceSessionState(next, nextActiveId)
        return next
      })
    },
    [activeSessionId]
  )

  const patchActiveSession = useCallback(
    (patch) => {
      updateSessions((prev) =>
        prev.map((session) => (session.id === activeSessionId ? { ...session, ...patch } : session))
      )
    },
    [activeSessionId, updateSessions]
  )

  const ensureSessionMessages = useCallback(
    (sessionId, variant) => {
      setSessionMessages((prev) => {
        if (prev[sessionId]) return prev
        return {
          ...prev,
          [sessionId]: createSeedMessagesForSession(variant, linkedProjectChat),
        }
      })
    },
    [linkedProjectChat]
  )

  const navigateInSession = useCallback(
    (href, navItemId, paneId) => {
      if (!href) return
      ownedNavigationRef.current = href

      const pathname = href.split("?")[0]
      const search = href.includes("?") ? href.slice(href.indexOf("?")) : ""
      const resolvedNavItemId = navItemId ?? navItemIdForLocation(pathname, search, navContext)

      if (isSplitSession(activeSession)) {
        const targetPane = paneId ?? activeSession.focusedPane
        const patch =
          targetPane === "left"
            ? { leftRoute: href, leftNavItemId: resolvedNavItemId }
            : { rightRoute: href, rightNavItemId: resolvedNavItemId }

        patchActiveSession(patch)

        if (targetPane === activeSession.focusedPane) {
          navigate(href)
        }
        return
      }

      patchActiveSession({
        route: href,
        selectedNavItemId: resolvedNavItemId,
        tabTitle: tabTitleForRoute(href, titleContext),
      })

      navigate(href)
    },
    [activeSession, navContext, navigate, patchActiveSession, titleContext]
  )

  const syncSessionTabTitle = useCallback(() => {
    if (isSplitSession(activeSession)) return
    const route = `${location.pathname}${location.search}`
    patchActiveSession({
      tabTitle: tabTitleForRoute(route, titleContext),
    })
  }, [activeSession, location.pathname, location.search, patchActiveSession, titleContext])

  const handleNavSelectItem = useCallback(
    (itemId) => {
      const href = routeForNavItemId(itemId, navContext)
      if (!href) return
      navigateInSession(href, itemId)
    },
    [navContext, navigateInSession]
  )

  const handlePaneFocus = useCallback(
    (paneId) => {
      if (!isSplitSession(activeSession)) return
      if (activeSession.focusedPane === paneId) return
      patchActiveSession({ focusedPane: paneId })
    },
    [activeSession, patchActiveSession]
  )

  const handleSplitLeftWidthChange = useCallback(
    (width) => {
      patchActiveSession({ splitLeftWidthPx: width })
    },
    [patchActiveSession]
  )

  const handleSelectSession = useCallback(
    (sessionId) => {
      if (sessionId === activeSessionId) return
      switchingRef.current = true
      setActiveSessionId(sessionId)
      persistWorkspaceSessionState(sessions, sessionId)
      const target = sessions.find((session) => session.id === sessionId)
      if (!target) return

      const href = focusedPaneRoute(target)
      if (href) {
        ownedNavigationRef.current = href
        navigate(href)
        if (isSplitSession(target)) {
          ensureChatMessagesForRoute(sessionId, target.leftRoute, ensureSessionMessages)
          ensureChatMessagesForRoute(sessionId, target.rightRoute, ensureSessionMessages)
        } else {
          ensureChatMessagesForRoute(sessionId, target.route, ensureSessionMessages)
        }
      }
      window.requestAnimationFrame(() => {
        switchingRef.current = false
      })
    },
    [activeSessionId, ensureSessionMessages, navigate, sessions]
  )

  const handleAddSession = useCallback(() => {
    const nextSession = createDefaultSession()
    const nextSessions = [...sessions, nextSession]
    updateSessions(nextSessions, nextSession.id)
    setActiveSessionId(nextSession.id)
    const href = nextSession.route
    if (href) {
      ownedNavigationRef.current = href
      navigate(href)
      ensureChatMessagesForRoute(nextSession.id, href, ensureSessionMessages)
    }
  }, [ensureSessionMessages, sessions, updateSessions, navigate])

  const handleAddSplitSession = useCallback(() => {
    const nextSession = createDefaultSplitSession()
    const nextSessions = [...sessions, nextSession]
    updateSessions(nextSessions, nextSession.id)
    setActiveSessionId(nextSession.id)
    const href = focusedPaneRoute(nextSession)
    if (href) {
      ownedNavigationRef.current = href
      navigate(href)
      ensureChatMessagesForRoute(nextSession.id, nextSession.leftRoute, ensureSessionMessages)
      ensureChatMessagesForRoute(nextSession.id, nextSession.rightRoute, ensureSessionMessages)
    }
  }, [ensureSessionMessages, sessions, updateSessions, navigate])

  const handleCloseSession = useCallback(
    (sessionId) => {
      if (sessions.length <= 1) return
      const index = sessions.findIndex((session) => session.id === sessionId)
      const nextSessions = sessions.filter((session) => session.id !== sessionId)
      const neighbor = nextSessions[Math.min(index, nextSessions.length - 1)]
      updateSessions(nextSessions, neighbor.id)
      setActiveSessionId(neighbor.id)
      const href = focusedPaneRoute(neighbor)
      if (href) {
        ownedNavigationRef.current = href
        navigate(href)
        if (isSplitSession(neighbor)) {
          ensureChatMessagesForRoute(neighbor.id, neighbor.leftRoute, ensureSessionMessages)
          ensureChatMessagesForRoute(neighbor.id, neighbor.rightRoute, ensureSessionMessages)
        } else {
          ensureChatMessagesForRoute(neighbor.id, neighbor.route, ensureSessionMessages)
        }
      }
      setSessionMessages((prev) => {
        const next = { ...prev }
        delete next[sessionId]
        return next
      })
    },
    [navigate, sessions, updateSessions, ensureSessionMessages]
  )

  const workspaceOutletContext = useMemo(
    () => ({
      navigateInSession,
      syncSessionTabTitle,
      linkedProjectChat,
      activeSessionId,
      sessionMessages,
      setSessionMessages,
      breadcrumbsMenuEnabled: isNarrow,
      workspaceScope,
      navContext,
      titleContext,
      activeTeam,
      activeProject,
    }),
    [
      activeSessionId,
      linkedProjectChat,
      navigateInSession,
      syncSessionTabTitle,
      sessionMessages,
      isNarrow,
      workspaceScope,
      navContext,
      titleContext,
      activeTeam,
      activeProject,
    ]
  )

  // In-app navigation updates the active session route(s).
  useEffect(() => {
    if (!activeSession) return

    const ownedRoute = ownedNavigationRef.current
    if (ownedRoute) {
      if (currentRoute === ownedRoute) {
        ownedNavigationRef.current = null
      }
      return
    }

    if (switchingRef.current) return

    const nextTitle = tabTitleForRoute(currentRoute, titleContext)
    const nextNavItemId = navItemIdForLocation(location.pathname, location.search, navContext)

    if (isSplitSession(activeSession)) {
      const matchesLeft = currentRoute === activeSession.leftRoute
      const matchesRight = currentRoute === activeSession.rightRoute

      if (matchesLeft) {
        if (activeSession.focusedPane !== "left") {
          window.requestAnimationFrame(() => patchActiveSession({ focusedPane: "left" }))
        }
        return
      }

      if (matchesRight) {
        if (activeSession.focusedPane !== "right") {
          window.requestAnimationFrame(() => patchActiveSession({ focusedPane: "right" }))
        }
        return
      }

      const pane = activeSession.focusedPane
      window.requestAnimationFrame(() => {
        patchActiveSession(
          pane === "left"
            ? { leftRoute: currentRoute, leftNavItemId: nextNavItemId }
            : { rightRoute: currentRoute, rightNavItemId: nextNavItemId }
        )
      })
      return
    }

    if (!activeSession.route) return

    if (currentRoute !== activeSession.route) {
      window.requestAnimationFrame(() => {
        patchActiveSession({
          route: currentRoute,
          selectedNavItemId: nextNavItemId,
          tabTitle: nextTitle,
        })
      })
      return
    }

    if (nextTitle !== activeSession.tabTitle) {
      window.requestAnimationFrame(() => {
        patchActiveSession({ tabTitle: nextTitle })
      })
    }
  }, [
    activeSession,
    activeSession?.route,
    activeSession?.tabTitle,
    activeSession?.leftRoute,
    activeSession?.rightRoute,
    activeSession?.focusedPane,
    currentRoute,
    location.pathname,
    location.search,
    navContext,
    patchActiveSession,
    titleContext,
  ])

  useEffect(() => {
    if (!activeSession) return
    if (isSplitSession(activeSession)) {
      window.requestAnimationFrame(() => {
        ensureChatMessagesForRoute(activeSessionId, activeSession.leftRoute, ensureSessionMessages)
        ensureChatMessagesForRoute(activeSessionId, activeSession.rightRoute, ensureSessionMessages)
      })
      return
    }
    if (!activeSession.route) return
    window.requestAnimationFrame(() => {
      ensureChatMessagesForRoute(activeSessionId, activeSession.route, ensureSessionMessages)
    })
  }, [
    activeSession,
    activeSession?.route,
    activeSession?.leftRoute,
    activeSession?.rightRoute,
    activeSessionId,
    ensureSessionMessages,
  ])

  useLayoutEffect(() => {
    const el = chromeRowRef.current
    if (!el || typeof ResizeObserver === "undefined") return undefined

    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width ?? 0
      setContainerWidth(w)
    })

    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const navSelectedItemId = activeNavItemIdForSession(activeSession)

  return (
    <main className="flex h-screen flex-col bg-white">
      <SessionTabBar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onCloseSession={handleCloseSession}
        onAddSession={handleAddSession}
        onAddSplitSession={handleAddSplitSession}
      />
      <div ref={chromeRowRef} className="flex min-h-0 flex-1 items-stretch">
        {!isNarrow ? (
          <NavPanel
            selectedItemId={navSelectedItemId}
            onSelectItem={handleNavSelectItem}
            activeTeam={activeTeam}
            activeProject={activeProject}
            projectId={activeProjectId}
            teamId={activeTeamId}
            scope={parsedRoute.scope}
          />
        ) : null}
        <div className="right-panel-enter min-h-0 min-w-0 flex-1">
          {isSplitSession(activeSession) ? (
            <SplitWorkspaceView
              leftRoute={activeSession.leftRoute}
              rightRoute={activeSession.rightRoute}
              splitLeftWidthPx={activeSession.splitLeftWidthPx}
              focusedPane={activeSession.focusedPane}
              onPaneFocus={handlePaneFocus}
              onSplitLeftWidthChange={handleSplitLeftWidthChange}
              outletContext={workspaceOutletContext}
              defaultTeam={defaultTeam}
            />
          ) : (
            <Outlet context={workspaceOutletContext} />
          )}
        </div>
      </div>
    </main>
  )
}
