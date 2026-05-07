import { createPortal } from "react-dom"
import { useEffect, useMemo, useRef, useState } from "react"
import { useAnchoredPopoverPosition } from "../hooks/useAnchoredPopoverPosition"
import { parseDateInput } from "../lib/dueDates"
import {
  formatSprintRange,
  formatSprintStartLabel,
  getSprintStartDateOptions,
  sanitizeSprintStartDate,
  sprintStartDateFromDate,
} from "../lib/sprints"
import { MenuItem } from "./MenuItem"
import { Page } from "./Page"

const labelStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
}

const modalShadow =
  "0px 6px 13px rgba(0,0,0,0.10), 0px 23px 23px rgba(0,0,0,0.09), 0px 52px 31px rgba(0,0,0,0.05), 0px 92px 37px rgba(0,0,0,0.01), 0px 144px 40px rgba(0,0,0,0)"

export function StartDateSelector({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const inputRef = useRef(null)
  const safeValue = sanitizeSprintStartDate(value)
  const previousValueRef = useRef(safeValue)
  const popoverPos = useAnchoredPopoverPosition(triggerRef, open, 2)
  const options = useMemo(() => getSprintStartDateOptions(), [])
  const safeChange = typeof onChange === "function" ? onChange : () => {}

  useEffect(() => {
    if (!open) return
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDocDown = (event) => {
      const t = event.target
      if (rootRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    const onEsc = (event) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("pointerdown", onDocDown)
    document.addEventListener("keydown", onEsc)
    return () => {
      document.removeEventListener("pointerdown", onDocDown)
      document.removeEventListener("keydown", onEsc)
    }
  }, [open])

  const commitInput = () => {
    const parsed = parseDateInput(inputValue)
    if (!parsed) {
      safeChange(previousValueRef.current)
      setOpen(false)
      return
    }
    safeChange(sprintStartDateFromDate(parsed))
    setOpen(false)
  }

  const menu = (
    <div
      ref={menuRef}
      className="fixed z-[210] inline-flex w-[232px] flex-col items-start gap-[4px] rounded-[2px] bg-white p-[6px]"
      style={{ boxShadow: modalShadow, top: `${popoverPos.top}px`, left: `${popoverPos.left}px` }}
    >
      <MenuItem type="label" label="Start date" fullWidth />
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className="w-full text-left"
          onClick={() => {
            safeChange(option.dateIso)
            setOpen(false)
          }}
        >
          <MenuItem type="textOnly" state={option.dateIso === safeValue ? "selected" : "rest"} label={option.label} fullWidth />
        </button>
      ))}
    </div>
  )

  return (
    <div ref={rootRef} className="relative">
      <div ref={triggerRef} className="inline-flex">
        {open ? (
          <div className="inline-flex h-[28px] items-center rounded-[14px] border-[1.5px] border-[var(--border-subtle)] bg-white px-[10px]">
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  commitInput()
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
                  commitInput()
                })
              }}
              placeholder="Start date"
              className="w-[108px] bg-transparent text-[var(--foreground-primary)] outline-none"
              style={labelStyle}
            />
          </div>
        ) : (
          <Page
            label={formatSprintRange(safeValue)}
            variant="datePicker"
            onSelect={() => {
              previousValueRef.current = safeValue
              setInputValue(formatSprintStartLabel(safeValue))
              setOpen(true)
            }}
          />
        )}
      </div>
      {open && typeof document !== "undefined" ? createPortal(menu, document.body) : null}
    </div>
  )
}
