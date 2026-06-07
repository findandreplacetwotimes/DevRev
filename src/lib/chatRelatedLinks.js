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

export function getChatRelatedLinks({ variant, linkedProjectChat } = {}) {
  if (variant === "ai") return COMPUTER_PAGE_LINKS
  if (variant === "build-team") return BUILD_TEAM_RELATED_LINKS
  if (variant === "chat-project") return projectChatRelatedLinks(linkedProjectChat?.projectId)
  return []
}
