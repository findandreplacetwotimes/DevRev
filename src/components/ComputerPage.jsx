import { useEffect, useRef, useState } from "react"
import { useChats } from "../context/IssuesContext"
import { callAI } from "../lib/aiClient"
import { InvitePanel } from "./InvitePanel"

export function ComputerPage() {
  const { chats, patchChat, setChats } = useChats()
  const [activeChat, setActiveChat] = useState(null)
  const [inputValue, setInputValue] = useState("")
  const [isComputerTyping, setIsComputerTyping] = useState(false)
  const [rightPanel, setRightPanel] = useState("canvas") // "canvas" | "invite"
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const hasGreetedRef = useRef(false)

  // Find or create a Computer-only chat for this experience
  useEffect(() => {
    if (!chats) return

    // Look for existing Computer-only chat
    const computerChat = chats.find(
      (c) => c.participants.includes("computer") && c.participants.length === 2
    )

    if (computerChat) {
      setActiveChat(computerChat)

      // Send proactive greeting if chat is empty
      if (computerChat.messages.length === 0 && !hasGreetedRef.current) {
        hasGreetedRef.current = true
        setTimeout(() => {
          const greetingMessage = {
            id: `msg-${Date.now()}-greeting`,
            senderId: "computer",
            text: "Hi! I'm Computer. I can help you brainstorm ideas, create artifacts, and collaborate on projects. What are you thinking about today?",
            timestamp: Date.now(),
          }
          patchChat(computerChat.id, {
            messages: [greetingMessage],
            lastActivity: Date.now(),
          })
        }, 500)
      }
    } else {
      // Create new Computer chat
      const newChatId = `chat-computer-${Date.now()}`
      const newChat = {
        id: newChatId,
        participants: ["computer", "user"],
        messages: [],
        files: [],
        createdAt: Date.now(),
        lastActivity: Date.now(),
        projectId: null,
        title: "Computer",
      }
      setChats((prev) => {
        if (!prev) return [newChat]
        return [...prev, newChat]
      })
      setActiveChat(newChat)

      // Send proactive greeting
      if (!hasGreetedRef.current) {
        hasGreetedRef.current = true
        setTimeout(() => {
          const greetingMessage = {
            id: `msg-${Date.now()}-greeting`,
            senderId: "computer",
            text: "Hi! I'm Computer. I can help you brainstorm ideas, create artifacts, and collaborate on projects. What are you thinking about today?",
            timestamp: Date.now(),
          }
          patchChat(newChatId, {
            messages: [greetingMessage],
            lastActivity: Date.now(),
          })
        }, 500)
      }
    }
  }, [chats, patchChat, setChats])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeChat?.messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !activeChat) return

    const userMessage = {
      id: `msg-${Date.now()}`,
      senderId: "user",
      text: inputValue.trim(),
      timestamp: Date.now(),
    }

    // Add user message
    patchChat(activeChat.id, {
      messages: [...activeChat.messages, userMessage],
      lastActivity: Date.now(),
    })

    setInputValue("")

    // Computer responds
    setIsComputerTyping(true)
    try {
      const conversationHistory = [...activeChat.messages, userMessage].map((msg) => ({
        role: msg.senderId === "user" ? "user" : "assistant",
        content: msg.text,
      }))

      const response = await callAI(conversationHistory, "computer")

      const computerMessage = {
        id: `msg-${Date.now()}-computer`,
        senderId: "computer",
        text: response,
        timestamp: Date.now(),
      }

      patchChat(activeChat.id, {
        messages: [...activeChat.messages, userMessage, computerMessage],
        lastActivity: Date.now(),
      })
    } catch (error) {
      console.error("Computer response failed:", error)
    } finally {
      setIsComputerTyping(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleConvertToProject = () => {
    // TODO: Implement convert to project
    console.log("Convert to project clicked")
  }

  if (!activeChat) {
    return (
      <div className="arcade-empty">
        <div className="arcade-empty__icon">⏳</div>
        <div className="arcade-empty__description">Loading...</div>
      </div>
    )
  }

  return (
    <div
      className="flex h-screen w-full"
      style={{
        fontFamily: "var(--font-text)",
        background: "hsl(var(--bg-layer-00))",
      }}
    >
      {/* Minimal Left Sidebar */}
      <ComputerSidebar activeChat={activeChat} />

      {/* Middle Panel - Chat */}
      <div
        className="flex flex-col"
        style={{
          width: "500px",
          height: "100%",
          borderRight: "1px solid hsl(var(--border-outline-01))",
          background: "hsl(var(--bg-layer-01))",
        }}
      >
        {/* Chat Header */}
        <div
          style={{
            padding: "var(--spacing-global-base) var(--spacing-global-lg)",
            borderBottom: "1px solid hsl(var(--border-outline-01))",
            background: "hsl(var(--bg-layer-01))",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-global-sm)" }}>
            <ComputerLogo size={36} />
            <div>
              <div className="text-body-small-medium" style={{ color: "hsl(var(--text-color-primary))" }}>
                Computer
              </div>
              <div className="text-caption" style={{ color: "hsl(var(--text-color-secondary))" }}>
                AI assistant
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            padding: "var(--spacing-global-lg)",
            background: "hsl(var(--bg-layer-00))",
          }}
        >
          {activeChat.messages.length === 0 ? (
            <div className="arcade-empty">
              <div className="arcade-empty__icon">💭</div>
              <div className="arcade-empty__description">Start a conversation with Computer</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-global-base)" }}>
              {activeChat.messages.map((msg) => {
                const isUser = msg.senderId === "user"

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isUser ? "flex-end" : "flex-start",
                      gap: "var(--spacing-global-4xs)",
                    }}
                  >
                    {!isUser && (
                      <div className="text-caption" style={{ color: "hsl(var(--text-color-tertiary))" }}>
                        Computer
                      </div>
                    )}
                    <div
                      className="text-system"
                      style={{
                        maxWidth: "85%",
                        padding: "var(--spacing-global-xs) var(--spacing-global-sm)",
                        borderRadius: "8px",
                        background: isUser
                          ? "hsl(var(--bg-interactive-primary-resting))"
                          : "hsl(var(--bg-layer-01))",
                        color: isUser ? "hsl(var(--text-interactive-primary-resting))" : "hsl(var(--text-color-primary))",
                        border: isUser ? "none" : "1px solid hsl(var(--border-outline-01))",
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                )
              })}
              {isComputerTyping && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "var(--spacing-global-4xs)",
                  }}
                >
                  <div className="text-caption" style={{ color: "hsl(var(--text-color-tertiary))" }}>
                    Computer
                  </div>
                  <div
                    className="text-system"
                    style={{
                      padding: "var(--spacing-global-xs) var(--spacing-global-sm)",
                      borderRadius: "8px",
                      background: "hsl(var(--bg-layer-01))",
                      border: "1px solid hsl(var(--border-outline-01))",
                      color: "hsl(var(--text-color-tertiary))",
                    }}
                  >
                    <span className="typing-indicator">●●●</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div
          style={{
            padding: "var(--spacing-global-base) var(--spacing-global-lg)",
            borderTop: "1px solid hsl(var(--border-outline-01))",
            display: "flex",
            gap: "var(--spacing-global-xs)",
            alignItems: "center",
            background: "hsl(var(--bg-layer-01))",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Send a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isComputerTyping}
            className="arcade-input"
            style={{ flex: 1 }}
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isComputerTyping}
            className="arcade-btn arcade-btn--primary"
            style={{
              width: "36px",
              height: "36px",
              minWidth: "36px",
              padding: "0",
              fontSize: "18px",
            }}
          >
            ↑
          </button>
        </div>
      </div>

      {/* Right Panel - Canvas or Invite */}
      <div className="flex-1 flex flex-col" style={{ background: "hsl(var(--bg-layer-01))" }}>
        {/* Right Panel Header */}
        <div
          style={{
            padding: "var(--spacing-global-base) var(--spacing-global-lg)",
            borderBottom: "1px solid hsl(var(--border-outline-01))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "hsl(var(--bg-layer-01))",
          }}
        >
          <div className="arcade-tabs">
            <button
              type="button"
              onClick={() => setRightPanel("canvas")}
              className={`arcade-tab ${rightPanel === "canvas" ? "arcade-tab--active" : ""}`}
            >
              Canvas
            </button>
            <button
              type="button"
              onClick={() => setRightPanel("invite")}
              className={`arcade-tab ${rightPanel === "invite" ? "arcade-tab--active" : ""}`}
            >
              Invite
            </button>
          </div>

          {/* Convert to Project button */}
          <button
            type="button"
            onClick={handleConvertToProject}
            className="arcade-btn arcade-btn--primary arcade-btn--M"
          >
            Convert to Project
          </button>
        </div>

        {/* Right Panel Content */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "var(--spacing-global-lg)" }}>
          {rightPanel === "canvas" ? (
            <CanvasPanel chat={activeChat} />
          ) : (
            <div style={{ maxWidth: "500px" }}>
              <InvitePanelFullPage chat={activeChat} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Computer logo component (two-bar logo)
function ComputerLogo({ size = 28 }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: "hsl(var(--intelligence-400))",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width={size * 0.4}
        height={size * 0.4}
        viewBox="0 0 10 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="2" y="1.5" width="1.5" height="7" rx="0.75" fill="white" />
        <rect x="6.5" y="1.5" width="1.5" height="7" rx="0.75" fill="white" />
      </svg>
    </div>
  )
}

// Canvas Panel - shows generated files
function CanvasPanel({ chat }) {
  const files = chat?.files || []

  if (files.length === 0) {
    return (
      <div className="arcade-empty">
        <div className="arcade-empty__icon">📄</div>
        <div className="arcade-empty__title">No artifacts yet</div>
        <div className="arcade-empty__description">
          Ask Computer to create documents, designs, or other artifacts. They'll appear here.
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-global-sm)" }}>
      {files.map((file) => (
        <div key={file.id} className="arcade-card">
          <div className="text-system-medium" style={{ color: "hsl(var(--text-color-primary))" }}>
            {file.name}
          </div>
          <div className="text-caption" style={{ color: "hsl(var(--text-color-secondary))" }}>
            {file.type}
          </div>
        </div>
      ))}
    </div>
  )
}

// Invite Panel for full-page view (wrapper around InvitePanel)
function InvitePanelFullPage({ chat }) {
  return (
    <div>
      <div className="text-body-small-medium" style={{ color: "hsl(var(--text-color-primary))", marginBottom: "var(--spacing-global-base)" }}>
        Invite people to collaborate
      </div>
      <InvitePanel chat={chat} isFullPage />
    </div>
  )
}

// Minimal sidebar for Computer page using Arcade design system
function ComputerSidebar({ activeChat }) {
  const { chats } = useChats()
  const [showMore, setShowMore] = useState(false)

  const lobbySections = [
    { label: "Lobby: Teams & Spaces" },
    { label: "Lobby: Build" },
  ]

  const chatItems = chats?.filter((c) => c.id !== activeChat?.id) || []
  const visibleChats = showMore ? chatItems : chatItems.slice(0, 5)

  return (
    <div
      className="arcade-sidebar"
      style={{
        width: "220px",
        background: "hsl(var(--bg-layer-01))",
        borderRight: "1px solid hsl(var(--border-outline-01))",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "var(--spacing-global-xs) var(--spacing-global-sm)",
          borderBottom: "1px solid hsl(var(--border-outline-01))",
          display: "flex",
          alignItems: "center",
          gap: "var(--spacing-global-4xs)",
        }}
      >
        <button
          type="button"
          className="arcade-btn arcade-btn--tertiary arcade-btn--S"
          title="Collapse sidebar"
          style={{
            minWidth: "28px",
            width: "28px",
            height: "28px",
            padding: "0",
            fontSize: "14px",
          }}
        >
          ☰
        </button>
        <button
          type="button"
          className="arcade-btn arcade-btn--tertiary arcade-btn--S"
          title="New Chat"
          style={{
            flex: 1,
            fontSize: "var(--fontSize-caption)",
            fontWeight: "440",
          }}
        >
          New Chat
        </button>
        <button
          type="button"
          className="arcade-btn arcade-btn--tertiary arcade-btn--S"
          title="Close"
          style={{
            minWidth: "28px",
            width: "28px",
            height: "28px",
            padding: "0",
            fontSize: "16px",
          }}
        >
          ×
        </button>
      </div>

      {/* Lobby Sections */}
      <div
        style={{
          padding: "var(--spacing-global-xs) var(--spacing-global-sm)",
          borderBottom: "1px solid hsl(var(--border-outline-01))",
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-global-5xs)",
        }}
      >
        {lobbySections.map((section, idx) => (
          <button
            key={idx}
            type="button"
            className="arcade-menu-item text-caption"
            style={{
              padding: "var(--spacing-global-3xs) var(--spacing-global-xs)",
              fontWeight: "440",
              justifyContent: "flex-start",
            }}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Chat List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "var(--spacing-global-xs) var(--spacing-global-sm)" }}>
        <div className="arcade-sidebar__section-title" style={{ padding: "var(--spacing-global-3xs) 0" }}>
          Chat
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-global-5xs)" }}>
          {visibleChats.map((chat) => {
            const participantNames = chat.participants
              .filter((p) => p !== "computer" && p !== "user")
              .join(", ")
            const label = chat.title || (chat.participants.includes("computer") ? "Computer" : participantNames)
            const lastMsg = chat.messages[chat.messages.length - 1]

            return (
              <button
                key={chat.id}
                type="button"
                className="arcade-menu-item"
                style={{
                  padding: "var(--spacing-global-3xs)",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "var(--spacing-global-5xs)",
                }}
              >
                <div className="text-caption-medium" style={{ width: "100%", textAlign: "left" }}>
                  {label}
                </div>
                {lastMsg && (
                  <div
                    className="text-caption"
                    style={{
                      color: "hsl(var(--text-color-tertiary))",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    {lastMsg.text}
                  </div>
                )}
              </button>
            )
          })}
        </div>
        {chatItems.length > 5 && (
          <button
            type="button"
            className="arcade-btn arcade-btn--tertiary arcade-btn--S"
            onClick={() => setShowMore(!showMore)}
            style={{
              width: "100%",
              marginTop: "var(--spacing-global-4xs)",
              fontSize: "var(--fontSize-caption)",
              fontWeight: "440",
            }}
          >
            {showMore ? "Show less" : `... More`}
          </button>
        )}
      </div>

      {/* Bottom User Profile */}
      <div
        style={{
          padding: "var(--spacing-global-xs) var(--spacing-global-sm)",
          borderTop: "1px solid hsl(var(--border-outline-01))",
          display: "flex",
          alignItems: "center",
          gap: "var(--spacing-global-xs)",
        }}
      >
        <div className="arcade-avatar arcade-avatar--M" style={{ background: "hsl(var(--intelligence-400))" }}>
          P
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="text-caption-medium" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Prithvi Sharma
          </div>
          <div className="text-caption" style={{ color: "hsl(var(--text-color-tertiary))" }}>
            DevRev
          </div>
        </div>
      </div>
    </div>
  )
}
