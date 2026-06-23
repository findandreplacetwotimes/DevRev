import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { useIssues } from "../context/IssuesContext"
import { getChatPagesLabel, getChatRelatedLinks } from "../lib/chatRelatedLinks"
import { projectDisplayTitle, resolveProjectForWorkspaceChat } from "../lib/projectsApi"
import {
  applyWorkspaceChatToSearchParams,
  hasWorkspaceChatInUrl,
  hrefWithWorkspaceParams,
  parseWorkspaceChatState,
} from "../lib/workspaceUrlState"
import { ChatRelatedLinksPanel } from "./ChatRelatedLinksMenu"
import { ChatWindow } from "./ChatWindow"
import { COMPUTER_NAV_ITEM_ID, NavPanel } from "./NavPanel"

const INITIAL_CHAT_WIDTH = 377
const MIN_CHAT_WIDTH = 300
const MIN_RECORD_WIDTH = 560
const NAV_WIDTH = 220
const DEBOUNCE_LS_MS = 300

const LS_CHAT_WIDTH = "devrev.workspace.chatWidth.v1"
const LS_CHAT_OPEN = "devrev.workspace.chatPanelOpen.v1"
const LS_RECORD_OPEN = "devrev.workspace.recordPanelOpen.v1"


function loadBool(key, defaultVal) {
  if (typeof window === "undefined") return defaultVal
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === "true") return true
    if (raw === "false") return false
  } catch {
    /* ignore */
  }
  return defaultVal
}

function isFirstWorkspaceVisit() {
  if (typeof window === "undefined") return false
  try {
    return window.localStorage.getItem(LS_CHAT_OPEN) == null && window.localStorage.getItem(LS_RECORD_OPEN) == null
  } catch {
    return false
  }
}

function loadChatWidth() {
  if (typeof window === "undefined") return INITIAL_CHAT_WIDTH
  try {
    const raw = window.localStorage.getItem(LS_CHAT_WIDTH)
    const n = raw != null ? Number.parseInt(raw, 10) : NaN
    if (Number.isFinite(n) && n >= MIN_CHAT_WIDTH && n <= 2000) return n
  } catch {
    /* ignore */
  }
  return INITIAL_CHAT_WIDTH
}

function loadInitialChatVariant() {
  return isFirstWorkspaceVisit() ? "ai" : "build-team"
}

function loadInitialSelectedNavItemId() {
  return isFirstWorkspaceVisit() ? COMPUTER_NAV_ITEM_ID : "build-team"
}

/** Never start with both panels hidden (blank canvas). */
function loadInitialPanelOpen() {
  const chat = loadBool(LS_CHAT_OPEN, true)
  const record = loadBool(LS_RECORD_OPEN, false)
  if (!chat && !record) {
    try {
      window.localStorage.setItem(LS_CHAT_OPEN, "true")
      window.localStorage.setItem(LS_RECORD_OPEN, "false")
    } catch {
      /* ignore */
    }
    return { chat: true, record: false }
  }
  return { chat, record }
}

/**
 * Outer shell: nav + optional chat split + optional record (main) split. Panel visibility and chat width persist in localStorage.
 */
export function AppWorkspaceLayout() {
  return <AppWorkspaceChrome />
}

