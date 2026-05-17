import { useState } from "react"
import { useChats } from "../context/IssuesContext"
import { Control } from "./Control"
import { TextInput } from "./TextInput"
import { ChatAvatar } from "./ChatAvatar"

// Mock user database
export const AVAILABLE_USERS = [
  { id: "prithvi", name: "Prithvi Sharma", email: "prithvi@devrev.ai" },
  { id: "konstantin-dziuin", name: "Konstantin Dziuin", email: "konstantin@devrev.ai" },
  { id: "dejan-mesar", name: "Dejan Mesar", email: "dejan@devrev.ai" },
  { id: "polina", name: "Polina Khokhonova", email: "polina@devrev.ai" },
  { id: "tim", name: "Tim Cherny", email: "tim@devrev.ai" },
  { id: "kunal", name: "Kunal Mohta", email: "kunal@devrev.ai" },
  { id: "yashraj", name: "Yashraj Singh", email: "yashraj@devrev.ai" },
  { id: "aditya", name: "Aditya Manickavasakam", email: "adi@devrev.ai" },
  { id: "pratham", name: "Pratham Gupta", email: "pratham@devrev.ai" },
  { id: "akanksha", name: "Akanksha Deswal", email: "akanksha@devrev.ai" },
]

export function InvitePanel({ chat, onClose, isFullPage = false }) {
  const { patchChat } = useChats()
  const [searchQuery, setSearchQuery] = useState("")
  const [pendingInvites, setPendingInvites] = useState([])

  const currentParticipantIds = chat.participants.filter((p) => p !== "computer" && p !== "user")

  const availableUsers = AVAILABLE_USERS.filter(
    (user) => !currentParticipantIds.includes(user.id) && !pendingInvites.includes(user.id)
  )

  const filteredUsers = searchQuery
    ? availableUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableUsers

  const handleAddPending = (userId) => {
    setPendingInvites((prev) => [...prev, userId])
  }

  const handleRemovePending = (userId) => {
    setPendingInvites((prev) => prev.filter((id) => id !== userId))
  }

  const handleInviteAll = () => {
    if (pendingInvites.length === 0) return

    const newParticipants = [...chat.participants, ...pendingInvites]
    patchChat(chat.id, { participants: newParticipants })

    // Add system message about new participants
    const invitedNames = AVAILABLE_USERS.filter((u) => pendingInvites.includes(u.id))
      .map((u) => u.name)
      .join(", ")

    const systemMessage = {
      id: `msg-${Date.now()}-system`,
      senderId: "system",
      text: `${invitedNames} ${pendingInvites.length === 1 ? "was" : "were"} added to the chat`,
      timestamp: Date.now(),
    }

    patchChat(chat.id, {
      messages: [...chat.messages, systemMessage],
      lastActivity: Date.now(),
    })

    setPendingInvites([])
    if (onClose) onClose()
  }

  const pendingUsers = AVAILABLE_USERS.filter((u) => pendingInvites.includes(u.id))

  const containerClassName = isFullPage
    ? "flex flex-col bg-white"
    : "absolute top-0 right-0 bottom-0 w-[320px] flex flex-col bg-white border-l border-[#ececec] z-10"

  return (
    <div className={containerClassName}>
      {/* Header */}
      {!isFullPage && (
        <div className="flex items-center justify-between p-[20px] border-b border-[#ececec]">
          <div>
            <h3
              className="m-0 text-[var(--foreground-primary)]"
              style={{
                fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: "15px",
                lineHeight: "18px",
                fontVariationSettings: '"wght" 520',
              }}
            >
              Invite to Chat
            </h3>
            <p
              className="m-0 mt-[6px] text-[var(--foreground-secondary)]"
              style={{
                fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: "12px",
                lineHeight: "15px",
                fontVariationSettings: '"wght" 450',
              }}
            >
              Invited users can see all messages and files
            </p>
          </div>
          <Control type="iconOnly" leadingIcon="close" label="" onClick={onClose} />
        </div>
      )}

      {/* Search */}
      <div className="p-[16px_20px]">
        <TextInput
          type="leading"
          placeholder="Search people..."
          value={searchQuery}
          onChange={setSearchQuery}
          fullWidth
        />
      </div>

      {/* Pending Invites */}
      {pendingUsers.length > 0 && (
        <div className="px-[20px] pb-[16px] border-b border-[#ececec]">
          <div
            className="mb-[8px] text-[var(--foreground-secondary)]"
            style={{
              fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: "12px",
              lineHeight: "15px",
              fontVariationSettings: '"wght" 460',
            }}
          >
            To be invited ({pendingUsers.length})
          </div>
          {pendingUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-[12px] p-[8px_12px] bg-[var(--background-primary-subtle)] rounded-[2px] mb-[6px]"
            >
              <ChatAvatar initial={user.name[0]} />
              <div className="flex-1 min-w-0">
                <div
                  className="text-[var(--foreground-primary)] whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{
                    fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: "13px",
                    lineHeight: "16px",
                    fontVariationSettings: '"wght" 460',
                  }}
                >
                  {user.name}
                </div>
              </div>
              <Control type="iconOnly" leadingIcon="close" label="" onClick={() => handleRemovePending(user.id)} />
            </div>
          ))}
        </div>
      )}

      {/* Available Users List */}
      <div className="flex-1 overflow-y-auto px-[20px] py-[16px]">
        {filteredUsers.length === 0 ? (
          <div
            className="text-center text-[var(--foreground-secondary)] py-[40px]"
            style={{
              fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: "13px",
              lineHeight: "16px",
              fontVariationSettings: '"wght" 460',
            }}
          >
            {searchQuery ? "No users found" : "All users invited"}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-[12px] p-[8px_12px] rounded-[2px] cursor-pointer mb-[4px] transition-colors duration-150 hover:bg-[var(--control-bg-hover)]"
              onClick={() => handleAddPending(user.id)}
            >
              <ChatAvatar initial={user.name[0]} />
              <div className="flex-1 min-w-0">
                <div
                  className="text-[var(--foreground-primary)] whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{
                    fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: "13px",
                    lineHeight: "16px",
                    fontVariationSettings: '"wght" 460',
                  }}
                >
                  {user.name}
                </div>
                <div
                  className="text-[var(--foreground-secondary)] whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{
                    fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: "12px",
                    lineHeight: "15px",
                    fontVariationSettings: '"wght" 450',
                  }}
                >
                  {user.email}
                </div>
              </div>
              <span className="text-[20px] text-[var(--foreground-secondary)]">+</span>
            </div>
          ))
        )}
      </div>

      {/* Footer with Invite Button */}
      {pendingUsers.length > 0 && (
        <div className="p-[16px_20px] border-t border-[#ececec]">
          <Control
            type="textOnly"
            label={`Invite ${pendingUsers.length} ${pendingUsers.length === 1 ? "person" : "people"}`}
            onClick={handleInviteAll}
            style={{ width: "100%", justifyContent: "center" }}
          />
        </div>
      )}
    </div>
  )
}
