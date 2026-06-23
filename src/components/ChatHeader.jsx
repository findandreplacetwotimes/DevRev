import { createPortal } from "react-dom"
import { useEffect, useId, useRef, useState } from "react"
import { ChatAvatar } from "./ChatAvatar"
import {
  CHAT_ACTIONS_MENU_ROW_GAP_PX,
  ChatActionsMenuItems,
  measureChatActionsMenuHeight,
} from "./ChatActionsMenu"
import { Control } from "./Control"
import { Icon } from "./Icon"
import { NewChatTitleRow } from "./NewChatTitleRow"

const MODAL_SHADOW =
  "0px 6px 13px rgba(0,0,0,0.10), 0px 23px 23px rgba(0,0,0,0.09), 0px 52px 31px rgba(0,0,0,0.05), 0px 92px 37px rgba(0,0,0,0.01), 0px 144px 40px rgba(0,0,0,0)"
const MENU_WIDTH_PX = 202
const EDGE_GUTTER_PX = 8

/** Figma Chat Title `5893:38592` — UI/System (Chip Text Variable, 13 / 16, –0.13px tracking). */
const LABEL_STYLE = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
  color: "var(--foreground-primary)",
}

/**
 * Chat column title row — Figma component set `6228:12018`.
 * `mode="default"` — team / person / group / computer.
 * `mode="newChat"` — draft people picker via `NewChatTitleRow`.
 */
