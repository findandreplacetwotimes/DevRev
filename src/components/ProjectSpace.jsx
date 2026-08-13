import { useMemo, useState } from "react"

function Icon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" }
  const paths = {
    search: <><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    back: <><path d="M19 12H5M11 18l-6-6 6-6"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    chevronDown: <path d="m6 9 6 6 6-6"/>,
    file: <><path d="M14 3v5h5"/><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-5Z"/></>,
    sparkle: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    send: <><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7Z"/></>,
    brain: <><path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-1 5.8V15a3 3 0 0 0 4 2.8V19a2 2 0 0 0 4 0V4a1 1 0 0 0-1-1Z"/><path d="M15 3a3 3 0 0 1 3 3 3 3 0 0 1 1 5.8V15a3 3 0 0 1-4 2.8"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 6a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.6"/></>,
    dot: <circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none"/>,
    pin: <><path d="M9 3h6l-1 6 3 3v2h-4v5l-1 2-1-2v-5H6v-2l3-3-1-6Z"/></>,
    attributes: <><path d="M4 6h16M4 12h16M4 18h10"/><circle cx="17" cy="18" r="2.4"/></>,
    target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></>,
    checklist: <><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    x: <path d="m6 6 12 12M18 6 6 18"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    user: <><circle cx="12" cy="8" r="3.4"/><path d="M5 20a7 7 0 0 1 14 0"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.5 6 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-6-3.5-9s1-6.5 3.5-9Z"/></>,
    folderPlus: <><path d="M4 6a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4V6Z"/><path d="M12 11v5M9.5 13.5h5"/></>,
  }
  return <svg {...common}>{paths[name]}</svg>
}

// ---- Project data (adapted from the Project Space prototype) ----
const analytics = {
  id: "analytics", name: "Session Analytics", emoji: "📊",
  desc: "Understand how teams use Computer sessions and where they drop off.",
  stage: "Active", tags: ["analytics", "q3"], health: "On track", tone: "good",
  sessions: 12, files: 8, due: "Aug 28", owners: ["PP", "RS"], progress: 53, visibility: "Invited people only",
  team: "Growth", access: ["PP", "RS", "AK", "G"],
  caps: { attributes: true, plan: true, work: true },
  objs: { issues: true, enhancements: true, tickets: true, tasks: true },
  description: "Session Analytics gives every team a clear view of how Computer is used and where the experience breaks down. It ships in three phases through Q3.",
  brief: [
    "We're figuring out why teams stop using Computer after their first session. Assume the reader knows our product but not our data model.",
    "Always cite the source file when you quote a number. Prefer weekly cohorts over daily. Flag anything below 200 sessions as low confidence.",
  ],
  members: [
    { i: "PP", n: "Priyanka Pal", role: "Owner", note: "you" },
    { i: "RS", n: "Ravi Sethi", role: "Can edit" },
    { i: "AK", n: "Akhil D.", role: "Can view" },
    { i: "G", n: "Growth", role: "Can edit", note: "Team · 8 people" },
  ],
  sessionList: [
    { id: "s1", title: "Drop-off between session 1 and 2", subtitle: "Pulled the funnel from Amplitude, wrote up three hypotheses on why teams stall.", link: "ISS-244", meta: "2h ago",
      answer: "62% of accounts start a second session within 7 days, but the ones that churn share a pattern — they never attach a file. Sessions with at least one file attached return at 81%; sessions without return at 29%. Source: session-funnel-jul.xlsx and tracking-plan-v4.csv. This contradicts ISS-244, which assumes the step-2 undercount is instrumentation — the gap looks behavioural, not a tracking bug.",
      issue: { id: "ISS-244", label: "Funnel step 2 undercounts web sessions", meta: "In progress · Funnel dashboard" } },
    { id: "s2", title: "Weekly metrics recap", subtitle: "Summarised the week's session and retention movement for the team update.", meta: "Yesterday" },
    { id: "s3", title: "Instrumentation gaps audit", subtitle: "Checked the tracking plan against what actually fires in production.", link: "ISS-231", meta: "Mon" },
    { id: "s4", title: "Draft: analytics FAQ for support", subtitle: "Turned the recurring analytics questions into a support-ready FAQ.", meta: "Jul 3" },
    { id: "s5", title: "Cohort chart debug", subtitle: "Traced why the cohort chart renders empty under 200 sessions.", meta: "Jul 1" },
    { id: "s6", title: "Tracking plan diff", subtitle: "Diffed the tracking plan against what fires in production.", meta: "Jun 29" },
    { id: "s7", title: "Exports scoping", subtitle: "Scoped the self-serve CSV export raised by four accounts.", meta: "Jun 27" },
  ],
  fileList: [
    { name: "tracking-plan-v4.csv", meta: "Added by Dhara · used in 6 chats", size: "1.2 MB" },
    { name: "session-funnel-jul.xlsx", meta: "Added by Piyush · used in 4 chats", size: "840 KB" },
    { name: "Analytics PRD.pdf", meta: "Added by Kunal · used in 9 chats", size: "2.4 MB" },
    { name: "retention-cohorts.png", meta: "Generated in “Weekly metrics recap”", size: "310 KB" },
  ],
  milestones: [
    { title: "Event instrumentation", status: "Done", tone: "good", meta: "6 issues · closed Jun 28", pct: 100 },
    { title: "Funnel dashboard", status: "Active", tone: "info", meta: "5 issues · due Jul 24 · Dhara", pct: 60 },
    { title: "Self-serve exports", status: "Planned", tone: "default", meta: "3 issues · due Aug 15", pct: 0 },
  ],
  work: {
    Issues: [
      { id: "ISS-244", title: "Funnel step 2 undercounts web sessions", meta: "Funnel dashboard", status: "In progress", tone: "info", prov: "Created from the session “Drop-off between session 1 and 2”" },
      { id: "ISS-231", title: "Add missing events to tracking plan", meta: "Instrumentation", status: "In progress", tone: "info" },
      { id: "ISS-219", title: "Cohort chart renders empty under 200 sessions", meta: "Funnel dashboard", status: "Blocked", tone: "risk" },
      { id: "ISS-198", title: "Instrument session replay opt-in", meta: "Instrumentation", status: "Done", tone: "good" },
    ],
    Enhancements: [
      { id: "ENH-51", title: "Self-serve CSV export of any cohort", meta: "4 accounts", status: "Planned", tone: "default", prov: "Raised in the session “Exports scoping”" },
      { id: "ENH-47", title: "Weekly digest email of session metrics", meta: "Deliveroo", status: "Backlog", tone: "default" },
      { id: "ENH-39", title: "Compare two date ranges side by side", meta: "11 accounts", status: "Shipped", tone: "good" },
    ],
    Tickets: [
      { id: "TKT-908", title: "Dashboard numbers don't match our warehouse", meta: "Deliveroo", status: "Awaiting eng", tone: "warn", prov: "Linked to ISS-244" },
      { id: "TKT-871", title: "Cannot export sessions older than 90 days", meta: "Acme Corp", status: "In progress", tone: "info" },
      { id: "TKT-844", title: "Request: API access to session events", meta: "Northwind", status: "Resolved", tone: "good" },
    ],
    Tasks: [
      { id: "TSK-77", title: "Send tracking plan to eng for review", meta: "Dhara · Jul 2", status: "Done", tone: "good" },
      { id: "TSK-81", title: "Book funnel walkthrough with Deliveroo", meta: "Piyush · due Jul 18", status: "In progress", tone: "info" },
      { id: "TSK-84", title: "Decide low-confidence threshold with data science", meta: "Unassigned · due Jul 22", status: "To do", tone: "default" },
    ],
  },
}

