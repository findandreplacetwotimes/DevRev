import { createPortal } from "react-dom"
import { useEffect, useMemo, useRef, useState } from "react"
import { useAnchoredPopoverPosition } from "../hooks/useAnchoredPopoverPosition"
import { MenuItem } from "./MenuItem"
import { PROJECT_HEALTH_OPTIONS, sanitizeProjectHealthId } from "../lib/projectHealth"

const labelStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
}

const modalShadow =
  "0px 6px 13px rgba(0,0,0,0.10), 0px 23px 23px rgba(0,0,0,0.09), 0px 52px 31px rgba(0,0,0,0.05), 0px 92px 37px rgba(0,0,0,0.01), 0px 144px 40px rgba(0,0,0,0.01)"

/** Text-only control matching document header chips; project detail page only (`DueDateSelector` has no glyph here). */
export function ProjectHealthSelector({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const popoverPos = useAnchoredPopoverPosition(triggerRef, open, 2)
  const safeValue = sanitizeProjectHealthId(value)
  const selected = useMemo(
    () => PROJECT_HEALTH_OPTIONS.find((item) => item.id === safeValue) ?? PROJECT_HEALTH_OPTIONS[2],
    [safeValue]
  )

  useEffect(() => {
    if (!open) return undefined
    const onDocumentPointerDown = (event) => {
      const t = event.target
      if (rootRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener("pointerdown", onDocumentPointerDown)
    return () => document.removeEventListener("pointerdown", onDocumentPointerDown)
  }, [open])

  const safeChange = typeof onChange === "function" ? onChange : () => {}

  const menuMarkup = (
    <div
      ref={menuRef}
      className="fixed z-[200] inline-flex w-[232px] flex-col items-start gap-[4px] rounded-[2px] bg-white p-[6px]"
      style={{
        boxShadow: modalShadow,
        top: `${popoverPos.top}px`,
        left: `${popoverPos.left}px`,
      }}
    >
      <MenuItem type="label" label="Health" fullWidth />
      {PROJECT_HEALTH_OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          className="w-full text-left"
          onClick={() => {
            safeChange(option.id)
            setOpen(false)
          }}
        >
          <MenuItem type="textOnly" state={safeValue === option.id ? "selected" : "rest"} label={option.label} fullWidth />
        </button>
      ))}
    </div>
  )

  return (
    <div className="relative inline-flex w-max max-w-full min-w-0 items-center" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Health · ${selected.label}`}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-[28px] items-center rounded-[2px] bg-[var(--background-primary-subtle)] px-[10px] transition-colors duration-150 hover:bg-[var(--control-bg-hover)]"
      >
        <span className="flex min-h-[16px] min-w-0 max-w-[min(100%,280px)] items-center overflow-hidden text-left leading-[16px]">
          <span className="min-w-0 truncate text-[var(--foreground-primary)]" style={labelStyle} title={selected.label}>
            {selected.label}
          </span>
        </span>
      </button>

      {open && typeof document !== "undefined" ? createPortal(menuMarkup, document.body) : null}
    </div>
  )
}
