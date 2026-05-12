/**
 * Detect @mentions in chat messages
 */

const AGENT_MENTION_PATTERNS = ['@computer', '@Computer', '@agent', '@Agent', '@AI', '@ai']

/**
 * Check if a message contains an @mention for the agent
 * @param {string} text - The message text
 * @returns {boolean} - True if agent is mentioned
 */
export function hasAgentMention(text) {
  if (!text || typeof text !== 'string') return false

  return AGENT_MENTION_PATTERNS.some(pattern => text.includes(pattern))
}

/**
 * Extract the message without the @mention prefix (for cleaner prompts)
 * @param {string} text - The message text
 * @returns {string} - Text with @mention removed
 */
export function stripAgentMention(text) {
  if (!text) return ''

  let result = text
  for (const pattern of AGENT_MENTION_PATTERNS) {
    result = result.replace(new RegExp(pattern, 'g'), '').trim()
  }

  return result
}
