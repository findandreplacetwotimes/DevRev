import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { useIssues } from "../context/IssuesContext"
import { getChatLinkPanelSections, hasChatLinkPanelContent } from "../lib/chatRelatedLinks"
import {
  CANVAS_INDEX_TAB_ID,
  addCanvasTab,
  closeCanvasTab,
  createDocTabFromLink,
  createDocTabFromLocation,
  docTabsOnly,
  docTabPatchFromLink,
  ensureIndexTab,
  findTabByRouteId,
  isCanvasIndexPath,
  isDocCanvasPath,
  loadCanvasTabsForChat,
  patchCanvasTabFromLocation,
  routeIdFromHref,
  saveCanvasTabsForChat,
  updateCanvasTab,
} from "../lib/canvasTabs"
import { NEW_CHAT_VARIANT, isBranchedChatVariant, isDynamicGroupChatVariant, isNavChatArchivable, resolveGroupChatDisplay } from "../lib/navFolderState"
import { projectDisplayTitle, resolveProjectForWorkspaceChat } from "../lib/projectsApi"
import {
  canBranchFromChat,
  createComputerChatRecord,
  createGroupChatRecord,
  ensureProjectMainChatInRegistry,
  getRelatedChatFamily,
  groupChatMetaFromRecord,
  isBranchedChatId,
  isComputerChatId,
  isGroupChatId,
  isProjectMainChatId,
  loadRelatedChatRegistry,
  projectMainChatId,
  relatedChatToNavItem,
  resolveBranchDraftFromVariant,
  resolveProjectIdFromVariant,
  resolveRootChatId,
  saveRelatedChatRegistry,
  supportsChatActionsMenu,
  TEAM_ROOT_CHAT_ID,
} from "../lib/relatedChats"
import { resetWorkspaceChats } from "../lib/workspaceReset"
import {
  applyWorkspaceChatToSearchParams,
  canvasIndexHref,
  hasWorkspaceChatInUrl,
  hrefWithWorkspaceParams,
  parseWorkspaceChatState,
} from "../lib/workspaceUrlState"
import { CanvasLinkPanelTab } from "./CanvasLinkPanelTab"
import { CanvasTabs } from "./CanvasTabs"
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
  return isFirstWorkspaceVisit() ? null : "build-team"
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
  const { issues, projects } = useIssues()
  const canvasTabContext = useMemo(() => ({ issues, projects }), [issues, projects])
  const skipUrlSyncRef = useRef(false)
  const skipCanvasUrlSyncRef = useRef(false)
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
  const [newChatParticipants, setNewChatParticipants] = useState([])
  const [branchDraft, setBranchDraft] = useState(null)
  const [groupChatMetas, setGroupChatMetas] = useState({})
  const [chatSessionKey, setChatSessionKey] = useState(0)
  const [relatedChatsRegistry, setRelatedChatsRegistry] = useState(() => loadRelatedChatRegistry())
  const rootChatId = useMemo(
    () => resolveRootChatId(chatVariant, relatedChatsRegistry) || chatVariant || "build-team",
    [chatVariant, relatedChatsRegistry]
  )
  const [canvasTabs, setCanvasTabs] = useState(() => loadCanvasTabsForChat("build-team"))
  const [activeCanvasTabId, setActiveCanvasTabId] = useState(CANVAS_INDEX_TAB_ID)
  const activeCanvasTabIdRef = useRef(activeCanvasTabId)
  const navPanelRef = useRef(null)

  /** Nav + chat header follow linked project from URL or workspace default. */
  const linkedProjectChat = useMemo(() => {
    const projectId =
      resolveProjectIdFromVariant(chatVariant, relatedChatsRegistry) ||
      (isProjectMainChatId(chatVariant) ? chatVariant.slice("chat-project-".length) : null) ||
      urlChatState.projectChatId ||
      resolveProjectForWorkspaceChat(projects)?.id ||
      null

    if (!projectId || !Array.isArray(projects)) return null
    const project = projects.find((row) => row && row.id === projectId)
    if (!project) return null
    return { projectId: project.id, title: projectDisplayTitle(project) }
  }, [projects, chatVariant, relatedChatsRegistry, urlChatState.projectChatId])

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
  useEffect(() => {
    activeCanvasTabIdRef.current = activeCanvasTabId
  }, [activeCanvasTabId])

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
    if (urlChatState.chatVariant !== NEW_CHAT_VARIANT) {
      setNewChatParticipants([])
      setBranchDraft(null)
    }
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
      if (!href || typeof href !== "string") return
      const pathname = href.split("?")[0].split("#")[0]
      if (isCanvasIndexPath(pathname) || isDocCanvasPath(pathname)) {
        openCanvasViewRef.current?.(
          { kind: "doc", href, state: options?.state },
          { replace: options?.replace, replaceActive: true }
        )
        return
      }
      navigate(hrefWithWorkspaceParams(href, searchParams), options)
    },
    [navigate, searchParams]
  )

  const openCanvasViewRef = useRef(null)

  const clampChatWidth = useCallback(
    (nextWidth) => {
      const layoutWidth = layoutRef.current?.clientWidth ?? window.innerWidth
      const available = Math.max(0, layoutWidth - NAV_WIDTH)

      if (!recordPanelOpen) {
        const chatOnlyUpper = Math.max(0, available)
        const chatOnlyLower = Math.min(MIN_CHAT_WIDTH, chatOnlyUpper || MIN_CHAT_WIDTH)
        return Math.min(chatOnlyUpper, Math.max(chatOnlyLower, nextWidth))
      }

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

  useEffect(() => {
    const registry = loadRelatedChatRegistry()
    setRelatedChatsRegistry(registry)
    navPanelRef.current?.rehydrateRelatedChats(registry)
    const metas = {}
    for (const record of Object.values(registry)) {
      const meta = groupChatMetaFromRecord(record)
      if (meta) metas[record.id] = meta
    }
    setGroupChatMetas(metas)
  }, [])

  useEffect(() => {
    if (!Array.isArray(projects) || projects.length === 0) return
    setRelatedChatsRegistry((prev) => {
      let next = prev
      let changed = false
      for (const project of projects) {
        if (!project?.id) continue
        const title = projectDisplayTitle(project)
        const result = ensureProjectMainChatInRegistry(next, project.id, title)
        if (result.registry !== next) {
          next = result.registry
          changed = true
        }
        navPanelRef.current?.registerProjectChat(relatedChatToNavItem(result.record))
      }
      if (changed) saveRelatedChatRegistry(next)
      return changed ? next : prev
    })
  }, [projects])

  const discardNewChatDraft = useCallback(() => {
    setNewChatParticipants([])
    setBranchDraft(null)
  }, [])

  const openProjectChat = useCallback(() => {
    if (chatVariant === NEW_CHAT_VARIANT) discardNewChatDraft()
    const projectChatId =
      activeProjectChatId ||
      linkedProjectChat?.projectId ||
      resolveProjectForWorkspaceChat(projects)?.id ||
      null

    if (!projectChatId) return
    const variant = projectMainChatId(projectChatId)
    setChatVariant(variant)
    setSelectedNavItemId(variant)
    setActiveProjectChatId(projectChatId)
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
      selectedNavItemId: variant,
      chatVariant: variant,
      projectChatId,
    })
  }, [activeProjectChatId, linkedProjectChat?.projectId, projects, syncWorkspaceStateToUrl, chatVariant, discardNewChatDraft])

  const openBuildTeamChat = useCallback(() => {
    if (chatVariant === NEW_CHAT_VARIANT) discardNewChatDraft()
    setChatVariant("build-team")
    setSelectedNavItemId("build-team")
    ensureChatPanelOpenPersist()
    syncWorkspaceStateToUrl({
      selectedNavItemId: "build-team",
      chatVariant: "build-team",
      projectChatId: null,
    })
  }, [syncWorkspaceStateToUrl])

  const persistCanvasTabs = useCallback(
    (tabs) => {
      saveCanvasTabsForChat(rootChatId, tabs)
    },
    [rootChatId]
  )

  const openCanvasView = useCallback(
    (target, options = {}) => {
      if (!target) return
      const { replace = false, newTab = false, replaceActive = false, activateTabId = null } = options

      if (target.kind === "index") {
        setCanvasTabs((prev) => ensureIndexTab(prev))
        setActiveCanvasTabId(CANVAS_INDEX_TAB_ID)
        skipCanvasUrlSyncRef.current = true
        navigate(canvasIndexHref(searchParams), { replace, state: target.state })
        ensureRecordPanelOpenPersist()
        return
      }

      if (target.kind === "doc" && target.href) {
        const activeId = activateTabId || activeCanvasTabIdRef.current
        let nextActiveId = activeId

        setCanvasTabs((prev) => {
          const withIndex = ensureIndexTab(prev)
          let next

          if (activateTabId) {
            next = withIndex
          } else if (newTab) {
            const tab = createDocTabFromLink(target, canvasTabContext)
            next = addCanvasTab(withIndex, tab)
            nextActiveId = tab.id
          } else if (replaceActive && activeId && activeId !== CANVAS_INDEX_TAB_ID) {
            next = updateCanvasTab(withIndex, activeId, docTabPatchFromLink(target, canvasTabContext))
            nextActiveId = activeId
          } else {
            const routeId = routeIdFromHref(target.href)
            const existing = findTabByRouteId(withIndex, routeId)
            if (existing) {
              next = withIndex
              nextActiveId = existing.id
            } else {
              const tab = createDocTabFromLink(target, canvasTabContext)
              next = addCanvasTab(withIndex, tab)
              nextActiveId = tab.id
            }
          }

          persistCanvasTabs(next)
          return next
        })
        setActiveCanvasTabId(nextActiveId)
        skipCanvasUrlSyncRef.current = true
        navigate(hrefWithWorkspaceParams(target.href, searchParams), {
          replace,
          state: target.state,
        })
        ensureRecordPanelOpenPersist()
      }
    },
    [navigate, searchParams, persistCanvasTabs, ensureRecordPanelOpenPersist, canvasTabContext]
  )

  useEffect(() => {
    openCanvasViewRef.current = openCanvasView
  }, [openCanvasView])

  const workspaceOutletContext = useMemo(
    () => ({
      openProjectChat,
      openBuildTeamChat,
      closeRecordPanel: closeRecordPanelPersist,
      navigateWithWorkspaceParams,
    }),
    [openProjectChat, openBuildTeamChat, closeRecordPanelPersist, navigateWithWorkspaceParams]
  )

  const handleNewChat = useCallback(() => {
    setBranchDraft(null)
    setNewChatParticipants([])
    setChatVariant(NEW_CHAT_VARIANT)
    setSelectedNavItemId(null)
    ensureChatPanelOpenPersist()
    syncWorkspaceStateToUrl({
      selectedNavItemId: null,
      chatVariant: NEW_CHAT_VARIANT,
      projectChatId: null,
    })
  }, [syncWorkspaceStateToUrl])

  const handleNewComputerChat = useCallback(() => {
    if (chatVariant === NEW_CHAT_VARIANT) discardNewChatDraft()
    setChatVariant("ai")
    setSelectedNavItemId(null)
    ensureChatPanelOpenPersist()
    syncWorkspaceStateToUrl({
      selectedNavItemId: null,
      chatVariant: "ai",
      projectChatId: null,
    })
  }, [chatVariant, discardNewChatDraft, syncWorkspaceStateToUrl])

  const handleComputerChatStarted = useCallback(
    (sessionId) => {
      const record = createComputerChatRecord(sessionId)
      navPanelRef.current?.registerGroupChat(relatedChatToNavItem(record))
      setRelatedChatsRegistry((prev) => {
        const next = { ...prev, [sessionId]: record }
        saveRelatedChatRegistry(next)
        return next
      })
      setChatVariant(sessionId)
      setSelectedNavItemId(sessionId)
      syncWorkspaceStateToUrl({
        selectedNavItemId: sessionId,
        chatVariant: sessionId,
        projectChatId: null,
      })
    },
    [syncWorkspaceStateToUrl]
  )

  const navigateToChatVariant = useCallback(
    (variant, projectChatId = null) => {
      setChatVariant(variant)
      setSelectedNavItemId(variant)
      if (projectChatId) setActiveProjectChatId(projectChatId)
      ensureChatPanelOpenPersist()
      syncWorkspaceStateToUrl({
        selectedNavItemId: variant,
        chatVariant: variant,
        projectChatId,
      })
    },
    [syncWorkspaceStateToUrl]
  )

  const handleChatDeleted = useCallback(
    (itemId) => {
      const activeNavId = chatVariant === "ai" ? null : chatVariant
      if (activeNavId === itemId) {
        setChatVariant("ai")
        setSelectedNavItemId(null)
        syncWorkspaceStateToUrl({
          selectedNavItemId: null,
          chatVariant: "ai",
          projectChatId: null,
        })
      }
      if (isDynamicGroupChatVariant(itemId) || isBranchedChatId(itemId)) {
        setGroupChatMetas((prev) => {
          const next = { ...prev }
          delete next[itemId]
          return next
        })
      }
      if (isBranchedChatId(itemId) || isComputerChatId(itemId) || isGroupChatId(itemId)) {
        setRelatedChatsRegistry((prev) => {
          if (!(itemId in prev)) return prev
          const next = { ...prev }
          delete next[itemId]
          saveRelatedChatRegistry(next)
          return next
        })
      }
    },
    [chatVariant, syncWorkspaceStateToUrl]
  )

  const handleArchiveChat = useCallback(
    (itemId) => {
      if (!itemId || !isNavChatArchivable(itemId)) return
      navPanelRef.current?.deleteChatItem(itemId)
      handleChatDeleted(itemId)
    },
    [handleChatDeleted]
  )

  const handleConfirmNewChat = useCallback(() => {
    if (newChatParticipants.length < 1) return
    const display = resolveGroupChatDisplay(newChatParticipants)
    const navItem =
      display.memberCount != null
        ? { id: "", label: display.title, memberCount: display.memberCount }
        : display.avatarInitial != null
          ? { id: "", label: display.title, initial: display.avatarInitial }
          : { id: "", label: display.title, iconName: "chat" }

    if (branchDraft) {
      const id = `chat-branch-${Date.now()}`
      navItem.id = id
      const record = {
        id,
        title: display.title,
        participants: newChatParticipants,
        context: branchDraft.context,
        parentChatId: branchDraft.parentChatId,
        rootChatId: branchDraft.rootChatId,
        createdAt: Date.now(),
      }
      setRelatedChatsRegistry((prev) => {
        const next = { ...prev, [id]: record }
        saveRelatedChatRegistry(next)
        return next
      })
      navPanelRef.current?.registerGroupChat(navItem)
      setGroupChatMetas((prev) => ({
        ...prev,
        [id]: { title: display.title, participants: newChatParticipants },
      }))
      setBranchDraft(null)
      setNewChatParticipants([])
      navigateToChatVariant(id, null)
      return
    }

    const id = `chat-group-${Date.now()}`
    navItem.id = id
    const record = createGroupChatRecord(id, display.title, newChatParticipants)
    setRelatedChatsRegistry((prev) => {
      const next = { ...prev, [id]: record }
      saveRelatedChatRegistry(next)
      return next
    })
    navPanelRef.current?.registerGroupChat(navItem)
    setGroupChatMetas((prev) => ({
      ...prev,
      [id]: { title: display.title, participants: newChatParticipants },
    }))
    setNewChatParticipants([])
    navigateToChatVariant(id, null)
  }, [newChatParticipants, branchDraft, navigateToChatVariant])

  const handleBranchChat = useCallback(
    (sourceVariant) => {
      const draft = resolveBranchDraftFromVariant(sourceVariant ?? chatVariant, relatedChatsRegistry)
      if (!draft) return
      if (chatVariant === NEW_CHAT_VARIANT) discardNewChatDraft()
      setBranchDraft(draft)
      setNewChatParticipants([])
      setChatVariant(NEW_CHAT_VARIANT)
      setSelectedNavItemId(null)
      ensureChatPanelOpenPersist()
      syncWorkspaceStateToUrl({
        selectedNavItemId: null,
        chatVariant: NEW_CHAT_VARIANT,
        projectChatId: null,
      })
    },
    [chatVariant, relatedChatsRegistry, discardNewChatDraft, syncWorkspaceStateToUrl]
  )

  const handleSelectRelatedChat = useCallback(
    (chatId) => {
      if (!chatId) return
      const projectId = isProjectMainChatId(chatId) ? chatId.slice("chat-project-".length) : null
      navigateToChatVariant(chatId, projectId)
    },
    [navigateToChatVariant]
  )

  const handleNavSelectItem = (itemId) => {
    if (chatVariant === NEW_CHAT_VARIANT) {
      discardNewChatDraft()
    }
    setSelectedNavItemId(itemId)
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
      const projectChatId = isProjectMainChatId(itemId) ? itemId.slice("chat-project-".length) : null
      if (projectChatId) setActiveProjectChatId(projectChatId)
      syncWorkspaceStateToUrl({
        selectedNavItemId: itemId,
        chatVariant: itemId,
        projectChatId,
      })
    }
  }

  const dynamicChatMeta = groupChatMetas[chatVariant] ?? null

  const linkPanelSections = useMemo(
    () =>
      getChatLinkPanelSections({
        variant: chatVariant,
        linkedProjectChat,
        relatedChatsRegistry,
        currentChatId: chatVariant,
      }),
    [chatVariant, linkedProjectChat, relatedChatsRegistry]
  )
  const hasPanelContent = hasChatLinkPanelContent(linkPanelSections)
  const relatedChatsFamily = rootChatId ? getRelatedChatFamily(rootChatId, relatedChatsRegistry) : []
  const showChatActionsMenu = supportsChatActionsMenu(chatVariant, relatedChatsRegistry)
  const showBranchAction = canBranchFromChat(chatVariant, relatedChatsRegistry)
  const showArchiveAction = isNavChatArchivable(chatVariant)
  const tabsSideOpen = recordPanelOpen

  useEffect(() => {
    setCanvasTabs(loadCanvasTabsForChat(rootChatId))
  }, [rootChatId])

  useEffect(() => {
    if (skipCanvasUrlSyncRef.current) {
      skipCanvasUrlSyncRef.current = false
      return
    }
    if (!recordPanelOpen) return

    if (isCanvasIndexPath(location.pathname)) {
      setActiveCanvasTabId(CANVAS_INDEX_TAB_ID)
      setCanvasTabs((prev) => ensureIndexTab(prev))
      return
    }

    if (isDocCanvasPath(location.pathname)) {
      const activeId = activeCanvasTabIdRef.current
      if (activeId && activeId !== CANVAS_INDEX_TAB_ID) {
        setCanvasTabs((prev) => {
          const withIndex = ensureIndexTab(prev)
          const next = patchCanvasTabFromLocation(
            withIndex,
            activeId,
            location.pathname,
            location.search,
            canvasTabContext
          )
          saveCanvasTabsForChat(rootChatId, next)
          return next
        })
        return
      }

      const tab = createDocTabFromLocation(location.pathname, location.search, {}, canvasTabContext)
      setCanvasTabs((prev) => {
        const next = addCanvasTab(ensureIndexTab(prev), tab)
        saveCanvasTabsForChat(rootChatId, next)
        return next
      })
      setActiveCanvasTabId(tab.id)
    }
  }, [location.pathname, location.search, recordPanelOpen, rootChatId, canvasTabContext])

  const toggleTabsSide = useCallback(() => {
    if (!hasPanelContent) return
    if (!recordPanelOpenRef.current) {
      openCanvasView({ kind: "index" })
      return
    }
    closeRecordPanelPersist()
  }, [hasPanelContent, openCanvasView, closeRecordPanelPersist])

  const handleAddCanvasTab = useCallback(() => {
    openCanvasView({ kind: "doc", href: "/issues", title: "Issues" }, { newTab: true })
  }, [openCanvasView])

  const handleSelectCanvasTab = useCallback(
    (tabId) => {
      if (tabId === CANVAS_INDEX_TAB_ID) {
        openCanvasView({ kind: "index" })
        return
      }
      const tab = canvasTabs.find((row) => row.id === tabId)
      if (!tab?.href) return
      openCanvasView(
        {
          kind: "doc",
          href: tab.href,
          state: tab.state,
          title: tab.label,
          leadingIcon: tab.leadingIcon,
        },
        { activateTabId: tabId }
      )
    },
    [canvasTabs, openCanvasView]
  )

  const handleCloseCanvasTab = useCallback(
    (tabId) => {
      if (tabId === CANVAS_INDEX_TAB_ID) return
      const wasActive = activeCanvasTabId === tabId
      setCanvasTabs((prev) => {
        const next = closeCanvasTab(prev, tabId)
        persistCanvasTabs(next)
        return next
      })
      if (wasActive) {
        openCanvasView({ kind: "index" })
      }
    },
    [activeCanvasTabId, openCanvasView, persistCanvasTabs]
  )

  const handleSelectRelatedLink = useCallback(
    (link) => {
      if (!link?.href) return
      openCanvasView({ kind: "doc", ...link }, { newTab: true })
    },
    [openCanvasView]
  )

  const handlePagesPanelNavigate = useCallback(
    (href) => {
      if (!href) return
      openCanvasView({ kind: "doc", href }, { newTab: true })
    },
    [openCanvasView]
  )

  const handleResetChats = useCallback(() => {
    const registry = resetWorkspaceChats(projects)
    navPanelRef.current?.resetNav()
    navPanelRef.current?.rehydrateRelatedChats(registry)
    setRelatedChatsRegistry(registry)
    setGroupChatMetas({})
    setBranchDraft(null)
    setNewChatParticipants([])
    setChatVariant("ai")
    setSelectedNavItemId(null)
    setActiveProjectChatId(null)
    setCanvasTabs(loadCanvasTabsForChat(TEAM_ROOT_CHAT_ID))
    setActiveCanvasTabId(CANVAS_INDEX_TAB_ID)
    setChatSessionKey((key) => key + 1)
    skipUrlSyncRef.current = true
    skipCanvasUrlSyncRef.current = true
    syncWorkspaceStateToUrl({
      selectedNavItemId: null,
      chatVariant: "ai",
      projectChatId: null,
      recordPanelOpen,
    })
    if (recordPanelOpen) {
      navigate(canvasIndexHref(searchParams), { replace: true })
    }
  }, [projects, syncWorkspaceStateToUrl, recordPanelOpen, navigate, searchParams])

  const showSplitHandle = chatPanelOpen && recordPanelOpen
  const chatFillsRemainder = chatPanelOpen && !recordPanelOpen
  const showCanvasIndex = activeCanvasTabId === CANVAS_INDEX_TAB_ID
  const docTabs = useMemo(() => docTabsOnly(canvasTabs), [canvasTabs])

  return (
    <main className="flex h-screen items-stretch justify-center bg-white">
      <div ref={layoutRef} className="flex h-full w-full min-w-0 items-stretch">
        <NavPanel
          ref={navPanelRef}
          selectedItemId={selectedNavItemId}
          onSelectItem={handleNavSelectItem}
          onNewChat={handleNewChat}
          onNewComputerChat={handleNewComputerChat}
          onDeleteChat={handleChatDeleted}
          onBranchChat={handleBranchChat}
          onSelectRelatedChat={handleSelectRelatedChat}
          relatedChatsRegistry={relatedChatsRegistry}
          onResetChats={handleResetChats}
        />

        {chatPanelOpen ? (
          <ChatWindow
            key={chatSessionKey}
            width={chatWidth}
            variant={chatVariant}
            flexFill={chatFillsRemainder}
            linkedProjectChat={linkedProjectChat}
            dynamicChatMeta={dynamicChatMeta}
            newChatParticipants={newChatParticipants}
            onNewChatParticipantsChange={setNewChatParticipants}
            onConfirmNewChat={handleConfirmNewChat}
            onArchiveChat={handleArchiveChat}
            onBranchChat={() => handleBranchChat(chatVariant)}
            onSelectRelatedChat={handleSelectRelatedChat}
            relatedChats={relatedChatsFamily}
            currentChatId={chatVariant}
            showChatActionsMenu={showChatActionsMenu}
            showBranch={showBranchAction}
            showArchive={showArchiveAction}
            hasPanelContent={hasPanelContent}
            relatedChatsRegistry={relatedChatsRegistry}
            onOpenRecordPanel={ensureRecordPanelOpenPersist}
            onComputerChatStarted={handleComputerChatStarted}
            tabsSideOpen={tabsSideOpen}
            onToggleTabsSide={toggleTabsSide}
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
          <div className="right-panel-enter flex min-h-0 min-w-0 flex-1 flex-col">
            <CanvasTabs
              tabs={docTabs}
              selectedId={activeCanvasTabId}
              showIndexButton
              indexActive={showCanvasIndex}
              onSelectIndex={() => openCanvasView({ kind: "index" })}
              onSelect={handleSelectCanvasTab}
              onClose={handleCloseCanvasTab}
              showAdd
              revealAddOnHover
              addVisible={false}
              onAdd={handleAddCanvasTab}
            />
            <div className="flex min-h-0 flex-1 bg-white">
              {showCanvasIndex ? (
                <CanvasLinkPanelTab
                  sections={linkPanelSections}
                  currentChatId={chatVariant}
                  projectId={linkedProjectChat?.projectId}
                  onSelect={handleSelectRelatedLink}
                  onSelectChat={handleSelectRelatedChat}
                  onNavigate={handlePagesPanelNavigate}
                />
              ) : (
                <Outlet context={workspaceOutletContext} />
              )}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  )
}
