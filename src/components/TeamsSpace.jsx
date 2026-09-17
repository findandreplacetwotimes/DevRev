import { useEffect, useMemo, useState } from "react"

function Icon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" }
  const paths = {
    back: <><path d="M19 12H5M11 18l-6-6 6-6"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    chevronDown: <path d="m6 9 6 6 6-6"/>,
    search: <><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></>,
    filter: <><path d="M3 5h18l-7 8v6l-4-2v-4L3 5Z"/></>,
    sliders: <><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    sparkle: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    dot: <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/>,
    stage: <><circle cx="12" cy="12" r="9"/><path d="m10 8 4 4-4 4"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3 10h18"/></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 22h4"/></>,
    link: <><path d="M9 15 15 9"/><path d="M11 6.5 13 4.5a4 4 0 0 1 6 6l-2 2"/><path d="M13 17.5 11 19.5a4 4 0 0 1-6-6l2-2"/></>,
    file: <><path d="M14 3v5h5"/><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-5Z"/></>,
    doc: <><path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 0-2 2z"/><path d="M4 5v14"/></>,
    more: <><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 16 9 5 9-5"/></>,
  }
  return <svg {...common}>{paths[name]}</svg>
}

// ---- Teams + issues data (synced-from-Jira/GitHub feel) ----
export const teams = [
  { id: "build", name: "Build", emoji: "🛠️", folders: [{ name: "devrev-app", path: "~/code/devrev-app" }] },
  { id: "growth", name: "Growth", emoji: "📈", folders: [{ name: "growth-web", path: "~/code/growth-web" }] },
  { id: "platform", name: "Platform", emoji: "🧱", folders: [{ name: "platform-core", path: "~/code/platform-core" }] },
]

const STAGES = ["In Deployment", "In Development", "In Testing", "In Review", "Triage"]
const STAGE_TONE = { "In Deployment": "good", "In Development": "info", "In Testing": "warn", "In Review": "purple", Triage: "plain" }

