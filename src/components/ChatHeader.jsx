import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { ChatAvatar } from "./ChatAvatar"
import { Control } from "./Control"
import { Icon } from "./Icon"
import { RightPanelNavMenu } from "./RightPanelNavMenu"

/** Figma Chat Title `5893:38592` — UI/System (Chip Text Variable, 13 / 16, –0.13px tracking). */
const LABEL_STYLE = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
  color: "var(--foreground-primary)",
}

function selectedHrefFromLocation(location) {
  return `${location.pathname}${location.search}`
}

/**
 * Chat column title row — `h-[56px]` to match record topbar rows (`px-[12px]`, `py-[14px]`).
 * Group chats use `ChatAvatar` + member count (nav parity); person DMs use initials; Computer uses `Icon`.
 */
export function ChatHeader({
  title = "Build team chat",
  iconName = "chat",
  avatarInitial = null,
  memberCount = null,
  relatedLinks = [],
  canvasPanelOpen = false,
  onToggleCanvasPanel,
  showCanvasToggle = false,
  navMenuEnabled = false,
  onNavigate,
  teamId,
  projectId,
  project,
  activeTeam,
  showProjectSection = true,
}) {
  const location = useLocation()
  const [navMenuOpen, setNavMenuOpen] = useState(false)
  const navTriggerRef = useRef(null)
  const navMenuRef = useRef(null)
  const selectedHref = selectedHrefFromLocation(location)

  useEffect(() => {
    if (!navMenuOpen) return undefined
    const onPointerDown = (event) => {
      const target = event.target
      if (navTriggerRef.current?.contains(target) || navMenuRef.current?.contains(target)) return
      setNavMenuOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [navMenuOpen])

  useEffect(() => {
    if (navMenuEnabled) return undefined
    const id = window.requestAnimationFrame(() => setNavMenuOpen(false))
    return () => window.cancelAnimationFrame(id)
  }, [navMenuEnabled])

  const leadingVisual =
    avatarInitial != null ? (
      <ChatAvatar initial={avatarInitial} />
    ) : memberCount != null ? (
      <ChatAvatar memberCount={memberCount} />
    ) : (
      <Icon name={iconName} />
    )

  return (
    <header className="flex h-[56px] w-full min-w-0 shrink-0 items-center gap-px px-[12px] py-[14px]">
      <div className="flex h-[28px] min-w-0 flex-1 items-center rounded-[2px] bg-white pr-[6px]">
        <div className="inline-flex h-[28px] min-w-0 max-w-full items-center rounded-[2px] bg-[var(--background-primary-subtle)] pr-[10px] transition-colors duration-150 hover:bg-[var(--control-bg-hover)]">
          {navMenuEnabled ? (
            <button
              ref={navTriggerRef}
              type="button"
              className="inline-flex shrink-0 items-center justify-center rounded-[2px] bg-transparent p-0 transition-colors duration-150 hover:bg-[var(--control-bg-hover)]"
              aria-label="Open navigation menu"
              aria-haspopup="menu"
              aria-expanded={navMenuOpen}
              onClick={() => setNavMenuOpen((value) => !value)}
            >
              {leadingVisual}
            </button>
          ) : (
            leadingVisual
          )}
          <div className="flex min-w-0 items-center py-[6px]">
            <span className="min-w-0 truncate" style={LABEL_STYLE}>
              {title}
            </span>
          </div>
        </div>
      </div>
      {showCanvasToggle ? (
        <Control
          type="iconOnly"
          leadingIcon="more"
          label=""
          aria-label={canvasPanelOpen ? "Hide CANVAS panel" : "Show CANVAS panel"}
          aria-pressed={canvasPanelOpen}
          onClick={onToggleCanvasPanel}
        />
      ) : null}
      <RightPanelNavMenu
        open={navMenuOpen}
        anchorRef={navTriggerRef}
        menuRef={navMenuRef}
        teamId={teamId}
        activeTeam={activeTeam}
        projectId={projectId}
        project={project}
        selectedHref={selectedHref}
        showProjectSection={showProjectSection}
        onClose={() => setNavMenuOpen(false)}
        onNavigate={onNavigate}
      />
    </header>
  )
}
