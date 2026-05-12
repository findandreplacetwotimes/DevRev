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
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">⏳</div>
          <div className="text-sm text-[var(--foreground-secondary)]">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex h-screen w-full"
      style={{
        fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
        background: "white",
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
          borderRight: "1px solid #ececec",
          background: "white",
        }}
      >
        {/* Chat Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #ececec",
            background: "white",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "hsl(259 94% 44%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: "600",
                color: "white",
              }}
            >
              C
            </div>
            <div>
              <div
                style={{
                  fontSize: "15px",
                  lineHeight: "18px",
                  letterSpacing: "-0.15px",
                  fontVariationSettings: '"wght" 540',
                  color: "var(--foreground-primary)",
                }}
              >
                Computer
              </div>
              <div
                style={{
                  fontSize: "12px",
                  lineHeight: "15px",
                  fontVariationSettings: '"wght" 450',
                  color: "var(--foreground-secondary)",
                }}
              >
                AI assistant
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            padding: "20px",
            background: "#fafafa",
          }}
        >
          {activeChat.messages.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>💭</div>
              <div
                style={{
                  fontSize: "15px",
                  lineHeight: "20px",
                  fontVariationSettings: '"wght" 460',
                  color: "var(--foreground-secondary)",
                }}
              >
                Start a conversation with Computer
              </div>
            </div>
          ) : (
            <div>
              {activeChat.messages.map((msg) => {
                const isUser = msg.senderId === "user"
                const isComputer = msg.senderId === "computer"
                const senderName = isUser ? "You" : "Computer"

                return (
                  <div
                    key={msg.id}
                    style={{
                      marginBottom: "16px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isUser ? "flex-end" : "flex-start",
                    }}
                  >
                    {!isUser && (
                      <div
                        style={{
                          fontSize: "11px",
                          lineHeight: "14px",
                          fontVariationSettings: '"wght" 460',
                          color: "var(--foreground-secondary)",
                          marginBottom: "6px",
                          marginLeft: "4px",
                        }}
                      >
                        {senderName}
                      </div>
                    )}
                    <div
                      style={{
                        maxWidth: "85%",
                        padding: "10px 14px",
                        borderRadius: "2px",
                        background: isUser ? "hsl(259 94% 44%)" : "white",
                        color: isUser ? "white" : "var(--foreground-primary)",
                        fontSize: "14px",
                        lineHeight: "20px",
                        letterSpacing: "-0.14px",
                        fontVariationSettings: '"wght" 460',
                        border: isUser ? "none" : "1px solid #ececec",
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
                    marginBottom: "16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      lineHeight: "14px",
                      fontVariationSettings: '"wght" 460',
                      color: "var(--foreground-secondary)",
                      marginBottom: "6px",
                      marginLeft: "4px",
                    }}
                  >
                    Computer
                  </div>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "2px",
                      background: "white",
                      border: "1px solid #ececec",
                      color: "var(--foreground-secondary)",
                      fontSize: "14px",
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
            padding: "16px 20px",
            borderTop: "1px solid #ececec",
            display: "flex",
            gap: "10px",
            alignItems: "center",
            background: "white",
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
            className="flex-1 px-[12px] py-[8px] rounded-[2px] bg-[var(--background-primary-subtle)] border border-transparent outline-none hover:bg-[var(--control-bg-hover)] transition-colors duration-150"
            style={{
              fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: "14px",
              lineHeight: "18px",
              letterSpacing: "-0.14px",
              fontVariationSettings: '"wght" 460',
              color: "var(--foreground-primary)",
            }}
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isComputerTyping}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "6px",
              background:
                inputValue.trim() && !isComputerTyping
                  ? "hsl(259 94% 44%)"
                  : "rgba(0, 0, 0, 0.03)",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              color:
                inputValue.trim() && !isComputerTyping ? "white" : "var(--foreground-secondary)",
              cursor: inputValue.trim() && !isComputerTyping ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: "600",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              if (inputValue.trim() && !isComputerTyping) {
                e.currentTarget.style.background = "hsl(259 94% 50%)"
              }
            }}
            onMouseLeave={(e) => {
              if (inputValue.trim() && !isComputerTyping) {
                e.currentTarget.style.background = "hsl(259 94% 44%)"
              }
            }}
          >
            ↑
          </button>
        </div>
      </div>

      {/* Right Panel - Canvas or Invite */}
      <div className="flex-1 flex flex-col" style={{ background: "white" }}>
        {/* Right Panel Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #ececec",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "white",
          }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => setRightPanel("canvas")}
              style={{
                padding: "6px 12px",
                borderRadius: "2px",
                background: rightPanel === "canvas" ? "hsl(259 94% 44%)" : "transparent",
                color: rightPanel === "canvas" ? "white" : "var(--foreground-primary)",
                border: rightPanel === "canvas" ? "none" : "1px solid #ececec",
                fontSize: "13px",
                lineHeight: "16px",
                fontVariationSettings: '"wght" 480',
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (rightPanel !== "canvas") {
                  e.currentTarget.style.background = "var(--control-bg-hover)"
                }
              }}
              onMouseLeave={(e) => {
                if (rightPanel !== "canvas") {
                  e.currentTarget.style.background = "transparent"
                }
              }}
            >
              Canvas
            </button>
            <button
              type="button"
              onClick={() => setRightPanel("invite")}
              style={{
                padding: "6px 12px",
                borderRadius: "2px",
                background: rightPanel === "invite" ? "hsl(259 94% 44%)" : "transparent",
                color: rightPanel === "invite" ? "white" : "var(--foreground-primary)",
                border: rightPanel === "invite" ? "none" : "1px solid #ececec",
                fontSize: "13px",
                lineHeight: "16px",
                fontVariationSettings: '"wght" 480',
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (rightPanel !== "invite") {
                  e.currentTarget.style.background = "var(--control-bg-hover)"
                }
              }}
              onMouseLeave={(e) => {
                if (rightPanel !== "invite") {
                  e.currentTarget.style.background = "transparent"
                }
              }}
            >
              Invite
            </button>
          </div>

          {/* Convert to Project button */}
          <button
            type="button"
            onClick={handleConvertToProject}
            style={{
              padding: "6px 12px",
              borderRadius: "2px",
              background: "hsl(259 94% 44%)",
              color: "white",
              border: "none",
              fontSize: "13px",
              lineHeight: "16px",
              fontVariationSettings: '"wght" 500',
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "hsl(259 94% 50%)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "hsl(259 94% 44%)"
            }}
          >
            Convert to Project
          </button>
        </div>

        {/* Right Panel Content */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "20px" }}>
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