// Lighter-weight projects share the same shape; they render every tab with real (if smaller) content.
function makeProject(base) {
  return {
    visibility: "Invited people only", team: "—", access: base.owners, progress: 0,
    caps: base.caps ?? { attributes: false, plan: false, work: false },
    objs: base.objs ?? { issues: false, enhancements: false, tickets: false, tasks: false },
    description: base.desc,
    brief: [base.desc, "Every session started here begins with this brief plus the project's files and linked work."],
    members: base.owners.map((i, idx) => ({ i, n: i, role: idx === 0 ? "Owner" : "Can edit", note: idx === 0 ? "you" : undefined })),
    sessionList: base.sessionList ?? [
      { id: "s1", title: "Kickoff & scope", subtitle: "Framed the problem and pulled the starting context into the space.", meta: "2d ago" },
      { id: "s2", title: "Working notes", subtitle: "Ongoing thread the team drops findings and questions into.", meta: "Yesterday" },
    ],
    fileList: base.fileList ?? [
      { name: "brief.md", meta: "Added by owner", size: "12 KB" },
      { name: "context.pdf", meta: "Reference material", size: "1.1 MB" },
    ],
    milestones: base.milestones ?? [],
    work: base.work ?? { Issues: [], Enhancements: [], Tickets: [], Tasks: [] },
    ...base,
  }
}

