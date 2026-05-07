/** Issue → [projectId, milestoneId] for demo scope (see `createInitialProjects` milestone ids). */
const ISSUE_PROJECT_MILESTONE = {
  /** Project-0001: 3 issues per milestone (`m1`, `m2`). */
  "Issue-0001": ["Project-0001", "Project-0001:m1"],
  "Issue-0002": ["Project-0001", "Project-0001:m1"],
  "Issue-0005": ["Project-0001", "Project-0001:m1"],
  "Issue-0003": ["Project-0001", "Project-0001:m2"],
  "Issue-0004": ["Project-0001", "Project-0001:m2"],
  "Issue-0008": ["Project-0001", "Project-0001:m2"],
  "Issue-0011": ["Project-0001", "Project-0001:m1"],
  "Issue-0012": ["Project-0001", "Project-0001:m1"],
  "Issue-0013": ["Project-0001", "Project-0001:m1"],
  "Issue-0014": ["Project-0001", "Project-0001:m2"],
  "Issue-0015": ["Project-0001", "Project-0001:m2"],
  "Issue-0016": ["Project-0001", "Project-0001:m2"],
  "Issue-0006": ["Project-0002", "Project-0002:m1"],
  "Issue-0007": ["Project-0002", "Project-0002:m2"],
  "Issue-0009": ["Project-0002", "Project-0002:m1"],
  "Issue-0010": ["Project-0003", "Project-0003:m1"],
}

function seedCreatedDateByIssueId(issueId) {
  const m = /(\d+)$/.exec(issueId)
  const n = m ? Number.parseInt(m[1], 10) : 1
  const base = new Date(2026, 3, 1)
  base.setDate(base.getDate() + Math.max(0, n - 1))
  const y = base.getFullYear()
  const mo = String(base.getMonth() + 1).padStart(2, "0")
  const d = String(base.getDate()).padStart(2, "0")
  return `${y}-${mo}-${d}`
}

function createInitialIssueRowsWithoutProjectLink() {
  return [
    {
      id: "Issue-0001",
      team: "Core",
      title: "Build core flow for feature",
      description: "Wire shared issues list to the backlog table.",
      ownerId: "olivia-brown",
      dueDateId: "today",
      sprint: "Sprint 1",
      stage: "In Progress",
    },
    {
      id: "Issue-0002",
      team: "Core",
      title: "",
      description: "",
      ownerId: "liam-johnson",
      dueDateId: null,
      sprint: "Sprint 2",
      stage: "Triage",
    },
    {
      id: "Issue-0003",
      team: "Growth",
      title: "Polish nav-panel interactions",
      description: "",
      ownerId: null,
      dueDateId: "tomorrow",
      sprint: "Sprint 3",
      stage: "No stage",
    },
    {
      id: "Issue-0004",
      team: "Platform",
      title: "Connect AI chat modes to nav actions",
      description: "",
      ownerId: "ava-martinez",
      dueDateId: "endOfWeek",
      sprint: "Sprint 4",
      stage: "In review",
    },
    {
      id: "Issue-0005",
      team: "Design",
      title: "",
      description: "Figma QA for table headers.",
      ownerId: null,
      dueDateId: null,
      sprint: "Sprint 5",
      stage: "No stage",
    },
    {
      id: "Issue-0006",
      team: "Infrastructure",
      title: "Harden KV sync for concurrent editors",
      description: "",
      ownerId: "noah-anderson",
      dueDateId: null,
      sprint: "Sprint 1",
      stage: "In Progress",
    },
    {
      id: "Issue-0007",
      team: "Core",
      title: "",
      description: "",
      ownerId: "mia-thompson",
      dueDateId: "endOfNextWeek",
      sprint: "Sprint 2",
      stage: "Triage",
    },
    {
      id: "Issue-0008",
      team: "Growth",
      title: "",
      description: "",
      ownerId: "ethan-clark",
      dueDateId: "today",
      sprint: "Sprint 3",
      stage: "In review",
    },
    {
      id: "Issue-0009",
      team: "Platform",
      title: "Document Issue schema for API clients",
      description: "",
      ownerId: null,
      dueDateId: "endOfWeek",
      sprint: "Sprint 4",
      stage: "No stage",
    },
    {
      id: "Issue-0010",
      team: "Core",
      title: "Retire demo rows after shared issues ship",
      description: "",
      ownerId: "isabella-davis",
      dueDateId: null,
      sprint: "Sprint 5",
      stage: "In Progress",
    },
    {
      id: "Issue-0011",
      team: "Core",
      title: "Finalize API retry strategy for issues sync",
      description: "Define retry/backoff behavior for issue saves and document expected error states in the client.",
      ownerId: "lucas-rodriguez",
      dueDateId: "tomorrow",
      sprint: "Sprint 1",
      stage: "In Progress",
    },
    {
      id: "Issue-0012",
      team: "Platform",
      title: "Validate breadcrumb context across deep links",
      description: "Add navigation-state checks so breadcrumb trails reflect entry path from Issues or Projects.",
      ownerId: "sophia-walker",
      dueDateId: "endOfWeek",
      sprint: "Sprint 2",
      stage: "In review",
    },
    {
      id: "Issue-0013",
      team: "Design",
      title: "Audit spacing tokens for milestone rows",
      description: "Review milestone row spacing against the design spec and align shared spacing utilities.",
      ownerId: "jackson-lee",
      dueDateId: "endOfNextWeek",
      sprint: "Sprint 3",
      stage: "Triage",
    },
    {
      id: "Issue-0014",
      team: "Growth",
      title: "Improve milestone loading-state copy",
      description: "Replace generic loading text with scoped copy for milestones and issue rows in project pages.",
      ownerId: "ava-martinez",
      dueDateId: "today",
      sprint: "Sprint 4",
      stage: "In Progress",
    },
    {
      id: "Issue-0015",
      team: "Infrastructure",
      title: "Add telemetry for issue open source context",
      description: "Capture whether issue detail was opened from list, project milestone, or direct URL for UX analysis.",
      ownerId: "noah-anderson",
      dueDateId: "endOfWeek",
      sprint: "Sprint 5",
      stage: "No stage",
    },
    {
      id: "Issue-0016",
      team: "Core",
      title: "Backfill seed data parity checks",
      description: "Add validation to ensure new seed issues include owner, due date, title, and description before bootstrapping.",
      ownerId: "mia-thompson",
      dueDateId: "tomorrow",
      sprint: "Sprint 1",
      stage: "In review",
    },
  ]
}

