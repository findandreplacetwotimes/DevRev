import { createPortal } from "react-dom"
import { useEffect, useRef, useState } from "react"

const RECENTS = [
  { id: "build-issues", label: "Issues", subtitle: "Build Team", icon: "page" },
  { id: "project-Project-0001", label: "Agentic Kanban", subtitle: "Your Projects", icon: "page" },
  { id: "build-sprints", label: "Sprints", subtitle: "Build Team", icon: "page" },
  { id: "build-chat", label: "Lobby", subtitle: "Build Team", icon: "page" },
  { id: "discover", label: "Explore", subtitle: "Nav", icon: "discover" },
]

const ALL_NAV_ITEMS = [
  { id: "inbox", label: "Updates", subtitle: "Nav", icon: "inbox" },
  { id: "build-chat", label: "Lobby", subtitle: "Build Team", icon: "page" },
  { id: "discover", label: "Explore", subtitle: "Nav", icon: "discover" },
  { id: "build-issues", label: "Issues", subtitle: "Build Team", icon: "page" },
  { id: "build-roadmap", label: "Roadmap", subtitle: "Build Team", icon: "page" },
  { id: "build-sprints", label: "Sprints", subtitle: "Build Team", icon: "page" },
  { id: "build-about", label: "About", subtitle: "Build Team", icon: "page" },
  { id: "projects", label: "Projects", subtitle: "Workspace", icon: "page" },
  { id: "project-Project-0001", label: "Agentic Kanban", subtitle: "Your Projects", icon: "page" },
  { id: "project-Project-0001-chat", label: "Agentic Kanban Chat", subtitle: "Your Projects", icon: "page" },
  { id: "agent-studio", label: "Agent Studio", subtitle: "Nav", icon: "agent" },
  { id: "inbox", label: "Inbox", subtitle: "Nav", icon: "inbox" },
  { id: "streams", label: "Streams", subtitle: "On-call related", icon: "page" },
  { id: "on-call-schedule", label: "On-call Schedule", subtitle: "On-call related", icon: "page" },
  { id: "session-replays", label: "Session Replays", subtitle: "Session Views", icon: "page" },
]

const CHIP_FONT = '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif'

export function CmdKPalette({ isOpen, onClose, onSelect }) {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  const items = query.trim()
    ? ALL_NAV_ITEMS.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : RECENTS

  useEffect(() => {
    if (isOpen) {
      setQuery("")
      setSelectedIndex(0)
      const id = window.setTimeout(() => inputRef.current?.focus(), 10)
      return () => window.clearTimeout(id)
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    if (!isOpen) return undefined
    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose()
        return
      }
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, items.length - 1))
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      }
      if (e.key === "Enter" && items[selectedIndex]) {
        onSelect(items[selectedIndex].id)
        onClose()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, items, selectedIndex, onClose, onSelect])

  if (!isOpen || typeof document === "undefined") return null

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center"
      style={{ paddingTop: "15vh", background: "rgba(0,0,0,0.15)" }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="w-[480px] overflow-hidden rounded-[6px] border border-[#e0dfe0] bg-white"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)" }}
      >
        {/* Input row */}
        <div className="flex items-center gap-[8px] border-b border-[#ececec] px-[14px] py-[10px]">
          <img src="/icons/search.svg" alt="" className="h-[15px] w-[15px] opacity-35" draggable={false} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or jump to..."
            className="flex-1 bg-transparent text-[14px] text-[#0f0e0f] outline-none placeholder-[#b0aeb0]"
            style={{ fontFamily: CHIP_FONT, fontVariationSettings: '"wght" 400' }}
          />
          <kbd
            className="rounded-[3px] border border-[#dcdadc] px-[5px] py-[1px] text-[11px] text-[#b0aeb0]"
            style={{ fontFamily: CHIP_FONT }}
          >
            Esc
          </kbd>
        </div>

        {/* Section label */}
        <div className="px-[14px] pb-[4px] pt-[8px]">
          <span
            className="text-[11px] uppercase tracking-[0.05em] text-[#b0aeb0]"
            style={{ fontFamily: CHIP_FONT, fontVariationSettings: '"wght" 540' }}
          >
            {query.trim() ? "Results" : "Recent"}
          </span>
        </div>

        {/* Items */}
        <div className="max-h-[320px] overflow-y-auto pb-[6px]">
          {items.length === 0 ? (
            <div className="px-[14px] py-[10px] text-[13px] text-[#b0aeb0]" style={{ fontFamily: CHIP_FONT }}>
              No results
            </div>
          ) : (
            items.map((item, idx) => (
              <button
                key={`${item.id}-${idx}`}
                type="button"
                className={`flex w-full items-center gap-[10px] px-[14px] py-[7px] text-left transition-colors duration-100 ${
                  idx === selectedIndex
                    ? "bg-[var(--background-primary-subtle)]"
                    : "hover:bg-[var(--background-primary-subtle)]"
                }`}
                onPointerEnter={() => setSelectedIndex(idx)}
                onClick={() => {
                  onSelect(item.id)
                  onClose()
                }}
              >
                <img
                  src={`/icons/${item.icon}.svg`}
                  alt=""
                  className="h-[15px] w-[15px] opacity-40"
                  draggable={false}
                />
                <span
                  className="flex-1 text-[13px] text-[#0f0e0f]"
                  style={{ fontFamily: CHIP_FONT, fontVariationSettings: '"wght" 420' }}
                >
                  {item.label}
                </span>
                <span
                  className="text-[11px] text-[#b0aeb0]"
                  style={{ fontFamily: CHIP_FONT, fontVariationSettings: '"wght" 420' }}
                >
                  {item.subtitle}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
