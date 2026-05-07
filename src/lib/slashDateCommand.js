import { dueDateIdFromDate, parseDateInput } from "./dueDates"

export function resolveDueDateIdFromCommand(commandText, now = new Date()) {
  const command = String(commandText ?? "").trim().toLowerCase()
  const m = /(?:change|set)\s+date\s+to\s+(.+)/.exec(command)
  if (!m) return null

  const candidate = m[1].trim()
  const targetDate =
    parseDateInput(candidate, now) ||
    parseDateInput((/^(.+?)(?:\s+(?:and|then|please)\b.*)?$/.exec(candidate)?.[1] ?? "").trim(), now)
  if (!targetDate) return null
  return dueDateIdFromDate(targetDate, now)
}

export function isDueDateSlashCommand(commandText) {
  return /(?:change|set)\s+date\s+to\b/i.test(String(commandText ?? ""))
}
