/**
 * Team-level PM Agent settings (CHE-39). These are the team defaults every project in the team
 * inherits — project settings (`ProjectSettingsTab`) can narrow them but not widen them.
 *
 * Three policies:
 * 1. Meeting linking — auto-link meetings to the team's enhancements, plus the content-access gate
 *    from the meeting-access consent spec (link is metadata; content needs consent).
 * 2. Weekly status updates — cadence, and whether the agent auto-posts or drafts for a human gate
 *    ("propose, don't prescribe" — PM Agent spec § Generate Status).
 * 3. Project memory — opt-in before the agent persists derived memory on the team's projects.
 */

const LS_KEY = "devrev.teamAgentSettings.v1"

export const LINK_SCOPE_OPTIONS = [
  { id: "team-enhancements", label: "The team's enhancements only" },
  { id: "all-team-projects", label: "Any project owned by the team" },
]

export const CONFIDENCE_OPTIONS = [
  { id: "high", label: "High confidence only" },
  { id: "medium", label: "Medium and above" },
  { id: "all", label: "All plausible matches" },
]

export const REVIEW_WINDOW_OPTIONS = [
  { id: "4h", label: "4 hours" },
  { id: "12h", label: "12 hours" },
  { id: "24h", label: "24 hours" },
  { id: "48h", label: "48 hours" },
]

/** What happens if no reviewer acts before the window closes. */
export const REVIEW_TIMEOUT_OPTIONS = [
  { id: "hold", label: "Hold the draft (nothing publishes)" },
  { id: "publish", label: "Publish the draft as-is" },
  { id: "escalate", label: "Escalate to the project lead" },
]

export const MEMORY_RETENTION_OPTIONS = [
  { id: "90d", label: "90 days" },
  { id: "180d", label: "6 months" },
  { id: "project-close", label: "Until the project closes" },
  { id: "indefinite", label: "Keep indefinitely" },
]

/** Categories of derived memory the agent may persist on the project record (PM Agent spec § What Gets Persisted). */
export const MEMORY_CATEGORY_OPTIONS = [
  {
    id: "decisions",
    label: "Confirmed decisions",
    description: "Decision trail with date, owner, and source meeting.",
  },
  {
    id: "action-items",
    label: "Action items & scope changes",
    description: "Pending items extracted from meetings, until the team resolves them.",
  },
  {
    id: "meeting-content",
    label: "Meeting content excerpts",
    description: "Quotes and summaries from meetings with content access granted.",
  },
  {
    id: "signals",
    label: "Risk signals & health history",
    description: "Firing signals with evidence, and how health changed over time.",
  },
]

export const DEFAULT_TEAM_AGENT_SETTINGS = {
  meetingLinking: {
    enabled: true,
    scope: "team-enhancements",
    confidence: "high",
    /** Content access still needs a member's consent (spec § Consent model). Off = metadata only, always. */
    allowContentAccessRequests: true,
    /** Offer standing rules after 3 consecutive grants on the same series (spec § Progressive trust). */
    allowStandingRules: true,
    /** Post link/grant/revoke events to the project chat (spec § transparency ledger). */
    postLedgerToProjectChat: true,
  },
  weeklyStatus: {
    enabled: true,
    cadence: { frequency: "weekly", day: "friday", time: "14:00-15:00" },
    approvalMode: "human",
    reviewWindow: "24h",
    onReviewTimeout: "hold",
    /** Project lead + these extra reviewers can approve a draft. */
    reviewerIds: [],
    /** Approving a status update also updates the official health on the project record. */
    syncOfficialHealth: true,
  },
  projectMemory: {
    /** Opt-in: off until the team explicitly enables it. */
    enabled: false,
    categories: ["decisions", "action-items"],
    retention: "project-close",
    /** Memory is readable by anyone on the team, not just the project's members. */
    shareAcrossTeam: true,
  },
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

/** Merge stored settings over the defaults so new keys appear for teams that saved an older shape. */
function withDefaults(stored) {
  const base = clone(DEFAULT_TEAM_AGENT_SETTINGS)
  if (!stored || typeof stored !== "object") return base
  for (const group of Object.keys(base)) {
    if (stored[group] && typeof stored[group] === "object") {
      base[group] = { ...base[group], ...stored[group] }
    }
  }
  return base
}

export function loadTeamAgentSettings() {
  if (typeof window === "undefined") return clone(DEFAULT_TEAM_AGENT_SETTINGS)
  try {
    const raw = window.localStorage.getItem(LS_KEY)
    return withDefaults(raw ? JSON.parse(raw) : null)
  } catch {
    return clone(DEFAULT_TEAM_AGENT_SETTINGS)
  }
}

export function saveTeamAgentSettings(settings) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(settings))
  } catch {
    /* ignore quota */
  }
}

/**
 * One-line summary per policy for the settings list and the project-level "inherited from team" hints.
 * @param {typeof DEFAULT_TEAM_AGENT_SETTINGS} settings
 */
export function summarizeTeamAgentSettings(settings) {
  const s = withDefaults(settings)
  const linkScope = LINK_SCOPE_OPTIONS.find((o) => o.id === s.meetingLinking.scope)?.label ?? ""
  const confidence = CONFIDENCE_OPTIONS.find((o) => o.id === s.meetingLinking.confidence)?.label ?? ""
  const memoryCount = s.projectMemory.categories.length

  return {
    meetingLinking: s.meetingLinking.enabled
      ? `On · ${linkScope.toLowerCase()} · ${confidence.toLowerCase()}`
      : "Off · the agent won't link meetings",
    weeklyStatus: s.weeklyStatus.enabled
      ? `${describeCadence(s.weeklyStatus.cadence)} · ${
          s.weeklyStatus.approvalMode === "auto" ? "auto-published" : "human approval required"
        }`
      : "Off · no status updates generated",
    projectMemory: s.projectMemory.enabled
      ? `Opted in · ${memoryCount} ${memoryCount === 1 ? "category" : "categories"} · ${
          MEMORY_RETENTION_OPTIONS.find((o) => o.id === s.projectMemory.retention)?.label.toLowerCase() ?? ""
        }`
      : "Not opted in · nothing persisted between runs",
  }
}

/** "Every week on Friday, 14:00 – 15:00" */
export function describeCadence(cadence) {
  const frequency = { daily: "Every day", weekly: "Every week", biweekly: "Every 2 weeks" }[cadence?.frequency] ?? "Every week"
  const day = cadence?.day ? cadence.day.charAt(0).toUpperCase() + cadence.day.slice(1) : ""
  const time = (cadence?.time ?? "").replace("-", " – ")
  const dayPart = cadence?.frequency === "daily" || !day ? "" : ` on ${day}`
  return `${frequency}${dayPart}, ${time}`
}
