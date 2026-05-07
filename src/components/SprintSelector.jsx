import { createPortal } from "react-dom"
import { useEffect, useMemo, useRef, useState } from "react"
import { useAnchoredPopoverPosition } from "../hooks/useAnchoredPopoverPosition"
import { Page } from "./Page"
import { MenuItem } from "./MenuItem"
import { TextInput } from "./TextInput"

const modalShadow =
  "0px 6px 13px rgba(0,0,0,0.10), 0px 23px 23px rgba(0,0,0,0.09), 0px 52px 31px rgba(0,0,0,0.05), 0px 92px 37px rgba(0,0,0,0.01), 0px 144px 40px rgba(0,0,0,0)"

export function SprintSelector({ value = "Sprint 1", options = [], onChange }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const popoverPos = useAnchoredPopoverPosition(triggerRef, open, 2)
  const safeChange = typeof onChange === "function" ? onChange : () => {}

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((option) => option.toLowerCase().includes(q))
  }, [options, query])

  useEffect(() => {
    if (!open) return
    const onDocDown = (event) => {
      const t = event.target
      if (rootRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
      setQuery("")
    }
    const onEsc = (event) => {
      if (event.key === "Escape") {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("pointerdown", onDocDown)
    document.addEventListener("keydown", onEsc)
    return () => {
      document.removeEventListener("pointerdown", onDocDown)
      document.removeEventListener("keydown", onEsc)
    }
  }, [open])

  const menu = (
    <div
      ref={menuRef}
      className="fixed z-[210] inline-flex w-[202px] flex-col items-start gap-[4px] rounded-[2px] bg-white p-[6px]"
      style={{ boxShadow: modalShadow, top: `${popoverPos.top}px`, left: `${popoverPos.left}px` }}
    >
      <TextInput type="inline" fullWidth value={query} onChange={setQuery} placeholder="Search" />
      <div className="h-px w-[190px] bg-[#f4f3f3]" />
      <MenuItem type="label" label="Sprints" fullWidth />
      {filtered.map((option) => (
        <button
          key={option}
          type="button"
          className="w-full text-left"
          onClick={() => {
            safeChange(option)
            setOpen(false)
            setQuery("")
          }}
        >
          <MenuItem type="textOnly" state={option === value ? "selected" : "rest"} label={option} fullWidth />
        </button>
      ))}
    </div>
  )

  return (
    <div ref={rootRef} className="relative">
      <div ref={triggerRef} className="inline-flex">
        <Page
          label={value}
          variant="selectedWithSelector"
          role="button"
          tabIndex={0}
          onSelect={() => setOpen((prev) => !prev)}
        />
      </div>
      {open && typeof document !== "undefined" ? createPortal(menu, document.body) : null}
    </div>
  )
}
