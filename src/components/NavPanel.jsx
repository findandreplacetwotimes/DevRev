import { createPortal } from "react-dom"
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useAnchoredPopoverPosition } from "../hooks/useAnchoredPopoverPosition"
import { useProjects } from "../context/IssuesContext"
import { ChatToggleIcon } from "./ChatToggleIcon"
import { Control } from "./Control"
import { NavItem } from "./NavItem"

const modalShadow =
  "0px 6px 13px rgba(0,0,0,0.10), 0px 23px 23px rgba(0,0,0,0.09), 0px 52px 31px rgba(0,0,0,0.05), 0px 92px 37px rgba(0,0,0,0.01), 0px 144px 40px rgba(0,0,0,0)"
const MENU_WIDTH_PX = 202
const EDGE_GUTTER_PX = 8
const CHIP_FONT = '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif'

function TeamAvatar({ color = "orange", label = "B" }) {
  const bgColors = {
    orange: "hsl(13 100% 60%)",
    purple: "hsl(259 94% 44%)",
    pink: "hsl(346 98% 58%)",
  }

  return (
    <span
      className="inline-flex size-[20px] shrink-0 items-center justify-center rounded-[4px] text-[10px] font-medium text-white"
      style={{
        background: bgColors[color] || bgColors.orange,
        fontFamily: CHIP_FONT,
        fontVariationSettings: '"wght" 540'
      }}
    >
      {label}
    </span>
  )
}

function SectionLabel({ title, showPlus = false, onPlus }) {
  return (
    <div className="flex h-[24px] items-center px-[6px]">
      <span
        className="flex-1 text-[11px] uppercase tracking-[0.05em] text-[#737072]"
        style={{ fontFamily: CHIP_FONT, fontVariationSettings: '"wght" 540' }}
      >
        {title}
      </span>
      {showPlus && (
        <button
          type="button"
          onClick={onPlus}
          className="text-[14px] text-[#737072] hover:text-[#898789] leading-none"
        >
          +
        </button>
      )}
    </div>
  )
}

function CollapsibleSection({ title, isOpen, onToggle, children, showPlus = false }) {
  return (
    <div className="flex w-full flex-col">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-[24px] w-full items-center gap-[4px] px-[6px] text-left"
      >
        <span
          className="flex-1 text-[11px] uppercase tracking-[0.05em] text-[#737072]"
          style={{ fontFamily: CHIP_FONT, fontVariationSettings: '"wght" 540' }}
        >
          {title}
        </span>
        {showPlus && (
          <span className="text-[14px] text-[#737072] hover:text-[#898789]">+</span>
        )}
      </button>
      {isOpen && (
        <div className="flex w-full flex-col gap-[4px] mt-[4px]">
          {children}
        </div>
      )}
    </div>
  )
}

