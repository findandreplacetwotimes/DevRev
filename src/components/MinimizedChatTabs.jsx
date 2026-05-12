import { Control } from "./Control"

export function MinimizedChatTabs({ minimizedChats, onRestore, onClose }) {
  if (minimizedChats.length === 0) return null

  return (
    <div
      style={{
        position: "fixed",
        bottom: "12px",
        right: "12px",
        display: "flex",
        gap: "8px",
        zIndex: 1001,
        fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {minimizedChats.map((chat) => {
        const participantNames = chat.participants
          .filter((p) => p !== "computer" && p !== "user")
          .join(", ")
        const title = chat.participants.includes("computer") && chat.participants.length === 2
          ? "Computer"
          : participantNames || "New Chat"

        return (
          <div
            key={chat.id}
            className="group"
            style={{
              width: "280px",
              minHeight: "56px",
              borderRadius: "8px",
              background: "white",
              border: "1px solid #ececec",
              boxShadow: "0px 6px 13px rgba(0,0,0,0.10), 0px 23px 23px rgba(0,0,0,0.09)",
              display: "flex",
              alignItems: "center",
              padding: "12px",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onClick={() => onRestore(chat.id)}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "hsl(259 94% 44%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "600",
                color: "white",
                flexShrink: 0,
              }}
            >
              {chat.participants.includes("computer") ? "C" : title[0]}
            </div>
            <div
              style={{
                flex: 1,
                marginLeft: "10px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  lineHeight: "16px",
                  letterSpacing: "-0.13px",
                  fontVariationSettings: '"wght" 520',
                  color: "var(--foreground-primary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {title}
              </div>
              {chat.messages.length > 0 && (
                <div
                  style={{
                    fontSize: "12px",
                    lineHeight: "15px",
                    fontVariationSettings: '"wght" 450',
                    color: "var(--foreground-secondary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {chat.messages[chat.messages.length - 1].text}
                </div>
              )}
            </div>
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ marginLeft: "8px" }}
            >
              <Control
                type="iconOnly"
                leadingIcon="close"
                label=""
                onClick={() => onClose(chat.id)}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