// Session entries live on issues; some already need attention. Delegating adds more.
const issuesSeed = [
  {
    id: "ISS-360144", team: "build", title: "Make checkout retries idempotent", priority: "P1", stage: "In Development",
    owner: "Priyanka Pal (Me)", created: "Aug 15, 2026", part: "Payments", tags: ["bug", "payments"], sprint: "Sprint 34", milestone: "Reliability", targetClose: "Aug 28, 2026", reportedBy: "Acme Corp", via: "Slack",
    description: "Duplicate captures double-charge customers when a checkout request is retried after a timeout. 14 enterprise accounts affected. We need retries to be safe: only idempotent operations should retry, and capture must require an idempotency key.",
    discussion: [
      { author: "Maya Nair", via: "Slack", time: "10:20 AM", text: "Two enterprise accounts hit this again overnight — the retry path re-captures. Can we prioritise the idempotency guard?" },
    ],
    sessions: [
      { id: "s-360144-1", agent: "Backend agent", label: "Idempotent retry guard", status: "needs input", run: "Run #184", note: "Paused — found two viable idempotency-key strategies and wants your call before patching payment-router." },
      { id: "s-360144-2", agent: "QA agent", label: "Regression tests for double-charge", status: "PR ready", run: "Run #182", note: "Opened PR #4830 · 51 additions · CI green — ready for your review." },
    ],
    loop: {
      delegate: { state: "done", hint: "Backend + QA agents · 2 sessions" },
      spec: { state: "done", hint: "by Computer · 12m ago" },
      "spec-review": { state: "active", hint: "Maya flagged the retry path — awaiting sign-off" },
      code: { state: "active", hint: "QA opened PR #4830 · Backend paused for input" },
      review: { state: "todo" },
      comments: { state: "todo" },
      testing: { state: "todo", hint: "Regression suite drafted by QA agent" },
      deploy: { state: "todo" },
    },
    spec: {
      generatedBy: "Computer", updated: "12m ago",
      sections: [
        { h: "Problem", body: "Retries after a checkout timeout can re-run a capture, double-charging the customer. Affects 14 enterprise accounts." },
        { h: "Proposed approach", body: "Gate retries in payment-router: only retry idempotent methods, require an idempotency key on capture, and short-circuit non-idempotent operations." },
        { h: "Acceptance criteria", list: ["No double-charge under retry (proven by regression test)", "Capture without an idempotency key is rejected", "Non-idempotent operations never retry"] },
        { h: "Risks & open questions", body: "Idempotency-key storage TTL vs. retry window — needs a decision (surfaced in the Backend agent session)." },
      ],
    },
  },
  {
    id: "ISS-362596", team: "build", title: "Changes in prompt in Issue sidepanel", priority: "P1", stage: "In Deployment",
    owner: "Priyanka Pal (Me)", created: "Today, 10:46 AM", part: "Dependency tracking for work & prod", tags: ["build-ux"], sprint: "Sprint 34", milestone: "—", targetClose: "Aug 20, 2026", reportedBy: "—", via: "",
    description: "Refine the prompt shown in the issue side panel so it reads clearly and points to the right next action.",
    discussion: [],
    sessions: [{ id: "s-362596-1", agent: "Frontend agent", label: "Update side-panel prompt copy", status: "running", run: "Run #201", note: "Editing the panel component.", activity: ["Reading IssueSidePanel.tsx…", "Rewriting the prompt copy for clarity…", "Updating the panel snapshot tests…", "Running lint + typecheck…", "Pushing changes to the branch…"] }],
    spec: null,
  },
  {
    id: "ISS-317383", team: "build", title: "Feedback on Links Aside Block Usability and Metadata", priority: "P2", stage: "In Deployment",
    owner: "Priyanka Pal (Me)", created: "Jun 9, 2026", part: "Dependency tracking for work & prod", tags: ["fit-and-finish", "build-ux"], sprint: "—", milestone: "—", targetClose: "Jun 20, 2026", reportedBy: "Not PR", via: "Slack",
    description: "User reports that the new links aside block is less informative, making it hard to find the child issue they were looking at. Metadata missing in the links aside block is a UX degrade.",
    discussion: [
      { author: "Not PR", via: "Slack", time: "1:48 PM", text: "The links aside block is less informational now — I found it hard to find the child issue I was looking at, and it took me 2–3 times to get to the right issue. Metadata missing in links aside block is a bit of a UX degrade." },
    ],
    sessions: [], spec: null,
  },
  { id: "ISS-362697", team: "build", title: "[SB <> Views] Re-run Migration for RZP board", priority: "P2", stage: "In Deployment", owner: "Tim Cherny", created: "Today, 1:26 PM", part: "Sprint board", tags: ["migration"], sprint: "Sprint 34", milestone: "—", targetClose: "—", reportedBy: "—", via: "", description: "Re-run the migration for the RZP board so views stay consistent.", discussion: [], sessions: [], spec: null },
  { id: "ISS-361612", team: "build", title: "Add Claude Icon for Computer Agent", priority: "P1", stage: "In Deployment", owner: "Akhil D.", created: "Aug 14, 2026", part: "Computer", tags: ["design"], sprint: "Sprint 33", milestone: "—", targetClose: "—", reportedBy: "—", via: "", description: "Add the Claude icon option for the Computer agent in the picker.", discussion: [], sessions: [], spec: null },
  { id: "ISS-359830", team: "build", title: "Regression: Missing “Move to Backlog” option for bulk select", priority: "P1", stage: "In Deployment", owner: "Priyanka Pal (Me)", created: "Aug 12, 2026", part: "Issues", tags: ["regression"], sprint: "Sprint 33", milestone: "—", targetClose: "—", reportedBy: "Northwind", via: "", description: "Bulk-select lost the “Move to Backlog” action after the last release.", discussion: [], sessions: [], spec: null },
  {
    id: "ISS-360012", team: "build", title: "Delegate-to-agent from the issue panel", priority: "P2", stage: "In Development",
    owner: "Priyanka Pal (Me)", created: "Aug 13, 2026", part: "Computer", tags: ["build-ux", "agents"], sprint: "Sprint 34", milestone: "Agent workspace", targetClose: "Aug 30, 2026", reportedBy: "—", via: "",
    description: "Let engineers and PMs delegate a task to an agent directly from an issue, spawning a session and monitoring it inline.",
    discussion: [], sessions: [{ id: "s-360012-1", agent: "Computer", label: "Prototype the delegate flow", status: "running", run: "Run #205", note: "Building the inline composer.", activity: ["Scaffolding the inline composer…", "Wiring the delegate action into the store…", "Adding the agent picker dropdown…", "Handling the empty-task state…", "Verifying the flow end-to-end…"] }], spec: null,
  },
  { id: "ISS-359114", team: "build", title: "Memory limit exceed error for sprint-related widgets", priority: "P2", stage: "In Testing", owner: "Maya Nair", created: "Aug 10, 2026", part: "Sprint board", tags: ["perf"], sprint: "Sprint 33", milestone: "—", targetClose: "—", reportedBy: "—", via: "", description: "Sprint widgets exceed the memory budget on large boards.", discussion: [], sessions: [], spec: null },
  { id: "ISS-360455", team: "build", title: "Idempotency-key storage TTL tuning", priority: "P2", stage: "In Testing", owner: "Akhil D.", created: "Aug 16, 2026", part: "Payments", tags: ["payments"], sprint: "Sprint 34", milestone: "Reliability", targetClose: "—", reportedBy: "—", via: "", description: "Tune the TTL for stored idempotency keys against the retry window.", discussion: [], sessions: [{ id: "s-360455-1", agent: "Backend agent", label: "Benchmark TTL options", status: "needs input", run: "Run #190", note: "Needs a product call on the retry window." }], spec: null },
  { id: "ISS-359166", team: "build", title: "Sprint board E2Es setting panel test", priority: "P1", stage: "In Review", owner: "Tim Cherny", created: "Aug 10, 2026", part: "Sprint board", tags: ["test"], sprint: "Sprint 33", milestone: "—", targetClose: "—", reportedBy: "—", via: "", description: "Add E2E coverage for the sprint board settings panel.", discussion: [], sessions: [], spec: null },
  { id: "ISS-361044", team: "build", title: "Triage: intermittent 500 on issue export", priority: "P1", stage: "Triage", owner: "—", created: "Today, 9:02 AM", part: "Issues", tags: ["incident"], sprint: "—", milestone: "—", targetClose: "—", reportedBy: "Deliveroo", via: "Slack", description: "Occasional 500s when exporting issues to CSV.", discussion: [], sessions: [], spec: null },
  { id: "ISS-361077", team: "build", title: "Triage: duplicate notifications on mention", priority: "P2", stage: "Triage", owner: "—", created: "Today, 8:40 AM", part: "Notifications", tags: [], sprint: "—", milestone: "—", targetClose: "—", reportedBy: "—", via: "", description: "Mentions sometimes send two notifications.", discussion: [], sessions: [], spec: null },
]

