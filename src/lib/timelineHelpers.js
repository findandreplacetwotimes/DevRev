/**
 * Timeline utilities for formatting and managing timeline events
 */

/**
 * Format a Date object to timeline timestamp format
 * @param {Date} date - Date to format
 * @returns {{ datePart: string, timePart: string }} - Timeline timestamp format
 */
export function formatTimelineTimestamp(date = new Date()) {
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  const datePart = isToday
    ? "today,"
    : date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }) + ","

  const timePart = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  return { datePart, timePart }
}

/**
 * Create a timeline event for a chat discussion
 * @param {string} messageText - The chat message content
 * @param {string} actorInitial - Initial of the person posting (default "M")
 * @returns {Object} - Timeline event object
 */
export function createDiscussionEvent(messageText, actorInitial = "M") {
  return {
    id: `evt-${Date.now()}`,
    timestamp: formatTimelineTimestamp(),
    actorInitial,
    type: "detail",
    attribute: "Discussion",
    detail: messageText
  }
}
