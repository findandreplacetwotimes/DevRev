const BUILD_TEAM_RELATED_LINKS = [
  {
    title: "Issues",
    href: "/issues",
  },
  {
    title: "Sprints",
    href: "/sprints",
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

export function getChatRelatedLinks({ variant, linkedProjectChat } = {}) {
  if (variant === "build-team") return BUILD_TEAM_RELATED_LINKS
  if (variant === "chat-project") return projectChatRelatedLinks(linkedProjectChat?.projectId)
  return []
}
