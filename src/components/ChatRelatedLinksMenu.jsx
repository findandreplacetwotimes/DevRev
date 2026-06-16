import { createPortal } from "react-dom"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { Icon } from "./Icon"
import { MenuItemLabel } from "./MenuItem"
import { NavItem } from "./NavItem"

const modalShadow =
  "0px 6px 13px rgba(0,0,0,0.10), 0px 23px 23px rgba(0,0,0,0.09), 0px 52px 31px rgba(0,0,0,0.05), 0px 92px 37px rgba(0,0,0,0.01), 0px 144px 40px rgba(0,0,0,0)"

const MENU_WIDTH_PX = 202
const EDGE_GUTTER_PX = 8

const labelStyle = {
  fontFamily: '"Chip Mono", "Chip Text Variable", monospace',
  fontSize: "10px",
  lineHeight: "10px",
  letterSpacing: "0px",
}

const keyStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
}

const titleStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "20px",
  letterSpacing: "0px",
  fontVariationSettings: '"wght" 460',
  fontFeatureSettings: '"lnum", "tnum"',
}

function linkKey(link) {
  return link.href ? `${link.title}-${link.href}` : link.title
}

function ChatRelatedLinkStaticRow({ link, className = "" }) {
  return (
    <div
      role="menuitem"
      aria-disabled="true"
      className={`inline-flex h-[28px] w-full min-w-0 items-center rounded-[2px] bg-white pr-[6px] ${className}`}
    >
      <Icon name="page" />
      {link.key ? (
        <span
          className="flex min-w-0 flex-1 items-center justify-start gap-[4px] overflow-hidden py-[6px] text-left"
          style={titleStyle}
        >
          <span className="shrink-0 whitespace-nowrap text-[#939393]" style={keyStyle}>
            {link.key}
          </span>
          <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[rgba(48,46,47,0.94)]">
            {link.title}
          </span>
        </span>
      ) : (
        <MenuItemLabel label={link.title} align="start" />
      )}
    </div>
  )
}

function ChatRelatedLinksList({ links = [], onSelect, canvasLabel = "CANVAS", itemPadding = "px-[10px]" }) {
  return (
    <>
      <div className={`inline-flex w-full items-center rounded-[2px] bg-white ${itemPadding}`}>
        <div className="inline-flex items-center py-[10.5px]">
          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[#939393]" style={labelStyle}>
            {canvasLabel}
          </span>
        </div>
      </div>
      {links.map((link) =>
        link.href ? (
          <button
            key={linkKey(link)}
            type="button"
            role="menuitem"
            className={`flex h-[28px] w-full min-w-0 items-center rounded-[2px] bg-white pr-[6px] text-left transition-colors duration-150 hover:bg-[var(--background-primary-subtle)] ${itemPadding}`}
            onClick={() => onSelect?.(link)}
          >
            <span className="flex min-w-0 flex-1 items-center gap-[4px]">
              {link.key ? (
                <span className="shrink-0 whitespace-nowrap text-[#939393]" style={keyStyle}>
                  {link.key}
                </span>
              ) : null}
              <span
                className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[rgba(48,46,47,0.94)]"
                style={titleStyle}
              >
                {link.title}
              </span>
            </span>
          </button>
        ) : (
          <ChatRelatedLinkStaticRow key={linkKey(link)} link={link} className={itemPadding} />
        )
      )}
    </>
  )
}

export function ChatRelatedLinksMenu({
  open,
  anchorRef,
  menuRef,
  links = [],
  canvasLabel = "CANVAS",
  onClose,
  onSelect,
}) {
  const [style, setStyle] = useState({ top: 0, left: 0 })

  useLayoutEffect(() => {
    if (!open) return undefined

    const positionMenu = () => {
      const triggerRect = anchorRef.current?.getBoundingClientRect()
      if (!triggerRect) return
      const menuHeight = menuRef.current?.offsetHeight ?? 144
      const viewportW = window.innerWidth
      const viewportH = window.innerHeight

      let top = Math.round(triggerRect.bottom + 4)
      if (top + menuHeight + EDGE_GUTTER_PX > viewportH) {
        top = Math.round(triggerRect.top - menuHeight - 4)
      }
      top = Math.max(EDGE_GUTTER_PX, Math.min(top, viewportH - menuHeight - EDGE_GUTTER_PX))

      let left = Math.round(triggerRect.right - MENU_WIDTH_PX)
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

  const handleSelect = (link) => {
    onSelect?.(link)
    onClose?.()
  }

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      aria-label={canvasLabel}
      className="fixed z-[2147483646] inline-flex w-[202px] flex-col items-start gap-[4px] rounded-[2px] bg-white p-[6px]"
      style={{ boxShadow: modalShadow, top: `${style.top}px`, left: `${style.left}px` }}
    >
      <ChatRelatedLinksList links={links} onSelect={handleSelect} canvasLabel={canvasLabel} />
    </div>,
    document.body
  )
}

export function ChatRelatedLinksPanel({
  links = [],
  canvasLabel = "CANVAS",
  onSelect,
}) {
  return (
    <aside
      className="flex h-full w-[274px] shrink-0 flex-col items-start border-l border-[#ececec] bg-white px-[12px] pb-[14px]"
      aria-label={canvasLabel}
    >
      <div className="h-[14px] w-full shrink-0 bg-white" />
      <div className="flex w-full min-w-0 flex-col items-stretch gap-[4px]" role="menu">
        <div className="inline-flex w-full items-center rounded-[2px] bg-white px-[6px]">
          <div className="inline-flex items-center py-[10.5px]">
            <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[#939393]" style={labelStyle}>
              {canvasLabel}
            </span>
          </div>
        </div>
        {links.map((link) => (
          <NavItem
            key={linkKey(link)}
            label={link.title}
            idLabel={link.key}
            iconName="page"
            className="w-full"
            inactive={!link.href}
            onClick={link.href ? () => onSelect?.(link) : undefined}
          />
        ))}
      </div>
      <div className="h-[20px] w-full shrink-0 bg-white" />
    </aside>
  )
}
