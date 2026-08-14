import { createPortal } from "react-dom"
import { useEffect, useLayoutEffect, useState } from "react"
import {
  CHAT_PEOPLE_ITEMS,
  projectPageDestinations,
  projectChatDestination,
  teamChatDestination,
  teamPageDestinations,
} from "../lib/navDestinations"
import { projectGroupLabel } from "../lib/projectsApi"
import { teamChatNavLabel, teamGroupLabel, projectChatNavLabel } from "../lib/workspaceLabels"
import { NavGroup } from "./NavGroup"
import { NavItem } from "./NavItem"
import { ChatAvatar } from "./ChatAvatar"

const modalShadow =
  "0px 6px 13px rgba(0,0,0,0.10), 0px 23px 23px rgba(0,0,0,0.09), 0px 52px 31px rgba(0,0,0,0.05), 0px 92px 37px rgba(0,0,0,0.01), 0px 144px 40px rgba(0,0,0,0)"

const MENU_WIDTH_PX = 202
const EDGE_GUTTER_PX = 8
const COMPUTER_HREF = "/computer"

export function RightPanelNavMenu({
  open,
  anchorRef,
  menuRef,
  onClose,
  onNavigate,
  projectId,
  project,
  activeTeam,
  teamId,
  selectedHref,
  showProjectSection = true,
}) {
  const [style, setStyle] = useState({ top: 0, left: 0 })

  useLayoutEffect(() => {
    if (!open) return undefined

    const positionMenu = () => {
      const triggerRect = anchorRef.current?.getBoundingClientRect()
      if (!triggerRect) return
      const menuHeight = menuRef.current?.offsetHeight ?? 420
      const viewportW = window.innerWidth
      const viewportH = window.innerHeight

      let top = Math.round(triggerRect.bottom + 4)
      if (top + menuHeight + EDGE_GUTTER_PX > viewportH) {
        top = Math.round(triggerRect.top - menuHeight - 4)
      }
      top = Math.max(EDGE_GUTTER_PX, Math.min(top, viewportH - menuHeight - EDGE_GUTTER_PX))

      let left = Math.round(triggerRect.left)
      left = Math.max(EDGE_GUTTER_PX, Math.min(left, viewportW - MENU_WIDTH_PX - EDGE_GUTTER_PX))

      setStyle({ top, left })
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
  }, [anchorRef, menuRef, open])

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onClose, open])

  if (!open || typeof document === "undefined") return null

  const teamPages = teamPageDestinations(teamId)
  const teamChat = teamChatDestination(teamId)
  const projectPages = projectPageDestinations(projectId)
  const projectChat = projectChatDestination(projectId)
  const teamLabel = activeTeam ? teamGroupLabel(activeTeam) : teamGroupLabel({ id: teamId })
  const projectGroupTitle = project ? projectGroupLabel(project) : "Project"

  const handleSelect = (href) => {
    onNavigate?.(href)
    onClose?.()
  }

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      aria-label="Workspace navigation"
      className="fixed z-[2147483646] inline-flex w-[202px] flex-col items-start rounded-[2px] bg-white p-[6px]"
      style={{ boxShadow: modalShadow, top: `${style.top}px`, left: `${style.left}px` }}
    >
      <button
        type="button"
        className="flex h-[29px] w-full items-center justify-center rounded-[999px] bg-[var(--background-primary-subtle)] pb-[3px] pt-[5px] transition-colors duration-150 hover:bg-[var(--control-bg-hover)]"
        onClick={() => handleSelect(COMPUTER_HREF)}
      >
        <img src="/icons/computer-wordmark.svg" alt="computer" className="h-[14px] w-[80px]" draggable={false} />
      </button>

      <div className="h-[20px] w-full shrink-0 bg-white" />

      <NavGroup label={teamLabel} variant="section" defaultExpanded>
        <NavItem
          label={teamChatNavLabel()}
          leading={<ChatAvatar memberCount={teamChat.memberCount} />}
          selected={selectedHref === teamChat.href}
          className="w-full"
          onClick={() => handleSelect(teamChat.href)}
        />
        {teamPages.map((item) => (
          <NavItem
            key={item.id}
            label={item.label}
            iconName={item.iconName}
            selected={selectedHref === item.href}
            className="w-full"
            onClick={() => handleSelect(item.href)}
          />
        ))}
      </NavGroup>

      {showProjectSection ? (
        <>
          <div className="h-[20px] w-full shrink-0 bg-white" />
          <NavGroup label={projectGroupTitle} variant="section" defaultExpanded>
            <NavItem
              label={projectChatNavLabel()}
              leading={<ChatAvatar memberCount={projectChat.memberCount} />}
              selected={selectedHref === projectChat.href}
              className="w-full"
              onClick={() => handleSelect(projectChat.href)}
            />
            {projectPages.map((item) => (
              <NavItem
                key={item.id}
                label={item.label}
                iconName={item.iconName}
                selected={selectedHref === item.href}
                className="w-full"
                onClick={() => handleSelect(item.href)}
              />
            ))}
          </NavGroup>
        </>
      ) : null}

      <div className="h-[20px] w-full shrink-0 bg-white" />

      <NavGroup label="Chat" variant="section" defaultExpanded>
        {CHAT_PEOPLE_ITEMS.map((person) => {
          const href = `/${String(person.label).trim().toLowerCase()}`
          return (
            <NavItem
              key={person.id}
              label={person.label}
              leading={<ChatAvatar initial={person.initial} />}
              selected={selectedHref === href}
              className="w-full"
              onClick={() => handleSelect(href)}
            />
          )
        })}
      </NavGroup>

      <div className="h-[10px] w-full shrink-0 bg-white" />
    </div>,
    document.body
  )
}
