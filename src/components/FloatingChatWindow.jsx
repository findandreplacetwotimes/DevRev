import { useEffect, useRef, useState } from "react"
import { useChats } from "../context/IssuesContext"
import { callAI } from "../lib/aiClient"

export function FloatingChatWindow({ chat, onClose, onMinimize, style }) {
  const { patchChat } = useChats()
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [inputValue, setInputValue] = useState("")
  const [isComputerTyping, setIsComputerTyping] = useState(false)
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
        ...style,
      }}
    >
      <div
        className="chat-window-container"
        style={{
          height: "100%",
          borderRadius: "16px",
          overflow: "hidden",
          backdropFilter: "blur(20px) saturate(180%)",
          background: "rgba(18, 18, 18, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          className="chat-header"
          onMouseDown={handleMouseDown}
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
              }}
            >
              {chat.participants.includes("computer") ? "C" : title[0]}
            </div>
            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "rgba(255, 255, 255, 0.95)",
                }}
              >
                {title}
              </div>
              {chat.participants.length > 2 && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(255, 255, 255, 0.5)",
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
              onClick={onMinimize}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "rgba(255, 255, 255, 0.7)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.95)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)"
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
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "rgba(255, 255, 255, 0.7)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.95)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)"
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
            padding: "20px",
            color: "rgba(255, 255, 255, 0.9)",
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
                color: "rgba(255, 255, 255, 0.4)",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
              <div style={{ fontSize: "14px" }}>
                Start a conversation with {title}
              </div>
            </div>
          ) : (
            <div>
              {chat.messages.map((msg) => {
                const isUser = msg.senderId === "user"
                const isComputer = msg.senderId === "computer"
                const senderName = isUser ? "You" : isComputer ? "Computer" : msg.senderId

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
                          fontSize: "12px",
                          color: "rgba(255, 255, 255, 0.5)",
                          marginBottom: "4px",
                          marginLeft: "4px",
                        }}
                      >
                        {senderName}
                      </div>
                    )}
                    <div
                      style={{
                        maxWidth: "80%",
                        padding: "12px 16px",
                        borderRadius: "12px",
                        background: isUser
                          ? "hsl(259 94% 44%)"
                          : isComputer
                            ? "rgba(100, 80, 200, 0.2)"
                            : "rgba(255, 255, 255, 0.1)",
                        color: "white",
                        fontSize: "14px",
                        lineHeight: "1.5",
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
                      fontSize: "12px",
                      color: "rgba(255, 255, 255, 0.5)",
                      marginBottom: "4px",
                      marginLeft: "4px",
                    }}
                  >
                    Computer
                  </div>
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: "12px",
                      background: "rgba(100, 80, 200, 0.2)",
                      color: "rgba(255, 255, 255, 0.6)",
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
          className="chat-input"
          style={{
            padding: "16px 20px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            gap: "8px",
            alignItems: "center",
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
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "rgba(255, 255, 255, 0.9)",
              fontSize: "14px",
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"
            }}
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isComputerTyping}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: inputValue.trim() && !isComputerTyping
                ? "hsl(259 94% 44%)"
                : "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: inputValue.trim() && !isComputerTyping
                ? "white"
                : "rgba(255, 255, 255, 0.3)",
              cursor: inputValue.trim() && !isComputerTyping ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              transition: "all 0.15s",
            }}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  )
}
