export function MinimizedChatTabs({ minimizedChats, onRestore, onClose }) {
  if (minimizedChats.length === 0) return null

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        display: "flex",
        gap: "12px",
        zIndex: 999,
      }}
    >
      {minimizedChats.map((chat) => {
        const participantNames = chat.participants
          .filter((p) => p !== "computer")
          .map((p) => (p === "user" ? "You" : p))
          .join(", ")
        const title = chat.participants.includes("computer") && chat.participants.length === 2
          ? "Computer"
          : participantNames || "New Chat"

        return (
          <div
            key={chat.id}
            style={{
              width: "280px",
              height: "56px",
              borderRadius: "12px",
              backdropFilter: "blur(20px) saturate(180%)",
              background: "rgba(18, 18, 18, 0.85)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
              display: "flex",
              alignItems: "center",
              padding: "12px 16px",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onClick={() => onRestore(chat.id)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(28, 28, 28, 0.9)"
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(18, 18, 18, 0.85)"
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "hsl(259 94% 44%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
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
                marginLeft: "12px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "rgba(255, 255, 255, 0.95)",
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
                    color: "rgba(255, 255, 255, 0.5)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {chat.messages[chat.messages.length - 1].text}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onClose(chat.id)
              }}
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "rgba(255, 255, 255, 0.5)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                transition: "all 0.15s",
                flexShrink: 0,
                marginLeft: "8px",
              }}
              onMouseEnter={(e) => {
                e.stopPropagation()
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.9)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)"
              }}
            >
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}
