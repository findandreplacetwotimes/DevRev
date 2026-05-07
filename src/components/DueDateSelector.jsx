import { createPortal } from "react-dom"
import { useEffect, useMemo, useRef, useState } from "react"
import { useAnchoredPopoverPosition } from "../hooks/useAnchoredPopoverPosition"
import { ENABLE_DUE_DATE_COMBO_INPUT } from "../lib/slashCommandConfig"
import { Icon } from "./Icon"
import { MenuItem } from "./MenuItem"
import { dueDateIdFromDate, getDueDateById, getDueDateOptions, parseDateInput } from "../lib/dueDates"

const labelStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
}

const modalShadow =
  "0px 6px 13px rgba(0,0,0,0.10), 0px 23px 23px rgba(0,0,0,0.09), 0px 52px 31px rgba(0,0,0,0.05), 0px 92px 37px rgba(0,0,0,0.01), 0px 144px 40px rgba(0,0,0,0)"

/** Backlog table: empty rows show grey “Due date” with no calendar (Figma `5926:40295`). */
export function DueDateSelector({ value, onChange, appearance = "default", tableEmptyGreyLabels = false }) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const inputRef = useRef(null)
  const menuRef = useRef(null)
  const previousValueRef = useRef(value ?? null)
  const popoverPos = useAnchoredPopoverPosition(triggerRef, open, 2)
  const options = useMemo(() => getDueDateOptions(), [])
  const selected = useMemo(() => getDueDateById(value), [value])

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

  const isTableGreyEmpty = tableEmptyGreyLabels && appearance === "inline" && !selected
  const triggerClass =
    appearance === "inline"
      ? `inline-flex min-h-[28px] w-full min-w-0 max-w-none flex-nowrap items-center rounded-[2px] bg-transparent text-left ${isTableGreyEmpty ? "gap-0 px-[10px]" : "gap-0 p-0"}`
      : "inline-flex h-[28px] items-center rounded-[2px] bg-[var(--background-primary-subtle)] pr-[10px] transition-colors duration-150 hover:bg-[var(--control-bg-hover)]"
  const triggerLabelPadding = appearance === "inline" ? "" : "py-[6px]"

  const rootWrapClass =
    appearance === "inline"
      ? "relative flex w-full min-w-0 items-center"
      : "relative inline-flex w-max max-w-full min-w-0 items-center"

  const isInline = appearance === "inline"
  const labelClusterClass = isInline
    ? "flex min-h-[16px] min-w-0 flex-1 items-center gap-0 overflow-hidden text-left leading-[16px]"
    : "flex min-h-[16px] max-w-[min(100%,280px)] min-w-0 items-center gap-[4px] overflow-hidden text-left leading-[16px]"
  const valueSpanClassInline = "min-w-0 flex-1 truncate text-left text-[var(--foreground-primary)]"
  const valueSpanClassDefault = "min-w-0 truncate text-left text-[var(--foreground-primary)]"

  const safeChange = typeof onChange === "function" ? onChange : () => {}
  const comboMode = ENABLE_DUE_DATE_COMBO_INPUT && appearance !== "inline"

  useEffect(() => {
    if (!comboMode || !open) return
    previousValueRef.current = value ?? null
    setInputValue(selected?.controlLabel ?? "")
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }, [comboMode, open, selected?.controlLabel, value])

  const commitComboInput = () => {
    const prev = previousValueRef.current
    const parsed = parseDateInput(inputValue)
    if (!parsed) {
      if (value !== prev) safeChange(prev)
      setOpen(false)
      return
    }
    const next = dueDateIdFromDate(parsed)
    if (next !== value) safeChange(next)
    setOpen(false)
  }

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
      <MenuItem type="label" label="Due date" fullWidth />
      {selected && (
        <button
          type="button"
          className="w-full text-left"
          onClick={() => {
            safeChange(null)
            setOpen(false)
          }}
        >
          <MenuItem type="textOnly" label="Remove due date" fullWidth />
        </button>
      )}
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className="w-full text-left"
          onClick={() => {
            safeChange(option.id)
            setOpen(false)
          }}
        >
          <MenuItem type="textOnly" state={value === option.id ? "selected" : "rest"} label={option.menuLabel} fullWidth />
        </button>
      ))}
    </div>
  )

  return (
    <div className={rootWrapClass} ref={rootRef}>
      {comboMode && open ? (
        <div ref={triggerRef} className="inline-flex h-[28px] w-[120px] items-center rounded-[2px] bg-[var(--background-primary-subtle)] pr-[10px]">
          <span className="inline-flex size-[28px] shrink-0 items-center justify-center">
            <Icon name="calendar" />
          </span>
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                commitComboInput()
              }
              if (event.key === "Escape") {
                event.preventDefault()
                setOpen(false)
              }
            }}
            onBlur={() => {
              window.requestAnimationFrame(() => {
                const active = document.activeElement
                if (active && (rootRef.current?.contains(active) || menuRef.current?.contains(active))) return
                commitComboInput()
              })
            }}
            placeholder="Due date"
            className="h-[16px] min-w-0 flex-1 bg-transparent py-[6px] text-[var(--foreground-primary)] outline-none"
            style={labelStyle}
          />
        </div>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={triggerClass}
        >
          {!isTableGreyEmpty ? (
            isInline ? (
              <span className="inline-flex size-[28px] shrink-0 items-center justify-center">
                <img src="/icons/calendar.svg" alt="" className="block size-[16px]" draggable={false} />
              </span>
            ) : (
              <span className="inline-flex size-[28px] shrink-0 items-center justify-center">
                <Icon name="calendar" />
              </span>
            )
          ) : null}
          {selected ? (
            <span className={labelClusterClass}>
              <span
                className={isInline ? valueSpanClassInline : valueSpanClassDefault}
                style={labelStyle}
                title={selected.controlLabel}
              >
                {selected.controlLabel}
              </span>
            </span>
          ) : (
            <span
              className={`flex min-h-[16px] min-w-0 items-center truncate ${isTableGreyEmpty ? "text-[var(--control-content-secondary)]" : "text-[var(--foreground-primary)]"} ${isInline ? "flex-1" : ""} ${triggerLabelPadding}`}
              style={labelStyle}
            >
              {"Due date"}
            </span>
          )}
        </button>
      )}

      {open && typeof document !== "undefined" ? createPortal(menuMarkup, document.body) : null}
    </div>
  )
}
