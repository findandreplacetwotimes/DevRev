import { ChatAvatar } from "./ChatAvatar"
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
 * Chat column title row (Figma `5893:38592` Chat Title — 56px rail, leading pictogram + label).
 * Person DMs use grey `ChatAvatar`; build / computer / project chat use `Icon` (`project` = Figma `6044:7714`).
 */
export function ChatHeader({ title = "Build chat", iconName = "chat", avatarInitial = null }) {
  return (
    <header className="flex h-[56px] w-full min-w-0 shrink-0 items-center px-[12px] py-[14px]">
      {avatarInitial != null ? <ChatAvatar initial={avatarInitial} /> : <Icon name={iconName} />}
      <div className="flex min-w-0 flex-1 items-center py-[6px]">
        <span className="min-w-0 truncate" style={LABEL_STYLE}>
          {title}
        </span>
      </div>
    </header>
  )
}
