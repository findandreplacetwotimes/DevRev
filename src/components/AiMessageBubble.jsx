import { createPortal } from "react-dom"
import { useEffect, useRef, useState } from "react"
import { useAnchoredPopoverPosition } from "../hooks/useAnchoredPopoverPosition"
import { MicroControl } from "./MicroControl"

/** Figma `5879:37970` — Paragraph/Body Small (13/20, –0.13px). */
const TEXT_STYLE = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "20px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 560',
  fontFeatureSettings: "'lnum' 1, 'tnum' 1",
}

/** Figma `6070:8082` — menu row (13px / 16px, Medium). */
const MENU_ROW_STYLE = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 520',
  fontFeatureSettings: "'lnum' 1, 'tnum' 1",
}

const FG_PROMINENT = "rgba(48, 46, 47, 0.94)"
const FG_MENU = "rgba(0, 0, 0, 0.9)"

const MODAL_SHADOW =
  "0px 6px 13px rgba(0,0,0,0.10), 0px 23px 23px rgba(0,0,0,0.09), 0px 52px 31px rgba(0,0,0,0.05), 0px 92px 37px rgba(0,0,0,0.01), 0px 144px 40px rgba(0,0,0,0)"

/** Figma `6070:8077` — More menu on Computer / AI message. */
const MENU_ACTIONS = [
  { id: "reply", label: "Reply" },
  { id: "postInProject", label: "Post it in project" },
  { id: "resend", label: "Resend" },
]

/**
 * Inbound AI / Computer message — Figma `5879:37972` Computer message (tag + body + micro control).
 * More icon opens menu `6070:8077`.
 */
export function AiMessageBubble({
  text = "",
  loading = false,
  /** Called when user chooses a menu row (`reply` | `postInProject` | `resend`). */
  onMenuAction,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const popoverPos = useAnchoredPopoverPosition(triggerRef, menuOpen, 2)

  const stageLabel = loading ? "Thinking" : "Worked 2s"

  useEffect(() => {
    if (loading) setMenuOpen(false)
  }, [loading])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onDocPointerDown = (event) => {
      const t = event.target
      if (rootRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setMenuOpen(false)
    }
    document.addEventListener("pointerdown", onDocPointerDown)
    return () => document.removeEventListener("pointerdown", onDocPointerDown)
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (event) => {
      if (event.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [menuOpen])

  const handleMenuPick = (actionId) => {
    setMenuOpen(false)
    onMenuAction?.(actionId)
  }

  const menuPortal =
    menuOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label="Message actions"
            className="fixed z-[300] inline-flex min-w-[200px] flex-col gap-[4px] rounded-[2px] bg-white p-[6px]"
            style={{
              boxShadow: MODAL_SHADOW,
              top: `${popoverPos.top}px`,
              left: `${popoverPos.left}px`,
            }}
          >
            {MENU_ACTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                className="flex h-[28px] w-full items-center rounded-[2px] border-0 bg-transparent px-[10px] text-left outline-none transition-colors duration-150 hover:bg-[var(--background-primary-subtle)] focus-visible:bg-[var(--background-primary-subtle)]"
                style={{ ...MENU_ROW_STYLE, color: FG_MENU }}
                onClick={() => handleMenuPick(item.id)}
              >
                <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </div>,
          document.body
        )
      : null

  return (
    <section ref={rootRef} className="flex w-full flex-col items-start gap-[8px]">
      <MicroControl type="tag" layout="textOnly" label={stageLabel} />
      <p className="w-full min-w-0 whitespace-pre-wrap break-words" style={{ ...TEXT_STYLE, color: FG_PROMINENT }}>
        {text}
      </p>
      {!loading ? (
        <MicroControl
          ref={triggerRef}
          type="control"
          layout="iconOnly"
          iconName="more"
          ariaLabel="More"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onPress={() => setMenuOpen((o) => !o)}
        />
      ) : null}
      {menuPortal}
    </section>
  )
}
