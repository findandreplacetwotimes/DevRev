import { OWNERS } from "./owners"

/**
 * @typedef {Object} ActivityItem
 * @property {string} id
 * @property {"event"|"update"} kind
 * @property {string} createdAt — ISO timestamp
 * @property {string} actorInitial
 * @property {string} [actorName]
 * @property {string} [attribute] — for events; optional on updates that ride along an attribute change.
 * @property {string} [fromValue]
 * @property {string} [toValue]
 * @property {string} [text] — body for `update` kind.
 * @property {string} [source] — `synthetic`, `computer-chat`, `system`.
 */

const TITLE_POOL = [
  "Backlog polish",
  "Ship checklist v1",
  "Pilot rollout",
  "Q2 push",
  "Triage cleanup",
  "Discovery sprint",
]

const DUE_DATE_POOL = ["End of week", "Today", "Tomorrow", "Next Friday", "End of month", "No date"]
const HEALTH_POOL = ["On track", "At risk", "Off track"]
const STAGE_POOL = ["Triage", "In progress", "In review", "Done"]
const MILESTONE_POOL = ["Discovery", "Build", "Validation", "Launch"]
const SPRINT_POOL = ["Backlog", "Sprint 1", "Sprint 2", "Sprint 3"]
const SCOPE_POOL = ["Narrow MVP", "MVP", "MVP + pilot", "MVP + compliance"]

const ATTRIBUTE_POOLS = {
  Owner: OWNERS.map((o) => o.name),
  Title: TITLE_POOL,
  "Due date": DUE_DATE_POOL,
  Health: HEALTH_POOL,
  Stage: STAGE_POOL,
  Milestone: MILESTONE_POOL,
  Sprint: SPRINT_POOL,
  Scope: SCOPE_POOL,
}

const ATTRIBUTE_NAMES = Object.keys(ATTRIBUTE_POOLS)

const UPDATE_TEXTS = [
  "The team is actively working on improving sprint efficiency by addressing current challenges in sprint management. Efforts are focused on streamlining communication, automating task tracking, and enhancing visibility to reduce time spent on administrative activities. Progress is being monitored closely to ensure timely identification and resolution of issues, aiming to optimize overall sprint execution.",
  "Synced scope with design and filed follow-ups for QA. Next: verify analytics events on the backlog table and update the rollout docs.",
  "Rolled QA feedback into acceptance criteria for the rollout epic; still waiting on infra for the feature-flag naming convention before we cut the release branch.",
  "Pilot customers agreed to a phased rollout: internal dogfood next week, then three design partners with read-only dashboards before full edit capacity.",
  "Condensed stakeholder interviews into five themes: onboarding friction, latency in search, role visibility, billing clarity, integrations.",
  "Suggestion: tighten the description so engineering can scope week one without another sync. Drafting a revision based on the latest review notes.",
]

/**
 * Day-by-day schedule shaping the seeded activity so every collapse case is visible.
 * `day` is offset from today (0 = today). Times below are spread within working hours.
 *
 * Cases covered:
 * - Today: events visible, no collapsing.
 * - Yesterday: single event (1 event → expanded).
 * - Day −2: 1 update + 1 event (both shown).
 * - Day −3: 4 events only (collapsed).
 * - Day −4: 1 update + 3 events (update shown, events collapsed).
 * - Day −5 & −6: events-only runs that merge into a single date-range entry.
 */
const SCHEDULE = [
  { day: 0, events: 3, updates: 1, updateWithAttr: true },
  { day: 1, events: 1, updates: 0 },
  { day: 2, events: 1, updates: 1, updateWithAttr: false },
  { day: 3, events: 4, updates: 0 },
  { day: 4, events: 3, updates: 1, updateWithAttr: true },
  { day: 5, events: 5, updates: 0 },
  { day: 6, events: 3, updates: 0 },
]

/** Cheap deterministic RNG seeded by `seed`; same project always renders the same activity. */
function rngFromString(seed) {
  let h = 1
  for (let i = 0; i < seed.length; i += 1) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0
  }
  return () => {
    h = (Math.imul(48271, h) + 1013904223) | 0
    return (h >>> 0) / 0x100000000
  }
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)]
}

function pickPair(rng, arr) {
  if (arr.length < 2) return [arr[0], arr[0]]
  const a = pick(rng, arr)
  let b = pick(rng, arr)
  let guard = 0
  while (b === a && guard < 8) {
    b = pick(rng, arr)
    guard += 1
  }
  return [a, b]
}

function withTime(base, hour, rng) {
  const t = new Date(base)
  t.setHours(hour, Math.floor(rng() * 60), Math.floor(rng() * 60), 0)
  return t
}

/**
 * Synthetic project activity (events + updates) for the last week, deterministic per project id.
 * Items returned newest-first. The result is meant to be merged with persisted chat updates from
 * `projectActivityStore` and then fed to `buildProjectActivityFeed` for collapse + grouping.
 *
 * @param {string} projectId
 * @param {Date} [now]
 * @returns {ActivityItem[]}
 */
export function generateProjectActivity(projectId, now = new Date()) {
  if (!projectId) return []
  const rng = rngFromString(`projectActivity:${projectId}`)
  /** @type {ActivityItem[]} */
  const items = []
  let counter = 0

  for (const slot of SCHEDULE) {
    const dayBase = new Date(now)
    dayBase.setDate(dayBase.getDate() - slot.day)
    dayBase.setHours(0, 0, 0, 0)

    for (let e = 0; e < slot.events; e += 1) {
      const hour = 9 + Math.floor(rng() * 9)
      const actor = pick(rng, OWNERS)
      const attribute = pick(rng, ATTRIBUTE_NAMES)
      const [from, to] = pickPair(rng, ATTRIBUTE_POOLS[attribute])
      counter += 1
      items.push({
        id: `pe-${projectId}-${slot.day}-${e}-${counter}`,
        kind: "event",
        createdAt: withTime(dayBase, hour, rng).toISOString(),
        actorInitial: (actor.name[0] ?? "M").toUpperCase(),
        actorName: actor.name,
        attribute,
        fromValue: from,
        toValue: to,
        source: "synthetic",
      })
    }

    for (let u = 0; u < (slot.updates ?? 0); u += 1) {
      const hour = 11 + Math.floor(rng() * 6)
      const actor = pick(rng, OWNERS)
      const text = pick(rng, UPDATE_TEXTS)
      counter += 1
      /** @type {ActivityItem} */
      const update = {
        id: `pu-${projectId}-${slot.day}-${u}-${counter}`,
        kind: "update",
        createdAt: withTime(dayBase, hour, rng).toISOString(),
        actorInitial: (actor.name[0] ?? "M").toUpperCase(),
        actorName: actor.name,
        text,
        source: "synthetic",
      }
      if (slot.updateWithAttr) {
        const attribute = pick(rng, ATTRIBUTE_NAMES)
        const [from, to] = pickPair(rng, ATTRIBUTE_POOLS[attribute])
        update.attribute = attribute
        update.fromValue = from
        update.toValue = to
      }
      items.push(update)
    }
  }

  return items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}
