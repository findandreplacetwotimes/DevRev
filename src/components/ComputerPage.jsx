import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useChats } from "../context/IssuesContext"
import { callAI } from "../lib/aiClient"
import { isChatReadyForProject } from "../lib/chatHelpers"
import { Canvas } from "./Canvas"
import { ProjectConversionModal } from "./ProjectConversionModal"
import { AVAILABLE_USERS } from "./InvitePanel"

export function ComputerPage() {
  const { chats, patchChat, setChats, convertChatToProject } = useChats()
  const [activeChat, setActiveChat] = useState(null)
  const [inputValue, setInputValue] = useState("")
  const [isComputerTyping, setIsComputerTyping] = useState(false)
  const [canvasOpen, setCanvasOpen] = useState(false) // Closed by default
  const [showConversionModal, setShowConversionModal] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const hasGreetedRef = useRef(false)
  const navigate = useNavigate()

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
    return null
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

  const handleSwitchToChat = (chatId) => {
    const chat = chats?.find(c => c.id === chatId)
    if (chat) {
      setActiveChat(chat)
    }
  }

  const handleConvertToProject = async (chatData) => {
    const newProjectId = convertChatToProject(chatData.id)
    if (newProjectId) {
      // Close modal first
      setShowConversionModal(false)
      // Navigate after modal close animation
      setTimeout(() => {
        console.log('Navigating to:', `/projects/${newProjectId}`)
        navigate(`/projects/${newProjectId}`)
      }, 300)
    } else {
      console.error('Failed to convert chat to project')
    }
  }

  // Get all computer chats
  const computerChats = chats?.filter(c => c.participants.includes("computer")) || []

  // Check if current chat is ready for conversion
  const canConvert = isChatReadyForProject(activeChat)

  return (
    <div style={{ display: "flex", width: "100%", height: "100vh", overflow: "hidden" }}>
      {/* Left Sidebar */}
      <div style={{
        width: "240px",
        background: "hsl(var(--bg-layer-01))",
        borderRight: "1px solid hsl(var(--border-outline-01))",
        display: "flex",
        flexDirection: "column",
        padding: "12px",
        gap: "12px",
        flexShrink: 0,
        containerType: "inline-size"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Collapse button on first row */}
          <button style={{
            position: "relative",
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "9px",
            border: 0,
            borderRadius: "4px",
            background: "transparent",
            outline: "solid 1px transparent",
            outlineOffset: "-1px",
            transition: "all 150ms",
            cursor: "pointer",
            width: "fit-content"
          }} className="collapse-btn fg-neutral-prominent" aria-label="Collapse sidebar">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <path fill="currentColor" d="M30 7c.05-2.58-2.15-4.91-4.74-4.99L19.14 2H7c-2.58-.05-4.91 2.15-4.99 4.74C2 10.65 2 20.95 2 25c-.05 2.58 2.15 4.91 4.74 4.99 3.91 0 14.21.04 18.26.05 2.6.04 4.93-2.18 5.01-4.78zM4.17 25c.07-5.84.09-12.28-.01-18.15C4.18 5.39 5.5 4.08 7 4.09c1.63-.02 3.3-.04 5-.05v23.91c-1.75-.02-3.47-.04-5.15-.07-1.48-.07-2.72-1.43-2.68-2.88m23.68.15c0 1.47-1.32 2.81-2.85 2.81-3.53.04-7.29.04-11 .01V4.03c3.75-.01 7.56.01 11.15.07 1.5.06 2.75 1.44 2.7 2.9-.09 5.84-.12 12.28 0 18.15M9 12H7v8h2z"/>
            </svg>
          </button>

          {/* Second row with New Chat button and Close button */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button onClick={handleNewChat} style={{
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
            }} className="fg-neutral-prominent" aria-label="New Chat">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path fill="currentColor" d="M3.411 14.097c-.263 1.47-1.155 2.655-2.161 3.717H2.5c1.781 0 3.556-.712 4.663-2.137 3.556.506 7.874.58 10.325-2.482 2.38-3.262 1.337-8.775-2.67-10.187-4.024-1.419-11.03-1.363-12.98 3.143C.806 8.764 1.03 12.271 3.4 14.09m12.875-1.781c-2.119 2.781-6.531 2.594-9.706 2.018-.25.413-.525.813-.944 1.15-.326.284-.692.51-1.082.68l-.397-.42c.32-.703.555-1.451.654-2.135l-.119-.093c-.219-.188-.45-.406-.65-.613-.956-1.037-1.219-2.412-1.206-3.825C2.8 7.433 3.356 5.883 4.6 4.926c2.55-1.843 6.825-1.83 9.681-.675 3.088 1.2 3.669 5.582 1.994 8.057"/>
                <path fill="#211E20" d="M14.375 9.845a69 69 0 0 1-3.425-.155l-.329.33a64 64 0 0 1 .16 3.419H9.22q.035-1.708.155-3.42l-.33-.33c-1.138.08-2.281.134-3.419.156V8.283a64 64 0 0 1 3.418.16l.331-.33A69 69 0 0 1 9.22 4.69h1.562a64 64 0 0 1-.16 3.424l.33.33a64 64 0 0 1 3.424-.16z"/>
              </svg>
              <span className="text-system-medium">New Chat</span>
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
            }} className="close-sessions-btn fg-neutral-prominent" aria-label="Close sessions">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m4 4 8 8m0-8-8 8"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="conversation-list" style={{ display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto" }}>
          {computerChats.map((chat) => {
            const isActive = chat.id === activeChat?.id
            const messageCount = chat.messages.length
            const isMultiplayer = chat.participants.length >= 3

            return (
              <div
                key={chat.id}
                onClick={() => handleSwitchToChat(chat.id)}
                className="conversation-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 8px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "background 150ms",
                  background: isActive ? "hsl(var(--bg-neutral-prominent) / 0.1)" : "transparent"
                }}
              >
                <div className="conversation-label text-system" style={{
                  flex: 1,
                  color: "hsl(var(--fg-neutral-prominent))",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {chat.title || (messageCount > 0
                    ? chat.messages[0].text.substring(0, 30) + "..."
                    : "New Chat"
                  )}
                </div>
                {isMultiplayer && chat.participantAvatars && (
                  <div className="conversation-avatars" style={{
                    display: "flex",
                    gap: "2px"
                  }}>
                    {chat.participantAvatars.map((avatar) => (
                      <div
                        key={avatar.id}
                        className="avatar"
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          background: avatar.color,
                          color: "white",
                          fontSize: "9px",
                          fontWeight: "540",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}
                      >
                        {avatar.initials}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="section-header" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 8px 4px",
          marginTop: "8px"
        }}>
          <div className="section-title" style={{
            fontSize: "0.75rem",
            lineHeight: "1.125rem",
            letterSpacing: "-0.02em",
            fontVariationSettings: '"wght" 540',
            color: "hsl(var(--fg-neutral-medium))",
            textTransform: "uppercase"
          }}>CHAT</div>
          <div className="more-btn" style={{
            fontSize: "0.875rem",
            color: "hsl(var(--fg-neutral-medium))",
            cursor: "pointer"
          }}>⋯ More</div>
        </div>

        <div className="conversation-list" style={{ display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto" }}>
          {[
            { label: "Devanshu Dangi, Prithvi...", count: 2 },
            { label: "Kunal Mohta, Pol...", count: 2, unread: true },
            { label: "Ribhu Chawla", img: 15 },
            { label: "Tom Shurrock", img: 68, unread: true },
            { label: "Priyanka Pal", img: 45 },
            { label: "Smrithi Ullal", initials: "SU", bg: "#8B3A3A" },
          ].map((item, idx) => (
            <div key={idx} className="dm-item" style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 8px",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "background 150ms"
            }}>
              {item.img ? (
                <img className="dm-avatar" src={`https://i.pravatar.cc/150?img=${item.img}`} style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  flexShrink: 0,
                  objectFit: "cover"
                }} alt="" />
              ) : (
                <div className="dm-avatar" style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: item.bg || "#666",
                  color: "white",
                  fontSize: item.count ? "12px" : "11px",
                  fontVariationSettings: '"wght" 540',
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  {item.count || item.initials}
                </div>
              )}
              <div className="dm-label" style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minWidth: 0
              }}>
                <div className="dm-name text-system" style={{
                  color: "hsl(var(--fg-neutral-prominent))",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>{item.label}</div>
              </div>
              {item.unread && (
                <div className="unread-indicator" style={{
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

        <div className="dm-item" style={{
          marginTop: "auto",
          paddingTop: "12px",
          borderTop: "1px solid hsl(var(--border-outline-01))",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 8px",
          borderRadius: "6px"
        }}>
          <img className="dm-avatar" src="https://i.pravatar.cc/150?img=12" style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            flexShrink: 0,
            objectFit: "cover"
          }} alt="" />
          <div className="dm-label" style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0
          }}>
            <div className="dm-name text-system" style={{
              color: "hsl(var(--fg-neutral-prominent))"
            }}>Prithvi Sharma</div>
            <div className="dm-count text-caption" style={{
              color: "hsl(var(--fg-neutral-medium))"
            }}>DevRev</div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="main-area" style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "hsl(var(--bg-layer-00))",
        minWidth: 0
      }}>
          <div className="chat-header" style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            padding: "12px 24px",
            background: "hsl(var(--bg-layer-01))",
            borderBottom: "1px solid hsl(var(--border-outline-01))",
            flexShrink: 0
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Chat icon - bubble for single player, chat bubble with people for multiplayer */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "hsl(var(--fg-neutral-medium))" }}>
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <div style={{
                fontSize: "0.875rem",
                lineHeight: "1.125rem",
                letterSpacing: "-0.005em",
                fontVariationSettings: '"wght" 540',
                color: "hsl(var(--fg-neutral-prominent))"
              }}>{activeChat.title || (activeChat.messages.length > 0 ? activeChat.messages[0].text.substring(0, 40) + "..." : "New Chat")}</div>
              {/* Dropdown for multiplayer chats */}
              {activeChat.participants.length >= 3 && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "hsl(var(--fg-neutral-medium))" }}>
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Multiplayer avatar indicator */}
              {activeChat.participants.length >= 3 && activeChat.participantAvatars && (
                <div style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 8px 4px 4px",
                  borderRadius: "16px",
                  background: "hsl(var(--bg-layer-00))",
                  border: "1px solid hsl(var(--border-outline-01))",
                  cursor: "pointer"
                }}>
                  <img
                    src={`https://i.pravatar.cc/150?img=12`}
                    alt="Avatar"
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      objectFit: "cover"
                    }}
                  />
                  <span style={{
                    fontSize: "0.75rem",
                    fontWeight: "540",
                    color: "hsl(var(--fg-neutral-prominent))"
                  }}>+{activeChat.participants.length - 1}</span>
                </div>
              )}
              {/* Convert to Project Button */}
              {canConvert && (
                <button
                  type="button"
                  onClick={() => setShowConversionModal(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    height: "32px",
                    padding: "0 12px",
                    border: 0,
                    borderRadius: "6px",
                    background: "#2D2D2D",
                    color: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 150ms",
                    outline: "solid 1px transparent",
                    outlineOffset: "-1px"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#1F1F1F"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#2D2D2D"
                  }}
                  title="Convert this chat to a project"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Convert to Project
                </button>
              )}

              {/* Canvas Toggle Button */}
              <button
              type="button"
              onClick={() => setCanvasOpen(!canvasOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                padding: 0,
                border: 0,
                borderRadius: "4px",
                background: canvasOpen ? "hsl(var(--bg-layer-02))" : "transparent",
                color: "hsl(var(--fg-neutral-prominent))",
                cursor: "pointer",
                transition: "all 150ms",
                outline: "solid 1px transparent",
                outlineOffset: "-1px"
              }}
              onMouseEnter={(e) => {
                if (!canvasOpen) {
                  e.currentTarget.style.background = "hsl(var(--bg-layer-02))"
                }
              }}
              onMouseLeave={(e) => {
                if (!canvasOpen) {
                  e.currentTarget.style.background = "transparent"
                }
              }}
              aria-label="Toggle Canvas"
              title="Canvas"
            >
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none" style={{ transform: "scaleX(-1)" }}>
                <path fill="currentColor" d="M30 7c.05-2.58-2.15-4.91-4.74-4.99L19.14 2H7c-2.58-.05-4.91 2.15-4.99 4.74C2 10.65 2 20.95 2 25c-.05 2.58 2.15 4.91 4.74 4.99 3.91 0 14.21.04 18.26.05 2.6.04 4.93-2.18 5.01-4.78zM4.17 25c.07-5.84.09-12.28-.01-18.15C4.18 5.39 5.5 4.08 7 4.09c1.63-.02 3.3-.04 5-.05v23.91c-1.75-.02-3.47-.04-5.15-.07-1.48-.07-2.72-1.43-2.68-2.88m23.68.15c0 1.47-1.32 2.81-2.85 2.81-3.53.04-7.29.04-11 .01V4.03c3.75-.01 7.56.01 11.15.07 1.5.06 2.75 1.44 2.7 2.9-.09 5.84-.12 12.28 0 18.15M9 12H7v8h2z"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="messages-area" style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px"
          }}>
            <div style={{
              width: "100%",
              maxWidth: "800px",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}>
            {activeChat.messages.map((msg, idx) => {
              const isComputer = msg.senderId === "computer"
              const isUser = msg.senderId === "user"
              const sender = AVAILABLE_USERS.find(u => u.id === msg.senderId)
              const senderName = sender?.name || (isComputer ? "Computer" : isUser ? "You" : "Unknown")
              const senderInitial = sender ? sender.name[0].toUpperCase() : (isUser ? "Y" : "?")

              const showTimestamp = idx === 0 || (msg.timestamp - activeChat.messages[idx - 1].timestamp) > 300000

              return (
                <div key={msg.id}>
                  {showTimestamp && (
                    <div className="message-timestamp" style={{
                      textAlign: "center",
                      fontSize: "0.75rem",
                      lineHeight: "1rem",
                      color: "hsl(var(--fg-neutral-medium))",
                      margin: "8px 0"
                    }}>
                      {new Date(msg.timestamp).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                  )}
                  <div className="message-group" style={{ display: "flex", gap: "16px" }}>
                    <div className="message-avatar" style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: isComputer ? "hsl(var(--husk-600))" : "#F57C00",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      {isComputer ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ width: "18px", height: "18px" }}>
                          <path fill="hsl(var(--day))" d="M8.403 14H5.919l-.495-9.297h3.194L8.405 14zm5.978-9.297h3.195L17.08 14h-2.483l-.214-9.297z"></path>
                        </svg>
                      ) : (
                        <span style={{
                          color: "white",
                          fontSize: "13px",
                          fontVariationSettings: '"wght" 540'
                        }}>{senderInitial}</span>
                      )}
                    </div>
                    <div className="message-content" style={{ flex: 1, minWidth: 0 }}>
                      <div className="message-header" style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: "8px",
                        marginBottom: "4px"
                      }}>
                        <span className="message-sender" style={{
                          fontSize: "0.875rem",
                          lineHeight: "1.125rem",
                          fontVariationSettings: '"wght" 540',
                          color: "hsl(var(--fg-neutral-prominent))"
                        }}>{senderName}</span>
                      </div>
                      <div className="message-bubble" style={{
                        background: "hsl(var(--bg-layer-01))",
                        borderRadius: "12px",
                        padding: "12px 16px",
                        maxWidth: "90%"
                      }}>
                        <div className="message-text" style={{
                          fontSize: "1rem",
                          lineHeight: "1.5rem",
                          color: "hsl(var(--fg-neutral-prominent))"
                        }}>{msg.text}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {isComputerTyping && (
              <div className="message-group" style={{ display: "flex", gap: "16px" }}>
                <div className="message-avatar" style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "hsl(var(--husk-600))",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ width: "18px", height: "18px" }}>
                    <path fill="hsl(var(--day))" d="M8.403 14H5.919l-.495-9.297h3.194L8.405 14zm5.978-9.297h3.195L17.08 14h-2.483l-.214-9.297z"></path>
                  </svg>
                </div>
                <div className="message-content" style={{ flex: 1, minWidth: 0 }}>
                  <div className="message-header" style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "8px",
                    marginBottom: "4px"
                  }}>
                    <span className="message-sender" style={{
                      fontSize: "0.875rem",
                      lineHeight: "1.125rem",
                      fontVariationSettings: '"wght" 540',
                      color: "hsl(var(--fg-neutral-prominent))"
                    }}>Computer</span>
                  </div>
                  <div className="message-bubble" style={{
                    background: "hsl(var(--bg-layer-01))",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    maxWidth: "90%"
                  }}>
                    <div className="message-text" style={{
                      fontSize: "1rem",
                      lineHeight: "1.5rem",
                      color: "hsl(var(--fg-neutral-medium))"
                    }}>
                      <span className="typing-indicator">●●●</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="input-area" style={{
            padding: "16px 24px 16px 24px",
            background: "hsl(var(--bg-layer-01))",
            borderTop: "1px solid hsl(var(--border-outline-01))",
            display: "flex",
            justifyContent: "center"
          }}>
            <div style={{
              width: "100%",
              maxWidth: "800px"
            }}>
            <div className="input-wrapper" style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 16px",
              background: "hsl(var(--bg-layer-01))",
              borderRadius: "24px",
              transition: "all 150ms"
            }}>
              {/* Emoji icon */}
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" style={{
                width: "20px",
                height: "20px",
                color: "hsl(var(--fg-neutral-medium))",
                cursor: "pointer",
                flexShrink: 0
              }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="8.5" cy="9.5" r="1" fill="currentColor"/>
                <circle cx="15.5" cy="9.5" r="1" fill="currentColor"/>
                <path d="M8 14c0 2.2 1.8 4 4 4s4-1.8 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                ref={inputRef}
                type="text"
                className="message-input"
                placeholder="Send a message"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isComputerTyping}
                style={{
                  flex: 1,
                  border: 0,
                  outline: "none",
                  background: "transparent",
                  fontSize: "1rem",
                  lineHeight: "1.5rem",
                  color: "hsl(var(--fg-neutral-prominent))",
                  fontFamily: "inherit"
                }}
              />
              {/* Plus icon */}
              <svg className="input-icon" viewBox="0 0 20 20" fill="none" style={{
                width: "20px",
                height: "20px",
                color: "hsl(var(--fg-neutral-medium))",
                cursor: "pointer",
                flexShrink: 0
              }}>
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 4v12m-6-6h12"/>
              </svg>
              {/* Send button */}
              <button
                className="send-btn"
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
                  background: inputValue.trim() && !isComputerTyping ? "hsl(var(--fg-neutral-prominent))" : "transparent",
                  color: inputValue.trim() && !isComputerTyping ? "hsl(var(--day))" : "hsl(var(--fg-neutral-medium))",
                  cursor: "pointer",
                  transition: "all 150ms",
                  flexShrink: 0
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 14V2m0 0L4 6m4-4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            </div>
          </div>
      </div>

      {/* Canvas Panel */}
      <div
        style={{
          width: canvasOpen ? "360px" : "0",
          overflow: "hidden",
          transition: "width 250ms ease-out",
          flexShrink: 0
        }}
      >
        {canvasOpen && (
          <Canvas
            onClose={() => setCanvasOpen(false)}
            onMinimize={() => setCanvasOpen(false)}
            sharedFiles={activeChat.files || []}
          />
        )}
      </div>

      {/* Project Conversion Modal */}
      <ProjectConversionModal
        isOpen={showConversionModal}
        onClose={() => setShowConversionModal(false)}
        onConfirm={handleConvertToProject}
        chatData={activeChat}
      />
    </div>
  )
}
