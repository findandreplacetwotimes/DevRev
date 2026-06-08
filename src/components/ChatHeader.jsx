import { useEffect, useRef, useState } from "react"
import { ChatAvatar } from "./ChatAvatar"
import { ChatRelatedLinksMenu } from "./ChatRelatedLinksMenu"
import { Control } from "./Control"
import { Icon } from "./Icon"

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
 * Chat column title row — `h-[56px]` to match record topbar rows (`px-[12px]`, `py-[14px]`).
 * Person DMs use grey `ChatAvatar`; build / computer / project chat use `Icon` (`project` = Figma `6044:7714`).
 */
export function ChatHeader({
  title = "Build team chat",
  iconName = "chat",
  avatarInitial = null,
  relatedLinks = [],
  pagesLabel = "PAGES",
  onSelectRelatedLink,
  hideRelatedLinksControl = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const hasRelatedLinks = relatedLinks.length > 0

  useEffect(() => {
    if (!menuOpen) return undefined
    const onPointerDown = (event) => {
      const target = event.target
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setMenuOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [menuOpen])

  useEffect(() => {
    if (!hideRelatedLinksControl) return undefined
    const id = window.requestAnimationFrame(() => setMenuOpen(false))
    return () => window.cancelAnimationFrame(id)
  }, [hideRelatedLinksControl])

  return (
    <header className="flex h-[56px] w-full min-w-0 shrink-0 items-center gap-px px-[12px] py-[14px]">
      <div className="flex h-[28px] min-w-0 flex-1 items-center rounded-[2px] bg-white pr-[6px]">
        <div className="inline-flex h-[28px] min-w-0 max-w-full items-center rounded-[2px] bg-[var(--background-primary-subtle)] pr-[10px] transition-colors duration-150 hover:bg-[var(--control-bg-hover)]">
          {avatarInitial != null ? <ChatAvatar initial={avatarInitial} /> : <Icon name={iconName} />}
          <div className="flex min-w-0 items-center py-[6px]">
            <span className="min-w-0 truncate" style={LABEL_STYLE}>
              {title}
            </span>
          </div>
        </div>
      </div>
      {hideRelatedLinksControl ? null : (
        <>
          <span ref={triggerRef} className="inline-flex">
            <Control
              type="iconOnly"
              leadingIcon="more"
              label=""
              aria-label="More chat actions"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              disabled={!hasRelatedLinks}
              onClick={() => {
                if (hasRelatedLinks) setMenuOpen((value) => !value)
              }}
            />
          </span>
          <ChatRelatedLinksMenu
            open={menuOpen}
            anchorRef={triggerRef}
            menuRef={menuRef}
            links={relatedLinks}
            pagesLabel={pagesLabel}
            onClose={() => setMenuOpen(false)}
            onSelect={onSelectRelatedLink}
          />
        </>
      )}
    </header>
  )
}
