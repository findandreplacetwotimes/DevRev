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

const AVATAR_COLORS = ["#5c3d2e", "#6b7c3a", "#2d4a3e", "#7a4a2a", "#3d5c6b"]

function AvatarStack({ members = [] }) {
  if (!members.length) return null
  return (
    <div className="flex shrink-0 items-center">
      {members.slice(0, 4).map((member, i) => (
        <span
          key={member.initial}
          className="relative inline-flex size-[24px] items-center justify-center rounded-full border-[2px] border-white"
          style={{
            backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
            marginLeft: i > 0 ? "-8px" : "0",
            zIndex: members.length - i,
          }}
        >
          <span
            className="text-[9px] font-medium text-white"
            style={{ fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif', fontVariationSettings: '"wght" 520' }}
          >
            {member.initial}
          </span>
        </span>
      ))}
    </div>
  )
}

/**
 * Chat column title row (Figma `5893:38592` Chat Title — 56px rail, leading pictogram + label).
 * Person / project lanes use the same grey chip avatar as `NavPanel` CHATS; build + Computer use icons.
 */
export function ChatHeader({ title = "Build chat", iconName = "chat", avatarInitial = null, members = [] }) {
  return (
    <header className="flex h-[56px] w-full min-w-0 shrink-0 items-center px-[12px] py-[14px]">
      {avatarInitial != null ? <ChatAvatar initial={avatarInitial} /> : <Icon name={iconName} />}
      <div className="flex min-w-0 flex-1 items-center py-[6px]">
        <span className="min-w-0 truncate" style={LABEL_STYLE}>
          {title}
        </span>
      </div>
      <AvatarStack members={members} />
    </header>
  )
}
