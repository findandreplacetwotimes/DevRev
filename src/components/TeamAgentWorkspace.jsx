import { useMemo, useRef, useState } from "react"
import "./TeamAgentWorkspace.css"
import "./AgentBoard.css"
import { ProjectSpace, workspaceProjects, makeSessionSource, buildNewProject, NewProjectModal } from "./ProjectSpace"

const sharedContext = {
  issue: { id: "ENH-482", label: "OAuth fallback", meta: "Enhancement · In progress" },
  files: [
    { path: "auth/middleware.ts", note: "427 lines changed" },
    { path: "auth/refresh-token.ts", note: "new file" },
    { path: "auth/__tests__/fallback.test.ts", note: "18 tests" },
  ],
  records: [
    { type: "PR", label: "PR #4821 — OAuth fallback", meta: "18 tests passed · no contract change" },
    { type: "Decision", label: "Keep the existing feature flag", meta: "Agreed in payments sync" },
    { type: "CI", label: "integration-suite #1042", meta: "Green · 4m 12s" },
  ],
  project: { name: "Payments API v3", meta: "12 people · 3 agents · Jun 28" },
  impact: "Mobile launch · 2 customer commitments",
}

const roleQueues = {
  "Engineering lead": {
    headline: "Your attention keeps delivery moving.",
    subtitle: "Agents are working across your projects. These are the moments that need human judgment.",
    items: [
  {
    id: "architecture",
    type: "Agent needs input",
    severity: "Now",
    title: "Choose the token refresh strategy",
    description: "The OAuth fallback agent found two viable paths. Its choice affects mobile support and the Jun 28 launch.",
    project: "Payments API v3",
    agent: "Backend agent",
    status: "Waiting for an architectural decision",
    people: ["AK", "DP"],
    choices: ["Use rotating refresh tokens", "Keep session-bound tokens"],
  },
  {
    id: "review",
    type: "Review ready",
    severity: "Today",
    title: "Review agent PR #4821 — OAuth fallback",
    description: "427 lines changed · 18 tests passed · no API contract changes detected.",
    project: "Payments API v3",
    agent: "Backend agent",
    status: "Awaiting code review",
    people: ["AK"],
  },
  {
    id: "dependency",
    type: "Dependency at risk",
    severity: "Tomorrow",
    title: "Identity platform handoff slipped 3 days",
    description: "Blocks the integration test run. Latest safe date to preserve the milestone is Jun 21.",
    project: "Payments API v3",
    agent: "Project agent",
    status: "Needs an owner and recovery plan",
    people: ["MS", "RK"],
  },
  {
    id: "bug",
    type: "Bug investigation",
    severity: "This week",
    title: "Checkout timeout is affecting 14 enterprise accounts",
    description: "The triage agent isolated the likely service boundary and prepared a reproduction.",
    project: "Payments API v3",
    agent: "Triage agent",
    status: "Ready to assign an investigation",
    people: ["AK", "JR"],
  },
    ],
  },
  Developer: {
    headline: "Your agent work is ready for the next move.",
    subtitle: "Review the implementation evidence, unblock agents, and keep your active work moving.",
    items: [
      { id: "dev-review", type: "Review ready", severity: "Now", title: "Review your agent PR #4821 — OAuth fallback", description: "427 lines changed · 18 tests passed · the agent highlighted two tradeoffs in the auth middleware.", project: "Payments API v3", agent: "Backend agent", status: "Your review unblocks the integration run", people: ["AK"], choices: ["Merge behind the existing feature flag", "Request a smaller auth middleware diff"] },
      { id: "dev-input", type: "Agent needs input", severity: "Today", title: "Clarify the retry behavior for checkout timeouts", description: "The investigation agent found a likely root cause but needs an implementation constraint before it patches payment-router.", project: "Payments API v3", agent: "Triage agent", status: "Waiting for your technical guidance", people: ["AK", "JR"], choices: ["Retry only idempotent requests", "Add a circuit breaker before retrying"] },
      { id: "dev-ci", type: "CI failed", severity: "Today", title: "Integration tests are failing on the mobile auth contract", description: "The agent isolated the failure to a stale mock. A one-line fixture update is proposed.", project: "Mobile onboarding", agent: "QA agent", status: "Ready for a quick fix or approval", people: ["AK" ] },
      { id: "dev-bug", type: "Bug investigation", severity: "This week", title: "Confirm the checkout timeout reproduction", description: "A reproducible trace and a proposed issue are ready. Decide whether to take over or let the agent open the fix.", project: "Payments API v3", agent: "Triage agent", status: "Investigation is ready to hand off", people: ["AK", "JR"] },
    ],
  },
  "Product manager": {
    headline: "Your decisions keep the product on course.",
    subtitle: "Resolve scope, customer, and launch tradeoffs while agents keep the delivery picture current.",
    items: [
      { id: "pm-scope", type: "Scope decision", severity: "Now", title: "Choose the token refresh strategy for mobile v1", description: "The implementation agent needs a product call: support persistent login now, or protect the June launch scope.", project: "Payments API v3", agent: "Backend agent", status: "A product decision unblocks the implementation", people: ["AK", "DP"], choices: ["Keep persistent login in the June scope", "Defer persistent login and protect the launch"] },
      { id: "pm-customer", type: "Customer impact", severity: "Today", title: "Confirm the response for 14 checkout-affected accounts", description: "The triage agent connected the timeout to enterprise accounts with a pending renewal. A customer update is ready to review.", project: "Payments API v3", agent: "Triage agent", status: "Needs a customer-facing decision", people: ["JR", "MS"] },
      { id: "pm-dependency", type: "Dependency at risk", severity: "Tomorrow", title: "Identity platform handoff slipped 3 days", description: "The project agent mapped the impact: the mobile launch is likely to slip unless scope or sequencing changes.", project: "Payments API v3", agent: "Project agent", status: "Choose a recovery plan with Engineering", people: ["MS", "RK"] },
      { id: "pm-update", type: "Status draft", severity: "This week", title: "Review the Payments API stakeholder update", description: "The agent drafted a concise update using live PR, CI, dependency, and customer evidence.", project: "Payments API v3", agent: "Project agent", status: "Ready to edit and publish", people: ["MS"] },
    ],
  },
}