export function teamIssues(teamId) {
  return issuesSeed.filter((i) => i.team === teamId)
}
export function getIssue(id) {
  return issuesSeed.find((i) => i.id === id)
}

// ---- Issues list ----
const TABS = ["My Issues", "Triage", "In Progress", "All Issues"]

export function IssuesListView({ team, tab = "In Progress", onTab, onOpenIssue, sessionsByIssue }) {
  const [collapsed, setCollapsed] = useState([])
  const all = teamIssues(team.id)
  const issues = useMemo(() => all.filter((i) => {
    if (tab === "My Issues") return i.owner.includes("Me")
    if (tab === "Triage") return i.stage === "Triage"
    if (tab === "In Progress") return i.stage !== "Triage"
    return true
  }), [all, tab])
  const groups = STAGES.map((s) => [s, issues.filter((i) => i.stage === s)]).filter(([, list]) => list.length)
  const attentionOf = (issue) => (sessionsByIssue[issue.id] ?? issue.sessions).some((s) => s.status === "needs input")
  const countOf = (issue) => (sessionsByIssue[issue.id] ?? issue.sessions).length
  const toggle = (s) => setCollapsed((c) => (c.includes(s) ? c.filter((x) => x !== s) : [...c, s]))

  return <div className="ts-issues">
    <div className="ts-issues-head">
      <div className="ts-crumb"><span className="ts-crumb-team">{team.emoji} {team.name}</span><Icon name="chevron" size={13}/><strong>Issues</strong><span className="ts-crumb-count">{all.length}</span></div>
      <button className="ts-new-issue"><Icon name="plus" size={14}/> Issue</button>
    </div>
    <div className="ts-tabs">
      {TABS.map((t) => <button key={t} className={tab === t ? "on" : ""} onClick={() => onTab(t)}>{t}</button>)}
      <button className="ts-tab-add"><Icon name="plus" size={13}/></button>
      <div className="ts-tabs-tools"><button title="Search"><Icon name="search" size={16}/></button><button title="Sort"><Icon name="sliders" size={16}/></button><button className="on" title="Filter"><Icon name="filter" size={16}/></button></div>
    </div>
    <div className="ts-filterbar">
      <span className="ts-fchip">Team · {team.name}</span>
      <span className="ts-fchip">Created · Last 90 days</span>
      <span className="ts-fchip">Stage · In Progress +3</span>
      <span className="ts-fchip ghost"><Icon name="plus" size={12}/></span>
      <button className="ts-clear">Clear</button>
    </div>

    <div className="ts-grouplist">
      {groups.map(([stage, list]) => <section key={stage} className="ts-group">
        <button className="ts-group-head" onClick={() => toggle(stage)}>
          <span className={`ts-stage-dot ${STAGE_TONE[stage]}`}><Icon name="stage" size={14}/></span>
          <strong>{stage}</strong><span className="ts-group-count">{list.length}</span>
          <Icon name={collapsed.includes(stage) ? "chevron" : "chevronDown"} size={14}/>
        </button>
        {!collapsed.includes(stage) ? <div className="ts-rows">
          {list.map((i) => <button key={i.id} className="ts-row" onClick={() => onOpenIssue(i.id)}>
            <span className="ts-check" />
            <span className="ts-id">{i.id}</span>
            <span className="ts-title">{i.title}</span>
            {attentionOf(i) ? <span className="ts-attn"><span className="ts-attn-dot" /> needs you</span> : countOf(i) ? <span className="ts-sesscount"><Icon name="sparkle" size={11}/> {countOf(i)}</span> : null}
            <span className={`ts-prio ${i.priority.toLowerCase()}`}>{i.priority}</span>
            <span className="ts-stagecell"><Icon name="stage" size={13}/> {i.stage}</span>
            <span className="ts-created">{i.created}</span>
          </button>)}
        </div> : null}
      </section>)}
    </div>
  </div>
}

