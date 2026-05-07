import { createPortal } from "react-dom"
import { useEffect, useMemo, useRef, useState } from "react"
import { useAnchoredPopoverPosition } from "../hooks/useAnchoredPopoverPosition"
import { FormItem } from "./FormItem"
import { FormList } from "./FormList"
import { Control } from "./Control"
import { MenuItem } from "./MenuItem"
import { TextInput } from "./TextInput"

const modalShadow =
  "0px 6px 13px rgba(0,0,0,0.10), 0px 23px 23px rgba(0,0,0,0.09), 0px 52px 31px rgba(0,0,0,0.05), 0px 92px 37px rgba(0,0,0,0.01), 0px 144px 40px rgba(0,0,0,0)"

const PRIORITY_OPTIONS = ["None", "P0", "P1", "P2"]
const SPRINT_OPTIONS = ["Backlog", "Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4", "Sprint 5"]

function formatCreatedDate(value) {
  if (typeof value !== "string") return "—"
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!m) return value
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(d)
}

function InlineChoiceField({ value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const popoverPos = useAnchoredPopoverPosition(triggerRef, open, 2)

  useEffect(() => {
    if (!open) return
    const onDocDown = (event) => {
      const t = event.target
      if (rootRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
      setQuery("")
    }
    document.addEventListener("pointerdown", onDocDown)
    return () => document.removeEventListener("pointerdown", onDocDown)
  }, [open])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.toLowerCase().includes(q))
  }, [options, query])

  const menu = (
    <div
      ref={menuRef}
      data-issue-attributes-overlay="true"
      className="fixed z-[210] inline-flex w-[202px] flex-col items-start gap-[4px] rounded-[2px] bg-white p-[6px]"
      style={{ boxShadow: modalShadow, top: `${popoverPos.top}px`, left: `${popoverPos.left}px` }}
    >
      <TextInput type="inline" fullWidth value={query} onChange={setQuery} placeholder="Search" />
      <div className="h-px w-[190px] bg-[#f4f3f3]" />
      {filtered.map((option) => (
        <button
          key={option}
          type="button"
          className="w-full text-left"
          onClick={() => {
            onChange(option)
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
        <Control
          type="trailing"
          state="inline"
          label={value || "None"}
          trailingIcon="chevronDown"
          onClick={() => setOpen((v) => !v)}
        />
      </div>
      {open && typeof document !== "undefined" ? createPortal(menu, document.body) : null}
    </div>
  )
}

export function IssueAttributesModal({ open, issue, anchorRef, onPatchIssue, onClose }) {
  const panelRef = useRef(null)
  const popoverPos = useAnchoredPopoverPosition(anchorRef, open, 8)

  useEffect(() => {
    if (!open) return
    const onDocDown = (event) => {
      const t = event.target
      if (t instanceof Element && t.closest('[data-issue-attributes-overlay="true"]')) return
      if (panelRef.current?.contains(t) || anchorRef?.current?.contains(t)) return
      onClose?.()
    }
    const onEsc = (event) => {
      if (event.key === "Escape") onClose?.()
    }
    document.addEventListener("pointerdown", onDocDown)
    document.addEventListener("keydown", onEsc)
    return () => {
      document.removeEventListener("pointerdown", onDocDown)
      document.removeEventListener("keydown", onEsc)
    }
  }, [open, onClose, anchorRef])

  if (!open || !issue) return null

  return createPortal(
    <div
      ref={panelRef}
      data-issue-attributes-overlay="true"
      className="fixed z-[205] rounded-[2px] bg-white p-[20px]"
      style={{ boxShadow: modalShadow, top: `${popoverPos.top}px`, left: `${popoverPos.left}px` }}
    >
      <FormList>
        <FormItem label="Priority">
          <InlineChoiceField
            value={issue.priority ?? "None"}
            options={PRIORITY_OPTIONS}
            onChange={(priority) => onPatchIssue(issue.id, { priority })}
          />
        </FormItem>
        <FormItem label="Sprint">
          <InlineChoiceField
            value={issue.sprint ?? "Sprint 1"}
            options={SPRINT_OPTIONS}
            onChange={(sprint) => onPatchIssue(issue.id, { sprint })}
          />
        </FormItem>
        <FormItem label="Created date">
          <Control type="textOnly" state="inline" label={formatCreatedDate(issue.createdDate)} />
        </FormItem>
      </FormList>
    </div>,
    document.body
  )
}
