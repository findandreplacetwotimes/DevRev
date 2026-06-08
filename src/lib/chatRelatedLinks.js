const BUILD_TEAM_RELATED_LINKS = [
  {
    title: "Issues",
    href: "/issues",
  },
  {
    title: "Sprints",
    href: "/sprints",
  },
  {
    title: "Projects",
    href: "/projects",
  },
  {
    title: "About",
    href: "/about",
  },
]

function projectChatRelatedLinks(projectId) {
  const sourceProjectId = projectId || "Project-0001"
  const encodedProjectId = encodeURIComponent(sourceProjectId)
  return [
    {
      key: sourceProjectId,
      title: "Overview",
      href: `/projects/${encodedProjectId}`,
      state: { sourceProjectId },
    },
    {
      key: sourceProjectId,
      title: "Scope",
      href: `/projects/${encodedProjectId}?tab=Scope`,
      state: { sourceProjectId },
    },
  ]
}

export const COMPUTER_PAGE_LINKS = [
  { id: "projects", title: "Projects" },
  { id: "issues", title: "Issues" },
  { id: "views", title: "Views" },
]

const PERSON_CHAT_LINKS = {
  "chat-arjun": [
    { key: "Issue-0001", title: "Build core flow for feature", href: "/issues/Issue-0001" },
    { key: "Issue-0003", title: "Polish nav-panel interactions", href: "/issues/Issue-0003" },
    { key: "Project-0001", title: "Build core flow", href: "/projects/Project-0001", state: { sourceProjectId: "Project-0001" } },
  ],
  "chat-sneha": [
    { key: "Issue-0004", title: "Connect AI chat modes to nav actions", href: "/issues/Issue-0004" },
    { key: "Issue-0009", title: "Document Issue schema for API clients", href: "/issues/Issue-0009" },
    { key: "Project-0001", title: "Overview", href: "/projects/Project-0001", state: { sourceProjectId: "Project-0001" } },
  ],
  "chat-rohan": [
    { key: "Issue-0002", title: "Untitled issue", href: "/issues/Issue-0002" },
    { key: "Issue-0005", title: "Figma QA for table headers", href: "/issues/Issue-0005" },
    { key: "Issue-0006", title: "Harden KV sync for concurrent editors", href: "/issues/Issue-0006" },
  ],
  "chat-leela": [
    { key: "Issue-0007", title: "Untitled issue", href: "/issues/Issue-0007" },
    { key: "Issue-0008", title: "Untitled issue", href: "/issues/Issue-0008" },
    { key: "Project-0001", title: "Scope", href: "/projects/Project-0001?tab=Scope", state: { sourceProjectId: "Project-0001" } },
  ],
}

export function isPersonDirectChat(variant) {
  return typeof variant === "string" && variant.startsWith("chat-") && variant !== "chat-project"
}

function personChatRelatedLinks(variant) {
  return PERSON_CHAT_LINKS[variant] ?? []
}

export function getChatRelatedLinks({ variant, linkedProjectChat } = {}) {
  if (variant === "ai") return COMPUTER_PAGE_LINKS
  if (variant === "build-team") return BUILD_TEAM_RELATED_LINKS
  if (variant === "chat-project") return projectChatRelatedLinks(linkedProjectChat?.projectId)
  if (isPersonDirectChat(variant)) return personChatRelatedLinks(variant)
  return []
}

export function getChatPagesLabel({ variant } = {}) {
  if (isPersonDirectChat(variant)) return "LINKS"
  if (variant === "build-team") return "TEAM PAGES"
  if (variant === "chat-project") return "PROJECT PAGES"
  return "PAGES"
}