// Standalone Computer sessions — not tied to a work-queue item. Shown in the left nav.
const standaloneSeed = [
  {
    id: "std-reliability",
    title: "Draft the Q3 reliability plan",
    agent: "Computer",
    project: "Standalone",
    description: "I pulled the last quarter of incidents, SLO burn, and the open reliability issues. Want me to draft a plan grouped by service, or by customer impact?",
    choices: ["Group by service", "Group by customer impact"],
    status: "Waiting for your direction",
    context: {
      issue: null,
      files: [{ path: "reliability/incidents-q2.csv", note: "reference" }, { path: "reliability/slo-burn.md", note: "draft" }],
      records: [{ type: "Doc", label: "Reliability plan (draft)", meta: "Generated by Computer" }, { type: "Query", label: "Incidents · last 90 days", meta: "37 rows" }],
      project: { name: "Standalone session", meta: "Started by you · today" },
      impact: "Planning · no code changes yet",
    },
  },
  {
    id: "std-auth",
    title: "Explore auth token rotation options",
    agent: "Computer",
    project: "Standalone",
    description: "Here are three token-rotation approaches with their tradeoffs against our mobile constraints. Want a deeper writeup on any one?",
    status: "Ready with options",
    context: {
      issue: null,
      files: [{ path: "notes/token-rotation.md", note: "working notes" }],
      records: [{ type: "Doc", label: "Token rotation comparison", meta: "3 approaches" }],
      project: { name: "Standalone session", meta: "Started by you · yesterday" },
      impact: "Research · informs Payments API v3",
    },
  },
]

function Icon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" }
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 16 9 5 9-5"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    search: <><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 22h4"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    back: <><path d="M19 12H5M11 18l-6-6 6-6"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
    sparkle: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    play: <path d="m8 5 11 7-11 7V5Z"/>,
    send: <><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7Z"/></>,
    expand: <><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></>,
    collapse: <><path d="M9 3v6H3M21 15h-6v6M3 9l6-6M15 21l6-6"/></>,
    panel: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/></>,
    file: <><path d="M14 3v5h5"/><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-5Z"/></>,
    folder: <path d="M4 6a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4V6Z"/>,
    record: <><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h5"/></>,
    link: <><path d="M9 15 15 9"/><path d="M11 6.5 13 4.5a4 4 0 0 1 6 6l-2 2"/><path d="M13 17.5 11 19.5a4 4 0 0 1-6-6l2-2"/></>,
    computer: <><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></>,
    dot: <circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none"/>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.5 6 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-6-3.5-9s1-6.5 3.5-9Z"/></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9.5" r="1.6"/><path d="m4 18 5-5 4 3 3-2 4 4"/></>,
    sheet: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="2.6"/></>,
    filter: <><path d="M3 5h18l-7 8v6l-4-2v-4L3 5Z"/></>,
  }
  return <svg {...common}>{paths[name]}</svg>
}

