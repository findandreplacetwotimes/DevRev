import { useEffect, useRef, useState } from "react"
import { useChats } from "../context/IssuesContext"
import { callAI } from "../lib/aiClient"
import { InvitePanel } from "./InvitePanel"

export function FloatingChatWindow({ chat, onClose, onMinimize, style }) {
  const { patchChat } = useChats()
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [inputValue, setInputValue] = useState("")
  const [isComputerTyping, setIsComputerTyping] = useState(false)
  const [showInvitePanel, setShowInvitePanel] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0, initialX: 0, initialY: 0 })
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const handleMouseDown = (e) => {
    if (e.target.closest(".chat-content, .chat-input")) return
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialX: position.x,
      initialY: position.y,
    }
  }

  useEffect(() => {
    if (!isDragging) return undefined

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - dragStartRef.current.x
      const deltaY = e.clientY - dragStartRef.current.y
      setPosition({
        x: dragStartRef.current.initialX + deltaX,
        y: dragStartRef.current.initialY + deltaY,
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chat.messages])

  const participantNames = chat.participants
    .filter((p) => p !== "computer" && p !== "user")
    .join(", ")
  const title = chat.participants.includes("computer") && chat.participants.length === 2
    ? "Computer"
    : participantNames || "New Chat"

  const hasComputer = chat.participants.includes("computer")
  const otherHumanParticipants = chat.participants.filter((p) => p !== "computer" && p !== "user")

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage = {
      id: `msg-${Date.now()}`,
      senderId: "user",
      text: inputValue.trim(),
      timestamp: Date.now(),
    }

    // Add user message
    patchChat(chat.id, {
      messages: [...chat.messages, userMessage],
      lastActivity: Date.now(),
    })

    setInputValue("")

    // Handle responses based on participants
    if (hasComputer) {
      // Computer responds
      setIsComputerTyping(true)
      try {
        const conversationHistory = [...chat.messages, userMessage].map((msg) => ({
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

        patchChat(chat.id, {
          messages: [...chat.messages, userMessage, computerMessage],
          lastActivity: Date.now(),
        })
      } catch (error) {
        console.error("Computer response failed:", error)
      } finally {
        setIsComputerTyping(false)
      }
    } else if (otherHumanParticipants.length > 0) {
      // Mock response from random human participant after delay
      setTimeout(() => {
        const randomParticipant =
          otherHumanParticipants[Math.floor(Math.random() * otherHumanParticipants.length)]
        const mockResponses = [
          "Sounds good!",
          "I agree with that approach",
          "Let me think about this...",
          "Can you share more details?",
          "I'll take a look",
          "Thanks for the update",
          "Let's discuss this in our next meeting",
        ]
        const humanMessage = {
          id: `msg-${Date.now()}-human`,
          senderId: randomParticipant,
          text: mockResponses[Math.floor(Math.random() * mockResponses.length)],
          timestamp: Date.now(),
        }

        patchChat(chat.id, {
          messages: [...chat.messages, userMessage, humanMessage],
          lastActivity: Date.now(),
        })
      }, 1000 + Math.random() * 2000)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div
      className="floating-chat-window"
      style={{
        position: "fixed",
        right: "24px",
        bottom: "24px",
        width: "400px",
        height: "600px",
        transform: `translate(${position.x}px, ${position.y}px)`,
        zIndex: 1000,
        fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
        ...style,
      }}
    >
      <div
        className="chat-window-container"
        style={{
          height: "100%",
          borderRadius: "8px",
          overflow: "hidden",
          background: "white",
          border: "1px solid #ececec",
          boxShadow: "0px 6px 13px rgba(0,0,0,0.10), 0px 23px 23px rgba(0,0,0,0.09)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          className="chat-header"
          onMouseDown={handleMouseDown}
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #ececec",
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "white",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
              }}
            >
              {chat.participants.includes("computer") ? "C" : title[0]}
            </div>
            <div>
              <div
                style={{
                  fontSize: "13px",
                  lineHeight: "16px",
                  letterSpacing: "-0.13px",
                  fontVariationSettings: '"wght" 520',
                  color: "var(--foreground-primary)",
                }}
              >
                {title}
              </div>
              {chat.participants.length > 2 && (
                <div
                  style={{
                    fontSize: "12px",
                    lineHeight: "15px",
                    fontVariationSettings: '"wght" 450',
                    color: "var(--foreground-secondary)",
                  }}
                >
                  {chat.participants.length} participants
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => setShowInvitePanel(!showInvitePanel)}
              title="Invite people"
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                background: showInvitePanel
                  ? "rgba(100, 80, 200, 0.2)"
                  : "rgba(0, 0, 0, 0.03)",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                color: "var(--foreground-primary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = showInvitePanel
                  ? "rgba(100, 80, 200, 0.3)"
                  : "rgba(0, 0, 0, 0.06)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = showInvitePanel
                  ? "rgba(100, 80, 200, 0.2)"
                  : "rgba(0, 0, 0, 0.03)"
              }}
            >
              👤+
            </button>
            <button
              type="button"
              onClick={onMinimize}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                background: "rgba(0, 0, 0, 0.03)",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                color: "var(--foreground-primary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.06)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.03)"
              }}
            >
              −
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                background: "rgba(0, 0, 0, 0.03)",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                color: "var(--foreground-primary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.06)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.03)"
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className="chat-content"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            background: "#fafafa",
          }}
        >
          {chat.messages.length === 0 ? (
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
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>💬</div>
              <div
                style={{
                  fontSize: "13px",
                  lineHeight: "16px",
                  fontVariationSettings: '"wght" 460',
                  color: "var(--foreground-secondary)",
                }}
              >
                Start a conversation with {title}
              </div>
            </div>
          ) : (
            <div>
              {chat.messages.map((msg) => {
                const isUser = msg.senderId === "user"
                const isComputer = msg.senderId === "computer"
                const isSystem = msg.senderId === "system"
                const senderName = isUser ? "You" : isComputer ? "Computer" : msg.senderId

                // System messages (like "X was added to the chat")
                if (isSystem) {
                  return (
                    <div
                      key={msg.id}
                      style={{
                        marginBottom: "12px",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          padding: "6px 12px",
                          borderRadius: "2px",
                          background: "var(--background-primary-subtle)",
                          color: "var(--foreground-secondary)",
                          fontSize: "12px",
                          lineHeight: "15px",
                          fontVariationSettings: '"wght" 450',
                          textAlign: "center",
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  )
                }

                return (
                  <div
                    key={msg.id}
                    style={{
                      marginBottom: "12px",
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
                          marginBottom: "4px",
                          marginLeft: "2px",
                        }}
                      >
                        {senderName}
                      </div>
                    )}
                    <div
                      style={{
                        maxWidth: "85%",
                        padding: "8px 12px",
                        borderRadius: "2px",
                        background: isUser
                          ? "hsl(259 94% 44%)"
                          : "white",
                        color: isUser ? "white" : "var(--foreground-primary)",
                        fontSize: "13px",
                        lineHeight: "18px",
                        letterSpacing: "-0.13px",
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
                    marginBottom: "12px",
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
                      marginBottom: "4px",
                      marginLeft: "2px",
                    }}
                  >
                    Computer
                  </div>
                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: "2px",
                      background: "white",
                      border: "1px solid #ececec",
                      color: "var(--foreground-secondary)",
                      fontSize: "13px",
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
          className="chat-input"
          style={{
            padding: "12px 16px",
            borderTop: "1px solid #ececec",
            display: "flex",
            gap: "8px",
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
            className="flex-1 px-[10px] py-[6px] rounded-[2px] bg-[var(--background-primary-subtle)] border border-transparent outline-none hover:bg-[var(--control-bg-hover)] transition-colors duration-150"
            style={{
              fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: "13px",
              lineHeight: "16px",
              letterSpacing: "-0.13px",
              fontVariationSettings: '"wght" 460',
              color: "var(--foreground-primary)",
            }}
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isComputerTyping}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              background: inputValue.trim() && !isComputerTyping
                ? "hsl(259 94% 44%)"
                : "rgba(0, 0, 0, 0.03)",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              color: inputValue.trim() && !isComputerTyping
                ? "white"
                : "var(--foreground-secondary)",
              cursor: inputValue.trim() && !isComputerTyping ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
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

        {/* Invite Panel */}
        {showInvitePanel && (
          <InvitePanel chat={chat} onClose={() => setShowInvitePanel(false)} />
        )}
      </div>
    </div>
  )
}
