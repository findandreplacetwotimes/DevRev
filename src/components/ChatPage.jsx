import { useCallback, useMemo } from "react"
import { useLocation } from "react-router-dom"
import { useWorkspaceOutletContext } from "../context/WorkspaceOutletContext"
import { ChatRelatedLinksPanel } from "./ChatRelatedLinksMenu"
import { ChatWindow } from "./ChatWindow"
import { chatVariantForRoute } from "../lib/navDestinations"
import { getChatCanvasLabel, getChatRelatedLinks } from "../lib/chatRelatedLinks"

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

  const variant = chatVariantForRoute(`${location.pathname}${location.search}`) ?? "ai"
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
        hideRelatedLinksControl
      />
      {canvasLinks.length > 0 ? (
        <ChatRelatedLinksPanel
          links={canvasLinks}
          canvasLabel={canvasLabel}
          onSelect={handleSelectCanvasLink}
        />
      ) : null}
    </div>
  )
}
