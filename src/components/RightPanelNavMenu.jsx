import { createPortal } from "react-dom"
import { useEffect, useLayoutEffect, useState } from "react"
import { NavGroup } from "./NavGroup"
import { NavItem } from "./NavItem"

const modalShadow =
  "0px 6px 13px rgba(0,0,0,0.10), 0px 23px 23px rgba(0,0,0,0.09), 0px 52px 31px rgba(0,0,0,0.05), 0px 92px 37px rgba(0,0,0,0.01), 0px 144px 40px rgba(0,0,0,0)"

const MENU_WIDTH_PX = 202
const EDGE_GUTTER_PX = 8
const DEFAULT_PROJECT_ID = "Project-0001"

const BUILD_TEAM_DESTINATIONS = [
  { id: "issues", label: "Issues", iconName: "page", href: "/issues" },
  { id: "sprints", label: "Sprints", iconName: "page", href: "/sprints" },
  { id: "projects", label: "Projects", iconName: "page", href: "/projects" },
  { id: "about", label: "About", iconName: "page", href: "/about" },
]

function projectDestinations(projectId) {
  const encoded = encodeURIComponent(projectId || DEFAULT_PROJECT_ID)
  return [
    { id: "project-overview", label: "Overview", iconName: "page", href: `/projects/${encoded}` },
    { id: "project-scope", label: "Scope", iconName: "page", href: `/projects/${encoded}?tab=Scope` },
  ]
}

export function RightPanelNavMenu({
  open,
  anchorRef,
  menuRef,
  onClose,
  onNavigate,
  onClosePanel,
  projectId,
  selectedHref,
}) {
  const [style, setStyle] = useState({ top: 0, left: 0 })

  useLayoutEffect(() => {
    if (!open) return undefined

    const positionMenu = () => {
      const triggerRect = anchorRef.current?.getBoundingClientRect()
      if (!triggerRect) return
      const menuHeight = menuRef.current?.offsetHeight ?? 280
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

  const projectItems = projectDestinations(projectId)
  const handleSelect = (href) => {
    onNavigate?.(href)
    onClose?.()
  }
  const handleClosePanel = () => {
    onClosePanel?.()
    onClose?.()
  }

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      aria-label="Right panel navigation"
      className="fixed z-[2147483646] inline-flex w-[202px] flex-col items-start gap-[10px] rounded-[2px] bg-white p-[6px]"
      style={{ boxShadow: modalShadow, top: `${style.top}px`, left: `${style.left}px` }}
    >
      <NavGroup label="Build team" iconName="team">
        {BUILD_TEAM_DESTINATIONS.map((item) => (
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

      <NavGroup label="Project" iconName="project">
        {projectItems.map((item) => (
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

      {typeof onClosePanel === "function" ? (
        <NavItem label="Close" iconName="close" className="w-full" onClick={handleClosePanel} />
      ) : null}
    </div>,
    document.body
  )
}