export function AppWorkspaceChrome() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { projects } = useIssues()
  const skipUrlSyncRef = useRef(false)
  const urlChatInitializedRef = useRef(false)

  const urlChatState = useMemo(
    () =>
      parseWorkspaceChatState({
        searchParams,
        projects,
        pathname: location.pathname,
      }),
    [searchParams, projects, location.pathname]
  )

  const [panelsInitial] = useState(loadInitialPanelOpen)

  const [chatWidth, setChatWidth] = useState(loadChatWidth)
  const [chatPanelOpen, setChatPanelOpen] = useState(panelsInitial.chat)
  const [recordPanelOpen, setRecordPanelOpen] = useState(() => {
    if (urlChatState.recordPanelOpen != null) return urlChatState.recordPanelOpen
    return panelsInitial.record
  })
  const [selectedNavItemId, setSelectedNavItemId] = useState(() => {
    if (hasWorkspaceChatInUrl(searchParams)) return urlChatState.selectedNavItemId
    return loadInitialSelectedNavItemId()
  })

  /** `person` chats use LLM as teammate; `ai` uses computer mode. */
  const [chatVariant, setChatVariant] = useState(() => {
    if (hasWorkspaceChatInUrl(searchParams)) return urlChatState.chatVariant
    return loadInitialChatVariant()
  })
  const [activeProjectChatId, setActiveProjectChatId] = useState(
    () => urlChatState.projectChatId ?? null
  )

  /** Nav + chat header follow linked project from URL or workspace default. */
  const linkedProjectChat = useMemo(() => {
    const projectId =
      (chatVariant === "chat-project" && activeProjectChatId) ||
      urlChatState.projectChatId ||
      resolveProjectForWorkspaceChat(projects)?.id ||
      null

    if (!projectId || !Array.isArray(projects)) return null
    const project = projects.find((row) => row && row.id === projectId)
    if (!project) return null
    return { projectId: project.id, title: projectDisplayTitle(project) }
  }, [projects, chatVariant, activeProjectChatId, urlChatState.projectChatId])

  const layoutRef = useRef(null)
  const dragStateRef = useRef(null)
  const stopResizeRef = useRef(null)

  const chatPanelOpenRef = useRef(chatPanelOpen)
  const recordPanelOpenRef = useRef(recordPanelOpen)
  useEffect(() => {
    chatPanelOpenRef.current = chatPanelOpen
  }, [chatPanelOpen])
  useEffect(() => {
    recordPanelOpenRef.current = recordPanelOpen
  }, [recordPanelOpen])

  const writeWorkspaceToUrl = useCallback(
    (workspaceState) => {
      skipUrlSyncRef.current = true
      setSearchParams((prev) => applyWorkspaceChatToSearchParams(prev, workspaceState), { replace: true })
    },
    [setSearchParams]
  )

  const syncWorkspaceStateToUrl = useCallback(
    (overrides = {}) => {
      writeWorkspaceToUrl({
        selectedNavItemId: overrides.selectedNavItemId ?? selectedNavItemId,
        chatVariant: overrides.chatVariant ?? chatVariant,
        projectChatId: overrides.projectChatId ?? activeProjectChatId ?? linkedProjectChat?.projectId ?? null,
        recordPanelOpen: overrides.recordPanelOpen ?? recordPanelOpen,
      })
    },
    [
      writeWorkspaceToUrl,
      selectedNavItemId,
      chatVariant,
      activeProjectChatId,
      linkedProjectChat?.projectId,
      recordPanelOpen,
    ]
  )

  useEffect(() => {
    if (skipUrlSyncRef.current) {
      skipUrlSyncRef.current = false
      return
    }

    if (!hasWorkspaceChatInUrl(searchParams)) {
      if (!urlChatInitializedRef.current) {
        urlChatInitializedRef.current = true
      }
      return
    }

    if (urlChatState.pendingProjects) return

    setSelectedNavItemId(urlChatState.selectedNavItemId)
    setChatVariant(urlChatState.chatVariant)
    if (urlChatState.projectChatId) setActiveProjectChatId(urlChatState.projectChatId)
    if (urlChatState.recordPanelOpen != null) setRecordPanelOpen(urlChatState.recordPanelOpen)
    setChatPanelOpen(true)

    if (urlChatState.shouldRewriteUrl) {
      writeWorkspaceToUrl({
        selectedNavItemId: urlChatState.selectedNavItemId,
        chatVariant: urlChatState.chatVariant,
        projectChatId: urlChatState.projectChatId,
        recordPanelOpen: urlChatState.recordPanelOpen ?? recordPanelOpen,
      })
    }

    urlChatInitializedRef.current = true
  }, [searchParams, urlChatState, writeWorkspaceToUrl, recordPanelOpen])

  const navigateWithWorkspaceParams = useCallback(
    (href, options) => {
      navigate(hrefWithWorkspaceParams(href, searchParams), options)
    },
    [navigate, searchParams]
  )

  const clampChatWidth = useCallback(
    (nextWidth) => {
      const layoutWidth = layoutRef.current?.clientWidth ?? window.innerWidth
      const available = Math.max(0, layoutWidth - NAV_WIDTH)

      if (!recordPanelOpen) {
        const chatOnlyUpper = Math.max(0, available)
        const chatOnlyLower = Math.min(MIN_CHAT_WIDTH, chatOnlyUpper || MIN_CHAT_WIDTH)
        return Math.min(chatOnlyUpper, Math.max(chatOnlyLower, nextWidth))
      }

      /**
       * Record column is flexible — reserve a proportional slice so chat's fixed px width never steals 100%
       * of `(layout − nav)` (which used to squash the Outlet to zero / “empty page” on narrower viewports).
       */
      const reserveRecord = Math.min(MIN_RECORD_WIDTH, Math.max(140, Math.ceil(available * 0.45)))
      const maxChat = Math.max(0, available - reserveRecord)
      const minChatSoft = Math.min(MIN_CHAT_WIDTH, Math.max(96, Math.floor(available * 0.38)))
      return Math.min(maxChat, Math.max(minChatSoft, nextWidth))
    },
    [recordPanelOpen]
  )

  const handleResizeMove = useCallback((event) => {
    if (!dragStateRef.current) return
    const deltaX = event.clientX - dragStateRef.current.startX
    const nextWidth = dragStateRef.current.startWidth + deltaX
    setChatWidth(clampChatWidth(nextWidth))
  }, [clampChatWidth])

  const stopResize = useCallback(() => {
    dragStateRef.current = null
    window.removeEventListener("pointermove", handleResizeMove)
    if (stopResizeRef.current) {
      window.removeEventListener("pointerup", stopResizeRef.current)
    }
    document.body.style.userSelect = ""
  }, [handleResizeMove])

  useEffect(() => {
    stopResizeRef.current = stopResize
  }, [stopResize])

  const startResize = (event) => {
    if (!chatPanelOpen || !recordPanelOpen) return
    event.preventDefault()
    dragStateRef.current = { startX: event.clientX, startWidth: chatWidth }
    window.addEventListener("pointermove", handleResizeMove)
    window.addEventListener("pointerup", stopResize)
    document.body.style.userSelect = "none"
  }

  useEffect(() => {
    const updateBounds = () => {
      setChatWidth((current) => clampChatWidth(current))
    }
    window.addEventListener("resize", updateBounds)
    return () => {
      window.removeEventListener("resize", updateBounds)
      stopResize()
    }
  }, [clampChatWidth, stopResize])

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      setChatWidth((current) => clampChatWidth(current))
    })
    return () => window.cancelAnimationFrame(id)
  }, [recordPanelOpen, chatPanelOpen, clampChatWidth])

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        window.localStorage.setItem(LS_CHAT_WIDTH, String(chatWidth))
      } catch {
        /* ignore */
      }
    }, DEBOUNCE_LS_MS)
    return () => window.clearTimeout(id)
  }, [chatWidth])

  useEffect(() => {
    if (!chatPanelOpen && !recordPanelOpen) {
      const id = window.requestAnimationFrame(() => {
        setChatPanelOpen(true)
        try {
          window.localStorage.setItem(LS_CHAT_OPEN, "true")
        } catch {
          /* ignore */
        }
      })
      return () => window.cancelAnimationFrame(id)
    }
    return undefined
  }, [chatPanelOpen, recordPanelOpen])


  const toggleChatPanel = () => {
    setChatPanelOpen((prev) => {
      if (prev && !recordPanelOpenRef.current) {
        try {
          window.localStorage.setItem(LS_CHAT_OPEN, "false")
          window.localStorage.setItem(LS_RECORD_OPEN, "true")
        } catch {
          /* ignore */
        }
        setRecordPanelOpen(true)
        syncWorkspaceStateToUrl({ recordPanelOpen: true })
        return false
      }
      const next = !prev
      try {
        window.localStorage.setItem(LS_CHAT_OPEN, String(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  const toggleRecordPanel = () => {
    setRecordPanelOpen((prev) => {
      if (prev && !chatPanelOpenRef.current) {
        try {
          window.localStorage.setItem(LS_RECORD_OPEN, "false")
          window.localStorage.setItem(LS_CHAT_OPEN, "true")
        } catch {
          /* ignore */
        }
        setChatPanelOpen(true)
        syncWorkspaceStateToUrl({ recordPanelOpen: false })
        return false
      }
      const next = !prev
      try {
        window.localStorage.setItem(LS_RECORD_OPEN, String(next))
      } catch {
        /* ignore */
      }
      syncWorkspaceStateToUrl({ recordPanelOpen: next })
      return next
    })
  }


  const ensureChatPanelOpenPersist = () => {
    setChatPanelOpen((prev) => {
      if (!prev) {
        try {
          window.localStorage.setItem(LS_CHAT_OPEN, "true")
        } catch {
          /* ignore */
        }
        return true
      }
      return prev
    })
  }

  const ensureRecordPanelOpenPersist = useCallback(() => {
    setRecordPanelOpen((prev) => {
      if (!prev) {
        try {
          window.localStorage.setItem(LS_RECORD_OPEN, "true")
        } catch {
          /* ignore */
        }
        syncWorkspaceStateToUrl({ recordPanelOpen: true })
        return true
      }
      return prev
    })
  }, [syncWorkspaceStateToUrl])

  const closeRecordPanelPersist = useCallback(() => {
    setRecordPanelOpen((prev) => {
      if (!prev) return prev
      try {
        window.localStorage.setItem(LS_RECORD_OPEN, "false")
        if (!chatPanelOpenRef.current) {
          window.localStorage.setItem(LS_CHAT_OPEN, "true")
        }
      } catch {
        /* ignore */
      }
      if (!chatPanelOpenRef.current) setChatPanelOpen(true)
      syncWorkspaceStateToUrl({ recordPanelOpen: false })
      return false
    })
  }, [syncWorkspaceStateToUrl])

  const openProjectChat = useCallback(() => {
    const projectChatId =
      activeProjectChatId ||
      linkedProjectChat?.projectId ||
      resolveProjectForWorkspaceChat(projects)?.id ||
      null

    setChatVariant("chat-project")
    setSelectedNavItemId("chat-project")
    if (projectChatId) setActiveProjectChatId(projectChatId)
    setChatPanelOpen((prev) => {
      if (!prev) {
        try {
          window.localStorage.setItem(LS_CHAT_OPEN, "true")
        } catch {
          /* ignore */
        }
        return true
      }
      return prev
    })
    syncWorkspaceStateToUrl({
      selectedNavItemId: "chat-project",
      chatVariant: "chat-project",
      projectChatId,
    })
  }, [activeProjectChatId, linkedProjectChat?.projectId, projects, syncWorkspaceStateToUrl])

  const openBuildTeamChat = useCallback(() => {
    setChatVariant("build-team")
    setSelectedNavItemId("build-team")
    ensureChatPanelOpenPersist()
    syncWorkspaceStateToUrl({
      selectedNavItemId: "build-team",
      chatVariant: "build-team",
      projectChatId: null,
    })
  }, [syncWorkspaceStateToUrl])

  const workspaceOutletContext = useMemo(
    () => ({
      openProjectChat,
      openBuildTeamChat,
      closeRecordPanel: closeRecordPanelPersist,
      navigateWithWorkspaceParams,
    }),
    [openProjectChat, openBuildTeamChat, closeRecordPanelPersist, navigateWithWorkspaceParams]
  )

  const handleNavSelectItem = (itemId) => {
    setSelectedNavItemId(itemId)
    if (itemId === COMPUTER_NAV_ITEM_ID) {
      setChatVariant("ai")
      ensureChatPanelOpenPersist()
      syncWorkspaceStateToUrl({
        selectedNavItemId: itemId,
        chatVariant: "ai",
        projectChatId: null,
      })
      return
    }
    if (itemId === "build-team" || itemId === "dev-team") {
      setChatVariant("build-team")
      ensureChatPanelOpenPersist()
      syncWorkspaceStateToUrl({
        selectedNavItemId: "build-team",
        chatVariant: "build-team",
        projectChatId: null,
      })
      return
    }
    if (itemId.startsWith("chat-")) {
      setChatVariant(itemId)
      ensureChatPanelOpenPersist()
      const projectChatId =
        itemId === "chat-project"
          ? activeProjectChatId || linkedProjectChat?.projectId || resolveProjectForWorkspaceChat(projects)?.id || null
          : null
      if (itemId === "chat-project" && projectChatId) setActiveProjectChatId(projectChatId)
      syncWorkspaceStateToUrl({
        selectedNavItemId: itemId,
        chatVariant: itemId,
        projectChatId,
      })
    }
  }

  const showSplitHandle = chatPanelOpen && recordPanelOpen
  const chatFillsRemainder = chatPanelOpen && !recordPanelOpen
  const relatedLinks = getChatRelatedLinks({ variant: chatVariant, linkedProjectChat })
  const pagesLabel = getChatPagesLabel({ variant: chatVariant })
  const showRelatedLinksPanel = !recordPanelOpen && relatedLinks.length > 0

  const handleSelectRelatedLink = (link) => {
    if (!link?.href) return
    ensureRecordPanelOpenPersist()
    navigateWithWorkspaceParams(link.href, link.state ? { state: link.state } : undefined)
  }

  const handlePagesPanelNavigate = (href) => {
    if (!href) return
    ensureRecordPanelOpenPersist()
    navigateWithWorkspaceParams(href)
  }

  return (
    <main className="flex h-screen items-stretch justify-center bg-white">
      <div ref={layoutRef} className="flex h-full w-full min-w-0 items-stretch">
        <NavPanel
          selectedItemId={selectedNavItemId}
          onSelectItem={handleNavSelectItem}
          chatPanelOpen={chatPanelOpen}
          recordPanelOpen={recordPanelOpen}
          onToggleChatPanel={toggleChatPanel}
          onToggleRecordPanel={toggleRecordPanel}
          projectChatNavLabel={linkedProjectChat?.title}
        />

        {chatPanelOpen ? (
          <ChatWindow
            width={chatWidth}
            variant={chatVariant}
            flexFill={chatFillsRemainder}
            linkedProjectChat={linkedProjectChat}
            onOpenRecordPanel={ensureRecordPanelOpenPersist}
            hideRelatedLinksControl={!recordPanelOpen}
            navigateInWorkspace={navigateWithWorkspaceParams}
          />
        ) : null}

        {showSplitHandle ? (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize chat panel"
            className="relative h-full w-px shrink-0 bg-[#ececec]"
          >
            <button
              type="button"
              aria-label="Resize chat panel"
              onPointerDown={startResize}
              className="absolute left-1/2 top-0 h-full w-[12px] -translate-x-1/2 bg-transparent"
            />
          </div>
        ) : null}

        {recordPanelOpen ? (
          <div className="right-panel-enter min-h-0 min-w-0 flex-1">
            <Outlet context={workspaceOutletContext} />
          </div>
        ) : showRelatedLinksPanel ? (
          <div className="right-panel-enter flex h-full shrink-0">
            {chatPanelOpen ? <div aria-hidden className="h-full w-px shrink-0 bg-[#ececec]" /> : null}
            <ChatRelatedLinksPanel
              links={relatedLinks}
              pagesLabel={pagesLabel}
              onSelect={handleSelectRelatedLink}
              projectId={linkedProjectChat?.projectId}
              onNavigate={handlePagesPanelNavigate}
            />
          </div>
        ) : null}
      </div>
    </main>
  )
}