// The scrolling chat transcript (no composer). The composer is rendered separately so it can be pinned to the bottom.
function SessionMessages({ session, onChoice, compact }) {
  return <div className={`tw-thread ${compact ? "compact" : ""}`}>
    {session.messages.map((message, index) => message.role === "agent"
      ? <div className="tw-message agent" key={index}>
          <div className="tw-message-avatar"><Icon name="sparkle" size={14}/></div>
          <div>
            <div className="tw-message-head"><strong>{message.name}</strong><span>{message.time}</span></div>
            <p>{message.text}</p>
            {message.choices ? <div className="tw-options">{message.choices.map((choice, i) => <button type="button" key={choice} onClick={() => onChoice(choice)}><b>{String.fromCharCode(65 + i)}</b>{choice}</button>)}</div> : null}
          </div>
        </div>
      : <div className="tw-message human" key={index}>
          <div className="tw-message-avatar human-avatar">AK</div>
          <div>
            <div className="tw-message-head"><strong>You</strong><span>{message.time}</span></div>
            <p>{message.text}</p>
          </div>
        </div>)}
  </div>
}

function SessionComposer({ session, onSend }) {
  const [draft, setDraft] = useState("")
  const submit = (event) => {
    event.preventDefault()
    const value = draft.trim()
    if (!value) return
    onSend(value)
    setDraft("")
  }
  return <form className="tw-composer" onSubmit={submit}>
    <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Reply to ${session.agent}, add a constraint, or direct the next step…`} />
    <button type="submit" className="tw-composer-send" disabled={!draft.trim()} aria-label="Send"><Icon name="send" size={16}/></button>
  </form>
}

function fileIcon(path) {
  if (/\.(png|jpe?g|webp|gif|svg)$/i.test(path)) return "image"
  if (/\.(csv|xlsx?|tsv)$/i.test(path)) return "sheet"
  if (/\.html?$/i.test(path)) return "globe"
  if (/\.(md|pdf|txt|docx?)$/i.test(path)) return "file"
  if (path.endsWith("/")) return "folder"
  return "file"
}

// The attached canvas surface: collapsed = hidden (chat is full-width, toggle lives in the header);
// expanded = a "Working files"–style panel of the session's files and linked records.
function SessionCanvas({ session, open, onToggle, selected, onSelect }) {
  const ctx = session.context
  if (!open) return null
  return <aside className="tw-canvas">
    <div className="tw-canvas-topbar">
      <span className="tw-canvas-title">Canvas</span>
      <div className="tw-canvas-top-actions">
        <button title="Preview"><Icon name="eye" size={15}/></button>
        <button title="Collapse canvas" onClick={onToggle}><Icon name="panel" size={15}/></button>
      </div>
    </div>

    {selected
      ? <div className="tw-canvas-detail">
          <button className="tw-canvas-back" onClick={() => onSelect(null)}><Icon name="back" size={14}/> Back to files</button>
          <div className="tw-canvas-detail-head"><Icon name={selected.kind === "file" ? fileIcon(selected.label) : "record"} size={16}/><strong>{selected.label}</strong></div>
          <p className="tw-canvas-detail-meta">{selected.meta}</p>
          <div className="tw-canvas-preview">
            {selected.kind === "file"
              ? <pre>{`// ${selected.label}\nexport async function withOAuthFallback(req, next) {\n  const token = await resolveToken(req)\n  if (!token.valid) return refreshOrReject(req)\n  return next(req, token)\n}`}</pre>
              : <div className="tw-canvas-record-body">This record is linked to the session so the agent — and you — stay grounded in the same evidence. Open it in the project to see full history.</div>}
          </div>
        </div>
      : <div className="tw-canvas-body">
          <section className="tw-canvas-sec">
            <div className="tw-canvas-sec-head"><h4>Working files</h4><div className="tw-canvas-sec-actions"><button title="Filter"><Icon name="filter" size={14}/></button><button title="Add file"><Icon name="plus" size={15}/></button></div></div>
            {ctx.files.length ? ctx.files.map((file) => <button key={file.path} className="tw-frow" onClick={() => onSelect({ kind: "file", label: file.path, meta: file.note })}>
              <Icon name={fileIcon(file.path)} size={16}/><span className="tw-frow-name">{file.path}</span><span className="tw-frow-act"><Icon name="expand" size={12}/></span>
            </button>) : <p className="tw-canvas-none">No files attached yet</p>}
          </section>

          {(ctx.issue || ctx.records.length) ? <section className="tw-canvas-sec">
            <div className="tw-canvas-sec-head"><h4>Linked records</h4></div>
            {ctx.issue ? <button className="tw-frow" onClick={() => onSelect({ kind: "record", label: `${ctx.issue.id} · ${ctx.issue.label}`, meta: ctx.issue.meta })}>
              <span className="tw-record-tag issue">Issue</span><span className="tw-frow-name">{ctx.issue.id} · {ctx.issue.label}</span><span className="tw-frow-act"><Icon name="expand" size={12}/></span>
            </button> : null}
            {ctx.records.map((record) => <button key={record.label} className="tw-frow" onClick={() => onSelect({ kind: "record", label: record.label, meta: record.meta })}>
              <span className={`tw-record-tag ${record.type.toLowerCase()}`}>{record.type}</span><span className="tw-frow-name">{record.label}</span><span className="tw-frow-act"><Icon name="expand" size={12}/></span>
            </button>)}
          </section> : null}

          <section className="tw-canvas-sec">
            <div className="tw-canvas-sec-head"><h4>Project</h4></div>
            <button className="tw-frow"><Icon name="layers" size={16}/><span className="tw-frow-name">{ctx.project.name}</span><span className="tw-frow-act"><Icon name="arrow" size={13}/></span></button>
            <div className="tw-canvas-impact"><span>Impact</span>{ctx.impact}</div>
          </section>
        </div>}
  </aside>
}

