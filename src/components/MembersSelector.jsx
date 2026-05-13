import { createPortal } from "react-dom"
import { useEffect, useMemo, useRef, useState } from "react"
import { useAnchoredPopoverPosition } from "../hooks/useAnchoredPopoverPosition"
import { Icon } from "./Icon"
import { MenuItem } from "./MenuItem"
import { TextInput } from "./TextInput"

const labelStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
}

const modalShadow =
  "0px 6px 13px rgba(0,0,0,0.10), 0px 23px 23px rgba(0,0,0,0.09), 0px 52px 31px rgba(0,0,0,0.05), 0px 92px 37px rgba(0,0,0,0.01), 0px 144px 40px rgba(0,0,0,0)"

export function MembersSelector({ owners = [], selectedMemberIds = [], onChange }) {
  const safeOnChange = typeof onChange === "function" ? onChange : () => {}
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const popoverPos = useAnchoredPopoverPosition(triggerRef, open, 2)

  const selectedMembers = useMemo(
    () => owners.filter((o) => selectedMemberIds.includes(o.id)),
    [owners, selectedMemberIds]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return owners
    return owners.filter((o) => o.name.toLowerCase().includes(q))
  }, [owners, query])

  useEffect(() => {
    if (!open) return undefined
    const onDocDown = (event) => {
      const t = event.target
      if (rootRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener("pointerdown", onDocDown)
    return () => document.removeEventListener("pointerdown", onDocDown)
  }, [open])

  function toggleMember(memberId) {
    if (selectedMemberIds.includes(memberId)) {
      safeOnChange(selectedMemberIds.filter((id) => id !== memberId))
    } else {
      safeOnChange([...selectedMemberIds, memberId])
    }
  }

  const displayLabel = selectedMembers.length === 0
    ? "Members"
    : selectedMembers.length === 1
      ? selectedMembers[0].name
      : `${selectedMembers.length} members`

  const menuMarkup = (
    <div
      ref={menuRef}
      className="fixed z-[200] inline-flex w-[202px] flex-col items-start gap-[4px] rounded-[2px] bg-white p-[6px]"
      style={{ boxShadow: modalShadow, top: `${popoverPos.top}px`, left: `${popoverPos.left}px` }}
    >
      <TextInput type="inline" fullWidth value={query} onChange={setQuery} placeholder="Search" />
      <div className="h-px w-[190px] bg-[#f4f3f3]" />
      <MenuItem type="label" label="Members" fullWidth />
      {filtered.map((owner) => {
        const selected = selectedMemberIds.includes(owner.id)
        return (
          <button
            key={owner.id}
            type="button"
            onClick={() => toggleMember(owner.id)}
            className="w-full text-left"
          >
            <MenuItem
              type="leading"
              state={selected ? "selected" : "rest"}
              label={owner.name}
              avatarInitial={(owner.name?.trim()?.[0] ?? "M").toUpperCase()}
              fullWidth
            />
          </button>
        )
      })}
    </div>
  )

  return (
    <div className="relative inline-flex w-max max-w-full min-w-0" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group inline-flex h-[28px] items-center rounded-[2px] bg-[var(--background-primary-subtle)] pr-[10px] transition-colors duration-150 hover:bg-[var(--control-bg-hover)]"
      >
        <Icon name="person" />
        <span className="min-w-0 shrink-0 whitespace-nowrap py-[6px] text-[var(--foreground-primary)]" style={labelStyle}>
          {displayLabel}
        </span>
      </button>
      {open && typeof document !== "undefined" ? createPortal(menuMarkup, document.body) : null}
    </div>
  )
}