const rawProjects = [
  analytics,
  makeProject({ id: "billing", name: "Billing revamp", emoji: "🧾", desc: "Move invoicing to the new metering service. Contracts and pricing docs live here.", stage: "Active", tags: ["platform"], health: "On track", tone: "good", sessions: 31, files: 22, due: "Sep 12", owners: ["AK", "PP", "MN"], progress: 45,
    caps: { attributes: true, plan: true, work: true }, objs: { issues: false, enhancements: false, tickets: true, tasks: false },
    work: { Issues: [], Enhancements: [], Tickets: [
      { id: "TKT-410", title: "Invoice totals differ from the metering export", meta: "Acme Corp", status: "In progress", tone: "info" },
      { id: "TKT-388", title: "Proration wrong on mid-cycle plan change", meta: "Northwind", status: "Awaiting eng", tone: "warn" },
    ], Tasks: [] },
    milestones: [
      { title: "Metering integration", status: "Active", tone: "info", meta: "8 issues · due Aug 30", pct: 55 },
      { title: "Invoice redesign", status: "Planned", tone: "default", meta: "due Sep 12", pct: 0 },
    ],
    sessionList: [
      { id: "s1", title: "Metering cutover plan", subtitle: "Drafted the cutover sequence to the new metering service.", meta: "3h ago" },
      { id: "s2", title: "Proration edge cases", subtitle: "Worked through the mid-cycle plan-change proration rules.", meta: "Yesterday" },
      { id: "s3", title: "Invoice copy review", subtitle: "Reviewed the new invoice copy against legal's notes.", meta: "Mon" },
    ] }),
  makeProject({ id: "deliveroo", name: "Deliveroo onboarding", emoji: "🛴", desc: "Rollout plan, migration notes and weekly sync recaps for the Deliveroo account.", stage: "Planning", tags: ["customer"], health: "Needs attention", tone: "warn", sessions: 5, files: 3, due: "Aug 22", owners: ["RS"], progress: 20 }),
  makeProject({ id: "q3", name: "Q3 planning", emoji: "🗺️", desc: "Goals, headcount model and the running planning thread with leadership.", stage: "Active", tags: ["growth"], health: "On track", tone: "good", sessions: 18, files: 6, due: "Aug 15", owners: ["PP", "LT"], progress: 70,
    sessionList: [
      { id: "s1", title: "Headcount model", subtitle: "Built the headcount model against the Q3 goal tree.", meta: "1h ago" },
      { id: "s2", title: "Leadership thread", subtitle: "Running planning conversation with leadership on priorities.", meta: "Today" },
    ] }),
  makeProject({ id: "search", name: "Search relevance", emoji: "🔍", desc: "Ranking experiments, eval sets and the notes from every tuning session.", stage: "Active", tags: ["platform"], health: "On track", tone: "good", sessions: 9, files: 14, due: "Sep 30", owners: ["MN", "AK"], progress: 40 }),
  makeProject({ id: "pricing", name: "Pricing experiments", emoji: "💸", desc: "Packaging tests, willingness-to-pay research and the pricing memo drafts.", stage: "Planning", tags: ["growth"], health: "Needs attention", tone: "warn", sessions: 7, files: 11, due: "No due date", owners: ["PP"], progress: 15 }),
  makeProject({ id: "mobile", name: "Mobile parity", emoji: "📱", desc: "Closing the gap between web and mobile. Specs, audits and review threads.", stage: "Active", tags: ["platform"], health: "At risk", tone: "risk", sessions: 22, files: 9, due: "Oct 4", owners: ["LT", "RS", "AK"], progress: 55 }),
  makeProject({ id: "acme", name: "Acme migration", emoji: "🏗️", desc: "Data migration runbook and the customer-facing comms for the Acme cutover.", stage: "Active", tags: ["customer"], health: "On track", tone: "good", sessions: 14, files: 27, due: "Aug 19", owners: ["AK", "PP"], progress: 65 }),
  makeProject({ id: "onboarding", name: "Onboarding rewrite", emoji: "🚀", desc: "New first-run flow. Copy drafts, funnel data and usability session notes.", stage: "Planning", tags: ["growth"], health: "Needs attention", tone: "warn", sessions: 6, files: 5, due: "Sep 5", owners: ["LT"], progress: 10 }),
  makeProject({ id: "support", name: "Support deflection", emoji: "🎧", desc: "Which questions the assistant can answer alone, and what it still escalates.", stage: "Completed", tags: ["customer"], health: "Shipped", tone: "good", sessions: 19, files: 8, due: "Shipped Jul 30", owners: ["RS", "MN"], progress: 100 }),
  makeProject({ id: "design", name: "Design system 3.0", emoji: "🎨", desc: "Token migration, component audit and the weekly design review recaps.", stage: "Completed", tags: ["platform"], health: "Shipped", tone: "good", sessions: 26, files: 31, due: "Shipped Jul 11", owners: ["PP", "LT"], progress: 100 }),
  makeProject({ id: "northstar", name: "Northstar metrics", emoji: "📈", desc: "Defining the metric tree and wiring the dashboards behind it.", stage: "Planning", tags: ["growth"], health: "Needs attention", tone: "warn", sessions: 4, files: 2, due: "No due date", owners: ["MN"], progress: 5 }),
]

