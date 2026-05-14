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
  /** Project-0004: Arcade Design System (2 per m1, 2 per m2, 1 per m3, 2 per m3, 1 per m4). */
  "Issue-0017": ["Project-0004", "Project-0004:m1"],
  "Issue-0018": ["Project-0004", "Project-0004:m1"],
  "Issue-0019": ["Project-0004", "Project-0004:m2"],
  "Issue-0020": ["Project-0004", "Project-0004:m2"],
  "Issue-0021": ["Project-0004", "Project-0004:m2"],
  "Issue-0022": ["Project-0004", "Project-0004:m3"],
  "Issue-0023": ["Project-0004", "Project-0004:m3"],
  "Issue-0024": ["Project-0004", "Project-0004:m4"],
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
      title: "Generate test coverage report",
      description: "Auto-generate unit test coverage metrics for the backlog module.",
      ownerId: "computer",
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
      title: "Review table header spacing",
      description: "Figma QA for table headers.",
      ownerId: "claude",
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
      title: "Optimize search indexing",
      description: "Improve search performance for large issue lists.",
      ownerId: "computer",
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
      ownerId: "claude",
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
      ownerId: "computer",
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
    // Arcade Design System issues (Project-0004)
    {
      id: "Issue-0017",
      team: "Design",
      title: "Define semantic color tokens for light/dark modes",
      description: "Establish color primitives and semantic naming convention for background, text, border, and accent tokens. Support both light and dark themes.",
      ownerId: "sophia-walker",
      dueDateId: "today",
      sprint: "Sprint 1",
      stage: "In Progress",
    },
    {
      id: "Issue-0018",
      team: "Design",
      title: "Build spacing and typography scale",
      description: "Define 4px grid spacing tokens and type scale with Editorial + System tracks. Custom font weights: 440, 540, 660.",
      ownerId: "claude",
      dueDateId: "tomorrow",
      sprint: "Sprint 1",
      stage: "In Progress",
    },
    {
      id: "Issue-0019",
      team: "Platform",
      title: "Build Button component with variants",
      description: "Implement headless Button component with primary, secondary, tertiary variants. Support start/end slots, polymorphic component prop, and full ARIA compliance.",
      ownerId: "lucas-rodriguez",
      dueDateId: "endOfWeek",
      sprint: "Sprint 2",
      stage: "Triage",
    },
    {
      id: "Issue-0020",
      team: "Platform",
      title: "Create Input and Select form components",
      description: "Form components with consistent focus states, validation styling, and accessibility attributes. Support controlled/uncontrolled modes.",
      ownerId: "noah-anderson",
      dueDateId: "endOfWeek",
      sprint: "Sprint 2",
      stage: "Triage",
    },
    {
      id: "Issue-0021",
      team: "Design",
      title: "Design Avatar component with agent support",
      description: "Avatar variants for users and AI agents (Computer, Claude). Brand color backgrounds (#6366F1, #CC785C) with logo rendering.",
      ownerId: "ava-martinez",
      dueDateId: "endOfNextWeek",
      sprint: "Sprint 3",
      stage: "No stage",
    },
    {
      id: "Issue-0022",
      team: "Core",
      title: "Set up Storybook with Arcade tokens",
      description: "Configure Storybook environment with design tokens and create component stories template. Document anatomy, variants, modifiers, and slots.",
      ownerId: "computer",
      dueDateId: null,
      sprint: "Sprint 3",
      stage: "No stage",
    },
    {
      id: "Issue-0023",
      team: "Platform",
      title: "Set up accessibility testing framework",
      description: "Integrate axe-core and establish automated a11y checks for all components in CI pipeline. Target: WCAG 2.2 AA compliance.",
      ownerId: "isabella-davis",
      dueDateId: null,
      sprint: "Sprint 4",
      stage: "No stage",
    },
    {
      id: "Issue-0024",
      team: "Growth",
      title: "Create migration guide from DLS",
      description: "Document component mappings, breaking changes, and codemods for teams migrating from legacy design system to Arcade.",
      ownerId: "mia-thompson",
      dueDateId: null,
      sprint: "Sprint 5",
      stage: "No stage",
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
      title: "Agentic Kanban",
      healthId: healthRotation[0],
      isMember: true,
      milestones: [
        { id: "Project-0001:m1", title: "Milestone 1", dueDateId: "endOfWeek", healthId: "on-track" },
        { id: "Project-0001:m2", title: "Milestone 2", dueDateId: "endOfNextWeek", healthId: "at-risk" },
      ],
    },
    {
      ...base[1],
      id: "Project-0002",
      healthId: healthRotation[1],
      isMember: false,
      milestones: [
        { id: "Project-0002:m1", title: "Milestone 1", dueDateId: null, healthId: "on-track" },
        { id: "Project-0002:m2", title: "Milestone 2", dueDateId: "tomorrow", healthId: "off-track" },
      ],
    },
    {
      ...base[2],
      id: "Project-0003",
      healthId: healthRotation[2],
      isMember: false,
      milestones: [{ id: "Project-0003:m1", title: "Milestone 1", dueDateId: "today", healthId: "at-risk" }],
    },
    {
      id: "Project-0004",
      title: "Arcade Design System",
      description: "Building a comprehensive, accessible design system to unify DevRev's product experience. Includes semantic tokens, reusable components, documentation, and migration tooling for product teams.",
      team: "Design",
      ownerId: "sophia-walker",
      dueDateId: "endOfNextWeek",
      sprint: "",
      stage: "in-progress",
      healthId: "on-track",
      isMember: true,
      createdDate: "2026-02-18",
      history: [
        {
          id: "timeline-arcade-1",
          type: "discussion",
          timestamp: Date.now() - (10 * 24 * 60 * 60 * 1000),
          author: "Dejan",
          content: "Kicked off Design Swarm '26 - converging on visual language and token architecture",
        },
      ],
      milestones: [
        { id: "Project-0004:m1", title: "Foundation & Tokens", dueDateId: "endOfWeek", healthId: "on-track" },
        { id: "Project-0004:m2", title: "Core Components", dueDateId: "endOfNextWeek", healthId: "on-track" },
        { id: "Project-0004:m3", title: "Documentation & Tooling", dueDateId: null, healthId: "at-risk" },
        { id: "Project-0004:m4", title: "Rollout & Migration", dueDateId: null, healthId: "at-risk" },
      ],
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
