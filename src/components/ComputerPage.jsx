import { useEffect, useRef, useState } from "react"
import { useChats } from "../context/IssuesContext"
import { callAI } from "../lib/aiClient"

export function ComputerPage() {
  const { chats, patchChat, setChats } = useChats()
  const [activeChat, setActiveChat] = useState(null)
  const [inputValue, setInputValue] = useState("")
  const [isComputerTyping, setIsComputerTyping] = useState(false)
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

  if (!activeChat) {
    return (
      <div className="arcade-empty">
        <div className="arcade-empty__icon">⏳</div>
        <div className="arcade-empty__description">Loading...</div>
      </div>
    )
  }

  const handleSwitchChat = (chatId) => {
    const chat = chats.find(c => c.id === chatId)
    if (chat) {
      setActiveChat(chat)
    }
  }

  const handleNewChat = () => {
    const newChatId = `chat-computer-${Date.now()}`
    const newChat = {
      id: newChatId,
      participants: ["computer", "user"],
      messages: [],
      files: [],
      createdAt: Date.now(),
      lastActivity: Date.now(),
      projectId: null,
      title: null,
    }
    setChats((prev) => {
      if (!prev) return [newChat]
      return [newChat, ...prev]
    })
    setActiveChat(newChat)
  }

  return (
    <div style={{ display: "flex", width: "100%", height: "100vh", overflow: "hidden" }}>
      {/* Left Sidebar */}
      <ComputerSidebar
        activeChat={activeChat}
        onSwitchChat={handleSwitchChat}
        onNewChat={handleNewChat}
      />

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "hsl(var(--bg-layer-00))", minWidth: 0 }}>
        {/* Chat Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 24px",
          background: "hsl(var(--bg-layer-01))",
          borderBottom: "1px solid hsl(var(--border-outline-01))"
        }}>
          <svg style={{ width: "16px", height: "16px", color: "hsl(var(--fg-neutral-medium))" }} viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <div className="text-system-medium" style={{ color: "hsl(var(--fg-neutral-prominent))" }}>
            {activeChat.messages.length || 0}
          </div>
          <div className="text-system-medium" style={{ color: "hsl(var(--fg-neutral-prominent))" }}>
            {activeChat.title || "Computer"}
          </div>
        </div>

        {/* Messages Area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {activeChat.messages.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "16px" }}>
              <ComputerLogo size={64} />
              <div className="text-body" style={{ color: "hsl(var(--fg-neutral-medium))" }}>
                Start a conversation with Computer
              </div>
            </div>
          ) : (
            <>
              {activeChat.messages.map((msg, idx) => {
                const isUser = msg.senderId === "user"
                const isComputer = msg.senderId === "computer"
                const senderName = isUser ? "You" : isComputer ? "Computer" : msg.senderId
                const showTimestamp = idx === 0 || (msg.timestamp - activeChat.messages[idx - 1].timestamp) > 300000

                return (
                  <div key={msg.id}>
                    {showTimestamp && (
                      <div className="text-system-small" style={{
                        textAlign: "center",
                        color: "hsl(var(--fg-neutral-medium))",
                        margin: "8px 0"
                      }}>
                        {new Date(msg.timestamp).toLocaleString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "16px" }}>
                      <div style={{ width: "32px", height: "32px", flexShrink: 0 }}>
                        {isComputer ? (
                          <div style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "hsl(var(--husk-600))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ width: "18px", height: "18px" }}>
                              <path fill="hsl(var(--day))" d="M8.403 14H5.919l-.495-9.297h3.194L8.405 14zm5.978-9.297h3.195L17.08 14h-2.483l-.214-9.297z"></path>
                            </svg>
                          </div>
                        ) : (
                          <div style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "#F57C00",
                            color: "white",
                            fontSize: "13px",
                            fontVariationSettings: '"wght" 540',
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            {senderName[0]}
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
                          <span className="text-system-medium" style={{ color: "hsl(var(--fg-neutral-prominent))" }}>
                            {senderName}
                          </span>
                        </div>
                        <div style={{
                          background: "hsl(var(--bg-layer-01))",
                          borderRadius: "12px",
                          padding: "12px 16px",
                          maxWidth: "90%"
                        }}>
                          <div className="text-body" style={{ color: "hsl(var(--fg-neutral-prominent))" }}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              {isComputerTyping && (
                <div style={{ display: "flex", gap: "16px" }}>
                  <div style={{ width: "32px", height: "32px", flexShrink: 0 }}>
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "hsl(var(--husk-600))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ width: "18px", height: "18px" }}>
                        <path fill="hsl(var(--day))" d="M8.403 14H5.919l-.495-9.297h3.194L8.405 14zm5.978-9.297h3.195L17.08 14h-2.483l-.214-9.297z"></path>
                      </svg>
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
                      <span className="text-system-medium" style={{ color: "hsl(var(--fg-neutral-prominent))" }}>
                        Computer
                      </span>
                    </div>
                    <div style={{
                      background: "hsl(var(--bg-layer-01))",
                      borderRadius: "12px",
                      padding: "12px 16px",
                      maxWidth: "90%"
                    }}>
                      <div className="text-body" style={{ color: "hsl(var(--fg-neutral-medium))" }}>
                        <span className="typing-indicator">●●●</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div style={{
          padding: "16px 24px",
          background: "hsl(var(--bg-layer-01))",
          borderTop: "1px solid hsl(var(--border-outline-01))"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 16px",
            background: "hsl(var(--bg-layer-01))",
            border: "1px solid hsl(var(--border-outline-01))",
            borderRadius: "24px",
            transition: "all 150ms"
          }}>
            <svg style={{ width: "20px", height: "20px", color: "hsl(var(--fg-neutral-medium))", cursor: "pointer" }} viewBox="0 0 20 20" fill="none">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 4v12m-6-6h12"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Send a message"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isComputerTyping}
              className="text-body"
              style={{
                flex: 1,
                border: 0,
                outline: "none",
                background: "transparent",
                color: "hsl(var(--fg-neutral-prominent))",
                fontFamily: "inherit"
              }}
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isComputerTyping}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                border: 0,
                borderRadius: "50%",
                background: inputValue.trim() && !isComputerTyping ? "hsl(var(--intelligence-400))" : "transparent",
                color: inputValue.trim() && !isComputerTyping ? "white" : "hsl(var(--fg-neutral-medium))",
                cursor: "pointer",
                transition: "all 150ms"
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path fill="currentColor" d="M2 2l16 8-16 8 4-8z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Computer logo component (two-bar pause icon in circle) - matches design reference
function ComputerLogo({ size = 32 }) {
  const iconSize = size * 0.56
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "50%",
      background: "hsl(var(--husk-600))",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ width: `${iconSize}px`, height: `${iconSize}px` }}>
        <path fill="hsl(var(--day))" d="M8.403 14H5.919l-.495-9.297h3.194L8.405 14zm5.978-9.297h3.195L17.08 14h-2.483l-.214-9.297z"></path>
      </svg>
    </div>
  )
}

// Sidebar matching design reference exactly
function ComputerSidebar({ activeChat, onSwitchChat, onNewChat }) {
  const { chats } = useChats()
  const [showMore, setShowMore] = useState(false)

  const conversationItems = [
    { label: "Lobby PoC", avatars: ["LP"] },
    { label: "Lobby: Teams & Sp...", avatars: ["LT", "TS", "SP"] },
    { label: "OpsLevel POC details ..." },
    { label: "Today's Daily Digest ...", unread: true },
    { label: "Lobby: Build", avatars: ["PS", "DD", "YA"], active: true },
  ]

  const dmItems = [
    { label: "Devanshu Dangi, Prithvi...", count: 2 },
    { label: "Kunal Mohta, Pol...", count: 2, unread: true },
    { label: "Yashraj, Kunal Mohta, Priyanka Pal, Akank...", count: 7 },
    { label: "Pratham Gupta, Akanks...", count: 2 },
    { label: "Ribhu Chawla", image: true },
    { label: "Adit Shah", image: true },
    { label: "Tom Shurrock", image: true, unread: true },
    { label: "Priyadharshan Ravichan...", count: 2 },
    { label: "Priyanka Pal", image: true },
    { label: "Shivam Gupta, Advaith...", count: 3 },
    { label: "Smrithi Ullal", initials: "SU" },
    { label: "Manasa, Shivam Gupta,...", count: 4 },
  ]

  return (
    <div style={{
      width: "240px",
      background: "hsl(var(--bg-layer-01))",
      borderRight: "1px solid hsl(var(--border-outline-01))",
      display: "flex",
      flexDirection: "column",
      padding: "12px",
      gap: "12px",
      flexShrink: 0
    }}>
      {/* Sidebar Header */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button style={{
          position: "relative",
          display: "inline-flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "9px",
          border: 0,
          borderRadius: "4px",
          background: "transparent",
          transition: "all 150ms",
          cursor: "pointer"
        }} className="fg-neutral-prominent">
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <path fill="currentColor" d="M30 7c.05-2.58-2.15-4.91-4.74-4.99L19.14 2H7c-2.58-.05-4.91 2.15-4.99 4.74C2 10.65 2 20.95 2 25c-.05 2.58 2.15 4.91 4.74 4.99 3.91 0 14.21.04 18.26.05 2.6.04 4.93-2.18 5.01-4.78zM4.17 25c.07-5.84.09-12.28-.01-18.15C4.18 5.39 5.5 4.08 7 4.09c1.63-.02 3.3-.04 5-.05v23.91c-1.75-.02-3.47-.04-5.15-.07-1.48-.07-2.72-1.43-2.68-2.88m23.68.15c0 1.47-1.32 2.81-2.85 2.81-3.53.04-7.29.04-11 .01V4.03c3.75-.01 7.56.01 11.15.07 1.5.06 2.75 1.44 2.7 2.9-.09 5.84-.12 12.28 0 18.15M9 12H7v8h2z"/>
          </svg>
        </button>
        <button onClick={onNewChat} style={{
          position: "relative",
          display: "flex",
          flex: 1,
          minWidth: 0,
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          padding: "0 16px",
          height: "40px",
          border: 0,
          borderRadius: "9999px",
          background: "hsl(var(--bg-neutral-prominent) / 0.08)",
          transition: "transform 200ms cubic-bezier(0.4, 0, 0.2, 1)",
          cursor: "pointer"
        }} className="fg-neutral-prominent text-system-medium">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path fill="currentColor" d="M3.411 14.097c-.263 1.47-1.155 2.655-2.161 3.717H2.5c1.781 0 3.556-.712 4.663-2.137 3.556.506 7.874.58 10.325-2.482 2.38-3.262 1.337-8.775-2.67-10.187-4.024-1.419-11.03-1.363-12.98 3.143C.806 8.764 1.03 12.271 3.4 14.09m12.875-1.781c-2.119 2.781-6.531 2.594-9.706 2.018-.25.413-.525.813-.944 1.15-.326.284-.692.51-1.082.68l-.397-.42c.32-.703.555-1.451.654-2.135l-.119-.093c-.219-.188-.45-.406-.65-.613-.956-1.037-1.219-2.412-1.206-3.825C2.8 7.433 3.356 5.883 4.6 4.926c2.55-1.843 6.825-1.83 9.681-.675 3.088 1.2 3.669 5.582 1.994 8.057"/>
            <path fill="#211E20" d="M14.375 9.845a69 69 0 0 1-3.425-.155l-.329.33a64 64 0 0 1 .16 3.419H9.22q.035-1.708.155-3.42l-.33-.33c-1.138.08-2.281.134-3.419.156V8.283a64 64 0 0 1 3.418.16l.331-.33A69 69 0 0 1 9.22 4.69h1.562a64 64 0 0 1-.16 3.424l.33.33a64 64 0 0 1 3.424-.16z"/>
          </svg>
          <span>New Chat</span>
        </button>
        <button style={{
          display: "inline-flex",
          width: "40px",
          height: "40px",
          alignItems: "center",
          justifyContent: "center",
          border: 0,
          borderRadius: "20px",
          background: "hsl(var(--bg-neutral-prominent) / 0.08)",
          transition: "transform 150ms",
          flexShrink: 0,
          cursor: "pointer"
        }} className="fg-neutral-prominent">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m4 4 8 8m0-8-8 8"/>
          </svg>
        </button>
      </div>

      {/* Conversation List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto" }}>
        {conversationItems.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 8px",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "background 150ms",
              background: item.active ? "hsl(var(--bg-neutral-prominent) / 0.1)" : "transparent"
            }}
            className="conversation-item"
          >
            <div className="text-system" style={{
              flex: 1,
              color: "hsl(var(--fg-neutral-prominent))",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              {item.label}
            </div>
            {item.avatars && (
              <div style={{ display: "flex", gap: "2px" }}>
                {item.avatars.map((av, i) => (
                  <div key={i} style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: ["#8B4513", "#2196F3", "#FF9800", "#4CAF50"][i % 4],
                    color: "white",
                    fontSize: "9px",
                    fontVariationSettings: '"wght" 540',
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>{av}</div>
                ))}
              </div>
            )}
            {item.unread && (
              <div style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "hsl(var(--fg-neutral-prominent))",
                flexShrink: 0
              }}/>
            )}
          </div>
        ))}
      </div>

      {/* Section Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 8px 4px",
        marginTop: "8px"
      }}>
        <div className="text-system-small" style={{
          fontVariationSettings: '"wght" 540',
          color: "hsl(var(--fg-neutral-medium))",
          textTransform: "uppercase"
        }}>CHAT</div>
        <div style={{
          fontSize: "0.875rem",
          color: "hsl(var(--fg-neutral-medium))",
          cursor: "pointer"
        }}>⋯ More</div>
      </div>

      {/* DM List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto", flex: 1 }}>
        {dmItems.slice(0, showMore ? dmItems.length : 8).map((item, idx) => (
          <div key={idx} style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 8px",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "background 150ms"
          }} className="dm-item">
            <div style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: item.count ? "#666" : (item.initials ? "#8B3A3A" : "hsl(var(--husk-600))"),
              color: "white",
              fontSize: item.count ? "12px" : "11px",
              fontVariationSettings: '"wght" 540',
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              {item.count || item.initials || item.label[0]}
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
              <div className="text-system" style={{
                color: "hsl(var(--fg-neutral-prominent))",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>{item.label}</div>
            </div>
            {item.unread && (
              <div style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "hsl(var(--fg-neutral-prominent))",
                flexShrink: 0
              }}/>
            )}
          </div>
        ))}
      </div>

      {/* Bottom User Profile */}
      <div style={{
        marginTop: "auto",
        paddingTop: "12px",
        borderTop: "1px solid hsl(var(--border-outline-01))",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 8px",
        borderRadius: "6px"
      }}>
        <div style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "#666",
          flexShrink: 0
        }}/>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div className="text-system" style={{ color: "hsl(var(--fg-neutral-prominent))" }}>Prithvi Sharma</div>
          <div className="text-system-small" style={{ color: "hsl(var(--fg-neutral-medium))" }}>DevRev</div>
        </div>
      </div>
    </div>
  )
}
