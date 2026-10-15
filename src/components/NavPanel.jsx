import { createPortal } from "react-dom"
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useAnchoredPopoverPosition } from "../hooks/useAnchoredPopoverPosition"
export { COMPUTER_NAV_ITEM_ID } from "../lib/workspaceSessions"

import {
  CHAT_PEOPLE_ITEMS,
  projectChatDestination,
  teamChatDestination,
} from "../lib/navDestinations"
import { loadTomorrowLayout, TOMORROW_PAGE_ITEMS } from "../lib/navTomorrow"
import { projectPathId } from "../lib/projectsApi"
import {
  teamChatNavLabel,
  teamGroupLabel,
  projectChatNavLabel,
} from "../lib/workspaceLabels"
import { COMPUTER_NAV_ITEM_ID } from "../lib/workspaceSessions"
import { ChatAvatar } from "./ChatAvatar"
import { Icon } from "./Icon"
import { NavGroup } from "./NavGroup"
import { NavItem } from "./NavItem"

const modalShadow =
  "0px 6px 13px rgba(0,0,0,0.10), 0px 23px 23px rgba(0,0,0,0.09), 0px 52px 31px rgba(0,0,0,0.05), 0px 92px 37px rgba(0,0,0,0.01), 0px 144px 40px rgba(0,0,0,0)"
const MENU_WIDTH_PX = 202
const EDGE_GUTTER_PX = 8

