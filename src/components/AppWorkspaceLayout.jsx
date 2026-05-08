import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { ChatWindow } from "./ChatWindow"
import { NavPanel } from "./NavPanel"

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

/** Never start with both panels hidden (blank canvas). */
function loadInitialPanelOpen() {
  const chat = loadBool(LS_CHAT_OPEN, true)
  const record = loadBool(LS_RECORD_OPEN, true)
  if (!chat && !record) {
    try {
      window.localStorage.setItem(LS_CHAT_OPEN, "true")
      window.localStorage.setItem(LS_RECORD_OPEN, "true")
    } catch {
      /* ignore */
    }
    return { chat: true, record: true }
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
  const location = useLocation()
  const navigate = useNavigate()

  const panelsInitRef = useRef(null)
  if (panelsInitRef.current === null) {
    panelsInitRef.current = loadInitialPanelOpen()
  }
  const panelsInitial = panelsInitRef.current

  const [chatWidth, setChatWidth] = useState(loadChatWidth)
  const [chatPanelOpen, setChatPanelOpen] = useState(panelsInitial.chat)
  const [recordPanelOpen, setRecordPanelOpen] = useState(panelsInitial.record)

  /** `person` chats use LLM as teammate; `ai` uses computer mode. */
  const [chatVariant, setChatVariant] = useState("build-team")
  const layoutRef = useRef(null)
  const dragStateRef = useRef(null)

  const chatPanelOpenRef = useRef(chatPanelOpen)
  const recordPanelOpenRef = useRef(recordPanelOpen)
  useEffect(() => {
    chatPanelOpenRef.current = chatPanelOpen
  }, [chatPanelOpen])
  useEffect(() => {
    recordPanelOpenRef.current = recordPanelOpen
  }, [recordPanelOpen])

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

  const stopResize = () => {
    dragStateRef.current = null
    window.removeEventListener("pointermove", handleResizeMove)
    window.removeEventListener("pointerup", stopResize)
    document.body.style.cursor = ""
    document.body.style.userSelect = ""
  }

  function handleResizeMove(event) {
    if (!dragStateRef.current) return
    const deltaX = event.clientX - dragStateRef.current.startX
    const nextWidth = dragStateRef.current.startWidth + deltaX
    setChatWidth(clampChatWidth(nextWidth))
  }

  const startResize = (event) => {
    if (!chatPanelOpen || !recordPanelOpen) return
    event.preventDefault()
    dragStateRef.current = { startX: event.clientX, startWidth: chatWidth }
    window.addEventListener("pointermove", handleResizeMove)
    window.addEventListener("pointerup", stopResize)
    document.body.style.cursor = "col-resize"
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
  }, [clampChatWidth])

  useEffect(() => {
    setChatWidth((current) => clampChatWidth(current))
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
      setChatPanelOpen(true)
      setRecordPanelOpen(true)
      try {
        window.localStorage.setItem(LS_CHAT_OPEN, "true")
        window.localStorage.setItem(LS_RECORD_OPEN, "true")
      } catch {
        /* ignore */
      }
    }
  }, [chatPanelOpen, recordPanelOpen])

  const pathname = location.pathname
  const issueFromThreeLevelPath =
    pathname.startsWith("/issues") &&
    typeof location.state?.sourceProjectId === "string" &&
    location.state.sourceProjectId.trim().length > 0

  // Extract projectId from route for project chat context
  const currentProjectId = useMemo(() => {
    const match = /^\/projects\/([^/]+)/.exec(pathname)
    return match ? decodeURIComponent(match[1]) : null
  }, [pathname])

  const selectedNavItemId = issueFromThreeLevelPath
    ? "projects"
    : pathname.startsWith("/issues")
      ? "issues"
    : pathname.startsWith("/projects")
      ? "projects"
    : pathname.startsWith("/sprints")
      ? "sprints"
    : pathname.startsWith("/about")
      ? "about"
    : pathname.startsWith("/team-members")
      ? "about"
      : chatVariant.startsWith("chat-") || chatVariant === "build-team"
        ? chatVariant
      : null

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
        return false
      }
      const next = !prev
      try {
        window.localStorage.setItem(LS_RECORD_OPEN, String(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  const ensureRecordPanelOpen = () => {
    setRecordPanelOpen((prev) => {
      if (!prev) {
        try {
          window.localStorage.setItem(LS_RECORD_OPEN, "true")
        } catch {
          /* ignore */
        }
        return true
      }
      return prev
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

  const openProjectChat = useCallback(() => {
    setChatVariant("chat-project")
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
  }, [])

  const openBuildTeamChat = useCallback(() => {
    setChatVariant("build-team")
    ensureChatPanelOpenPersist()
  }, [])

  const workspaceOutletContext = useMemo(
    () => ({ openProjectChat, openBuildTeamChat }),
    [openProjectChat, openBuildTeamChat]
  )

  /** Build team → chat lane only (person). Does not navigate or change record panel — same as Computer for “chat-only”. */
  const handleNavSelectItem = (itemId) => {
    if (itemId === "build-team") {
      setChatVariant("build-team")
      ensureChatPanelOpenPersist()
      return
    }
    if (itemId.startsWith("chat-")) {
      setChatVariant(itemId)
      ensureChatPanelOpenPersist()
      return
    }
    if (itemId === "issues") {
      ensureRecordPanelOpen()
      navigate("/issues")
      return
    }
    if (itemId === "projects") {
      ensureRecordPanelOpen()
      navigate("/projects")
      return
    }
    if (itemId === "sprints") {
      ensureRecordPanelOpen()
      navigate("/sprints")
      return
    }
    if (itemId === "about") {
      ensureRecordPanelOpen()
      navigate("/about")
      return
    }
    /* Secondary nav (no route yet): show record canvas; leave chat lane as-is */
    ensureRecordPanelOpen()
  }

  /** Computer chip → AI chat lane (does not change record route). */
  const handleComputerClick = () => {
    setChatVariant("ai")
    setChatPanelOpen((prev) => {
      if (!prev) {
        try {
          window.localStorage.setItem(LS_CHAT_OPEN, "true")
        } catch {
          /* ignore */
        }
      }
      return true
    })
  }

  const showSplitHandle = chatPanelOpen && recordPanelOpen
  const chatFillsRemainder = chatPanelOpen && !recordPanelOpen

  return (
    <main className="flex h-screen items-stretch justify-center bg-white">
      <div ref={layoutRef} className="flex h-full w-full min-w-0 items-stretch">
        <NavPanel
          selectedItemId={selectedNavItemId}
          onSelectItem={handleNavSelectItem}
          onComputerClick={handleComputerClick}
          chatPanelOpen={chatPanelOpen}
          recordPanelOpen={recordPanelOpen}
          onToggleChatPanel={toggleChatPanel}
          onToggleRecordPanel={toggleRecordPanel}
        />

        {chatPanelOpen ? (
          <ChatWindow
            width={chatWidth}
            variant={chatVariant}
            flexFill={chatFillsRemainder}
            projectId={chatVariant === "chat-project" ? currentProjectId : null}
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
              className="absolute left-1/2 top-0 h-full w-[12px] -translate-x-1/2 cursor-col-resize bg-transparent"
            />
          </div>
        ) : null}

        {recordPanelOpen ? (
          <div className="min-h-0 min-w-0 flex-1">
            <Outlet context={workspaceOutletContext} />
          </div>
        ) : null}
      </div>
    </main>
  )
}
