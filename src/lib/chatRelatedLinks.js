export const CHAT_CANVAS_LABEL = "CANVAS"

function projectCanvasDocs() {
  return [
    { key: "Doc-0001", title: "Project brief" },
    { key: "Doc-0002", title: "Scope and milestones" },
    { key: "Doc-0003", title: "Reference links" },
  ]
}

function teamCanvasDocs() {
  return [
    { key: "Doc-0001", title: "Q2 planning brief" },
    { key: "Doc-0002", title: "Core flow spec" },
    { key: "Doc-0003", title: "Nav interaction notes" },
    { key: "Doc-0004", title: "API schema reference" },
  ]
}

const PERSON_CHAT_DOCS = {
  "chat-arjun": [
    { key: "Doc-0001", title: "Core flow spec" },
    { key: "Doc-0002", title: "Nav interaction notes" },
    { key: "Doc-0003", title: "Build core flow overview" },
  ],
  "chat-sneha": [
    { key: "Doc-0001", title: "AI chat mode matrix" },
    { key: "Doc-0002", title: "Issue schema reference" },
    { key: "Doc-0003", title: "Rollout checklist" },
  ],
  "chat-rohan": [
    { key: "Doc-0001", title: "Table header QA" },
    { key: "Doc-0002", title: "KV sync hardening" },
    { key: "Doc-0003", title: "Open design questions" },
  ],
  "chat-leela": [
    { key: "Doc-0001", title: "Scope draft" },
    { key: "Doc-0002", title: "Onboarding flow notes" },
    { key: "Doc-0003", title: "Support playbook" },
  ],
}

export function isPersonDirectChat(variant) {
  return typeof variant === "string" && variant.startsWith("chat-") && variant !== "chat-project"
}

function personChatCanvasDocs(variant) {
  return PERSON_CHAT_DOCS[variant] ?? []
}

export function getChatRelatedLinks({ variant, linkedProjectChat, teamId } = {}) {
  if (variant === "ai") return teamCanvasDocs(teamId)
  if (variant === "build-team") return teamCanvasDocs(teamId)
  if (variant === "chat-project") return projectCanvasDocs(linkedProjectChat?.projectId)
  if (isPersonDirectChat(variant)) return personChatCanvasDocs(variant)
  return []
}

export function getChatCanvasLabel() {
  return CHAT_CANVAS_LABEL
}