const VIS_BY_ID = { analytics: "shared", billing: "shared", deliveroo: "workspace", q3: "personal", search: "shared", pricing: "personal", mobile: "workspace", acme: "shared", onboarding: "personal", support: "workspace", design: "workspace", northstar: "personal" }
export function visLabel(vis) {
  return vis === "personal" ? "Personal" : vis === "workspace" ? "Everyone in workspace" : "Invited people only"
}

export const workspaceProjects = rawProjects.map((p) => {
  const vis = VIS_BY_ID[p.id] ?? "shared"
  return { ...p, vis, visibility: visLabel(vis), detail: `${p.sessions} people · ${p.files} files · ${p.due}` }
})

const VIS_FILTERS = [["All", "all"], ["Personal", "personal"], ["Shared", "shared"], ["Workspace", "workspace"]]

export function getProject(id) {
  return workspaceProjects.find((p) => p.id === id) ?? workspaceProjects[0]
}

// Build a session "source" for a project session row — used by the detail view and the left nav.
export function makeSessionSource(project, session) {
  return {
    id: `${project.id}-${session?.id ?? "new"}`,
    title: session?.title ?? `New session in ${project.name}`,
    agent: "Computer",
    project: project.name,
    description: session?.answer ?? `Starting from this project's brief, ${project.files} files and its linked work. What would you like to explore?`,
    status: session ? "Session active" : "Waiting for your first prompt",
    context: {
      issue: session?.issue ?? null,
      files: project.fileList.map((f) => ({ path: f.name, note: f.meta })),
      records: [
        ...project.work.Issues.filter((i) => i.id !== session?.issue?.id).slice(0, 2).map((i) => ({ type: "Issue", label: `${i.id} · ${i.title}`, meta: i.status })),
        ...project.milestones.slice(0, 1).map((m) => ({ type: "Doc", label: m.title, meta: m.meta })),
      ],
      project: { name: project.name, meta: `${project.sessions} sessions · ${project.files} files` },
      impact: `${project.stage} · ${project.health}`,
    },
  }
}

export function ProjectSpace({ mode, projects = workspaceProjects, projectId, initialTab, onOpenProject, onNewProject, onBack, onOpenSession, caps, onToggleCap, onToggleObj, pinned, onTogglePin }) {
  if (mode === "detail") {
    const project = projects.find((p) => p.id === projectId) ?? projects[0]
    return <ProjectDetail project={project} initialTab={initialTab} onBack={onBack} onOpenSession={onOpenSession} caps={caps} onToggleCap={onToggleCap} onToggleObj={onToggleObj} pinned={pinned?.includes(project.id)} onTogglePin={onTogglePin} />
  }
  return <ProjectList projects={projects} onOpenProject={onOpenProject} onNewProject={onNewProject} pinned={pinned} onTogglePin={onTogglePin} />
}

const VIS_HINT = { personal: "Only you", shared: "Invited people", workspace: "Everyone at DevRev" }