export function ChatHeader({
  mode = "default",
  title = "Build team",
  iconName = "chat",
  avatarInitial = null,
  memberCount = null,
  relatedLinks = [],
  hasPanelContent = false,
  tabsSideOpen = false,
  onToggleTabsSide,
  hideLinksPanelControl = false,
  participants = [],
  onParticipantsChange,
  onConfirm,
  navItemId = null,
  onArchiveChat,
  onBranchChat,
  onSelectRelatedChat,
  relatedChats = [],
  currentChatId = null,
  showChatActionsMenu = false,
  showBranch = false,
  showArchive = false,
}) {
  const actionsMenuId = useId()
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false)
  const [actionsMenuStyle, setActionsMenuStyle] = useState({ top: 0, left: 0 })
  const titleRef = useRef(null)
  const actionsMenuRef = useRef(null)
  const actionsMenuOpenedAtRef = useRef(0)
  const hasRelatedLinks = hasPanelContent || relatedLinks.length > 0
  const canOpenActionsMenu = showChatActionsMenu

  useEffect(() => {
    if (!actionsMenuOpen) return undefined
    const onPointerDown = (event) => {
      if (Date.now() - actionsMenuOpenedAtRef.current < 250) return
      const target = event.target
      if (titleRef.current?.contains(target) || actionsMenuRef.current?.contains(target)) return
      setActionsMenuOpen(false)
    }
    const onKey = (event) => {
      if (event.key === "Escape") setActionsMenuOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown, true)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true)
      document.removeEventListener("keydown", onKey)
    }
  }, [actionsMenuOpen])

  const openActionsMenu = (event) => {
    if (!canOpenActionsMenu) return
    const rect = event.currentTarget.getBoundingClientRect()
    const viewportW = window.innerWidth
    const viewportH = window.innerHeight
    const menuHeight = measureChatActionsMenuHeight({
      showBranch,
      showArchive,
      relatedChats,
    })
    let top = Math.round(rect.bottom + 2)
    if (top + menuHeight > viewportH - EDGE_GUTTER_PX) {
      top = Math.round(rect.top - menuHeight - 2)
    }
    top = Math.max(EDGE_GUTTER_PX, Math.min(top, viewportH - menuHeight - EDGE_GUTTER_PX))
    let left = Math.round(rect.left)
    left = Math.max(EDGE_GUTTER_PX, Math.min(left, viewportW - MENU_WIDTH_PX - EDGE_GUTTER_PX))
    actionsMenuOpenedAtRef.current = Date.now()
    setActionsMenuStyle({ top, left })
    setActionsMenuOpen(true)
  }

  const closeActionsMenu = () => setActionsMenuOpen(false)

  if (mode === "newChat") {
    return (
      <NewChatTitleRow
        participants={participants}
        onParticipantsChange={onParticipantsChange}
        onConfirm={onConfirm}
      />
    )
  }

  return (
    <header className="flex h-[56px] w-full min-w-0 shrink-0 items-center gap-px px-[12px] py-[14px]">
      <div className="flex h-[28px] min-w-0 flex-1 items-center rounded-[2px] bg-white pr-[6px]">
        {canOpenActionsMenu ? (
          <button
            ref={titleRef}
            type="button"
            className="inline-flex h-[28px] min-w-0 max-w-full items-center rounded-[2px] border-0 bg-[var(--background-primary-subtle)] pr-[10px] text-left transition-colors duration-150 hover:bg-[var(--control-bg-hover)]"
            onClick={openActionsMenu}
            aria-haspopup="menu"
            aria-expanded={actionsMenuOpen}
            aria-controls={actionsMenuOpen ? `${actionsMenuId}-menu` : undefined}
          >
            {memberCount != null ? (
              <ChatAvatar count={memberCount} />
            ) : avatarInitial != null ? (
              <ChatAvatar initial={avatarInitial} />
            ) : (
              <Icon name={iconName} />
            )}
            <div className="flex min-w-0 items-center py-[6px]">
              <span className="min-w-0 truncate" style={LABEL_STYLE}>
                {title}
              </span>
            </div>
          </button>
        ) : (
          <span
            ref={titleRef}
            className="inline-flex h-[28px] min-w-0 max-w-full items-center rounded-[2px] bg-[var(--background-primary-subtle)] pr-[10px]"
          >
            {memberCount != null ? (
              <ChatAvatar count={memberCount} />
            ) : avatarInitial != null ? (
              <ChatAvatar initial={avatarInitial} />
            ) : (
              <Icon name={iconName} />
            )}
            <div className="flex min-w-0 items-center py-[6px]">
              <span className="min-w-0 truncate" style={LABEL_STYLE}>
                {title}
              </span>
            </div>
          </span>
        )}
      </div>
      {hideLinksPanelControl ? null : (
        <Control
          type="iconOnly"
          leadingIcon="sidePanel"
          label=""
          state="rest"
          aria-label={tabsSideOpen ? "Close tabs" : "Open tabs"}
          aria-expanded={tabsSideOpen}
          disabled={!hasRelatedLinks}
          onClick={() => {
            if (hasRelatedLinks) onToggleTabsSide?.()
          }}
        />
      )}

      {actionsMenuOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={actionsMenuRef}
              id={`${actionsMenuId}-menu`}
              role="menu"
              aria-label="Chat actions"
              className="fixed z-[2147483646] inline-flex w-[202px] flex-col items-start rounded-[2px] bg-white p-[6px]"
              style={{
                boxShadow: MODAL_SHADOW,
                top: `${actionsMenuStyle.top}px`,
                left: `${actionsMenuStyle.left}px`,
                gap: `${CHAT_ACTIONS_MENU_ROW_GAP_PX}px`,
              }}
            >
              <ChatActionsMenuItems
                onBranch={() => {
                  onBranchChat?.()
                  closeActionsMenu()
                }}
                onArchive={() => {
                  onArchiveChat?.(navItemId)
                  closeActionsMenu()
                }}
                onSelectRelatedChat={(chatId) => {
                  onSelectRelatedChat?.(chatId)
                  closeActionsMenu()
                }}
                relatedChats={relatedChats}
                currentChatId={currentChatId ?? navItemId}
                showBranch={showBranch}
                showArchive={showArchive}
              />
            </div>,
            document.body
          )
        : null}
    </header>
  )
}