// ---- Issue panel ----
const AGENTS = ["Backend agent", "Frontend agent", "QA agent", "Claude (external)", "Cursor (external)", "Computer"]
const STATUS_CLASS = { "needs input": "run", "PR ready": "rev", running: "go", blocked: "blk", done: "done" }

// The delegation loop every issue moves through. States: done | active | todo.
const LOOP_STEPS = [
  { key: "delegate", label: "Delegated to agent" },
  { key: "spec", label: "Spec generated" },
  { key: "spec-review", label: "Spec reviewed" },
  { key: "code", label: "Code changes / PR opened" },
  { key: "review", label: "Code review" },
  { key: "comments", label: "Review comments addressed" },
  { key: "testing", label: "Testing" },
  { key: "deploy", label: "Deployment" },
]

// Infer loop progress from issue signals; an explicit issue.loop map overrides per step.
function buildLoop(issue, sessions, spec) {
  const override = issue.loop ?? {}
  let done = 0
  if (sessions.length) done = 1                                  // delegated
  if (spec) done = Math.max(done, 2)                             // spec generated
  const hasPR = sessions.some((s) => s.status === "PR ready" || /PR\s*#/.test(s.note || ""))
  if (hasPR) done = Math.max(done, 4)                            // code / PR opened
  const stageDone = { Triage: 0, "In Development": 2, "In Review": 4, "In Testing": 5, "In Deployment": 6 }[issue.stage] ?? 0
  done = Math.max(done, stageDone)
  return LOOP_STEPS.map((st, idx) => {
    const o = override[st.key]
    const state = o?.state ?? (idx < done ? "done" : idx === done ? "active" : "todo")
    return { ...st, state, hint: o?.hint }
  })
}

// One agent-work row with a live, ticking summary of what the agent is doing.
function SessionRow({ issue, s, onOpen }) {
  const running = s.status === "running" && s.activity?.length
  const [i, setI] = useState(0)
  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setI((v) => (v + 1) % s.activity.length), 2600)
    return () => clearInterval(t)
  }, [running, s.activity])
  const summary = running ? s.activity[i] : s.note
  return <button className="ts-aw-row" onClick={() => onOpen(issue, s)}>
    <span className="ts-aw-ic"><Icon name="sparkle" size={12}/></span>
    <span className="ts-aw-main">
      <span className="ts-aw-label"><b>{s.agent}</b> · {s.label}</span>
      {summary ? <span className={`ts-aw-activity${running ? " live" : ""}`}>{running ? <span className="ts-aw-pulse" /> : null}<span className="ts-aw-activity-text">{summary}</span></span> : null}
    </span>
    <span className={`ts-status sm ${STATUS_CLASS[s.status] ?? "go"}`}>{["needs input", "PR ready", "blocked"].includes(s.status) ? <span className="ts-status-dot" /> : null}{s.status}</span>
  </button>
}

