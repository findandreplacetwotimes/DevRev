import { createPortal } from "react-dom"
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import { useAnchoredPopoverPosition } from "../hooks/useAnchoredPopoverPosition"
export { COMPUTER_NAV_ITEM_ID } from "../lib/workspaceSessions"

import {
  CHAT_PEOPLE_ITEMS,
  projectPageDestinations,
  projectChatDestination,
  teamChatDestination,
  teamPageDestinations,
} from "../lib/navDestinations"
import { projectGroupLabel, projectPathId } from "../lib/projectsApi"
import {
  teamChatNavLabel,
  teamGroupLabel,
  projectChatNavLabel,
} from "../lib/workspaceLabels"
import { COMPUTER_NAV_ITEM_ID } from "../lib/workspaceSessions"
import { ChatAvatar } from "./ChatAvatar"
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

const SECONDARY_ITEMS = [
  { id: "inbox", label: "Inbox", iconName: "inbox" },
  { id: "discover", label: "Discover", iconName: "discover" },
  { id: "agent-studio", label: "Agent studio", iconName: "agent" },
  { id: "me", label: "Me", leading: <MeAvatar /> },
]

export function NavPanel({
  className = "",
  selectedItemId,
  defaultSelectedItemId = "team:chat",
  onSelectItem,
  activeTeam,
  activeProject,
  projectId,
  teamId,
  scope = "team",
}) {
  const [uncontrolledSelectedItemId, setUncontrolledSelectedItemId] = useState(defaultSelectedItemId)
  const isControlledSelection = selectedItemId !== undefined
  const currentSelectedItemId = isControlledSelection ? selectedItemId : uncontrolledSelectedItemId

  const meMenuId = useId()
  const meTriggerRef = useRef(null)
  const meMenuRef = useRef(null)
  const [meMenuOpen, setMeMenuOpen] = useState(false)
  const mePopoverPos = useAnchoredPopoverPosition(meTriggerRef, meMenuOpen, 2)
  const [meMenuStyle, setMeMenuStyle] = useState({ top: 0, left: 0 })

  const resolvedProjectId = projectId ?? (activeProject ? projectPathId(activeProject) : null)
  const teamPages = teamPageDestinations(teamId)
  const teamChat = teamChatDestination(teamId)
  const projectChat = projectChatDestination(resolvedProjectId)
  const projectPages = projectPageDestinations(resolvedProjectId)
  const teamLabel = activeTeam ? teamGroupLabel(activeTeam) : teamGroupLabel({ id: teamId })
  const projectGroupTitle = activeProject ? projectGroupLabel(activeProject) : "Project"
  const showProjectSection = scope === "project" || Boolean(resolvedProjectId)

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

  return (
    <aside
      className={`flex h-full min-h-0 w-[220px] shrink-0 flex-col items-start overflow-hidden border-r border-[#ececec] bg-white px-[12px] py-[14px] ${className}`}
    >
      <div className="flex w-full items-center">
        <button
          type="button"
          onClick={() => handleSelectItem(COMPUTER_NAV_ITEM_ID)}
          className="flex h-[29px] w-full items-center justify-center rounded-[999px] bg-[var(--background-primary-subtle)] pb-[3px] pt-[5px] transition-colors duration-150 hover:bg-[var(--control-bg-hover)]"
        >
          <img src="/icons/computer-wordmark.svg" alt="computer" className="h-[14px] w-[80px]" draggable={false} />
        </button>
      </div>

      <div className="h-[20px] w-[192px] shrink-0 bg-white" />

      <div className="flex w-[194px] flex-col gap-[10px]">
        <NavGroup label={teamLabel} variant="section">
          <NavItem
            label={teamChatNavLabel()}
            leading={<ChatAvatar memberCount={teamChat.memberCount} />}
            selected={currentSelectedItemId === "team:chat" || currentSelectedItemId === "build-team"}
            className="w-full"
            onClick={() => handleSelectItem("team:chat")}
          />
          {teamPages.map((item) => (
            <NavItem
              key={item.id}
              label={item.label}
              iconName={item.iconName}
              selected={currentSelectedItemId === item.id}
              className="w-full"
              onClick={() => handleSelectItem(item.id)}
            />
          ))}
        </NavGroup>

        {showProjectSection ? (
          <NavGroup label={projectGroupTitle} variant="section">
            <NavItem
              label={projectChatNavLabel()}
              leading={<ChatAvatar memberCount={projectChat.memberCount} />}
              selected={currentSelectedItemId === "project:chat" || currentSelectedItemId === "chat-project"}
              className="w-full"
              onClick={() => handleSelectItem("project:chat")}
            />
            {projectPages.map((item) => (
              <NavItem
                key={item.id}
                label={item.label}
                iconName={item.iconName}
                selected={currentSelectedItemId === item.id}
                className="w-full"
                onClick={() => handleSelectItem(item.id)}
              />
            ))}
          </NavGroup>
        ) : null}

        <NavGroup label="Chat" variant="section">
          {CHAT_PEOPLE_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              label={item.label}
              leading={<ChatAvatar initial={item.initial} />}
              selected={currentSelectedItemId === item.id}
              className="w-full"
              onClick={() => handleSelectItem(item.id)}
            />
          ))}
        </NavGroup>
      </div>

      <div className="min-h-0 w-[192px] flex-1 bg-white" />

      <div className="flex w-full flex-col gap-[4px]">
        {SECONDARY_ITEMS.slice(0, 3).map((item) => (
          <NavItem
            key={item.id}
            label={item.label}
            iconName={item.iconName}
            selected={currentSelectedItemId === item.id}
            className="w-full"
            onClick={() => handleSelectItem(item.id)}
          />
        ))}
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
      </div>

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
