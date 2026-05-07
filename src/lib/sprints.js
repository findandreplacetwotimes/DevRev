import { parseDateInput } from "./dueDates"

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function isoDate(date) {
  const d = startOfDay(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function sprintStartDateFromDate(date) {
  return isoDate(date)
}

function formatShort(date) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(date)
}

export function sanitizeSprintStartDate(raw, fallback = new Date()) {
  if (typeof raw === "string") {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw.trim())
    if (m) return `${m[1]}-${m[2]}-${m[3]}`
    const parsed = parseDateInput(raw)
    if (parsed) return isoDate(parsed)
  }
  return isoDate(fallback)
}

export function deriveSprintEndDate(startDateIso, durationDays = 14) {
  const parsed = parseDateInput(startDateIso) ?? new Date(startDateIso)
  if (Number.isNaN(parsed.getTime())) return sanitizeSprintStartDate(null)
  return isoDate(addDays(startOfDay(parsed), durationDays))
}

export function formatSprintRange(startDateIso, durationDays = 14) {
  const parsed = parseDateInput(startDateIso) ?? new Date(startDateIso)
  const base = Number.isNaN(parsed.getTime()) ? new Date() : parsed
  const start = startOfDay(base)
  const end = addDays(start, durationDays)
  return `${formatShort(start)} — ${formatShort(end)}`
}

export function formatSprintStartLabel(startDateIso) {
  const parsed = parseDateInput(startDateIso) ?? new Date(startDateIso)
  const base = Number.isNaN(parsed.getTime()) ? new Date() : parsed
  return formatShort(startOfDay(base))
}

export function getSprintStartDateOptions(now = new Date()) {
  const today = startOfDay(now)
  const tomorrow = addDays(today, 1)
  const endOfWeek = addDays(today, (5 - today.getDay() + 7) % 7)
  const endOfNextWeek = addDays(endOfWeek, 7)
  return [
    { id: "today", label: `Today, ${formatShort(today)}`, dateIso: isoDate(today) },
    { id: "tomorrow", label: `Tomorrow, ${formatShort(tomorrow)}`, dateIso: isoDate(tomorrow) },
    { id: "endOfWeek", label: `End of the week, ${formatShort(endOfWeek)}`, dateIso: isoDate(endOfWeek) },
    { id: "endOfNextWeek", label: `End of the next week, ${formatShort(endOfNextWeek)}`, dateIso: isoDate(endOfNextWeek) },
  ]
}
