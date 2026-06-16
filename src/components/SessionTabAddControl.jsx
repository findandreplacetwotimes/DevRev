import { createPortal } from "react-dom"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { Icon } from "./Icon"
import { MenuItemLabel } from "./MenuItem"

const modalShadow =
  "0px 6px 13px rgba(0,0,0,0.10), 0px 23px 23px rgba(0,0,0,0.09), 0px 52px 31px rgba(0,0,0,0.05), 0px 92px 37px rgba(0,0,0,0.01), 0px 144px 40px rgba(0,0,0,0)"

const MENU_WIDTH_PX = 202
const EDGE_GUTTER_PX = 8

export function SessionTabAddControl({ onAddSession, onAddSplitSession }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0 })
  const rootRef = useRef(null)
  const chevronRef = useRef(null)
  const menuRef = useRef(null)

  useLayoutEffect(() => {
    if (!menuOpen) return undefined

    const positionMenu = () => {
      const triggerRect = chevronRef.current?.getBoundingClientRect()
      if (!triggerRect) return
      const menuHeight = menuRef.current?.offsetHeight ?? 72
      const viewportW = window.innerWidth
      const viewportH = window.innerHeight

      let top = Math.round(triggerRect.bottom + 4)
      if (top + menuHeight + EDGE_GUTTER_PX > viewportH) {
        top = Math.round(triggerRect.top - menuHeight - 4)
      }
      top = Math.max(EDGE_GUTTER_PX, Math.min(top, viewportH - menuHeight - EDGE_GUTTER_PX))

      let left = Math.round(triggerRect.right - MENU_WIDTH_PX)
      left = Math.max(EDGE_GUTTER_PX, Math.min(left, viewportW - MENU_WIDTH_PX - EDGE_GUTTER_PX))

      setMenuStyle({ top, left })
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
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onPointerDown = (event) => {
      const target = event.target
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setMenuOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [menuOpen])

  const handleNewTab = () => {
    onAddSession?.()
    setMenuOpen(false)
  }

  const handleNewSplitTab = () => {
    onAddSplitSession?.()
    setMenuOpen(false)
  }

  return (
    <div ref={rootRef} className="inline-flex shrink-0 items-center overflow-hidden rounded-[28px] bg-[var(--control-bg-rest-white)]">
      <button
        type="button"
        aria-label="Add session"
        onClick={handleNewTab}
        className="inline-flex size-[28px] items-center justify-center border-0 bg-transparent text-[var(--foreground-primary)] transition-colors duration-150 hover:bg-[var(--control-bg-hover)] appearance-none"
      >
        <Icon name="plus" />
      </button>
      <span className="h-[16px] w-px shrink-0 bg-[#ececec]" aria-hidden />
      <button
        ref={chevronRef}
        type="button"
        aria-label="More new tab options"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((value) => !value)}
        className="inline-flex size-[28px] items-center justify-center border-0 bg-transparent text-[var(--foreground-primary)] transition-colors duration-150 hover:bg-[var(--control-bg-hover)] appearance-none"
      >
        <Icon name="chevronDown" />
      </button>
      {menuOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              aria-label="New tab options"
              className="fixed z-[2147483646] inline-flex w-[202px] flex-col items-start gap-[4px] rounded-[2px] bg-white p-[6px]"
              style={{ boxShadow: modalShadow, top: `${menuStyle.top}px`, left: `${menuStyle.left}px` }}
            >
              <button
                type="button"
                role="menuitem"
                className="flex h-[28px] w-full items-center rounded-[2px] bg-white px-[6px] text-left transition-colors duration-150 hover:bg-[var(--background-primary-subtle)]"
                onClick={handleNewTab}
              >
                <MenuItemLabel label="New tab" align="start" />
              </button>
              <button
                type="button"
                role="menuitem"
                className="flex h-[28px] w-full items-center rounded-[2px] bg-white px-[6px] text-left transition-colors duration-150 hover:bg-[var(--background-primary-subtle)]"
                onClick={handleNewSplitTab}
              >
                <MenuItemLabel label="New split tab" align="start" />
              </button>
            </div>,
            document.body
          )
        : null}
    </div>
  )
}