export function TeamAgentWorkspace() {
  const [role, setRole] = useState("Engineering lead")
  const [view, setView] = useState("today") // today | projects | project | session
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [projectTab, setProjectTab] = useState("Sessions")
  const [completed, setCompleted] = useState([])
  const [showBoard, setShowBoard] = useState(false)

  // Per-project capability config (attributes / plan / work + which work objects). Lightweight unless turned on.
  const [projectCaps, setProjectCaps] = useState(() => Object.fromEntries(workspaceProjects.map((p) => [p.id, { caps: { ...p.caps }, objs: { ...p.objs } }])))
  const [pinned, setPinned] = useState(["analytics"])
  const [expandedNav, setExpandedNav] = useState(["analytics"])
  const [navShowMore, setNavShowMore] = useState([])
  const [createdProjects, setCreatedProjects] = useState([])
  const [newProjectOpen, setNewProjectOpen] = useState(false)

  const allProjects = [...createdProjects, ...workspaceProjects]
  const findProject = (id) => allProjects.find((p) => p.id === id) ?? workspaceProjects[0]

  const createProject = (data) => {
    const id = `new-${nextId.current++}`
    const project = buildNewProject({ id, ...data })
    setCreatedProjects((prev) => [project, ...prev])
    setProjectCaps((prev) => ({ ...prev, [id]: { caps: { ...project.caps }, objs: { ...project.objs } } }))
    setNewProjectOpen(false)
    openProject(id)
  }

  const toggleCap = (pid, key) => setProjectCaps((prev) => {
    const cur = prev[pid]
    const now = !cur.caps[key]
    const objs = { ...cur.objs }
    if (key === "work" && now && !Object.values(objs).some(Boolean)) objs.issues = true
    return { ...prev, [pid]: { caps: { ...cur.caps, [key]: now }, objs } }
  })
  const toggleObj = (pid, obj) => setProjectCaps((prev) => {
    const cur = prev[pid]
    return { ...prev, [pid]: { ...cur, objs: { ...cur.objs, [obj]: !cur.objs[obj] } } }
  })
  const togglePin = (pid) => {
    setPinned((prev) => (prev.includes(pid) ? prev.filter((x) => x !== pid) : [...prev, pid]))
    setExpandedNav((prev) => (prev.includes(pid) ? prev : [...prev, pid]))
  }
  const toggleNavProject = (pid) => setExpandedNav((prev) => (prev.includes(pid) ? prev.filter((x) => x !== pid) : [...prev, pid]))
  const toggleNavMore = (pid) => setNavShowMore((prev) => (prev.includes(pid) ? prev.filter((x) => x !== pid) : [...prev, pid]))

  // Session store: id -> live session (messages, canvas state). Created lazily on open.
  const [sessions, setSessions] = useState({})
  const [standalone, setStandalone] = useState(standaloneSeed.map((s) => s.id))
  const [openSessionId, setOpenSessionId] = useState(null)
  const [canvasOpen, setCanvasOpen] = useState(false)
  const [canvasSelected, setCanvasSelected] = useState(null)
  const nextId = useRef(1)

  const persona = roleQueues[role]
  const visibleItems = useMemo(() => persona.items.filter((item) => !completed.includes(item.id)), [persona.items, completed])
  const openSession = openSessionId ? sessions[openSessionId] : null
  const standaloneSessions = standalone.map((id) => sessions[id] ?? standaloneSeed.find((s) => s.id === id)).filter(Boolean)

  const buildSession = (source) => ({
    id: source.id,
    title: source.title,
    agent: source.agent,
    project: source.project,
    status: source.status ?? "Agent paused for your input",
    run: source.run ?? `Run #${180 + (nextId.current % 40)}`,
    standalone: source.project === "Standalone",
    context: source.context ?? sharedContext,
    messages: [
      { role: "agent", name: source.agent, time: "9 min ago", text: source.description, choices: source.choices },
    ],
  })

  const ensureSession = (source) => {
    setSessions((prev) => (prev[source.id] ? prev : { ...prev, [source.id]: buildSession(source) }))
    return source.id
  }

  const openWork = (item, fullPage = false) => {
    const id = ensureSession(item)
    setOpenSessionId(id)
    setCanvasSelected(null)
    if (fullPage) { setView("session"); setCanvasOpen(false) }
  }

  const sendMessage = (id, text) => {
    setSessions((prev) => {
      const session = prev[id]
      if (!session) return prev
      const messages = [
        ...session.messages,
        { role: "you", name: "You", time: "Now", text },
        { role: "agent", name: session.agent, time: "Just now", text: "Got it — I'll take that into account and continue. I'll surface the next decision here when I need you.", },
      ]
      return { ...prev, [id]: { ...session, messages, status: "Agent working on your guidance" } }
    })
  }

  const chooseOption = (id, choice) => {
    setSessions((prev) => {
      const session = prev[id]
      if (!session) return prev
      const messages = [
        ...session.messages,
        { role: "you", name: "You", time: "Now", text: `You chose: ${choice}` },
        { role: "agent", name: session.agent, time: "Just now", text: `Understood — proceeding with “${choice}”. Resuming the run now; I'll return with the PR and test evidence.` },
      ]
      return { ...prev, [id]: { ...session, messages, status: "Agent resumed with your decision" } }
    })
  }

  const resolveSession = (id, note) => {
    if (!id) return
    setCompleted((ids) => (ids.includes(id) ? ids : [...ids, id]))
    sendMessage(id, note)
  }

  const startStandalone = () => {
    const id = `std-new-${nextId.current++}`
    const source = {
      id,
      title: "New session with Computer",
      agent: "Computer",
      project: "Standalone",
      description: "What would you like to work on? I can pull context from any project, issue, or customer signal to get started.",
      status: "Waiting for your first prompt",
      context: {
        issue: null,
        files: [],
        records: [],
        project: { name: "Standalone session", meta: "Started by you · now" },
        impact: "No linked work yet",
      },
    }
    setSessions((prev) => ({ ...prev, [id]: buildSession(source) }))
    setStandalone((prev) => [id, ...prev])
    setOpenSessionId(id)
    setCanvasSelected(null)
    setView("session")
    setCanvasOpen(false)
  }

  const changeRole = (nextRole) => {
    setRole(nextRole)
    setOpenSessionId(null)
    setView("today")
  }

  const openProject = (projectId, tab = "Sessions") => { setActiveProjectId(projectId); setProjectTab(tab); setView("project") }
  const openProjectSession = (project, session) => openWork(makeSessionSource(project, session), true)

  const navItems = [["Today", "grid", "today"], ["Projects", "layers", "projects"]]
  const breadcrumb = view === "session" && openSession ? openSession.title
    : view === "project" ? (findProject(activeProjectId)?.name ?? "Project")
    : view === "projects" ? "Projects" : "Today"
  const showDetail = view !== "session" && !!openSession

  return <main className={`team-workspace ${showDetail ? "" : "two-col"}`}>
    <aside className="tw-sidebar">
      <div className="tw-brand"><span className="tw-logo"><Icon name="sparkle" size={17}/></span><span>devrev</span></div>
      <button className="tw-new" onClick={startStandalone}><Icon name="plus" size={16}/> New session</button>
      <nav className="tw-nav">
        {navItems.map(([label, icon, key]) => (
          <button key={label} onClick={() => { setView(key); setOpenSessionId(null) }} className={(view === key || (key === "projects" && view === "project")) ? "active" : ""}>
            <Icon name={icon}/>{label}{key === "today" && visibleItems.length ? <b>{visibleItems.length}</b> : null}
          </button>
        ))}
      </nav>

      <div className="tw-nav-group tw-nav-scroll">
        <div className="tw-nav-group-label">PROJECTS<button className="tw-nav-group-add" title="New project" onClick={() => setNewProjectOpen(true)}><Icon name="plus" size={14}/></button></div>
        {pinned.map((pid) => {
          const project = findProject(pid)
          const cfg = projectCaps[pid]
          const isOpen = expandedNav.includes(pid)
          const seeAll = navShowMore.includes(pid)
          const sessions = project.sessionList
          const shown = seeAll ? sessions : sessions.slice(0, 5)
          const views = [
            ["Files", "file", project.files, "Files"],
            ["Brief", "record", null, "Brief"],
            ...(cfg.caps.plan ? [["Plan", "layers", project.milestones.length, "Plan"]] : []),
            ...(cfg.caps.work && cfg.objs.issues ? [["Issues", "record", project.work.Issues.length, "Work"]] : []),
            ...(cfg.caps.work && cfg.objs.enhancements ? [["Enhancements", "sparkle", project.work.Enhancements.length, "Work"]] : []),
            ...(cfg.caps.work && cfg.objs.tickets ? [["Tickets", "record", project.work.Tickets.length, "Work"]] : []),
            ...(cfg.caps.work && cfg.objs.tasks ? [["Tasks", "check", project.work.Tasks.length, "Work"]] : []),
          ]
          return <div key={pid} className={`tw-navproj ${isOpen ? "open" : ""}`}>
            <div className="tw-navproj-head">
              <button className="tw-navchev" onClick={() => toggleNavProject(pid)}><Icon name="chevron" size={14}/></button>
              <button className="tw-navproj-name" onClick={() => openProject(pid)}><span className="tw-navproj-emoji">{project.emoji}</span><span className="tw-navproj-label">{project.name}</span></button>
            </div>
            {isOpen ? <div className="tw-navsub">
              <div className="tw-navsub-label">Sessions</div>
              {shown.map((s) => <button key={s.id} className="tw-navsub-item" onClick={() => openProjectSession(project, s)}><Icon name="sparkle" size={13}/><span>{s.title}</span></button>)}
              {sessions.length > 5 ? <button className="tw-navsub-more" onClick={() => toggleNavMore(pid)}>{seeAll ? "Show less" : `Show ${sessions.length - 5} more`}</button> : null}
              <div className="tw-navsub-label">Views</div>
              {views.map(([label, icon, count, tab]) => <button key={label} className="tw-navsub-item" onClick={() => openProject(pid, tab)}><Icon name={icon} size={13}/><span>{label}</span>{count ? <b>{count}</b> : null}</button>)}
            </div> : null}
          </div>
        })}
        {pinned.length === 0 ? <p className="tw-nav-empty">Pin a project to see it here</p> : null}
      </div>

      <div className="tw-nav-group">
        <div className="tw-nav-group-label">COMPUTER SESSIONS</div>
        {standaloneSessions.map((session) => (
          <button key={session.id} className={`tw-session-link ${openSessionId === session.id && view === "session" ? "active" : ""}`} onClick={() => openWork(session, true)}>
            <span className="tw-session-dot"><Icon name="dot" size={10}/></span>
            <span className="tw-session-link-title">{session.title}</span>
          </button>
        ))}
        {standaloneSessions.length === 0 ? <p className="tw-nav-empty">No sessions yet</p> : null}
      </div>

      <div className="tw-sidebar-bottom">
        <div className="tw-team-label">YOUR TEAM</div>
        <button className="tw-team"><span className="tw-avatar violet">P</span>Product delivery <Icon name="chevron" size={15}/></button>
        <button className="tw-user"><span className="tw-avatar dark">AK</span><span><strong>Arjun Kapoor</strong><small>{role}</small></span><Icon name="chevron" size={15}/></button>
      </div>
    </aside>

    <section className="tw-main">
      <header className="tw-topbar">
        <div className="tw-breadcrumb"><span>Workspace</span><Icon name="chevron" size={14}/><strong>{breadcrumb}</strong></div>
        <div className="tw-actions"><button className="tw-search"><Icon name="search" size={16}/> Search work, people, or agents <kbd>⌘ K</kbd></button><button className="tw-icon-button"><Icon name="bell" size={18}/><i/></button><div className="tw-role-select"><span>Viewing as</span><select value={role} onChange={(event) => changeRole(event.target.value)}><option>Engineering lead</option><option>Developer</option><option>Product manager</option></select></div></div>
      </header>

      {view === "session" && openSession ? (
        <SessionView
          session={openSession}
          canvasOpen={canvasOpen}
          onToggleCanvas={() => setCanvasOpen((v) => !v)}
          canvasSelected={canvasSelected}
          onSelectCanvas={setCanvasSelected}
          onSend={(text) => sendMessage(openSession.id, text)}
          onChoice={(choice) => chooseOption(openSession.id, choice)}
          onResolve={(note) => resolveSession(openSession.id, note)}
          onBack={() => setView(openSession.standalone ? "today" : "today")}
        />
      ) : view === "projects" ? (
        <ProjectSpace mode="list" projects={allProjects} onOpenProject={openProject} onNewProject={() => setNewProjectOpen(true)} pinned={pinned} onTogglePin={togglePin} />
      ) : view === "project" ? (
        <ProjectSpace key={`${activeProjectId}-${projectTab}`} mode="detail" projects={allProjects} projectId={activeProjectId} initialTab={projectTab} onBack={() => setView("projects")} onOpenSession={(item) => openWork(item, true)} caps={projectCaps[activeProjectId]} onToggleCap={toggleCap} onToggleObj={toggleObj} pinned={pinned} onTogglePin={togglePin} />
      ) : showBoard ? (
        <AgentBoard role={role} items={persona.items} onBack={() => setShowBoard(false)} onSelect={(item) => openWork(item, false)} />
      ) : (
        <div className="tw-content">
          <section className="tw-intro">
            <div><p className="tw-eyebrow">FRIDAY, JUNE 14</p><h1>{persona.headline}</h1><p className="tw-subtitle">{persona.subtitle}</p></div>
            <button className="tw-outline-button" onClick={startStandalone}><Icon name="sparkle" size={16}/> Ask Computer</button>
          </section>

          <section className="tw-queue-section">
            <div className="tw-section-heading"><div><h2>Work queue</h2><p>{visibleItems.length} items need attention · Sorted by impact</p></div><button onClick={() => setShowBoard(true)} className="tw-text-button">View all <Icon name="arrow" size={15}/></button></div>
            <div className="tw-queue-list">
              {visibleItems.length ? visibleItems.map((item) => <button onClick={() => openWork(item, false)} className={`tw-queue-card ${openSessionId === item.id ? "selected" : ""}`} key={item.id}>
                <span className={`tw-card-indicator ${item.type === "Dependency at risk" ? "orange" : item.type === "Bug investigation" ? "red" : "purple"}`}/>
                <div className="tw-card-body"><div className="tw-card-meta"><span className="tw-card-type">{item.type}</span><span>·</span><span>{item.project}</span></div><h3>{item.title}</h3><p>{item.description}</p><div className="tw-card-footer"><span className="tw-agent-dot"><Icon name="sparkle" size={12}/>{item.agent}</span><span className="tw-card-status">{item.status}</span></div></div>
                <div className="tw-card-right"><span className="tw-due">{item.severity}</span><div className="tw-avatar-stack">{item.people.map((person, index) => <span key={person} style={{ zIndex: 5 - index }} className={`tw-avatar ${index === 0 ? "dark" : "sand"}`}>{person}</span>)}</div></div><Icon name="chevron" size={17}/>
              </button>) : <div className="tw-empty"><Icon name="check" size={24}/><strong>Your queue is clear</strong><span>Agent work and cross-team risks will appear here when they need you.</span></div>}
            </div>
          </section>

          <section className="tw-projects-section">
            <div className="tw-section-heading"><div><h2>Projects in motion</h2><p>Live delivery signals, not manual status updates.</p></div><button onClick={() => setView("projects")} className="tw-text-button">All projects <Icon name="arrow" size={15}/></button></div>
            <div className="tw-project-grid">{workspaceProjects.map((project) => <button key={project.id} onClick={() => openProject(project.id)} className="tw-project-card"><div className="tw-project-head"><span className={`tw-health ${project.tone}`}>{project.health}</span><Icon name="chevron" size={16}/></div><h3>{project.name}</h3><p>{project.detail}</p><div className="tw-progress"><i style={{width: `${project.progress}%`}}/></div><small>{project.progress}% of planned work evidenced</small></button>)}</div>
          </section>
        </div>
      )}
    </section>

    {showDetail && (
      <aside className="tw-detail">
        <div className="tw-detail-head">
          <span className="tw-detail-label">AGENT SESSION</span>
          <div className="tw-detail-head-actions">
            <button title="Expand to full screen" onClick={() => { setView("session"); setCanvasOpen(false) }}><Icon name="expand" size={16}/></button>
            <button title="Close" onClick={() => setOpenSessionId(null)}><Icon name="close" size={18}/></button>
          </div>
        </div>
        <div className="tw-detail-title"><span className="tw-agent-icon"><Icon name="sparkle" size={17}/></span><div><p>{openSession.agent} · {openSession.project}</p><h2>{openSession.title}</h2></div></div>
        <div className="tw-run-status"><span className="tw-pulse"/> {openSession.status} <span>{openSession.run}</span></div>
        <SessionMessages session={openSession} compact onChoice={(choice) => chooseOption(openSession.id, choice)} />
        <div className="tw-detail-footer">
          <div className="tw-detail-actions">
            <button className="tw-primary" onClick={() => resolveSession(openSession.id, "Approved the recommended approach. The agent has resumed.")}><Icon name="check" size={15}/> Approve & resume</button>
            <button className="tw-secondary" onClick={() => { setView("session"); setCanvasOpen(true) }}><Icon name="panel" size={14}/> Open canvas</button>
          </div>
          <SessionComposer session={openSession} onSend={(text) => sendMessage(openSession.id, text)} />
        </div>
      </aside>
    )}

    {newProjectOpen ? <NewProjectModal onCreate={createProject} onClose={() => setNewProjectOpen(false)} /> : null}
  </main>
}