/**
 * Default backlog used when KV has never been seeded (`/api/issues` GET bootstrap).
 */
export function createInitialIssues() {
  return createInitialIssueRowsWithoutProjectLink().map((row) => {
    const link = ISSUE_PROJECT_MILESTONE[row.id]
    const issue = {
      ...row,
      priority: "None",
      createdDate: seedCreatedDateByIssueId(row.id),
    }
    if (!link) return { ...issue, projectId: null, milestoneId: null }
    return { ...issue, projectId: link[0], milestoneId: link[1] }
  })
}

/**
 * Keep existing issues intact, but append any seed issues missing by id.
 * Useful when persisted storage predates newly added seed rows.
 *
 * @param {import("./issuesApi").Issue[]} issues
 * @returns {import("./issuesApi").Issue[]}
 */
export function mergeMissingSeedIssues(issues) {
  const byId = new Set(issues.map((i) => i.id))
  const missing = createInitialIssues().filter((seed) => !byId.has(seed.id))
  if (missing.length === 0) return issues
  return [...issues, ...missing]
}

/**
 * Old persisted issues may omit `projectId` / `milestoneId`. Restore from seed when both are unset.
 * @param {import("./issuesApi").Issue[]} issues
 * @returns {import("./issuesApi").Issue[]}
 */
export function mergeSeedIssueProjectLinks(issues) {
  const seedById = new Map(createInitialIssues().map((i) => [i.id, i]))
  return issues.map((issue) => {
    const s = seedById.get(issue.id)
    if (!s) return issue
    const hasLink = issue.projectId != null || issue.milestoneId != null
    if (hasLink) return issue
    if (s.projectId == null && s.milestoneId == null) return issue
    return { ...issue, projectId: s.projectId, milestoneId: s.milestoneId }
  })
}

export function createInitialProjects() {
  const healthRotation = ["on-track", "at-risk", "off-track"]
  const base = createInitialIssueRowsWithoutProjectLink().slice(0, 3)
  return [
    {
      ...base[0],
      id: "Project-0001",
      healthId: healthRotation[0],
      milestones: [
        { id: "Project-0001:m1", title: "Milestone 1", dueDateId: "endOfWeek", healthId: "on-track" },
        { id: "Project-0001:m2", title: "Milestone 2", dueDateId: "endOfNextWeek", healthId: "at-risk" },
      ],
    },
    {
      ...base[1],
      id: "Project-0002",
      healthId: healthRotation[1],
      milestones: [
        { id: "Project-0002:m1", title: "Milestone 1", dueDateId: null, healthId: "on-track" },
        { id: "Project-0002:m2", title: "Milestone 2", dueDateId: "tomorrow", healthId: "off-track" },
      ],
    },
    {
      ...base[2],
      id: "Project-0003",
      healthId: healthRotation[2],
      milestones: [{ id: "Project-0003:m1", title: "Milestone 1", dueDateId: "today", healthId: "at-risk" }],
    },
  ]
}

/**
 * When storage predates `milestones[]`, backfill from the default project shape so the project page can render scope.
 * @param {import("./issuesApi").Project[]} projects
 * @returns {import("./issuesApi").Project[]}
 */
export function mergeSeedMilestonesIntoProjects(projects) {
  const seed = createInitialProjects()
  const byId = new Map(seed.map((p) => [p.id, p]))
  return projects.map((p) => {
    const seedP = byId.get(p.id)
    const cur = p.milestones ?? []
    if (cur.length > 0 || !seedP?.milestones?.length) return p
    return { ...p, milestones: seedP.milestones }
  })
}

export function createInitialSprints() {
  return [
    { id: "Sprint 1", startDate: "2026-04-01", endDate: "2026-04-15" },
    { id: "Sprint 2", startDate: "2026-04-15", endDate: "2026-04-29" },
    { id: "Sprint 3", startDate: "2026-04-29", endDate: "2026-05-13" },
    { id: "Sprint 4", startDate: "2026-05-13", endDate: "2026-05-27" },
    { id: "Sprint 5", startDate: "2026-05-27", endDate: "2026-06-10" },
  ]
}