export function IssuePanel({ issue, team, sessions, spec, onBack, onOpenSession, onDelegate, onGenerateSpec }) {
  const [tab, setTab] = useState("Overview")
  const [showMore, setShowMore] = useState(false)
  const [delegating, setDelegating] = useState(false)
  const [task, setTask] = useState(issue.title)
  const [agent, setAgent] = useState("Backend agent")
  const submit = () => { if (task.trim()) { onDelegate(issue, { task: task.trim(), agent }); setDelegating(false) } }
  const loop = buildLoop(issue, sessions, spec)
  const loopDone = loop.filter((st) => st.state === "done").length

  return <div className="ts-panel">
    <div className="ts-panel-top">
      <button className="ts-panel-x" onClick={onBack}><Icon name="back" size={16}/></button>
      <span className="ts-id big">{issue.id}</span>
      <div className="ts-panel-tabs">
        {["Overview", "Links", "Files"].map((t) => <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t === "Links" ? <Icon name="link" size={14}/> : t === "Files" ? <Icon name="file" size={14}/> : <Icon name="doc" size={14}/>} {t}</button>)}
      </div>
      <div className="ts-panel-tools"><button><Icon name="sparkle" size={16}/></button><button><Icon name="bell" size={16}/></button><button><Icon name="link" size={16}/></button><button><Icon name="more" size={16}/></button></div>
    </div>

    <div className="ts-panel-body">
      <div className="ts-panel-main">
       <div className="ts-panel-inner">
        <h1 className="ts-issue-title">{issue.title}</h1>
        <p className="ts-issue-desc">{showMore || issue.description.length < 140 ? issue.description : issue.description.slice(0, 140) + "… "}{issue.description.length >= 140 ? <button className="ts-showmore" onClick={() => setShowMore((v) => !v)}>{showMore ? "Show less" : "Show more"}</button> : null}</p>

        {/* Agent work — compact */}
        <div className="ts-aw">
          <div className="ts-aw-head">
            <span className="ts-aw-title"><Icon name="sparkle" size={14}/> Agent work</span>
            <span className="ts-aw-sum">{sessions.length ? `${sessions.length} session${sessions.length > 1 ? "s" : ""}${sessions.some((s) => s.status === "needs input") ? " · needs you" : ""}` : "Not started"}</span>
            <button className="ts-aw-delegate" onClick={() => setDelegating((v) => !v)}><Icon name="plus" size={13}/> Delegate</button>
          </div>
          {delegating ? <div className="ts-aw-composer">
            <input autoFocus value={task} onChange={(e) => setTask(e.target.value)} placeholder="Describe a task for an agent…" onKeyDown={(e) => e.key === "Enter" && submit()} />
            <select value={agent} onChange={(e) => setAgent(e.target.value)}>{AGENTS.map((a) => <option key={a}>{a}</option>)}</select>
            <button className="ts-aw-send" onClick={submit} disabled={!task.trim()}>Delegate</button>
          </div> : null}
          {sessions.length ? <div className="ts-aw-list">
            {sessions.map((s) => <SessionRow key={s.id} issue={issue} s={s} onOpen={onOpenSession} />)}
          </div> : !delegating ? <p className="ts-aw-empty">No agent is working this yet — delegate a task to start.</p> : null}
        </div>

        {/* Delivery loop — where this issue is in the agent workflow */}
        <div className="ts-loop">
          <div className="ts-loop-head">
            <span className="ts-loop-title"><Icon name="layers" size={14}/> Delivery loop</span>
            <span className="ts-loop-sum">{loopDone} of {loop.length} steps done</span>
          </div>
          <ol className="ts-loop-steps">
            {loop.map((st) => <li key={st.key} className={`ts-loop-step ${st.state}`}>
              <span className="ts-loop-mark">{st.state === "done" ? <Icon name="check" size={12}/> : st.state === "active" ? <span className="ts-loop-spin" /> : null}</span>
              <span className="ts-loop-body">
                <span className="ts-loop-label">{st.label}</span>
                {st.hint ? <span className="ts-loop-hint">{st.hint}</span> : null}
              </span>
            </li>)}
          </ol>
        </div>

        {/* Spec */}
        <div className="ts-sec-head"><h3><Icon name="doc" size={14}/> Spec</h3>{spec ? <span className="ts-sec-roll">by {spec.generatedBy} · {spec.updated}</span> : null}</div>
        {spec ? <div className="ts-spec">
          {spec.sections.map((sec) => <div key={sec.h} className="ts-spec-sec">
            <h4>{sec.h}</h4>
            {sec.list ? <ul>{sec.list.map((li) => <li key={li}>{li}</li>)}</ul> : <p>{sec.body}</p>}
          </div>)}
        </div> : <button className="ts-genspec" onClick={() => onGenerateSpec(issue)}><Icon name="sparkle" size={15}/> Generate a spec with Computer</button>}

        {/* Discussion */}
        <div className="ts-disc-tabs"><button className="on">Internal discussions</button><button>Events</button></div>
        <div className="ts-thread">
          {issue.discussion.length ? issue.discussion.map((d, i) => <div key={i} className="ts-msg">
            <span className="ts-msg-av">{d.author.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
            <div><div className="ts-msg-head"><b>{d.author}</b>{d.via ? <span className="ts-via">via {d.via}</span> : null}<span className="ts-time">{d.time}</span></div><p>{d.text}</p></div>
          </div>) : <p className="ts-empty-line">No internal discussion yet.</p>}
        </div>
        <div className="ts-reply"><span className="ts-msg-av me">P</span><input placeholder="Write a reply…" /></div>
       </div>
      </div>

      <aside className="ts-rail">
        <div className="ts-rail-head">Attributes</div>
        <div className="ts-attr"><span>Owner</span><strong>{issue.owner}</strong></div>
        <div className="ts-attr"><span>Team</span><strong>{team.name}</strong></div>
        <div className="ts-attr"><span>Part</span><strong className="ts-part">{issue.part}</strong></div>
        <div className="ts-attr"><span>Priority</span><span className={`ts-prio ${issue.priority.toLowerCase()}`}>{issue.priority}</span></div>
        <div className="ts-attr"><span>Stage</span><span className="ts-stagecell"><Icon name="stage" size={13}/> {issue.stage}</span></div>
        <div className="ts-attr"><span>Target Close</span><strong>{issue.targetClose}</strong></div>
        <div className="ts-attr"><span>Tags</span><span className="ts-tags">{issue.tags.length ? issue.tags.map((t) => <span key={t} className="ts-tag">{t}</span>) : "—"}</span></div>
        <div className="ts-attr"><span>Sprint</span><strong>{issue.sprint}</strong></div>
        <div className="ts-attr"><span>Milestone</span><strong>{issue.milestone}</strong></div>
        <hr className="ts-rail-div" />
        <div className="ts-rail-sub">Customer Information</div>
        <div className="ts-attr"><span>Reported by</span><strong>{issue.reportedBy}</strong></div>
        {issue.via === "Slack" ? <><div className="ts-rail-sub">Slack</div><div className="ts-attr"><span>Initial thread</span><a className="ts-link">Slack thread link</a></div></> : null}
      </aside>
    </div>
  </div>
}

