import { relatedChatToNavItem } from "../lib/relatedChats"
import { ChatAvatar } from "./ChatAvatar"
import { MenuItem } from "./MenuItem"
import { NavItem } from "./NavItem"

/** Figma `6234:11748` — modal menu padding + 4px row gap. */
export const CHAT_ACTIONS_MENU_INSET_PX = 6
export const CHAT_ACTIONS_MENU_PADDING_PX = CHAT_ACTIONS_MENU_INSET_PX * 2
export const CHAT_ACTIONS_MENU_ROW_GAP_PX = 4
export const CHAT_ACTIONS_MENU_ROW_HEIGHT_PX = 28

/**
 * @param {{ showBranch?: boolean, showArchive?: boolean, relatedChats?: object[] }} options
 */
export function measureChatActionsMenuHeight({ showBranch = false, showArchive = false, relatedChats = [] } = {}) {
  const rowCount =
    (showBranch ? 1 : 0) +
    (showArchive ? 1 : 0) +
    (relatedChats.length > 1 ? 1 + relatedChats.length : 0)
  if (rowCount === 0) return CHAT_ACTIONS_MENU_PADDING_PX
  const gaps = Math.max(0, rowCount - 1) * CHAT_ACTIONS_MENU_ROW_GAP_PX
  return CHAT_ACTIONS_MENU_PADDING_PX + rowCount * CHAT_ACTIONS_MENU_ROW_HEIGHT_PX + gaps
}

/** Branch, Archive, then RELATED CHATS family rows — shared by chat title and nav context menus. */
export function ChatActionsMenuItems({
  onBranch,
  onArchive,
  onSelectRelatedChat,
  relatedChats = [],
  currentChatId = null,
  showBranch = true,
  showArchive = true,
}) {
  const showRelatedSection = relatedChats.length > 1

  return (
    <>
      {showBranch ? (
        <button type="button" className="w-full text-left" onClick={onBranch}>
          <MenuItem type="textOnly" state="rest" label="Branch new chat" fullWidth />
        </button>
      ) : null}
      {showArchive ? (
        <button type="button" className="w-full text-left" onClick={onArchive}>
          <MenuItem type="textOnly" state="rest" label="Archive" fullWidth />
        </button>
      ) : null}
      {showRelatedSection ? (
        <>
          <MenuItem type="label" state="rest" label="Related chats" />
          {relatedChats.map((chat) => {
            const navItem = relatedChatToNavItem(chat)
            const leading =
              navItem.memberCount != null ? (
                <ChatAvatar count={navItem.memberCount} />
              ) : navItem.initial != null ? (
                <ChatAvatar initial={navItem.initial} />
              ) : null
            return (
              <NavItem
                key={chat.id}
                label={navItem.label}
                iconName={navItem.iconName ?? "chat"}
                leading={leading}
                className="w-full"
                selected={currentChatId === chat.id}
                onClick={() => onSelectRelatedChat?.(chat.id)}
              />
            )
          })}
        </>
      ) : null}
    </>
  )
}