// Full-page session: wide chat + attached canvas surface (collapsed by default).
function SessionView({ session, canvasOpen, onToggleCanvas, canvasSelected, onSelectCanvas, onSend, onChoice, onResolve, onBack }) {
  return <div className={`tw-session-view ${canvasOpen ? "canvas-open" : ""}`}>
    <div className="tw-session-main">
      <div className="tw-session-head">
        <button className="tw-back" onClick={onBack}><Icon name="back" size={15}/> Back</button>
        <div className="tw-session-titles">
          <p>{session.agent} · {session.project}</p>
          <h1>{session.title}</h1>
        </div>
        <div className="tw-session-head-right">
          <div className="tw-run-status inline"><span className="tw-pulse"/> {session.status} <span>{session.run}</span></div>
          {!canvasOpen ? <button className="tw-secondary" onClick={onToggleCanvas}><Icon name="panel" size={15}/> Show canvas</button> : null}
        </div>
      </div>
      <div className="tw-session-body">
        <div className="tw-session-chat">
          <SessionMessages session={session} onChoice={onChoice} />
          <div className="tw-session-footer">
            <div className="tw-session-actions">
              <button className="tw-primary" onClick={() => onResolve("Approved the recommended approach. The agent has resumed.")}><Icon name="check" size={15}/> Approve & resume</button>
              <button className="tw-secondary" onClick={() => onChoice("Take over the session")}>Take over</button>
            </div>
            <SessionComposer session={session} onSend={onSend} />
          </div>
        </div>
        <SessionCanvas session={session} open={canvasOpen} onToggle={onToggleCanvas} selected={canvasSelected} onSelect={onSelectCanvas} />
      </div>
    </div>
  </div>
}