// ---- Lightweight Roadmap & Sprints views ----
export function RoadmapView({ team }) {
  const rows = [
    { name: "Reliability", tone: "info", pct: 60, meta: "Aug – Sep · 6 issues" },
    { name: "Agent workspace", tone: "purple", pct: 35, meta: "Aug – Oct · 9 issues" },
    { name: "Sprint board polish", tone: "good", pct: 85, meta: "shipping · 4 issues" },
    { name: "Payments hardening", tone: "warn", pct: 20, meta: "planned · 5 issues" },
  ]
  return <div className="ts-simple">
    <div className="ts-crumb"><span className="ts-crumb-team">{team.emoji} {team.name}</span><Icon name="chevron" size={13}/><strong>Roadmap</strong></div>
    <h1>Roadmap</h1><p className="ts-sub">Milestones this team is driving, with live progress from delivery evidence.</p>
    <div className="ts-road">{rows.map((r) => <div key={r.name} className="ts-road-row"><span className="ts-road-name"><Icon name="target" size={14}/> {r.name}</span><div className="ts-road-bar"><i className={r.tone} style={{ width: `${r.pct}%` }} /></div><span className="ts-road-meta">{r.meta}</span></div>)}</div>
  </div>
}

export function SprintsView({ team }) {
  const sprints = [
    { name: "Sprint 34", when: "Aug 12 – Aug 26", state: "Active", done: 14, total: 22 },
    { name: "Sprint 33", when: "Jul 29 – Aug 12", state: "Completed", done: 19, total: 19 },
    { name: "Sprint 35", when: "Aug 26 – Sep 9", state: "Planned", done: 0, total: 8 },
  ]
  return <div className="ts-simple">
    <div className="ts-crumb"><span className="ts-crumb-team">{team.emoji} {team.name}</span><Icon name="chevron" size={13}/><strong>Sprints</strong></div>
    <h1>Sprints</h1><p className="ts-sub">Cadence for {team.name}. Issues and agent sessions roll up here.</p>
    <div className="ts-sprints">{sprints.map((s) => <div key={s.name} className="ts-sprint"><div className="ts-sprint-top"><strong>{s.name}</strong><span className={`ts-sprint-state ${s.state.toLowerCase()}`}>{s.state}</span></div><p>{s.when}</p><div className="ts-road-bar"><i className="info" style={{ width: `${Math.round((s.done / s.total) * 100)}%` }} /></div><small>{s.done}/{s.total} issues done</small></div>)}</div>
  </div>
}
