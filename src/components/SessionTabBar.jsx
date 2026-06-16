import { navIconForNavItemId } from "../lib/navDestinations"
import { isSplitSession, sessionTabIcons, sessionTabLabel } from "../lib/workspaceSessions"
import { ChatAvatar } from "./ChatAvatar"
import { Icon } from "./Icon"
import { SessionTabAddControl } from "./SessionTabAddControl"
import { TabItem } from "./TabItem"

function iconLeading(icon) {
  if (!icon) return null
  if (icon.type === "avatar") return <ChatAvatar initial={icon.initial} />
  return <Icon name={icon.iconName} />
}

export function SessionTabBar({
  sessions,
  activeSessionId,
  onSelectSession,
  onCloseSession,
  onAddSession,
  onAddSplitSession,
  className = "",
}) {
  return (
    <div
      className={`flex h-[44px] w-full shrink-0 items-center justify-between overflow-hidden border-b border-[#ececec] bg-[var(--control-bg-rest)] pr-[14px] ${className}`}
      role="tablist"
      aria-label="Workspace sessions"
    >
      <div className="flex h-full min-w-0 items-stretch overflow-x-auto">
        {sessions.map((session) => {
          const split = isSplitSession(session)
          const icons = split ? sessionTabIcons(session) : null
          const primaryIcon = split ? icons?.left : navIconForNavItemId(session.selectedNavItemId)

          return (
            <TabItem
              key={session.id}
              type={session.id === activeSessionId ? "selected" : "nonSelected"}
              label={split ? undefined : sessionTabLabel(session)}
              iconName={primaryIcon?.type === "icon" ? primaryIcon.iconName : undefined}
              leading={iconLeading(primaryIcon)}
              split={split}
              secondaryLeading={split ? iconLeading(icons?.right) : null}
              closable={sessions.length > 1}
              onSelect={() => onSelectSession?.(session.id)}
              onClose={() => onCloseSession?.(session.id)}
            />
          )
        })}
      </div>
      <SessionTabAddControl onAddSession={onAddSession} onAddSplitSession={onAddSplitSession} />
    </div>
  )
}