function AgentBoard({ role, items, onBack, onSelect }) {
  const columns = [
    { title: "Needs input", subtitle: "Human decision required", matches: ["needs input", "scope decision", "customer impact", "dependency at risk"] },
    { title: "In progress", subtitle: "Agents actively executing", matches: ["in progress"] },
    { title: "Needs review", subtitle: "Evidence ready to inspect", matches: ["review ready", "ci failed", "status draft"] },
    { title: "Ready to ship", subtitle: "Approved and awaiting release", matches: ["ready to ship"] },
  ]
  const syntheticProgress = [
    { id: "active-1", type: "In progress", title: "Add rollout telemetry to OAuth fallback", description: "Backend agent · Running tests and preparing PR", project: "Payments API v3", agent: "Backend agent", severity: "Live", people: ["AK"] },
    { id: "active-2", type: "In progress", title: "Map duplicate timeout reports", description: "Triage agent · Connecting tickets to the root cause", project: "Payments API v3", agent: "Triage agent", severity: "Live", people: ["JR"] },
    { id: "ship-1", type: "Ready to ship", title: "Mobile onboarding empty states", description: "QA checks passed · Deployment approval pending", project: "Mobile onboarding", agent: "UI agent", severity: "Today", people: ["AK", "MS"] },
  ]
  const cards = [...items, ...syntheticProgress]
  return <div className="tw-board-view">
    <div className="tw-board-head"><div><button onClick={onBack} className="tw-back">← Today</button><h1>Agent work across delivery</h1><p>Every workstream is grouped by the human attention it needs—not by raw agent activity.</p></div><div className="tw-board-role">{role} view</div></div>
    <div className="tw-swimlane-label"><span>SWIMLANES</span><strong>Projects and maintenance work</strong></div>
    <div className="tw-board-columns">{columns.map((column) => <section key={column.title} className="tw-board-column"><header><h2>{column.title}</h2><p>{column.subtitle}</p></header>{["Payments API v3", "Mobile onboarding"].map((lane) => { const laneCards = cards.filter((card) => card.project === lane && column.matches.includes(card.type.toLowerCase())); return <div className="tw-lane" key={lane}><span className="tw-lane-name">{lane}</span><div className="tw-lane-cards">{laneCards.map((card) => <button onClick={() => onSelect(card)} className="tw-board-card" key={card.id}><span className="tw-card-type">{card.type}</span><h3>{card.title}</h3><p>{card.description}</p><div><span className="tw-agent-dot"><Icon name="sparkle" size={12}/>{card.agent}</span><span className="tw-due">{card.severity}</span></div></button>)}</div></div>})}</section>)}</div>
  </div>
}