function MeAvatar({ selected = false }) {
  return (
    <span className="relative inline-flex size-[28px] shrink-0 items-center justify-center overflow-hidden">
      <span
        className={`absolute left-[5px] top-[5px] size-[18px] rounded-[999px] border border-transparent transition-colors duration-150 ${
          selected
            ? "border border-white bg-white"
            : "bg-[var(--background-primary-subtle)] group-hover:border-white group-hover:bg-white"
        }`}
      />
      <span
        className="relative z-[1] inline-flex h-[11px] w-[18px] items-center justify-center text-center text-[9.9px] text-[#737072]"
        style={{ fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif', fontVariationSettings: '"wght" 560' }}
      >
        M
      </span>
    </span>
  )
}

const PERSON_BY_ID = Object.fromEntries(CHAT_PEOPLE_ITEMS.map((item) => [item.id, item]))

function sessionNavLabel(sessionId, { teamChat, projectChat }) {
  if (sessionId === COMPUTER_NAV_ITEM_ID) return "Computer"
  if (sessionId === "team:chat" || sessionId === "build-team") return teamChat?.label ?? teamChatNavLabel()
  if (sessionId === "project:chat" || sessionId === "chat-project") {
    return projectChat?.label ?? projectChatNavLabel()
  }
  return PERSON_BY_ID[sessionId]?.label ?? sessionId
}

function sessionNavLeading(sessionId, { teamChat, projectChat }) {
  if (sessionId === COMPUTER_NAV_ITEM_ID) return undefined
  if (sessionId === "team:chat" || sessionId === "build-team") {
    return <ChatAvatar memberCount={teamChat?.memberCount ?? 12} />
  }
  if (sessionId === "project:chat" || sessionId === "chat-project") {
    return <ChatAvatar memberCount={projectChat?.memberCount ?? 23} />
  }
  const person = PERSON_BY_ID[sessionId]
  if (person) return <ChatAvatar initial={person.initial} />
  return undefined
}

function sessionIconName(sessionId) {
  if (sessionId === COMPUTER_NAV_ITEM_ID) return "computer"
  if (sessionId === "team:chat" || sessionId === "build-team") return "team"
  if (sessionId === "project:chat" || sessionId === "chat-project") return "project"
  return undefined
}

/**
 * Tomorrow-vision nav: pages open canvas; TEAMS / buckets hold sessions only.
 */
export function NavPanel({
  className = "",
  selectedItemId,
  defaultSelectedItemId = "computer",
  onSelectItem,
  onNewSession,
  activeTeam,
  activeProject,
  projectId,
  teamId,
  scope = "team",
}) {
  const [uncontrolledSelectedItemId, setUncontrolledSelectedItemId] = useState(defaultSelectedItemId)
  const isControlledSelection = selectedItemId !== undefined
  const currentSelectedItemId = isControlledSelection ? selectedItemId : uncontrolledSelectedItemId
  const layout = useMemo(() => loadTomorrowLayout(), [])

  const meMenuId = useId()
  const meTriggerRef = useRef(null)
  const meMenuRef = useRef(null)
  const [meMenuOpen, setMeMenuOpen] = useState(false)
  const mePopoverPos = useAnchoredPopoverPosition(meTriggerRef, meMenuOpen, 2)
  const [meMenuStyle, setMeMenuStyle] = useState({ top: 0, left: 0 })

  const resolvedProjectId = projectId ?? (activeProject ? projectPathId(activeProject) : null)
  const teamChat = teamChatDestination(teamId)
  const projectChat = projectChatDestination(resolvedProjectId)
  const teamLabel = activeTeam ? teamGroupLabel(activeTeam) : teamGroupLabel({ id: teamId })
  const showProjectChat = scope === "project" || Boolean(resolvedProjectId)

  const chatContext = useMemo(() => ({ teamChat, projectChat }), [teamChat, projectChat])

  const handleSelectItem = (itemId) => {
    if (!isControlledSelection) {
      setUncontrolledSelectedItemId(itemId)
    }
    onSelectItem?.(itemId)
  }

  const handleMeClick = () => {
    handleSelectItem("me")
    setMeMenuOpen((prev) => !prev)
  }

  useEffect(() => {
    if (!meMenuOpen) return undefined
    const onDocumentPointerDown = (event) => {
      const t = event.target
      if (meTriggerRef.current?.contains(t) || meMenuRef.current?.contains(t)) return
      setMeMenuOpen(false)
    }
    document.addEventListener("pointerdown", onDocumentPointerDown)
    return () => document.removeEventListener("pointerdown", onDocumentPointerDown)
  }, [meMenuOpen])

  useLayoutEffect(() => {
    if (!meMenuOpen) return undefined

    const positionMenu = () => {
      const triggerRect = meTriggerRef.current?.getBoundingClientRect()
      if (!triggerRect) return
      const menuHeight = meMenuRef.current?.offsetHeight ?? 120
      const viewportW = window.innerWidth
      const viewportH = window.innerHeight

      let top = Math.round(triggerRect.bottom + 2)
      const bottomOverflow = top + menuHeight - viewportH + EDGE_GUTTER_PX
      if (bottomOverflow > 0) {
        top = Math.round(triggerRect.top - menuHeight - 2)
      }
      top = Math.max(EDGE_GUTTER_PX, Math.min(top, viewportH - menuHeight - EDGE_GUTTER_PX))

      let left = Math.round(triggerRect.left)
      left = Math.max(EDGE_GUTTER_PX, Math.min(left, viewportW - MENU_WIDTH_PX - EDGE_GUTTER_PX))

      setMeMenuStyle({ top, left })
    }

    positionMenu()
    const id = window.requestAnimationFrame(positionMenu)
    window.addEventListener("scroll", positionMenu, true)
    window.addEventListener("resize", positionMenu)
    return () => {
      window.cancelAnimationFrame(id)
      window.removeEventListener("scroll", positionMenu, true)
      window.removeEventListener("resize", positionMenu)
    }
  }, [meMenuOpen, mePopoverPos])

  useEffect(() => {
    if (!meMenuOpen) return undefined
    const onKey = (event) => {
      if (event.key === "Escape") setMeMenuOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [meMenuOpen])

  const renderSessionItem = (sessionId) => {
    const leading = sessionNavLeading(sessionId, chatContext)
    const iconName = leading ? undefined : sessionIconName(sessionId)
    return (
      <NavItem
        key={sessionId}
        label={sessionNavLabel(sessionId, chatContext)}
        leading={leading}
        iconName={iconName}
        selected={
          currentSelectedItemId === sessionId ||
          (sessionId === "team:chat" && currentSelectedItemId === "build-team") ||
          (sessionId === "project:chat" && currentSelectedItemId === "chat-project")
        }
        className="w-full"
        onClick={() => handleSelectItem(sessionId)}
      />
    )
  }

  return (
    <aside
      data-variant="variant3"
      className={`flex h-full min-h-0 w-[220px] shrink-0 flex-col items-start overflow-hidden border-r border-[#ececec] bg-white px-[12px] py-[14px] ${className}`}
    >
      <div className="flex w-full items-center gap-[6px]">
        <button
          type="button"
          onClick={() => handleSelectItem(COMPUTER_NAV_ITEM_ID)}
          className="flex h-[29px] min-w-0 flex-1 items-center justify-center rounded-[999px] bg-[var(--background-primary-subtle)] pb-[3px] pt-[5px] transition-colors duration-150 hover:bg-[var(--control-bg-hover)]"
        >
          <img src="/icons/computer-wordmark.svg" alt="computer" className="h-[14px] w-[80px]" draggable={false} />
        </button>
        {onNewSession ? (
          <button
            type="button"
            aria-label="New session"
            onClick={() => onNewSession()}
            className="inline-flex size-[28px] shrink-0 items-center justify-center rounded-[999px] text-[var(--foreground-primary)] transition-colors duration-150 hover:bg-[var(--control-bg-hover)]"
          >
            <Icon name="plus" />
          </button>
        ) : null}
      </div>

      <div className="h-[16px] w-[192px] shrink-0 bg-white" />

      <div className="flex w-[194px] flex-col gap-[4px]">
        {TOMORROW_PAGE_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            label={item.label}
            iconName={item.iconName}
            selected={currentSelectedItemId === item.id}
            className="w-full"
            onClick={() => handleSelectItem(item.id)}
          />
        ))}
      </div>

      <div className="h-[16px] w-[192px] shrink-0 bg-white" />

      <div className="flex w-[194px] min-h-0 flex-1 flex-col gap-[10px] overflow-y-auto">
        <NavGroup label={teamLabel} variant="section">
          {(layout.teamsSessionIds?.length ? layout.teamsSessionIds : ["team:chat"]).map(renderSessionItem)}
          {showProjectChat ? (
            <NavItem
              label={projectChatNavLabel()}
              leading={<ChatAvatar memberCount={projectChat.memberCount} />}
              selected={currentSelectedItemId === "project:chat" || currentSelectedItemId === "chat-project"}
              className="w-full"
              onClick={() => handleSelectItem("project:chat")}
            />
          ) : null}
        </NavGroup>

        {layout.sectionOrder.map((sectionId) => {
          const section = layout.sections?.[sectionId]
          if (!section) return null
          const ids = Array.isArray(section.sessionIds) ? section.sessionIds : []
          if (ids.length === 0) return null
          return (
            <NavGroup key={sectionId} label={section.title} variant="section">
              {ids.map(renderSessionItem)}
            </NavGroup>
          )
        })}
      </div>

      <div className="h-[12px] w-full shrink-0 bg-white" />
      <NavItem
        ref={meTriggerRef}
        label="Me"
        className="w-full"
        id={`${meMenuId}-trigger`}
        leading={<MeAvatar selected={currentSelectedItemId === "me" || meMenuOpen} />}
        selected={currentSelectedItemId === "me" || meMenuOpen}
        onClick={handleMeClick}
        aria-haspopup="menu"
        aria-expanded={meMenuOpen}
        aria-controls={meMenuOpen ? `${meMenuId}-menu` : undefined}
      />

      {meMenuOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={meMenuRef}
              id={`${meMenuId}-menu`}
              role="menu"
              aria-label="Account"
              className="fixed z-[2147483646] inline-flex w-[202px] flex-col items-start gap-[4px] rounded-[2px] bg-white p-[6px]"
              style={{
                boxShadow: modalShadow,
                top: `${meMenuStyle.top}px`,
                left: `${meMenuStyle.left}px`,
              }}
            >
              <NavItem label="Profile" leading={<></>} className="w-full max-w-none pr-[6px]" onClick={() => setMeMenuOpen(false)} />
            </div>,
            document.body
          )
        : null}
    </aside>
  )
}