function CollapsibleTeam({ name, avatar, isOpen, onToggle, children, selected = false }) {
  return (
    <div className="flex w-full flex-col">
      <button
        type="button"
        onClick={onToggle}
        className={`flex h-[28px] w-full items-center gap-[6px] px-[6px] text-left transition-colors duration-150 hover:bg-[var(--background-primary-subtle)] rounded-[2px] ${
          selected ? "bg-[var(--background-primary-subtle)]" : ""
        }`}
      >
        <img
          src="/icons/chevron-down.svg"
          alt=""
          className="size-[12px] transition-transform duration-200"
          style={{ transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
        />
        {avatar}
        <span
          className="flex-1 text-[14px] text-[#0f0e0f]"
          style={{ fontFamily: CHIP_FONT, fontVariationSettings: '"wght" 440' }}
        >
          {name}
        </span>
      </button>
      {isOpen && (
        <div className="flex w-full flex-col gap-[2px] ml-[26px] mt-[2px]">
          {children}
        </div>
      )}
    </div>
  )
}

// Custom free-form sections the user has created
const CUSTOM_SECTIONS = [
  {
    id: "support-views",
    title: "Support Views",
    items: [
      { id: "all-open-tickets", label: "All open tickets", iconName: "page" },
      { id: "escalated", label: "Escalated", iconName: "page" },
      { id: "high-priority", label: "High priority", iconName: "page" },
    ],
  },
]

const BUILD_TEAM_ITEMS = [
  { id: "build-chat", label: "Lobby", iconName: "chat" },
  { id: "build-issues", label: "Issues", iconName: "page" },
  { id: "build-roadmap", label: "Roadmap", iconName: "page", disabled: true },
  { id: "build-sprints", label: "Sprints", iconName: "page" },
  { id: "build-about", label: "About", iconName: "page" },
]

const OTHER_TEAM_ITEMS = [
  { id: "issues", label: "Issues", iconName: "page", disabled: true },
  { id: "roadmap", label: "Roadmap", iconName: "page", disabled: true },
  { id: "sprints", label: "Sprints", iconName: "page", disabled: true },
]


export function NavPanel({
  className = "",
  selectedItemId,
  defaultSelectedItemId = "projects",
  onSelectItem,
  onComputerClick,
  onSearchClick,
  chatPanelOpen = true,
  chatVariant = "build-team",
  recordPanelOpen = true,
  onToggleChatPanel,
  onToggleRecordPanel,
}) {
  const [uncontrolledSelectedItemId, setUncontrolledSelectedItemId] = useState(defaultSelectedItemId)
  const isControlledSelection = selectedItemId !== undefined
  const currentSelectedItemId = isControlledSelection ? selectedItemId : uncontrolledSelectedItemId

  // Section collapse state
  const [teamsOpen, setTeamsOpen] = useState(true)
  const [projectsSectionOpen, setProjectsSectionOpen] = useState(true)
  const [buildTeamOpen, setBuildTeamOpen] = useState(true)
  const [foundationsTeamOpen, setFoundationsTeamOpen] = useState(false)
  const [growthTeamOpen, setGrowthTeamOpen] = useState(false)
  const [supportTeamOpen, setSupportTeamOpen] = useState(false)
  const [customSectionStates, setCustomSectionStates] = useState(() =>
    Object.fromEntries(CUSTOM_SECTIONS.map((s) => [s.id, true]))
  )
  // Project spaces state
  const { projects } = useProjects()
  const [projectStates, setProjectStates] = useState({})

  // Filter projects with membership
  const memberProjects = useMemo(() => {
    if (!projects) return []
    return projects.filter(p => p.isMember)
  }, [projects])

  const allItemIds = useMemo(() => {
    const baseIds = BUILD_TEAM_ITEMS.map((item) => item.id)
    const projectIds = memberProjects.flatMap(p => [
      `project-${p.id}`,
      `project-${p.id}-chat`,
    ])
    const customIds = CUSTOM_SECTIONS.flatMap(s => s.items.map(i => i.id))
    return ["inbox", "discover", ...baseIds, ...projectIds, ...customIds]
  }, [memberProjects])

  // Profile dropdown (avatar button in top bar)
  const profileMenuId = useId()
  const profileTriggerRef = useRef(null)
  const profileMenuRef = useRef(null)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profilePopoverPos = useAnchoredPopoverPosition(profileTriggerRef, profileMenuOpen, 2)
  const [profileMenuStyle, setProfileMenuStyle] = useState({ top: 0, left: 0 })

  const handleSelectItem = (itemId) => {
    if (!allItemIds.includes(itemId)) return
    if (!isControlledSelection) {
      setUncontrolledSelectedItemId(itemId)
    }
    onSelectItem?.(itemId)
  }

  // Profile menu positioning
  useEffect(() => {
    if (!profileMenuOpen) return undefined
    const onDown = (e) => {
      if (profileTriggerRef.current?.contains(e.target) || profileMenuRef.current?.contains(e.target)) return
      setProfileMenuOpen(false)
    }
    document.addEventListener("pointerdown", onDown)
    return () => document.removeEventListener("pointerdown", onDown)
  }, [profileMenuOpen])

  useLayoutEffect(() => {
    if (!profileMenuOpen) return undefined
    const position = () => {
      const r = profileTriggerRef.current?.getBoundingClientRect()
      if (!r) return
      const menuH = profileMenuRef.current?.offsetHeight ?? 300
      const vH = window.innerHeight
      let top = Math.round(r.bottom + 4)
      if (top + menuH > vH - EDGE_GUTTER_PX) top = Math.round(r.top - menuH - 4)
      top = Math.max(EDGE_GUTTER_PX, top)
      setProfileMenuStyle({ top, left: Math.round(r.left) })
    }
    position()
    const id = window.requestAnimationFrame(position)
    window.addEventListener("resize", position)
    return () => { window.cancelAnimationFrame(id); window.removeEventListener("resize", position) }
  }, [profileMenuOpen, profilePopoverPos])

  useEffect(() => {
    if (!profileMenuOpen) return undefined
    const onKey = (e) => { if (e.key === "Escape") setProfileMenuOpen(false) }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [profileMenuOpen])

  return (
    <aside
      className={`flex h-full min-h-0 w-[220px] shrink-0 flex-col items-start overflow-y-auto overflow-x-hidden border-r border-[#ececec] bg-white px-[12px] py-[14px] ${className}`}
    >
      {/* Top bar */}
      <div className="flex w-full items-center gap-[4px] mb-[8px]">
        {/* User profile avatar */}
        <button
          ref={profileTriggerRef}
          type="button"
          id={`${profileMenuId}-trigger`}
          aria-haspopup="menu"
          aria-expanded={profileMenuOpen}
          onClick={() => setProfileMenuOpen((p) => !p)}
          className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full overflow-hidden transition-opacity duration-150 hover:opacity-80"
          aria-label="Profile"
        >
          <span
            className="inline-flex size-[28px] items-center justify-center rounded-full bg-[#d0cfd0] text-[11px] text-[#555]"
            style={{ fontFamily: CHIP_FONT, fontVariationSettings: '"wght" 540' }}
          >
            M
          </span>
        </button>

        {/* Settings */}
        <button
          type="button"
          className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[4px] transition-colors duration-150 hover:bg-[var(--background-primary-subtle)]"
          aria-label="Settings"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="#737072" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11.3 8.6a.9.9 0 0 0 .18 1l.06.06a1.1 1.1 0 0 1-1.56 1.56l-.06-.06a.9.9 0 0 0-1-.18.9.9 0 0 0-.55.82v.17a1.1 1.1 0 0 1-2.2 0V11.9a.9.9 0 0 0-.59-.82.9.9 0 0 0-1 .18l-.06.06a1.1 1.1 0 0 1-1.56-1.56l.06-.06a.9.9 0 0 0 .18-1 .9.9 0 0 0-.82-.55H2.1a1.1 1.1 0 0 1 0-2.2h.08a.9.9 0 0 0 .82-.59.9.9 0 0 0-.18-1l-.06-.06a1.1 1.1 0 0 1 1.56-1.56l.06.06a.9.9 0 0 0 1 .18h.04a.9.9 0 0 0 .55-.82V2.1a1.1 1.1 0 0 1 2.2 0v.08a.9.9 0 0 0 .55.82.9.9 0 0 0 1-.18l.06-.06a1.1 1.1 0 0 1 1.56 1.56l-.06.06a.9.9 0 0 0-.18 1v.04a.9.9 0 0 0 .82.55h.17a1.1 1.1 0 0 1 0 2.2H11.9a.9.9 0 0 0-.82.55 0 0Z" stroke="#737072" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Layout toggle (sidebar) */}
        <button
          type="button"
          className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[4px] transition-colors duration-150 hover:bg-[var(--background-primary-subtle)]"
          aria-label="Toggle layout"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="12" height="12" rx="2" stroke="#737072" strokeWidth="1.2"/>
            <line x1="4.5" y1="1" x2="4.5" y2="13" stroke="#737072" strokeWidth="1.2"/>
          </svg>
        </button>

        <div className="flex-1" />

        {/* + New */}
        <button
          type="button"
          className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[4px] bg-[#0f0e0f] transition-colors duration-150 hover:bg-[#2a282a]"
          aria-label="New"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Computer button */}
      <button
        type="button"
        onClick={onComputerClick}
        className="flex h-[29px] w-full items-center justify-center rounded-[999px] bg-[var(--background-primary-subtle)] pb-[3px] pt-[5px] mb-[8px] transition-colors duration-150 hover:bg-[var(--control-bg-hover)]"
      >
        <img src="/icons/computer-wordmark.svg" alt="computer" className="h-[14px] w-[80px]" draggable={false} />
      </button>

      {/* Search / Cmd+K */}
      <button
        type="button"
        onClick={onSearchClick}
        className="flex h-[30px] w-full items-center gap-[8px] rounded-[4px] border border-[#e5e3e5] bg-white px-[8px] transition-colors duration-150 hover:border-[#d0ced0] hover:bg-[var(--background-primary-subtle)] mb-[12px]"
      >
        <img src="/icons/search.svg" alt="" className="h-[13px] w-[13px] opacity-35" draggable={false} />
        <span
          className="flex-1 text-left text-[13px] text-[#b0aeb0]"
          style={{ fontFamily: CHIP_FONT, fontVariationSettings: '"wght" 400' }}
        >
          Search
        </span>
        <kbd
          className="rounded-[3px] border border-[#e0dfe0] px-[4px] py-[1px] text-[10px] text-[#c0bec0]"
          style={{ fontFamily: CHIP_FONT }}
        >
          ⌘K
        </kbd>
      </button>

      {/* Top-level nav: Updates, Explore */}
      <div className="flex w-full flex-col gap-[2px] mb-[12px]">
        <NavItem
          label="Updates"
          iconName="inbox"
          selected={currentSelectedItemId === "inbox"}
          className="w-full"
          onClick={() => handleSelectItem("inbox")}
        />
        <NavItem
          label="Explore"
          iconName="discover"
          selected={currentSelectedItemId === "discover"}
          className="w-full"
          onClick={() => handleSelectItem("discover")}
        />
      </div>

      {/* YOUR TEAMS */}
      <div className="w-full mb-[12px]">
        <CollapsibleSection title="Your Teams" isOpen={teamsOpen} onToggle={() => setTeamsOpen(!teamsOpen)}>
        <CollapsibleTeam
          name="Build"
          avatar={<TeamAvatar color="orange" label="B" />}
          isOpen={buildTeamOpen}
          onToggle={() => setBuildTeamOpen(!buildTeamOpen)}
        >
          {BUILD_TEAM_ITEMS.map((item) => {
            if (item.id === "build-chat") {
              const isBuildChatActive = chatVariant === "build-team"
              const showChatOpen = chatPanelOpen && isBuildChatActive
              return (
                <NavItem
                  key={item.id}
                  label={item.label}
                  leading={<ChatToggleIcon isOpen={showChatOpen} />}
                  selected={false}
                  className="w-full h-[24px] text-[13px] px-[6px]"
                  onClick={() => handleSelectItem(item.id)}
                />
              )
            }
            return (
              <NavItem
                key={item.id}
                label={item.label}
                iconName={item.iconName}
                selected={currentSelectedItemId === item.id}
                className={`w-full h-[24px] text-[13px] px-[6px] ${item.disabled ? "cursor-not-allowed" : ""}`}
                onClick={() => !item.disabled && handleSelectItem(item.id)}
              />
            )
          })}
        </CollapsibleTeam>

        <CollapsibleTeam
          name="Foundations"
          avatar={<TeamAvatar color="orange" label="F" />}
          isOpen={foundationsTeamOpen}
          onToggle={() => setFoundationsTeamOpen(!foundationsTeamOpen)}
        >
          {OTHER_TEAM_ITEMS.map((item) => (
            <NavItem
              key={`foundations-${item.id}`}
              label={item.label}
              iconName={item.iconName}
              selected={false}
              className="w-full h-[24px] text-[13px] px-[6px] cursor-not-allowed"
              onClick={() => {}}
            />
          ))}
        </CollapsibleTeam>

        <CollapsibleTeam
          name="Growth"
          avatar={<TeamAvatar color="purple" label="G" />}
          isOpen={growthTeamOpen}
          onToggle={() => setGrowthTeamOpen(!growthTeamOpen)}
        >
          {OTHER_TEAM_ITEMS.map((item) => (
            <NavItem
              key={`growth-${item.id}`}
              label={item.label}
              iconName={item.iconName}
              selected={false}
              className="w-full h-[24px] text-[13px] px-[6px] cursor-not-allowed"
              onClick={() => {}}
            />
          ))}
        </CollapsibleTeam>

        <CollapsibleTeam
          name="Support"
          avatar={<TeamAvatar color="pink" label="S" />}
          isOpen={supportTeamOpen}
          onToggle={() => setSupportTeamOpen(!supportTeamOpen)}
        >
          {OTHER_TEAM_ITEMS.map((item) => (
            <NavItem
              key={`support-${item.id}`}
              label={item.label}
              iconName={item.iconName}
              selected={false}
              className="w-full h-[24px] text-[13px] px-[6px] cursor-not-allowed"
              onClick={() => {}}
            />
          ))}
        </CollapsibleTeam>
        </CollapsibleSection>
      </div>

      {/* YOUR PROJECTS */}
      {memberProjects.length > 0 && (
        <div className="w-full mb-[12px]">
          <CollapsibleSection title="Your Projects" isOpen={projectsSectionOpen} onToggle={() => setProjectsSectionOpen(!projectsSectionOpen)}>
          {memberProjects.map((project) => {
            const isProjectOpen = projectStates[project.id] ?? false
            const isThisProjectChatActive = chatVariant === `project-${project.id}`
            const showChatOpen = chatPanelOpen && isThisProjectChatActive
            return (
              <CollapsibleTeam
                key={project.id}
                name={project.title || project.id}
                avatar={<TeamAvatar color="orange" label={project.title?.[0] || "P"} />}
                isOpen={isProjectOpen}
                onToggle={() => setProjectStates(prev => ({ ...prev, [project.id]: !isProjectOpen }))}
              >
                <NavItem
                  label="Project chat"
                  leading={<ChatToggleIcon isOpen={showChatOpen} />}
                  selected={false}
                  className="w-full h-[24px] text-[13px] px-[6px]"
                  onClick={() => handleSelectItem(`project-${project.id}-chat`)}
                />
                <NavItem
                  label="Scope"
                  iconName="page"
                  selected={currentSelectedItemId === `project-${project.id}`}
                  className="w-full h-[24px] text-[13px] px-[6px]"
                  onClick={() => handleSelectItem(`project-${project.id}`)}
                />
                <NavItem
                  label="Execution Timeline"
                  iconName="page"
                  selected={false}
                  className="w-full h-[24px] text-[13px] px-[6px] cursor-not-allowed"
                  onClick={() => {}}
                />
                <NavItem
                  label="Release Phases"
                  iconName="page"
                  selected={false}
                  className="w-full h-[24px] text-[13px] px-[6px] cursor-not-allowed"
                  onClick={() => {}}
                />
              </CollapsibleTeam>
            )
          })}
          </CollapsibleSection>
        </div>
      )}

      {/* CUSTOM FREE-FORM SECTIONS */}
      {CUSTOM_SECTIONS.map((section) => (
        <div key={section.id} className="w-full mb-[12px]">
          <CollapsibleSection
            title={section.title}
            isOpen={customSectionStates[section.id] ?? true}
            onToggle={() =>
              setCustomSectionStates((prev) => ({ ...prev, [section.id]: !(prev[section.id] ?? true) }))
            }
          >
            {section.items.map((item) => (
              <NavItem
                key={item.id}
                label={item.label}
                iconName={item.iconName}
                selected={currentSelectedItemId === item.id}
                className="w-full cursor-not-allowed"
                onClick={() => {}}
              />
            ))}
          </CollapsibleSection>
        </div>
      ))}

      <div className="min-h-0 w-full flex-1" />

      {/* Bottom: customer support chat button */}
      <div className="flex w-full items-center justify-start pb-[4px]">
        <button
          type="button"
          className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#6366F1] shadow-md transition-opacity duration-150 hover:opacity-90"
          aria-label="Customer support"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 2C5.13 2 2 4.91 2 8.5c0 1.74.72 3.32 1.9 4.48L3 15l2.18-.88C6.27 14.68 7.6 15 9 15c3.87 0 7-2.91 7-6.5S12.87 2 9 2Z" fill="white"/>
          </svg>
        </button>
      </div>

      {profileMenuOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={profileMenuRef}
              id={`${profileMenuId}-menu`}
              role="menu"
              className="fixed z-[2147483646] w-[240px] flex-col rounded-[6px] bg-white overflow-hidden"
              style={{ boxShadow: modalShadow, top: `${profileMenuStyle.top}px`, left: `${profileMenuStyle.left}px` }}
            >
              {/* Header */}
              <div className="flex items-center gap-[10px] px-[14px] py-[12px] border-b border-[#f0eef0]">
                <span
                  className="inline-flex size-[36px] shrink-0 items-center justify-center rounded-full text-[13px] font-medium text-white"
                  style={{ background: "hsl(259 94% 44%)", fontFamily: CHIP_FONT, fontVariationSettings: '"wght" 600' }}
                >
                  KM
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] text-[#0f0e0f] truncate" style={{ fontFamily: CHIP_FONT, fontVariationSettings: '"wght" 500' }}>
                    kunal-mohta
                  </span>
                  <span className="text-[11px] text-[#737072] truncate" style={{ fontFamily: CHIP_FONT }}>
                    kunal@devrev.ai
                  </span>
                </div>
                <span className="ml-auto size-[8px] rounded-full bg-[#22c55e] shrink-0" />
              </div>

              {/* Actions */}
              <div className="flex flex-col py-[6px] border-b border-[#f0eef0]">
                {[
                  { label: "Pause notifications" },
                  { label: "Set yourself as away" },
                  { label: "Invite members" },
                  { label: "Settings" },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className="flex h-[30px] w-full items-center px-[14px] text-left text-[13px] text-[#0f0e0f] hover:bg-[var(--background-primary-subtle)] transition-colors duration-100"
                    style={{ fontFamily: CHIP_FONT, fontVariationSettings: '"wght" 420' }}
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Orgs */}
              <div className="flex flex-col py-[6px] border-b border-[#f0eef0]">
                <div className="flex items-center px-[14px] h-[24px]">
                  <span className="flex-1 text-[11px] text-[#737072] uppercase tracking-[0.05em]" style={{ fontFamily: CHIP_FONT, fontVariationSettings: '"wght" 540' }}>Orgs</span>
                  <span className="text-[14px] text-[#737072]">+</span>
                </div>
                {[
                  { label: "kunal-aps-0502", active: true },
                  { label: "DevRev", active: false },
                ].map((org) => (
                  <button
                    key={org.label}
                    type="button"
                    className="flex h-[30px] w-full items-center gap-[8px] px-[14px] text-left text-[13px] text-[#0f0e0f] hover:bg-[var(--background-primary-subtle)] transition-colors duration-100"
                    style={{ fontFamily: CHIP_FONT, fontVariationSettings: '"wght" 420' }}
                  >
                    <span className="flex-1 truncate">{org.label}</span>
                    {org.active && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#0f0e0f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              {/* Log out */}
              <div className="flex flex-col py-[6px]">
                <button
                  type="button"
                  className="flex h-[30px] w-full items-center px-[14px] text-left text-[13px] text-[#0f0e0f] hover:bg-[var(--background-primary-subtle)] transition-colors duration-100"
                  style={{ fontFamily: CHIP_FONT, fontVariationSettings: '"wght" 420' }}
                  onClick={() => setProfileMenuOpen(false)}
                >
                  Log out
                </button>
              </div>
            </div>,
            document.body
          )
        : null}

    </aside>
  )
}
