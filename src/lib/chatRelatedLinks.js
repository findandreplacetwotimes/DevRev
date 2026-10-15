import {
  DEFAULT_TEAM_ID,
  projectBasePath,
  teamAboutHref,
  teamIssuesHref,
  teamProjectsHref,
  teamSprintsHref,
} from "./teams"

export const CHAT_CANVAS_LABEL = "CANVAS"

function projectCanvasDocs(projectId) {
  const base = projectId ? projectBasePath(projectId) : null
  return [
    { key: "project-overview", title: "Project overview", href: base ?? undefined },
    { key: "Doc-scope", title: "Scope and milestones", href: base ? `${base}/scope` : undefined },
    { key: "Doc-brief", title: "Project brief", href: base ? `${base}/brief` : undefined },
    { key: "Doc-links", title: "Reference links", href: base ? `${base}/links` : undefined },
  ].filter((link) => link.href)
}

function teamCanvasDocs(teamId) {
  const id = teamId ?? DEFAULT_TEAM_ID
  return [
    { key: "team-issues", title: "Issues", href: teamIssuesHref(id) },
    { key: "team-projects", title: "Projects", href: teamProjectsHref(id) },
    { key: "team-sprints", title: "Sprints", href: teamSprintsHref(id) },
    { key: "team-about", title: "About", href: teamAboutHref(id) },
  ]
}

const PERSON_CHAT_DOCS = {
  "chat-arjun": [
    { key: "team-issues", title: "Issues" },
    { key: "team-projects", title: "Projects" },
  ],
  "chat-sneha": [
    { key: "team-issues", title: "Issues" },
    { key: "team-sprints", title: "Sprints" },
  ],
  "chat-rohan": [
    { key: "team-projects", title: "Projects" },
    { key: "team-about", title: "About" },
  ],
  "chat-leela": [
    { key: "team-issues", title: "Issues" },
    { key: "team-projects", title: "Projects" },
  ],
}

export function isPersonDirectChat(variant) {
  return typeof variant === "string" && variant.startsWith("chat-") && variant !== "chat-project"
}

function personChatCanvasDocs(variant, teamId) {
  const stubs = PERSON_CHAT_DOCS[variant] ?? []
  const teamDocs = teamCanvasDocs(teamId)
  return stubs
    .map((stub) => teamDocs.find((doc) => doc.key === stub.key) ?? null)
    .filter(Boolean)
}

export function getChatRelatedLinks({ variant, linkedProjectChat, teamId } = {}) {
  if (variant === "ai") return teamCanvasDocs(teamId)
  if (variant === "build-team") return teamCanvasDocs(teamId)
  if (variant === "chat-project") return projectCanvasDocs(linkedProjectChat?.projectId)
  if (isPersonDirectChat(variant)) return personChatCanvasDocs(variant, teamId)
  return []
}

export function getChatCanvasLabel() {
  return CHAT_CANVAS_LABEL
}
