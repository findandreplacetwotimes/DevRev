import { createPortal } from "react-dom"
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useAnchoredPopoverPosition } from "../hooks/useAnchoredPopoverPosition"
import { useProjects } from "../context/IssuesContext"
import { ChatAvatar } from "./ChatAvatar"
import { ChatToggleIcon } from "./ChatToggleIcon"
import { Control } from "./Control"
import { MenuItem } from "./MenuItem"
import { NavItem } from "./NavItem"

const modalShadow =
  "0px 6px 13px rgba(0,0,0,0.10), 0px 23px 23px rgba(0,0,0,0.09), 0px 52px 31px rgba(0,0,0,0.05), 0px 92px 37px rgba(0,0,0,0.01), 0px 144px 40px rgba(0,0,0,0)"
const MENU_WIDTH_PX = 202
const EDGE_GUTTER_PX = 8

function MeAvatar({ selected = false }) {
  return (
    <span className="relative inline-flex size-[28px] shrink-0 items-center justify-center overflow-hidden">
      <span
        className={`absolute left-[5px] top-[5px] size-[18px] rounded-[999px] border border-transparent transition-colors duration-150 ${
          selected
            ? "border border-white bg-white"
            : "bg-[var(--background-primary-subtle)] group-hover:border-white group-hover:bg-white"
        }`}
      />
      <span
        className="relative z-[1] inline-flex h-[11px] w-[18px] items-center justify-center text-center text-[9.9px] text-[#737072]"
        style={{ fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif', fontVariationSettings: '"wght" 520' }}
      >
        M
      </span>
    </span>
  )
}

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
        fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
        fontVariationSettings: '"wght" 540'
      }}
    >
      {label}
    </span>
  )
}

