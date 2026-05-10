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

function Avatar({ name, variant = "regular", isAgent = false, agentId = null }) {
  const initial = (name?.trim?.()?.[0] ?? "M").toUpperCase()
  const isWhite = variant === "white"
  /** White: border + white fill (emphasis / legacy). Regular: same as `MenuItem` AvatarIcon — subtle fill at rest, white on control hover. */
  const circleClass = isWhite
    ? "border border-white bg-white"
    : "bg-[var(--background-primary-subtle)] group-hover:border group-hover:border-white group-hover:bg-white group-hover/row:border group-hover/row:border-white group-hover/row:bg-white"

  // Agent avatars use icons instead of initials
  if (isAgent) {
    const iconSrc = agentId === "computer" ? "/icons/computer-chat.svg" : "/icons/agent.svg"
    const bgClass = isWhite ? "bg-[#6366F1]" : "bg-[#6366F1]" // Jabuticaba purple for agents
    return (
      <span className="relative inline-flex size-[28px] shrink-0 items-center justify-center overflow-hidden">
        <span className={`absolute left-[5px] top-[5px] size-[18px] rounded-[999px] ${bgClass} flex items-center justify-center`}>
          <img src={iconSrc} alt="" className="w-[10px] h-[10px]" style={{ filter: "brightness(0) invert(1)" }} />
        </span>
      </span>
    )
  }

  return (
    <span className="relative inline-flex size-[28px] shrink-0 items-center justify-center overflow-hidden">
      <span className={`absolute left-[5px] top-[5px] size-[18px] rounded-[999px] ${circleClass}`} />
      <span
        className="relative z-[1] inline-flex h-[11px] w-[18px] items-center justify-center text-center text-[9.9px] text-[#737072]"
        style={{ fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif', fontVariationSettings: '"wght" 520' }}
      >
        {initial}
      </span>
    </span>
  )
}

function ownerInitial(name) {
  return (name?.trim()?.[0] ?? "M").toUpperCase()
}

export function OwnerSelector({
  owners = [],
  selectedOwnerId,
  onChange,
  appearance = "default",
  /** Table: when the backlog row checkbox is selected, force white avatar chip (matches row chrome). */
  rowSelected = false,
  /** Backlog table: empty rows show grey “Owner” with no person glyph (Figma `5926:40295`). */
  tableEmptyGreyLabels = false,
}) {
  const safeOnChange = typeof onChange === "function" ? onChange : () => {}
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const popoverPos = useAnchoredPopoverPosition(triggerRef, open, 2)

  const selectedOwner = useMemo(
    () => owners.find((owner) => owner.id === selectedOwnerId) ?? null,
    [owners, selectedOwnerId]
  )
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return owners
    return owners.filter((owner) => owner.name.toLowerCase().includes(q))
  }, [owners, query])

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

  const isTableGreyEmpty = tableEmptyGreyLabels && appearance === "inline" && !selectedOwner
  const triggerClass =
    appearance === "inline"
      ? `group inline-flex min-h-[28px] w-full max-w-none flex-wrap items-center rounded-[2px] bg-transparent text-left ${isTableGreyEmpty ? "gap-0 px-[10px]" : "gap-0 p-0"}`
      : "group inline-flex h-[28px] items-center rounded-[2px] bg-[var(--background-primary-subtle)] pr-[10px] transition-colors duration-150 hover:bg-[var(--control-bg-hover)]"
  const triggerLabelPadding = appearance === "inline" ? "" : "py-[6px]"

  const menuMarkup = (
    <div
      ref={menuRef}
      className="fixed z-[200] inline-flex w-[202px] flex-col items-start gap-[4px] rounded-[2px] bg-white p-[6px]"
      style={{
        boxShadow: modalShadow,
        top: `${popoverPos.top}px`,
        left: `${popoverPos.left}px`,
      }}
    >
      <TextInput type="inline" fullWidth value={query} onChange={setQuery} placeholder="Search" />
      <div className="h-px w-[190px] bg-[#f4f3f3]" />
      <MenuItem type="label" label="Owner" fullWidth />
      {selectedOwner && (
        <button
          type="button"
          className="w-full text-left"
          onClick={() => {
            safeOnChange(null)
            setOpen(false)
            setQuery("")
          }}
        >
          <MenuItem type="textOnly" label="Remove owner" fullWidth />
        </button>
      )}
      {filtered.map((owner) => {
        const selected = owner.id === selectedOwnerId
        return (
          <button
            key={owner.id}
            type="button"
            onClick={() => {
              safeOnChange(owner.id)
              setOpen(false)
              setQuery("")
            }}
            className="w-full text-left"
          >
            <MenuItem
              type="leading"
              state={selected ? "selected" : "rest"}
              label={owner.name}
              avatarInitial={ownerInitial(owner.name)}
              isAgent={owner.isAgent ?? false}
              agentId={owner.id}
              fullWidth
            />
          </button>
        )
      })}
    </div>
  )

  const rootWrapClass =
    appearance === "inline" ? "relative w-full min-w-0" : "relative inline-flex w-max max-w-full min-w-0"

  return (
    <div className={rootWrapClass} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={triggerClass}
      >
        {selectedOwner ? (
          <Avatar
            name={selectedOwner.name}
            variant={rowSelected ? "white" : "regular"}
            isAgent={selectedOwner.isAgent ?? false}
            agentId={selectedOwner.id}
          />
        ) : isTableGreyEmpty ? null : appearance === "inline" ? (
          <span className="inline-flex size-[28px] shrink-0 items-center justify-center">
            <img src="/icons/person.svg" alt="" className="block size-[16px]" draggable={false} />
          </span>
        ) : (
          <Icon name="person" />
        )}
        <span
          className={`min-w-0 ${isTableGreyEmpty ? "text-[var(--control-content-secondary)]" : "text-[var(--foreground-primary)]"} ${appearance === "inline" ? "flex-1 whitespace-normal break-words" : "shrink-0 whitespace-nowrap"} ${triggerLabelPadding}`}
          style={labelStyle}
        >
          {selectedOwner ? selectedOwner.name : "Owner"}
        </span>
      </button>

      {open && typeof document !== "undefined" ? createPortal(menuMarkup, document.body) : null}
    </div>
  )
}
