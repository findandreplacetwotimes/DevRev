/**
 * Group activity items into renderable timeline groups and apply collapse rules.
 *
 * Collapse rules (Figma `6003:6860`):
 * - Today: nothing collapses.
 * - One past day with one event → show it.
 * - One past day with ≥2 events and no updates → collapse to a single "N events hidden. Show" row.
 * - One past day with updates → updates always show. If events ≥ 2, events collapse beneath them.
 *   If only one event, both update(s) and event are shown.
 * - Consecutive past days that each reduce to "events-only, collapse" merge into a single date-range
 *   group with one timestamp "first — last" and a combined "N events hidden" row.
 *
 * The returned shape is purely structural and ready for rendering:
 *
 * Day group:
 *  { kind: "day", dayKey, isToday, timestamp: { datePart, timePart }, updates, events, collapseEvents }
 *
 * Range group:
 *  { kind: "range", firstDayKey, lastDayKey, timestamp: { datePart, timePart }, events, hiddenCount }
 */

const MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function dayKeyOf(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function parseDayKey(key) {
  const [y, m, d] = key.split("-").map(Number)
  return { y, m, d }
}

/**
 * "TODAY" / "YESTERDAY" / "9 May" depending on how far `key` is from `nowKey`.
 * Returned string is rendered uppercase by the `MicroControl` timestamp layout.
 */
function labelFromDayKey(key, nowKey) {
  if (nowKey) {
    if (key === nowKey) return "today"
    const now = parseDayKey(nowKey)
    const target = parseDayKey(key)
    const nowMs = Date.UTC(now.y, now.m - 1, now.d)
    const targetMs = Date.UTC(target.y, target.m - 1, target.d)
    const diffDays = Math.round((nowMs - targetMs) / 86400000)
    if (diffDays === 1) return "yesterday"
  }
  const { m, d } = parseDayKey(key)
  return `${d} ${MONTHS_FULL[m - 1] ?? ""}`.trim()
}

/**
 * `oldest…newest` range label. Folds the month into a single suffix when both
 * endpoints share the same month (`7 — 8 May`), otherwise prints both
 * (`25 April — 2 May`).
 */
function labelFromRange(oldestKey, newestKey) {
  const a = parseDayKey(oldestKey)
  const b = parseDayKey(newestKey)
  if (a.y === b.y && a.m === b.m) {
    return `${a.d} — ${b.d} ${MONTHS_FULL[a.m - 1] ?? ""}`.trim()
  }
  return `${a.d} ${MONTHS_FULL[a.m - 1] ?? ""} — ${b.d} ${MONTHS_FULL[b.m - 1] ?? ""}`.trim()
}

/**
 * @param {import("./projectEvents").ActivityItem[]} items
 * @param {Date} [now]
 */
export function buildProjectActivityFeed(items, now = new Date()) {
  if (!Array.isArray(items) || items.length === 0) return []

  const todayKey = dayKeyOf(new Date(now))
  const sorted = [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

  /** Preserve DESC insertion order so the first key in `buckets` is the newest day. */
  const buckets = new Map()
  for (const item of sorted) {
    const t = new Date(item.createdAt)
    if (Number.isNaN(t.getTime())) continue
    const k = dayKeyOf(t)
    if (!buckets.has(k)) buckets.set(k, [])
    buckets.get(k).push(item)
  }

  const dayKeys = [...buckets.keys()]
  const groups = []

  let i = 0
  while (i < dayKeys.length) {
    const k = dayKeys[i]
    const dayItems = buckets.get(k)
    const events = dayItems.filter((it) => it.kind === "event")
    const updates = dayItems.filter((it) => it.kind === "update")

    if (k === todayKey) {
      /**
       * Today exposes at most one update so the most recent message stays prominent;
       * older same-day updates are suppressed from the visible feed. Today's events
       * are always fully expanded (the day never collapses).
       */
      groups.push({
        kind: "day",
        dayKey: k,
        isToday: true,
        timestamp: { datePart: "today", timePart: "" },
        updates: updates.slice(0, 1),
        events,
        collapseEvents: false,
      })
      i += 1
      continue
    }

    const dayLabel = labelFromDayKey(k, todayKey)

    const isCollapseOnly = updates.length === 0 && events.length >= 2

    if (isCollapseOnly) {
      // Greedily merge adjacent past collapse-only days into a single range group.
      let j = i + 1
      const collected = [{ k, events }]
      while (j < dayKeys.length) {
        const kj = dayKeys[j]
        if (kj === todayKey) break
        const itemsJ = buckets.get(kj)
        const evJ = itemsJ.filter((it) => it.kind === "event")
        const upJ = itemsJ.filter((it) => it.kind === "update")
        if (upJ.length === 0 && evJ.length >= 2) {
          collected.push({ k: kj, events: evJ })
          j += 1
        } else {
          break
        }
      }

      if (collected.length === 1) {
        groups.push({
          kind: "day",
          dayKey: k,
          isToday: false,
          timestamp: { datePart: dayLabel, timePart: "" },
          updates,
          events,
          collapseEvents: true,
        })
      } else {
        const newest = collected[0].k
        const oldest = collected[collected.length - 1].k
        const hiddenCount = collected.reduce((s, c) => s + c.events.length, 0)
        groups.push({
          kind: "range",
          firstDayKey: oldest,
          lastDayKey: newest,
          timestamp: { datePart: labelFromRange(oldest, newest), timePart: "" },
          /**
           * Per-day buckets preserved so expanding the range cleanly re-splits into
           * individual day groups (each with its own date timestamp) instead of dumping
           * a flat event list under one range header.
           */
          days: collected.map((c) => ({
            dayKey: c.k,
            timestamp: { datePart: labelFromDayKey(c.k, todayKey), timePart: "" },
            events: c.events,
          })),
          hiddenCount,
        })
      }
      i = j
    } else {
      const collapseEvents = updates.length > 0 && events.length >= 2
      groups.push({
        kind: "day",
        dayKey: k,
        isToday: false,
        timestamp: { datePart: dayLabel, timePart: "" },
        updates,
        events,
        collapseEvents,
      })
      i += 1
    }
  }

  return groups
}