function CollapsibleSection({ title, isOpen, onToggle, children, showPlus = false }) {
  return (
    <div className="flex w-full flex-col">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-[28px] w-full items-center gap-[4px] px-[6px] text-left transition-colors duration-150 hover:bg-[var(--background-primary-subtle)] rounded-[2px]"
      >
        <img
          src="/icons/chevron-down.svg"
          alt=""
          className="size-[12px] transition-transform duration-200"
          style={{ transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
        />
        <span
          className="flex-1 text-[11px] uppercase tracking-[0.05em] text-[#737072]"
          style={{ fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif', fontVariationSettings: '"wght" 540' }}
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
          style={{ fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif', fontVariationSettings: '"wght" 440' }}
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

const WORKSPACE_ITEMS = [
  { id: "projects", label: "Projects", iconName: "page" },
  { id: "views", label: "Views", iconName: "page", disabled: true },
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

const SECONDARY_ITEMS = [
  { id: "inbox", label: "Inbox", iconName: "inbox" },
  { id: "discover", label: "Discover", iconName: "discover" },
  { id: "agent-studio", label: "Agent studio", iconName: "agent" },
  { id: "me", label: "Me", leading: <MeAvatar /> },
]

export function NavPanel({
  className = "",
  selectedItemId,
  defaultSelectedItemId = "projects",
  onSelectItem,
  onComputerClick,
  chatPanelOpen = true,
  chatVariant = "build-team",
  recordPanelOpen = true,
  onToggleChatPanel,
  onToggleRecordPanel,
}) {
  const [uncontrolledSelectedItemId, setUncontrolledSelectedItemId] = useState(defaultSelectedItemId)
  const isControlledSelection = selectedItemId !== undefined
  const currentSelectedItemId = isControlledSelection ? selectedItemId : uncontrolledSelectedItemId

  // Section state
  const [myWorkOpen, setMyWorkOpen] = useState(false)
  const [workspaceOpen, setWorkspaceOpen] = useState(true)
  const [favouritesOpen, setFavouritesOpen] = useState(false)
  const [buildTeamOpen, setBuildTeamOpen] = useState(false)
  const [foundationsTeamOpen, setFoundationsTeamOpen] = useState(false)
  const [growthTeamOpen, setGrowthTeamOpen] = useState(false)
  const [supportTeamOpen, setSupportTeamOpen] = useState(false)
  const [chatsOpen, setChatsOpen] = useState(false)

  // Project spaces state
  const { projects } = useProjects()
  const [projectStates, setProjectStates] = useState({})

  // Filter projects with membership
  const memberProjects = useMemo(() => {
    if (!projects) return []
    return projects.filter(p => p.isMember)
  }, [projects])

  const allItemIds = useMemo(() => {
    const baseIds = [...WORKSPACE_ITEMS, ...BUILD_TEAM_ITEMS, ...SECONDARY_ITEMS].map((item) => item.id)
    const projectIds = memberProjects.flatMap(p => [
      `project-${p.id}`,
      `project-${p.id}-chat`,
    ])
    return [...baseIds, ...projectIds]
  }, [memberProjects])

  const hasPanelToggles =
    typeof onToggleChatPanel === "function" || typeof onToggleRecordPanel === "function"

  const meMenuId = useId()
  const meTriggerRef = useRef(null)
  const meMenuRef = useRef(null)
  const [meMenuOpen, setMeMenuOpen] = useState(false)
  const mePopoverPos = useAnchoredPopoverPosition(meTriggerRef, meMenuOpen, 2)
  const [meMenuStyle, setMeMenuStyle] = useState({ top: 0, left: 0 })

  const handleSelectItem = (itemId) => {
    if (!allItemIds.includes(itemId)) return
    if (!isControlledSelection) {
      setUncontrolledSelectedItemId(itemId)
    }
    onSelectItem?.(itemId)
  }

  const handleMeClick = () => {
    handleSelectItem("me")
    setMeMenuOpen((prev) => !prev)
  }

  useEffect(() => {
    if (!meMenuOpen) return undefined
    const onDocumentPointerDown = (event) => {
      const t = event.target
      if (meTriggerRef.current?.contains(t) || meMenuRef.current?.contains(t)) return
      setMeMenuOpen(false)
    }
    document.addEventListener("pointerdown", onDocumentPointerDown)
    return () => document.removeEventListener("pointerdown", onDocumentPointerDown)
  }, [meMenuOpen])

  useLayoutEffect(() => {
    if (!meMenuOpen) return undefined

    const positionMenu = () => {
      const triggerRect = meTriggerRef.current?.getBoundingClientRect()
      if (!triggerRect) return
      const menuHeight = meMenuRef.current?.offsetHeight ?? 120
      const viewportW = window.innerWidth
      const viewportH = window.innerHeight

      // Prefer below; flip above when close to bottom edge.
      let top = Math.round(triggerRect.bottom + 2)
      const bottomOverflow = top + menuHeight - viewportH + EDGE_GUTTER_PX
      if (bottomOverflow > 0) {
        top = Math.round(triggerRect.top - menuHeight - 2)
      }
      // Clamp inside viewport in extreme short-height cases.
      top = Math.max(EDGE_GUTTER_PX, Math.min(top, viewportH - menuHeight - EDGE_GUTTER_PX))

      // Keep menu within left/right viewport edges.
      let left = Math.round(triggerRect.left)
      left = Math.max(EDGE_GUTTER_PX, Math.min(left, viewportW - MENU_WIDTH_PX - EDGE_GUTTER_PX))

      setMeMenuStyle({ top, left })
    }

    positionMenu()
    const id = window.requestAnimationFrame(positionMenu)
    window.addEventListener("scroll", positionMenu, true)
    window.addEventListener("resize", positionMenu)
    return () => {
      window.cancelAnimationFrame(id)
      window.removeEventListener("scroll", positionMenu, true)
      window.removeEventListener("resize", positionMenu)
    }
  }, [meMenuOpen, mePopoverPos])

  useEffect(() => {
    if (!meMenuOpen) return undefined
    const onKey = (event) => {
      if (event.key === "Escape") setMeMenuOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [meMenuOpen])

  return (
    <aside
      className={`flex h-full min-h-0 w-[220px] shrink-0 flex-col items-start overflow-hidden border-r border-[#ececec] bg-white px-[12px] py-[14px] ${className}`}
    >
      <div className="flex w-full items-center gap-[4px]">
        <button
          type="button"
          onClick={onComputerClick}
          className="flex h-[29px] min-w-0 flex-1 items-center justify-center rounded-[999px] bg-[var(--background-primary-subtle)] pb-[3px] pt-[5px] transition-colors duration-150 hover:bg-[var(--control-bg-hover)]"
        >
          <img src="/icons/computer-wordmark.svg" alt="computer" className="h-[14px] w-[80px]" draggable={false} />
        </button>
        <Control type="iconOnly" leadingIcon="clock" label="" />
      </div>

      <div className="h-[20px] w-[192px] shrink-0 bg-white" />

      {/* MY WORK */}
      <div className="w-[194px]">
        <CollapsibleSection
          title="My Work"
          isOpen={myWorkOpen}
          onToggle={() => setMyWorkOpen(!myWorkOpen)}
        >
          {/* Empty for now */}
        </CollapsibleSection>
      </div>

      <div className="h-[12px] w-[192px] shrink-0 bg-white" />

      {/* WORKSPACE */}
      <div className="w-[194px]">
        <CollapsibleSection
          title="Workspace"
          isOpen={workspaceOpen}
          onToggle={() => setWorkspaceOpen(!workspaceOpen)}
          showPlus
        >
          {WORKSPACE_ITEMS.map((item) => {
            // Special case: Chats uses same icon as Lobby
            if (item.id === "chats") {
              return (
                <NavItem
                  key={item.id}
                  label={item.label}
                  leading={<ChatToggleIcon isOpen={false} />}
                  selected={currentSelectedItemId === item.id}
                  className={`w-full ${item.disabled ? "cursor-not-allowed" : ""}`}
                  onClick={() => !item.disabled && handleSelectItem(item.id)}
                />
              )
            }
            return (
              <NavItem
                key={item.id}
                label={item.label}
                iconName={item.iconName}
                selected={currentSelectedItemId === item.id}
                className={`w-full ${item.disabled ? "cursor-not-allowed" : ""}`}
                onClick={() => !item.disabled && handleSelectItem(item.id)}
              />
            )
          })}
        </CollapsibleSection>
      </div>

      <div className="h-[12px] w-[192px] shrink-0 bg-white" />

      {/* YOUR PROJECTS */}
      {memberProjects.length > 0 && (
        <div className="w-[194px] flex flex-col gap-[4px]">
          <div className="flex h-[24px] items-center px-[6px]">
            <span
              className="text-[11px] uppercase tracking-[0.05em] text-[#737072]"
              style={{ fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif', fontVariationSettings: '"wght" 540' }}
            >
              Your Projects
            </span>
          </div>
          {memberProjects.map((project) => {
            const isProjectOpen = projectStates[project.id] ?? false
            const isThisProjectChatActive = chatVariant === `project-${project.id}`
            const showChatOpen = chatPanelOpen && isThisProjectChatActive

            // Custom avatar per project
            const getProjectAvatar = () => {
              if (project.id === "Project-0001") {
                return <TeamAvatar color="purple" label="K" />
              }
              return <TeamAvatar color="orange" label={project.title?.[0] || "P"} />
            }

            return (
              <CollapsibleTeam
                key={project.id}
                name={project.title || project.id}
                avatar={getProjectAvatar()}
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
        </div>
      )}

      <div className="h-[12px] w-[192px] shrink-0 bg-white" />

      {/* YOUR TEAMS */}
      <div className="w-[194px] flex flex-col gap-[4px]">
        <div className="flex h-[24px] items-center px-[6px]">
          <span
            className="text-[11px] uppercase tracking-[0.05em] text-[#737072]"
            style={{ fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif', fontVariationSettings: '"wght" 540' }}
          >
            Your Teams
          </span>
        </div>

        {/* Build Team */}
        <CollapsibleTeam
          name="Build"
          avatar={<TeamAvatar color="orange" label="B" />}
          isOpen={buildTeamOpen}
          onToggle={() => setBuildTeamOpen(!buildTeamOpen)}
        >
          {BUILD_TEAM_ITEMS.map((item) => {
            // Special handling for Build chat
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

        {/* Other Teams - collapsed */}
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
      </div>

      <div className="min-h-0 w-[192px] flex-1 bg-white" />

      {/* CHATS */}
      <div className="w-[194px]">
        <CollapsibleSection
          title="Chats"
          isOpen={chatsOpen}
          onToggle={() => setChatsOpen(!chatsOpen)}
        >
          <NavItem
            label="12 Macros failing with inval..."
            leading={<span className="inline-flex size-[20px] shrink-0 items-center justify-center rounded-[4px] bg-[var(--foreground-error)] text-[10px] font-medium text-white" style={{ fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif', fontVariationSettings: '"wght" 540' }}>12</span>}
            selected={false}
            className="w-full h-[24px] text-[13px] px-[6px] cursor-not-allowed"
            onClick={() => {}}
          />
          <NavItem
            label="Kavinash"
            leading={<ChatAvatar initial="K" />}
            selected={false}
            className="w-full h-[24px] text-[13px] px-[6px] cursor-not-allowed"
            onClick={() => {}}
          />
          <NavItem
            label="13 Crash when importing la..."
            leading={<span className="inline-flex size-[20px] shrink-0 items-center justify-center rounded-[4px] bg-[var(--foreground-error)] text-[10px] font-medium text-white" style={{ fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif', fontVariationSettings: '"wght" 540' }}>13</span>}
            selected={false}
            className="w-full h-[24px] text-[13px] px-[6px] cursor-not-allowed"
            onClick={() => {}}
          />
          <NavItem
            label="Lina"
            leading={<ChatAvatar initial="L" />}
            selected={false}
            className="w-full h-[24px] text-[13px] px-[6px] cursor-not-allowed"
            onClick={() => {}}
          />
        </CollapsibleSection>
      </div>

      <div className="h-[12px] w-[192px] shrink-0 bg-white" />

      {/* Bottom items */}
      <div className="flex w-full flex-col gap-[4px]">
        {SECONDARY_ITEMS.slice(0, 3).map((item) => (
          <NavItem
            key={item.id}
            label={item.label}
            iconName={item.iconName}
            selected={currentSelectedItemId === item.id}
            className="w-full"
            onClick={() => handleSelectItem(item.id)}
          />
        ))}
        <div className="h-[12px] w-full shrink-0 bg-white" />
        <NavItem
          ref={meTriggerRef}
          label="Me"
          className="w-full"
          id={`${meMenuId}-trigger`}
          leading={<MeAvatar selected={currentSelectedItemId === "me" || meMenuOpen} />}
          selected={currentSelectedItemId === "me" || meMenuOpen}
          onClick={handleMeClick}
          aria-haspopup="menu"
          aria-expanded={meMenuOpen}
          aria-controls={meMenuOpen ? `${meMenuId}-menu` : undefined}
        />
      </div>

      {meMenuOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={meMenuRef}
              id={`${meMenuId}-menu`}
              role="menu"
              aria-label="Panels"
              className="fixed z-[2147483646] inline-flex w-[202px] flex-col items-start gap-[4px] rounded-[2px] bg-white p-[6px]"
              style={{
                boxShadow: modalShadow,
                top: `${meMenuStyle.top}px`,
                left: `${meMenuStyle.left}px`,
              }}
            >
              <MenuItem type="label" label="Panels" fullWidth />
              {hasPanelToggles ? (
                <>
                  {typeof onToggleChatPanel === "function" ? (
                    <NavItem
                      label={chatPanelOpen ? "Hide Chat" : "Show Chat"}
                      leading={<></>}
                      className="w-full max-w-none pr-[6px]"
                      onClick={() => onToggleChatPanel()}
                    />
                  ) : null}
                  {typeof onToggleRecordPanel === "function" ? (
                    <NavItem
                      label={recordPanelOpen ? "Hide Panel" : "Show Panel"}
                      leading={<></>}
                      className="w-full max-w-none pr-[6px]"
                      onClick={() => onToggleRecordPanel()}
                    />
                  ) : null}
                </>
              ) : null}
            </div>,
            document.body
          )
        : null}
    </aside>
  )
}
