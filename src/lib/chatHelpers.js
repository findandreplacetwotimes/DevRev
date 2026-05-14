/**
 * Chat utility functions for conversion and eligibility checks
 */

/**
 * Determines if a chat is ready to be converted to a project.
 * A chat is eligible when it has:
 * - At least one file
 * - Multiple participants (group chat with 3+ people, not just user + computer)
 * - Sufficient conversation history
 *
 * NOTE: Only shows on multiplayer group chats, not 1-on-1 Computer sessions
 */
export function isChatReadyForProject(chat) {
  if (!chat) return false

  return (
    chat.files && chat.files.length > 0 &&           // Has files
    chat.participants && chat.participants.length >= 3 &&  // Group chat (3+ participants)
    chat.messages && chat.messages.length >= 5       // Sufficient conversation
  )
}

/**
 * Generates a display name for a project created from a chat
 */
export function generateProjectTitleFromChat(chat) {
  if (chat.title && chat.title !== "Computer") {
    return chat.title
  }

  // Fallback: use first meaningful message or generic name
  const firstUserMessage = chat.messages?.find(m => m.senderId === "user")
  if (firstUserMessage?.text) {
    const truncated = firstUserMessage.text.slice(0, 50)
    return truncated.length < firstUserMessage.text.length
      ? `${truncated}...`
      : truncated
  }

  return "Project from Chat"
}
