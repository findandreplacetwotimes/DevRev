import { useCallback, useEffect, useRef, useState } from "react"
import { Icon } from "./Icon"
import { MentionMenu } from "./MentionMenu"
import { NewChatParticipantChip } from "./NewChatParticipantChip"
import { SYSTEM_LABEL_STYLE } from "./TextInput"
import {
  DEFAULT_MENTION_TARGETS,
  estimateMentionMenuHeight,
  filterPeoplePickerTargets,
} from "../lib/mentionUtils"

const PLACEHOLDER = "Add new people"

/** Figma `6228:12001` — confirm pill, 28×28. */
function NewChatConfirmButton({ onClick }) {
  return (
    <button
      type="button"
      className="inline-flex size-[28px] shrink-0 items-center justify-center rounded-[28px] border-0 bg-[var(--background-primary-subtle)] text-[var(--foreground-primary)] transition-colors duration-150 hover:bg-[var(--control-bg-hover)]"
      onClick={onClick}
      aria-label="Start chat"
    >
      <Icon name="check" />
    </button>
  )
}

/**
 * Figma Chat title — new-chat variants (`6228:12015`–`6232:11890`).
 * Empty: centered field only. With chips: `gap-[6px]` row + confirm pill.
 */
export function NewChatTitleRow({ participants = [], onParticipantsChange, onConfirm }) {
  const [query, setQuery] = useState("")
  const [pickerOpen, setPickerOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const inputRef = useRef(null)
  const fieldRef = useRef(null)
  const pickerMenuRef = useRef(null)
  const [pickerPos, setPickerPos] = useState({ left: 0, top: 0 })

  const participantIds = participants.map((p) => p.id)
  const pickerItems = filterPeoplePickerTargets(DEFAULT_MENTION_TARGETS, query, participantIds)
  const hasParticipants = participants.length >= 1

  const updatePickerPosition = useCallback(() => {
    const shell = fieldRef.current
    if (!shell) return
    const rect = shell.getBoundingClientRect()
    const estimatedHeight = estimateMentionMenuHeight(pickerItems.length)
    let top = rect.top - estimatedHeight
    if (top < 8) top = rect.bottom + 4
    setPickerPos({ left: rect.left, top })
  }, [pickerItems.length])

  useEffect(() => {
    if (!pickerOpen) return undefined
    updatePickerPosition()
    const onLayout = () => updatePickerPosition()
    window.addEventListener("resize", onLayout)
    window.addEventListener("scroll", onLayout, true)
    return () => {
      window.removeEventListener("resize", onLayout)
      window.removeEventListener("scroll", onLayout, true)
    }
  }, [pickerOpen, updatePickerPosition])

  const addParticipant = (target) => {
    if (!target || participantIds.includes(target.id)) return
    onParticipantsChange?.([
      ...participants,
      { id: target.id, label: target.label, initial: target.initial ?? target.label?.[0] ?? "?" },
    ])
    setQuery("")
    setHighlightIndex(0)
    inputRef.current?.focus()
  }

  const removeParticipant = (id) => {
    onParticipantsChange?.(participants.filter((p) => p.id !== id))
  }

  const handleFocus = () => {
    if (pickerItems.length > 0) {
      updatePickerPosition()
      setPickerOpen(true)
    }
  }

  const handleBlur = (event) => {
    if (pickerMenuRef.current?.contains(event.relatedTarget)) return
    window.setTimeout(() => setPickerOpen(false), 0)
  }

  const handleChange = (event) => {
    const next = event.target.value
    setQuery(next)
    const filtered = filterPeoplePickerTargets(DEFAULT_MENTION_TARGETS, next, participantIds)
    setHighlightIndex(0)
    setPickerOpen(filtered.length > 0)
  }

  const handleKeyDown = (event) => {
    if (!pickerOpen || pickerItems.length === 0) {
      if (event.key === "Enter" && hasParticipants) {
        event.preventDefault()
        onConfirm?.()
      }
      return
    }
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setHighlightIndex((i) => Math.min(i + 1, pickerItems.length - 1))
      return
    }
    if (event.key === "ArrowUp") {
      event.preventDefault()
      setHighlightIndex((i) => Math.max(i - 1, 0))
      return
    }
    if (event.key === "Enter") {
      event.preventDefault()
      addParticipant(pickerItems[highlightIndex])
      return
    }
    if (event.key === "Escape") {
      event.preventDefault()
      setPickerOpen(false)
    }
  }

  return (
    <header
      className={`flex h-[56px] w-full min-w-0 shrink-0 items-center p-[14px] ${
        hasParticipants ? "gap-[6px]" : "justify-center"
      }`}
    >
      {participants.map((person) => (
        <NewChatParticipantChip
          key={person.id}
          label={person.label}
          initial={person.initial}
          onRemove={() => removeParticipant(person.id)}
        />
      ))}

      <div ref={fieldRef} className={`flex h-[28px] min-w-0 items-center px-[10px] ${hasParticipants ? "flex-1" : "w-full"}`}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={PLACEHOLDER}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[var(--control-content-primary)] outline-none placeholder:text-[var(--control-content-secondary)]"
          style={SYSTEM_LABEL_STYLE}
          aria-label="Add people to chat"
        />
      </div>

      {hasParticipants ? <NewChatConfirmButton onClick={() => onConfirm?.()} /> : null}

      <MentionMenu
        open={pickerOpen}
        left={pickerPos.left}
        top={pickerPos.top}
        items={pickerItems}
        highlightIndex={highlightIndex}
        menuRef={pickerMenuRef}
        onPick={addParticipant}
        onHighlightChange={setHighlightIndex}
      />
    </header>
  )
}