// Canvas Panel - shows generated files
function CanvasPanel({ chat }) {
  const files = chat?.files || []

  if (files.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>📄</div>
        <div
          style={{
            fontSize: "15px",
            lineHeight: "20px",
            fontVariationSettings: '"wght" 480',
            color: "var(--foreground-primary)",
            marginBottom: "8px",
          }}
        >
          No artifacts yet
        </div>
        <div
          style={{
            fontSize: "13px",
            lineHeight: "18px",
            fontVariationSettings: '"wght" 450',
            color: "var(--foreground-secondary)",
            maxWidth: "320px",
          }}
        >
          Ask Computer to create documents, designs, or other artifacts. They'll appear here.
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {files.map((file) => (
        <div
          key={file.id}
          style={{
            padding: "16px",
            borderRadius: "2px",
            border: "1px solid #ececec",
            background: "var(--background-primary-subtle)",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              lineHeight: "18px",
              fontVariationSettings: '"wght" 500',
              color: "var(--foreground-primary)",
              marginBottom: "4px",
            }}
          >
            {file.name}
          </div>
          <div
            style={{
              fontSize: "12px",
              lineHeight: "16px",
              fontVariationSettings: '"wght" 450',
              color: "var(--foreground-secondary)",
            }}
          >
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
      <div
        style={{
          fontSize: "15px",
          lineHeight: "20px",
          fontVariationSettings: '"wght" 520',
          color: "var(--foreground-primary)",
          marginBottom: "16px",
        }}
      >
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
    { label: "Lobby: Teams & Spaces", avatars: ["🏢", "👥"] },
    { label: "Lobby: Build", avatars: ["🔨", "⚙️"] },
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
            gap: "var(--spacing-global-5xs)",
          }}
        >
          <span style={{ fontSize: "14px" }}>💬</span> New Chat
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
            className="arcade-menu-item"
            style={{
              padding: "var(--spacing-global-3xs) var(--spacing-global-xs)",
              fontSize: "var(--fontSize-caption)",
              fontWeight: "440",
            }}
          >
            <div style={{ display: "flex", gap: "var(--spacing-global-5xs)", alignItems: "center" }}>
              {section.avatars.map((emoji, i) => (
                <span key={i} style={{ fontSize: "12px", lineHeight: "1" }}>
                  {emoji}
                </span>
              ))}
            </div>
            <span style={{ fontSize: "var(--fontSize-caption)" }}>{section.label}</span>
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
              <div
                key={chat.id}
                className="arcade-menu-item"
                style={{
                  padding: "var(--spacing-global-3xs)",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "var(--spacing-global-5xs)",
                }}
              >
                <div
                  style={{
                    fontSize: "var(--fontSize-caption)",
                    fontWeight: "540",
                    color: "hsl(var(--text-color-primary))",
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--spacing-global-4xs)",
                    width: "100%",
                  }}
                >
                  {chat.participants.length > 2 && (
                    <span style={{ fontSize: "11px" }}>👥</span>
                  )}
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {label}
                  </span>
                </div>
                {lastMsg && (
                  <div
                    style={{
                      fontSize: "var(--fontSize-caption)",
                      fontWeight: "440",
                      color: "hsl(var(--text-color-tertiary))",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      width: "100%",
                    }}
                  >
                    {lastMsg.text}
                  </div>
                )}
              </div>
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
        <div
          className="arcade-avatar arcade-avatar--M"
          style={{
            background: "hsl(var(--intelligence-400))",
          }}
        >
          P
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "var(--fontSize-caption)",
              fontWeight: "540",
              color: "hsl(var(--text-color-primary))",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Prithvi Sharma
          </div>
          <div
            style={{
              fontSize: "var(--fontSize-caption)",
              fontWeight: "440",
              color: "hsl(var(--text-color-tertiary))",
            }}
          >
            DevRev
          </div>
        </div>
      </div>
    </div>
  )
}
