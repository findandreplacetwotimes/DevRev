import { useCallback, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import { useWorkspaceOutletContext } from "../context/WorkspaceOutletContext"
import { ChatRelatedLinksPanel } from "./ChatRelatedLinksMenu"
import { ChatWindow } from "./ChatWindow"
import { chatVariantForRoute } from "../lib/navDestinations"
import { getChatCanvasLabel, getChatRelatedLinks } from "../lib/chatRelatedLinks"

const LS_CHAT_CANVAS_PANEL_OPEN = "devrev.chat.canvasPanelOpen.v1"

function loadCanvasPanelOpen() {
  if (typeof window === "undefined") return true
  try {
    const raw = window.localStorage.getItem(LS_CHAT_CANVAS_PANEL_OPEN)
    if (raw === "0" || raw === "false") return false
    if (raw === "1" || raw === "true") return true
  } catch {
    /* ignore */
  }
  return true
}

function persistCanvasPanelOpen(open) {
  try {
    window.localStorage.setItem(LS_CHAT_CANVAS_PANEL_OPEN, open ? "1" : "0")
  } catch {
    /* ignore */
  }
}

export function ChatPage() {
  const location = useLocation()
  const outletContext = useWorkspaceOutletContext()

  const {
    navigateInSession,
    linkedProjectChat,
    activeSessionId,
    sessionMessages,
    setSessionMessages,
    navContext,
    activeTeam,
    activeProject,
    breadcrumbsMenuEnabled,
    workspaceScope,
  } = outletContext

  const routeKey = `${location.pathname}${location.search}`
  const variant = chatVariantForRoute(routeKey) ?? "ai"
  const messages = sessionMessages?.[activeSessionId] ?? []

  const canvasLinks = useMemo(
    () =>
      getChatRelatedLinks({
        variant,
        linkedProjectChat,
        teamId: navContext?.teamId,
      }),
    [linkedProjectChat, navContext?.teamId, variant]
  )
  const canvasLabel = getChatCanvasLabel()
  const hasCanvasLinks = canvasLinks.length > 0

  const [canvasPanelOpen, setCanvasPanelOpen] = useState(loadCanvasPanelOpen)

  const handleToggleCanvasPanel = useCallback(() => {
    if (!hasCanvasLinks) return
    setCanvasPanelOpen((value) => {
      const next = !value
      persistCanvasPanelOpen(next)
      return next
    })
  }, [hasCanvasLinks])

  const handleSelectCanvasLink = useCallback(
    (link) => {
      if (!link?.href) return
      navigateInSession?.(link.href)
    },
    [navigateInSession]
  )

  return (
    <div className="flex h-full min-h-0 w-full">
      <ChatWindow
        sessionId={activeSessionId}
        variant={variant}
        flexFill
        linkedProjectChat={linkedProjectChat}
        teamId={navContext?.teamId}
        activeTeam={activeTeam}
        activeProject={activeProject}
        projectId={navContext?.projectId}
        navMenuEnabled={breadcrumbsMenuEnabled}
        showProjectNavSection={workspaceScope?.isProjectContext || Boolean(navContext?.projectId)}
        messages={messages}
        onMessagesChange={(next) =>
          setSessionMessages((prev) => ({
            ...prev,
            [activeSessionId]: typeof next === "function" ? next(prev[activeSessionId] ?? []) : next,
          }))
        }
        onOpenPageInSession={(href) => navigateInSession?.(href)}
        showCanvasToggle={hasCanvasLinks}
        canvasPanelOpen={canvasPanelOpen}
        onToggleCanvasPanel={handleToggleCanvasPanel}
      />
      {canvasPanelOpen && hasCanvasLinks ? (
        <ChatRelatedLinksPanel
          links={canvasLinks}
          canvasLabel={canvasLabel}
          onSelect={handleSelectCanvasLink}
        />
      ) : null}
    </div>
  )
}