function ProjectList({ projects, onOpenProject, onNewProject, pinned = [], onTogglePin }) {
  const [query, setQuery] = useState("")
  const [vis, setVis] = useState("all")
  const filtered = useMemo(() => projects.filter((p) => {
    if (vis !== "all" && p.vis !== vis) return false
    if (query && !(`${p.name} ${p.desc} ${p.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()))) return false
    return true
  }), [projects, query, vis])

  return <div className="pj-list">
    <div className="pj-list-head">
      <div><h1>Projects</h1><p>Shared spaces where people and agents work with the same context.</p></div>
      <button className="tw-primary" onClick={onNewProject}><Icon name="plus" size={15}/> New project</button>
    </div>

    <div className="pj-explore">
      <div className="pj-searchbox"><Icon name="search" size={16}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects, descriptions, tags…" /></div>
      <div className="pj-fbar">
        {VIS_FILTERS.map(([label, key]) => <button key={key} className={`pj-fchip ${vis === key ? "on" : ""}`} onClick={() => setVis(key)} title={key !== "all" ? VIS_HINT[key] : undefined}>{label}</button>)}
      </div>
    </div>

    <p className="pj-rescount">{filtered.length} project{filtered.length === 1 ? "" : "s"}</p>
    <div className="pj-grid">
      {filtered.map((project) => <button key={project.id} className="pj-card" onClick={() => onOpenProject(project.id)}>
        <span className={`pj-pin ${pinned.includes(project.id) ? "on" : ""}`} title={pinned.includes(project.id) ? "Unpin from sidebar" : "Pin to sidebar"} role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); onTogglePin?.(project.id) }}><Icon name="pin" size={15}/></span>
        <div className="pj-card-top"><span className="pj-emoji">{project.emoji}</span><strong>{project.name}</strong></div>
        <p className="pj-card-desc">{project.desc}</p>
        <div className="pj-card-tags"><span className={`tw-health ${project.tone}`}>{project.stage}</span>{project.tags.map((t) => <span key={t} className="pj-tagchip">{t}</span>)}</div>
        <div className="pj-card-foot"><span>{project.sessions} sessions</span><span>·</span><span>{project.files} files</span><div className="tw-avatar-stack">{project.owners.map((o, i) => <span key={o} style={{ zIndex: 5 - i }} className={`tw-avatar ${i === 0 ? "dark" : "sand"}`}>{o}</span>)}</div><span className="pj-card-due">{project.due}</span></div>
      </button>)}
      {filtered.length === 0 ? <div className="tw-empty" style={{ gridColumn: "1/-1" }}><Icon name="search" size={22}/><strong>No projects match</strong><span>Try a different search or clear the filters.</span></div> : null}
    </div>
  </div>
}

const OBJ_GROUPS = [["issues", "Issues"], ["enhancements", "Enhancements"], ["tickets", "Tickets"], ["tasks", "Tasks"]]

function ProjectDetail({ project, initialTab, onBack, onOpenSession, caps, onToggleCap, onToggleObj, pinned, onTogglePin }) {
  const cap = caps?.caps ?? project.caps
  const objs = caps?.objs ?? project.objs
  const [tab, setTab] = useState(initialTab ?? "Sessions")
  const [brief, setBrief] = useState(project.brief.join("\n\n"))
  const [workGroup, setWorkGroup] = useState("Issues")
  const [capsOpen, setCapsOpen] = useState(false)

  const lightweight = !cap.attributes && !cap.plan && !cap.work
  const enabledGroups = cap.work ? OBJ_GROUPS.filter(([key]) => objs[key]).map(([, name]) => name) : []
  const workCount = enabledGroups.reduce((n, g) => n + project.work[g].length, 0)
  const tabs = ["Sessions", "Files", "Brief", ...(cap.plan ? ["Plan"] : []), ...(cap.work ? ["Work"] : [])]
  const activeTab = tabs.includes(tab) ? tab : "Sessions"
  const activeGroup = enabledGroups.includes(workGroup) ? workGroup : enabledGroups[0]
  const tabCounts = { Sessions: project.sessions, Files: project.files, Plan: project.milestones.length, Work: workCount }

  const startSession = (session) => onOpenSession?.(makeSessionSource(project, session))

  return <div className="pj-detail">
    <div className="pj-detail-topbar">
      <button className="tw-back" onClick={onBack}><Icon name="back" size={15}/> Projects</button>
      <div className="pj-crumb"><span className="pj-emoji sm">{project.emoji}</span><strong>{project.name}</strong></div>
      <div className="tw-avatar-stack">{project.access.map((a, i) => <span key={a + i} style={{ zIndex: 5 - i }} className={`tw-avatar ${i === 0 ? "dark" : "sand"}`}>{a}</span>)}</div>
      <button className={`tw-secondary pj-pinbtn ${pinned ? "on" : ""}`} onClick={() => onTogglePin?.(project.id)}><Icon name="pin" size={14}/> {pinned ? "Pinned" : "Pin"}</button>
      <button className="tw-secondary">Share</button>
    </div>

    <div className="pj-detail-body">
      <div className="pj-detail-main">
       <div className="pj-detail-inner">
        <div className="pj-ph">
          <div className="pj-ph-title"><span className="pj-emoji lg">{project.emoji}</span><h1>{project.name}</h1></div>
          <div className="pj-chipstrip">
            <span className="pj-chip"><span className="tw-avatar dark">{project.owners[0]}</span>{project.owners.length > 1 ? `${project.owners[0]} +${project.owners.length - 1}` : project.owners[0]}</span>
            <span className="pj-chip">{project.visibility}</span>
            {cap.attributes ? <><span className="pj-chip">{project.stage}</span><span className="pj-chip">Due {project.due}</span>{project.tags.map((t) => <span key={t} className="pj-chip">{t}</span>)}</> : null}
            {cap.plan ? <span className={`tw-health ${project.tone}`}>{project.health}</span> : null}
          </div>
        </div>

        <div className="pj-tabbar">
          {tabs.map((t) => <button key={t} className={`pj-tab ${activeTab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}{tabCounts[t] ? <b>{tabCounts[t]}</b> : null}</button>)}
          <button className="pj-tab-add" onClick={() => setCapsOpen(true)}><Icon name="plus" size={14}/> Customize</button>
        </div>

        {activeTab === "Sessions" && <div className="pj-panel">
          <button className="pj-newsession" onClick={() => startSession(null)}>
            <Icon name="sparkle" size={15}/><span>Start a new session in {project.name}…</span><span className="pj-newsession-go"><Icon name="send" size={15}/></span>
          </button>
          {lightweight ? <div className="pj-nudge">
            <span className="pj-nudge-i"><Icon name="sparkle" size={16}/></span>
            <div className="pj-nudge-m"><strong>This is a lightweight space</strong><span>Just sessions, files and a brief. Add fields, a plan or work tracking whenever this grows into something you need to manage.</span></div>
            <button className="tw-secondary" onClick={() => setCapsOpen(true)}>Customize</button>
          </div> : null}
          <div className="pj-memnote"><Icon name="brain" size={15}/><span>This space remembers: the brief, {project.files} files{cap.work ? ` and ${workCount} linked work items` : ""}. Every new session starts with that context.</span></div>
          <div className="pj-shead"><h3>Recent sessions</h3><button className="tw-text-button">View all {project.sessions}</button></div>
          <div className="pj-rows">
            {project.sessionList.slice(0, 4).map((s) => <button key={s.id} className="pj-row" onClick={() => startSession(s)}>
              <span className="pj-row-icon"><Icon name="sparkle" size={15}/></span>
              <span className="pj-row-main"><strong>{s.title}</strong><small>{s.subtitle}</small></span>
              {s.link ? <span className="pj-linkchip">→ {s.link}</span> : null}
              <span className="pj-row-meta">{s.meta}</span>
            </button>)}
          </div>
        </div>}

        {activeTab === "Files" && <div className="pj-panel">
          <div className="pj-shead"><h3>Files in this space</h3><button className="tw-text-button"><Icon name="plus" size={13}/> Add files</button></div>
          <div className="pj-rows">
            {project.fileList.map((f) => <div key={f.name} className="pj-row static">
              <span className="pj-row-icon"><Icon name="file" size={15}/></span>
              <span className="pj-row-main"><strong>{f.name}</strong><small>{f.meta}</small></span>
              <span className="pj-row-meta">{f.size}</span>
            </div>)}
          </div>
        </div>}

        {activeTab === "Brief" && <div className="pj-panel">
          <div className="pj-shead"><h3>Brief</h3><span className="pj-shead-cap">The agent reads this on every session you start here</span></div>
          <textarea className="pj-brief" value={brief} onChange={(e) => setBrief(e.target.value)} />
          {(cap.plan || cap.work) ? <>
            <div className="pj-shead" style={{ marginTop: 22 }}><h3>Also in context</h3></div>
            <div className="pj-rows">
              {cap.plan ? <div className="pj-row static"><span className="pj-row-main"><strong>{project.milestones.length} milestones and their status</strong><small>From the project record</small></span><span className="pj-toggle on"/></div> : null}
              {cap.work ? <div className="pj-row static"><span className="pj-row-main"><strong>{workCount} linked work items</strong><small>Titles, status and owners</small></span><span className="pj-toggle on"/></div> : null}
            </div>
          </> : null}
        </div>}

        {activeTab === "Plan" && <div className="pj-panel">
          <div className="pj-shead"><h3>Description</h3><button className="tw-text-button">Edit</button></div>
          <p className="pj-desc">{project.description}</p>
          <div className="pj-shead" style={{ marginTop: 8 }}><h3>Milestones</h3><button className="tw-text-button"><Icon name="plus" size={13}/> Milestone</button></div>
          {project.milestones.length ? <div className="pj-ms-list">
            {project.milestones.map((m) => <div key={m.title} className="pj-ms">
              <span className={`tw-health ${m.tone}`}>{m.status}</span>
              <div className="pj-ms-main"><strong>{m.title}</strong><small>{m.meta}</small></div>
              <div className="pj-ms-bar"><i style={{ width: `${m.pct}%` }}/></div>
              <span className="pj-ms-pct">{m.pct}%</span>
            </div>)}
          </div> : <div className="tw-empty"><Icon name="dot" size={20}/><strong>No milestones yet</strong><span>Add milestones to track this project's phases.</span></div>}
        </div>}

        {activeTab === "Work" && <div className="pj-panel">
          <div className="pj-shead"><h3>Work in this project</h3><button className="tw-text-button" onClick={() => setCapsOpen(true)}><Icon name="plus" size={13}/> Configure</button></div>
          {enabledGroups.length ? <>
            <div className="pj-workgroups">{enabledGroups.map((group) => <button key={group} className={`pj-fchip ${activeGroup === group ? "on" : ""}`} onClick={() => setWorkGroup(group)}>{group} <b>{project.work[group].length}</b></button>)}</div>
            {project.work[activeGroup]?.length ? <div className="pj-rows">
              {project.work[activeGroup].map((w) => <div key={w.id} className="pj-row static">
                <span className="pj-idchip">{w.id}</span>
                <span className="pj-row-main"><strong>{w.title}</strong><small>{w.prov ?? w.meta}</small></span>
                <span className={`tw-health ${w.tone}`}>{w.status}</span>
              </div>)}
            </div> : <div className="tw-empty"><Icon name="dot" size={20}/><strong>No {activeGroup?.toLowerCase()} yet</strong><span>Work you create or link will appear here.</span></div>}
          </> : <div className="tw-empty"><Icon name="dot" size={20}/><strong>Pick which work types this project tracks</strong><span>Turn on issues, enhancements, tickets or tasks in Customize.</span></div>}
        </div>}
       </div>
      </div>

      <aside className="pj-rail">
        <div className="pj-rail-head">Details</div>
        <div className="pj-attr"><span>Owners</span><div className="pj-persons">{project.members.filter((m) => m.role === "Owner").map((m) => <span key={m.i} className="pj-person"><span className="tw-avatar dark">{m.i}</span>{m.n}</span>)}</div></div>
        {cap.attributes ? <>
          <div className="pj-attr"><span>Stage</span><strong>{project.stage}</strong></div>
          <div className="pj-attr"><span>Due date</span><strong>{project.due}</strong></div>
          <div className="pj-attr"><span>Tags</span><div className="pj-tagrow">{project.tags.map((t) => <span key={t} className="pj-tagchip">{t}</span>)}</div></div>
        </> : null}
        <div className="pj-attr"><span>Visibility</span><strong>{project.visibility}</strong></div>
        <div className="pj-attr"><span>Access</span><div className="tw-avatar-stack">{project.access.map((a, i) => <span key={a + i} style={{ zIndex: 5 - i }} className={`tw-avatar ${i === 0 ? "dark" : "sand"}`}>{a}</span>)}<button className="pj-linky">Manage</button></div></div>
        {cap.plan ? <>
          <div className="pj-attr"><span>Health</span><span className={`tw-health ${project.tone}`}>{project.health}</span></div>
          <div className="pj-attr"><span>Progress</span><div className="pj-attr-progress"><div className="pj-ms-bar"><i style={{ width: `${project.progress}%` }}/></div><small>{project.progress}%</small></div></div>
        </> : null}
        {cap.attributes ? <div className="pj-attr-add"><button className="tw-text-button"><Icon name="plus" size={13}/> Add custom field</button></div> : null}

        <hr className="pj-divider"/>
        <div className="pj-rail-label">SPACE CONTENTS</div>
        {[["Sessions", project.sessions, true], ["Files", project.files, true], ["Issues", project.work.Issues.length, cap.work && objs.issues], ["Enhancements", project.work.Enhancements.length, cap.work && objs.enhancements], ["Tickets", project.work.Tickets.length, cap.work && objs.tickets], ["Tasks", project.work.Tasks.length, cap.work && objs.tasks], ["Milestones", project.milestones.length, cap.plan]].filter(([, , show]) => show).map(([label, n]) => (
          <div key={label} className="pj-content-row"><span>{label}</span><b>{n}</b></div>
        ))}

        {lightweight ? <button className="pj-railadd" onClick={() => setCapsOpen(true)}>
          <span className="pj-railadd-t"><Icon name="plus" size={14}/> Add planning &amp; tracking</span>
          <span className="pj-railadd-d">Turn on fields, milestones or work tracking when this space needs them.</span>
        </button> : null}
      </aside>
    </div>

    {capsOpen ? <CustomizeDialog project={project} cap={cap} objs={objs} onToggleCap={onToggleCap} onToggleObj={onToggleObj} onClose={() => setCapsOpen(false)} /> : null}
  </div>
}

const CAP_OPTS = [
  { key: "attributes", icon: "attributes", title: "Attributes & fields", desc: "Give this project a stage, due date, owners, tags and your own custom fields." },
  { key: "plan", icon: "target", title: "Plan & milestones", desc: "Break the work into milestones on a timeline, with health and progress." },
  { key: "work", icon: "checklist", title: "Work tracking", desc: "Plan and track real work in this project — pick which object types it uses." },
]

function CustomizeDialog({ project, cap, objs, onToggleCap, onToggleObj, onClose }) {
  return <div className="pj-overlay" onClick={onClose}>
    <div className="pj-dialog" onClick={(e) => e.stopPropagation()}>
      <div className="pj-dialog-head"><strong>Customize {project.name}</strong><button className="pj-dialog-x" onClick={onClose}><Icon name="x" size={16}/></button></div>
      <div className="pj-dialog-body">
        <p className="pj-dialog-intro">Sessions, files and the brief are always here. Switch on more only when this space needs it — turn things off again any time, nothing you've added is lost.</p>
        {CAP_OPTS.map((opt) => <div key={opt.key} className={`pj-capopt ${cap[opt.key] ? "on" : ""}`}>
          <div className="pj-capopt-row" onClick={() => onToggleCap?.(project.id, opt.key)}>
            <span className="pj-capopt-i"><Icon name={opt.icon} size={17}/></span>
            <div className="pj-capopt-m"><strong>{opt.title}</strong><span>{opt.desc}</span></div>
            <span className={`pj-swch ${cap[opt.key] ? "on" : ""}`}/>
          </div>
          {opt.key === "work" && cap.work ? <div className="pj-capsub">
            {OBJ_GROUPS.map(([key, name]) => <button key={key} className={`pj-capsub-item ${objs[key] ? "on" : ""}`} onClick={() => onToggleObj?.(project.id, key)}>
              <span className={`pj-check ${objs[key] ? "on" : ""}`}>{objs[key] ? <Icon name="check" size={11}/> : null}</span>{name}
            </button>)}
          </div> : null}
        </div>)}
        <p className="pj-dialog-foot">Everything you switch on shows up as a tab here and under this project in the left nav.</p>
      </div>
      <div className="pj-dialog-actions"><button className="tw-primary" onClick={onClose}>Done</button></div>
    </div>
  </div>
}

// ---- New project ----
export function buildNewProject({ id, name, brief, emoji, vis }) {
  return {
    id, name, emoji: emoji || "📁",
    desc: brief || "A fresh space to work with the agent.",
    stage: "Planning", tags: [], health: "On track", tone: "good",
    sessions: 0, files: 0, due: "No due date", owners: ["PP"], progress: 0,
    vis, visibility: visLabel(vis), team: "—", access: ["PP"],
    description: brief || "",
    brief: [brief || "What is this project about? The agent reads this on every session you start here."],
    members: [{ i: "PP", n: "Priyanka Pal", role: "Owner", note: "you" }],
    sessionList: [], fileList: [], milestones: [],
    work: { Issues: [], Enhancements: [], Tickets: [], Tasks: [] },
    caps: { attributes: false, plan: false, work: false },
    objs: { issues: false, enhancements: false, tickets: false, tasks: false },
    detail: "0 people · 0 files · No due date",
  }
}

const NEW_EMOJIS = ["📁", "📊", "🧾", "🗺️", "🚀", "🧪", "🛴", "💬"]
const VIS_OPTS = [
  { key: "personal", label: "Personal", icon: "user", hint: "Only you can open this" },
  { key: "shared", label: "Invite people", icon: "users", hint: "Just the people you add" },
  { key: "workspace", label: "Workspace", icon: "globe", hint: "Anyone at DevRev" },
]

export function NewProjectModal({ onCreate, onClose }) {
  const [name, setName] = useState("")
  const [brief, setBrief] = useState("")
  const [emoji, setEmoji] = useState("📁")
  const [vis, setVis] = useState("personal")
  const submit = () => { if (name.trim()) onCreate({ name: name.trim(), brief: brief.trim(), emoji, vis }) }

  return <div className="pj-overlay" onClick={onClose}>
    <div className="pj-dialog pj-newproj" onClick={(e) => e.stopPropagation()}>
      <div className="pj-dialog-head"><strong>New project</strong><button className="pj-dialog-x" onClick={onClose}><Icon name="x" size={16}/></button></div>
      <div className="pj-dialog-body">
        <div className="pj-field">
          <label>Name</label>
          <div className="pj-name-row">
            <span className="pj-name-emoji">{emoji}</span>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pricing experiments" onKeyDown={(e) => e.key === "Enter" && submit()} />
          </div>
          <div className="pj-emoji-grid">{NEW_EMOJIS.map((e) => <button key={e} className={`pj-emoji-opt ${emoji === e ? "on" : ""}`} onClick={() => setEmoji(e)}>{e}</button>)}</div>
        </div>

        <div className="pj-field">
          <label>Brief <em>— optional</em></label>
          <textarea value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="What is this project about? The agent reads this on every session you start here." />
          <p className="pj-field-hint">You can write this later, or let a session fill it in.</p>
        </div>

        <div className="pj-field">
          <label>Visibility</label>
          <div className="pj-vis-seg">
            {VIS_OPTS.map((o) => <button key={o.key} className={`pj-vis-opt ${vis === o.key ? "on" : ""}`} onClick={() => setVis(o.key)}>
              <Icon name={o.icon} size={15}/><span className="pj-vis-label">{o.label}</span><span className="pj-vis-hint">{o.hint}</span>
            </button>)}
          </div>
        </div>

        <div className="pj-field">
          <label>Source folders <em>— optional</em></label>
          <div className="pj-dropzone">
            <span className="pj-dropzone-i"><Icon name="folderPlus" size={20}/></span>
            <strong>Add files the agent can read</strong>
            <span>Everything you add shows up in the project's Files tab.</span>
            <div className="pj-dropzone-actions"><button><Icon name="folder" size={14}/> Add folder</button><button><Icon name="file" size={14}/> Add files</button></div>
          </div>
        </div>
      </div>
      <div className="pj-dialog-actions pj-newproj-actions">
        <span className="pj-newproj-note">Starts lightweight — add fields, a plan or work tracking whenever you need them.</span>
        <div className="pj-newproj-btns">
          <button className="tw-secondary" onClick={onClose}>Cancel</button>
          <button className="tw-primary" onClick={submit} disabled={!name.trim()}>Create project</button>
        </div>
      </div>
    </div>
  </div>
}
