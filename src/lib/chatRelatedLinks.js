import {
  getRelatedChatFamily,
  isBranchedChatVariant,
  isComputerChatVariant,
  isProjectMainChatId,
  resolveProjectIdFromVariant,
  resolveRootChatId,
  TEAM_ROOT_CHAT_ID,
} from "./relatedChats"

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
  return (
    typeof variant === "string" &&
    variant.startsWith("chat-") &&
    !isProjectMainChatId(variant) &&
    variant !== "chat-project" &&
    !variant.startsWith("chat-group-") &&
    !isBranchedChatVariant(variant)
  )
}

function personChatRelatedLinks(variant) {
  return PERSON_CHAT_LINKS[variant] ?? []
}

export function getChatRelatedLinks({ variant, linkedProjectChat, relatedChatsRegistry = {} } = {}) {
  if (variant === "ai" || isComputerChatVariant(variant)) return COMPUTER_PAGE_LINKS

  const projectId =
    resolveProjectIdFromVariant(variant, relatedChatsRegistry) ||
    (isProjectMainChatId(variant) ? variant.slice("chat-project-".length) : null) ||
    linkedProjectChat?.projectId ||
    null

  if (projectId) return projectChatRelatedLinks(projectId)

  const rootId = resolveRootChatId(variant, relatedChatsRegistry)
  if (variant === "build-team" || rootId === TEAM_ROOT_CHAT_ID) return BUILD_TEAM_RELATED_LINKS

  if (isPersonDirectChat(variant)) return personChatRelatedLinks(variant)
  return []
}

export function getChatPagesLabel({ variant, linkedProjectChat, relatedChatsRegistry = {} } = {}) {
  if (isPersonDirectChat(variant)) return "LINKS"

  const projectId =
    resolveProjectIdFromVariant(variant, relatedChatsRegistry) ||
    (isProjectMainChatId(variant) ? variant.slice("chat-project-".length) : null) ||
    linkedProjectChat?.projectId ||
    null

  if (projectId) return "PROJECT PAGES"

  const rootId = resolveRootChatId(variant, relatedChatsRegistry)
  if (variant === "build-team" || rootId === TEAM_ROOT_CHAT_ID) return "TEAM PAGES"

  return "PAGES"
}

/**
 * @param {object} options
 * @param {string} options.variant
 * @param {{ projectId?: string, title?: string } | null} [options.linkedProjectChat]
 * @param {import("./relatedChats").RelatedChatRegistry} [options.relatedChatsRegistry]
 * @param {string} [options.currentChatId]
 */
export function getChatLinkPanelSections({
  variant,
  linkedProjectChat,
  relatedChatsRegistry = {},
  currentChatId,
} = {}) {
  /** @type {Array<{ id: string, label: string, kind: "record", links: object[] } | { id: string, label: string, kind: "chat", chats: import("./relatedChats").RelatedChatRecord[] }>} */
  const sections = []

  const links = getChatRelatedLinks({ variant, linkedProjectChat, relatedChatsRegistry })
  if (links.length > 0) {
    sections.push({
      id: "pages",
      label: getChatPagesLabel({ variant, linkedProjectChat, relatedChatsRegistry }),
      kind: "record",
      links,
    })
  }

  const rootId = resolveRootChatId(variant, relatedChatsRegistry)
  if (rootId) {
    const family = getRelatedChatFamily(rootId, relatedChatsRegistry)
    if (family.length > 1) {
      sections.push({
        id: "chats",
        label: "RELATED CHATS",
        kind: "chat",
        chats: family,
      })
    }
  }

  return sections
}

/** @param {ReturnType<typeof getChatLinkPanelSections>} sections */
export function hasChatLinkPanelContent(sections) {
  return sections.some((section) =>
    section.kind === "record" ? section.links.length > 0 : section.chats.length > 0
  )
}
