import { useLayoutEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { estimateMentionMenuHeight } from "../lib/mentionUtils"
import { Icon } from "./Icon"

const MOUSE_NUDGE_THRESHOLD_PX = 3

const MODAL_SHADOW =
  "0px 6px 13px rgba(0,0,0,0.10), 0px 23px 23px rgba(0,0,0,0.09), 0px 52px 31px rgba(0,0,0,0.05), 0px 92px 37px rgba(0,0,0,0.01), 0px 144px 40px rgba(0,0,0,0)"

const ROW_STYLE = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
}

/** Figma `6077:38175` — @mention picker (Computer + people). */
export function MentionMenu({
  open,
  left,
  top,
  items,
  highlightIndex,
  menuRef,
  onPick,
  onHighlightChange,
}) {
  const optionRefs = useRef([])
  /** Tracked so hover only steals the keyboard-set highlight when the mouse actually MOVES (not when the menu pops up under the cursor or scrollIntoView shifts the menu). */
  const lastMousePosRef = useRef(null)

  useLayoutEffect(() => {
    if (!open || items.length === 0) return
    const el = optionRefs.current[highlightIndex]
    el?.scrollIntoView({ block: "nearest" })
  }, [open, highlightIndex, items.length])

  useLayoutEffect(() => {
    if (!open) lastMousePosRef.current = null
  }, [open])

  if (!open || typeof document === "undefined" || items.length === 0) return null

  const vw = typeof window !== "undefined" ? window.innerWidth : 400
  const vh = typeof window !== "undefined" ? window.innerHeight : 600
  /** Figma `6077:38256` — mention menu width `202px`. */
  const menuWidth = 202
  const estimatedHeight = estimateMentionMenuHeight(items.length)
  let adjLeft = left
  let adjTop = top
  if (adjLeft + menuWidth > vw - 8) adjLeft = Math.max(8, vw - menuWidth - 8)
  if (adjTop < 8) adjTop = 8
  if (adjTop + estimatedHeight > vh - 8) adjTop = Math.max(8, vh - estimatedHeight - 8)

  return createPortal(
    <div
      ref={menuRef}
      role="listbox"
      aria-label="Mention"
      className="fixed z-[300] flex w-[202px] flex-col gap-[4px] rounded-[2px] bg-white p-[6px]"
      style={{
        boxShadow: MODAL_SHADOW,
        top: `${Math.round(adjTop)}px`,
        left: `${Math.round(adjLeft)}px`,
      }}
    >
      {items.map((item, index) => {
        const active = index === highlightIndex
        return (
          <button
            key={item.id}
            ref={(node) => {
              optionRefs.current[index] = node
            }}
            type="button"
            role="option"
            aria-selected={active}
            className={`flex w-full items-center gap-0 rounded-[2px] border-0 bg-transparent py-0 pr-[10px] text-left outline-none transition-colors duration-150 ${
              active ? "bg-[var(--background-primary-subtle)]" : "bg-white"
            }`}
            style={{ ...ROW_STYLE, color: "var(--foreground-primary, #211e20)" }}
            onMouseMove={(event) => {
              const prev = lastMousePosRef.current
              const nextPos = { x: event.clientX, y: event.clientY }
              if (
                prev &&
                Math.abs(prev.x - nextPos.x) < MOUSE_NUDGE_THRESHOLD_PX &&
                Math.abs(prev.y - nextPos.y) < MOUSE_NUDGE_THRESHOLD_PX
              ) {
                return
              }
              lastMousePosRef.current = nextPos
              if (index !== highlightIndex) onHighlightChange(index)
            }}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onPick(item)}
          >
            <span className="inline-flex size-[28px] shrink-0 items-center justify-center">
              {item.kind === "computer" ? (
                <Icon name="computer" />
              ) : (
                <span className="inline-flex size-[18px] items-center justify-center rounded-full bg-[var(--control-bg-rest)]">
                  <span
                    className="text-[9.9px] capitalize text-[var(--control-content-primary)]"
                    style={{
                      fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontVariationSettings: '"wght" 500',
                    }}
                  >
                    {(item.initial ?? item.label[0] ?? "?").toUpperCase()}
                  </span>
                </span>
              )}
            </span>
            <span className="flex min-w-0 flex-1 flex-col justify-center py-[6px]">
              <span className="leading-[16px]">{item.label}</span>
            </span>
          </button>
        )
      })}
    </div>,
    document.body
  )
}
