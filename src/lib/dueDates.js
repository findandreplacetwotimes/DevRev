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

function endOfWeekFriday(date) {
  const d = startOfDay(date)
  const day = d.getDay() // 0=Sun ... 5=Fri
  const diff = (5 - day + 7) % 7
  return addDays(d, diff)
}

function formatShort(date) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(date)
}

function isoDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function customDueDateIdFromDate(date) {
  return `date:${isoDate(startOfDay(date))}`
}

export function parseCustomDueDateId(id) {
  const m = /^date:(\d{4})-(\d{2})-(\d{2})$/.exec(String(id ?? "").trim())
  if (!m) return null
  const year = Number.parseInt(m[1], 10)
  const month = Number.parseInt(m[2], 10) - 1
  const day = Number.parseInt(m[3], 10)
  const d = new Date(year, month, day)
  if (Number.isNaN(d.getTime())) return null
  return startOfDay(d)
}

const MONTH_TO_INDEX = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
}

/**
 * Supports:
 * - 10/05
 * - 10-05
 * - 10 of may
 * - may 10
 */
export function parseDateInput(text, now = new Date()) {
  const t = String(text ?? "").trim().toLowerCase()
  if (!t) return null

  const makeCheckedDate = (year, monthZeroBased, day) => {
    const d = new Date(year, monthZeroBased, day)
    if (Number.isNaN(d.getTime())) return null
    if (d.getFullYear() !== year || d.getMonth() !== monthZeroBased || d.getDate() !== day) return null
    return startOfDay(d)
  }

  const withYear = (rawYear) => {
    if (rawYear === undefined || rawYear === null || rawYear === "") return now.getFullYear()
    const y = Number.parseInt(String(rawYear), 10)
    if (!Number.isFinite(y)) return null
    if (String(rawYear).length <= 2) return 2000 + y
    return y
  }

  const dmy = /^(\d{1,2})[./-](\d{1,2})(?:[./-](\d{2,4}))?$/.exec(t)
  if (dmy) {
    const day = Number.parseInt(dmy[1], 10)
    const month = Number.parseInt(dmy[2], 10) - 1
    const year = withYear(dmy[3])
    if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && Number.isFinite(year)) {
      return makeCheckedDate(year, month, day)
    }
  }

  const dayMonth = /^(\d{1,2})(?:st|nd|rd|th)?(?:\s+of)?\s+([a-z]+)(?:\s+(\d{2,4}))?$/.exec(t)
  if (dayMonth) {
    const day = Number.parseInt(dayMonth[1], 10)
    const month = MONTH_TO_INDEX[dayMonth[2]]
    const year = withYear(dayMonth[3])
    if (day >= 1 && day <= 31 && Number.isInteger(month) && Number.isFinite(year)) {
      return makeCheckedDate(year, month, day)
    }
  }

  const monthDay = /^([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s+(\d{2,4}))?$/.exec(t)
  if (monthDay) {
    const month = MONTH_TO_INDEX[monthDay[1]]
    const day = Number.parseInt(monthDay[2], 10)
    const year = withYear(monthDay[3])
    if (day >= 1 && day <= 31 && Number.isInteger(month) && Number.isFinite(year)) {
      return makeCheckedDate(year, month, day)
    }
  }

  return null
}

export function getDueDateOptions(now = new Date()) {
  const today = startOfDay(now)
  const tomorrow = addDays(today, 1)
  const endOfWeek = endOfWeekFriday(today)
  const endOfNextWeek = addDays(endOfWeek, 7)

  return [
    { id: "today", date: today, menuLabel: `Today, ${formatShort(today)}`, controlLabel: formatShort(today) },
    { id: "tomorrow", date: tomorrow, menuLabel: `Tomorrow, ${formatShort(tomorrow)}`, controlLabel: formatShort(tomorrow) },
    { id: "endOfWeek", date: endOfWeek, menuLabel: `End of the week, ${formatShort(endOfWeek)}`, controlLabel: formatShort(endOfWeek) },
    {
      id: "endOfNextWeek",
      date: endOfNextWeek,
      menuLabel: `End of the next week, ${formatShort(endOfNextWeek)}`,
      controlLabel: formatShort(endOfNextWeek),
    },
  ]
}

export function getDueDateById(id, now = new Date()) {
  const options = getDueDateOptions(now)
  const preset = options.find((item) => item.id === id)
  if (preset) return preset

  const customDate = parseCustomDueDateId(id)
  if (!customDate) return null
  return {
    id: customDueDateIdFromDate(customDate),
    date: customDate,
    menuLabel: formatShort(customDate),
    controlLabel: formatShort(customDate),
    custom: true,
  }
}

export function dueDateIdFromDate(date, now = new Date()) {
  const target = startOfDay(date).getTime()
  const options = getDueDateOptions(now)
  const preset = options.find((item) => startOfDay(item.date).getTime() === target)
  if (preset) return preset.id
  return customDueDateIdFromDate(date)
}
