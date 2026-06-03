import { getAiResponse } from "./aiClient"

const BUILD_TEAM_DESTINATIONS = [
  { id: "issues", label: "Issues", href: "/issues" },
  { id: "sprints", label: "Sprints", href: "/sprints" },
  { id: "projects", label: "Projects", href: "/projects" },
  { id: "about", label: "About", href: "/about" },
]

function displayTitle(row, fallback) {
  const trimmed = typeof row?.title === "string" ? row.title.trim() : ""
  return trimmed.length > 0 ? trimmed : fallback
}

function projectDestinations(projectId) {
  const sourceProjectId = projectId || "Project-0001"
  const encoded = encodeURIComponent(sourceProjectId)
  return [
    { id: "overview", label: "Overview", href: `/projects/${encoded}`, state: { sourceProjectId } },
    { id: "scope", label: "Scope", href: `/projects/${encoded}?tab=Scope`, state: { sourceProjectId } },
    { id: "activity", label: "Activity", href: `/projects/${encoded}?tab=Activity`, state: { sourceProjectId } },
  ]
}

function issueDestinations(issues, context) {
  const list = Array.isArray(issues) ? issues : []
  const projectScoped =
    context?.variant === "chat-project" && context.projectId
      ? list.filter((issue) => issue.projectId === context.projectId)
      : list

  return projectScoped.map((issue) => ({
    id: `issue:${issue.id}`,
    label: `${issue.id} ${displayTitle(issue, "No title")}`,
    href: `/issues/${encodeURIComponent(issue.id)}`,
    aliases: [issue.id, displayTitle(issue, "")].filter(Boolean),
  }))
}

function projectRecordDestinations(projects) {
  const list = Array.isArray(projects) ? projects : []
  return list.map((project) => {
    const title = displayTitle(project, "No title")
    return {
      id: `project:${project.id}`,
      label: `${project.id} ${title}`,
      href: `/projects/${encodeURIComponent(project.id)}`,
      state: { sourceProjectId: project.id },
      aliases: [project.id, title].filter(Boolean),
    }
  })
}

function destinationsForContext(context) {
  const recordDestinations = [
    ...issueDestinations(context?.issues, context),
    ...projectRecordDestinations(context?.projects),
  ]
  if (context?.variant === "chat-project") {
    return [...projectDestinations(context.projectId), ...recordDestinations]
  }
  return [...BUILD_TEAM_DESTINATIONS, ...recordDestinations]
}

function parseJsonObject(raw) {
  const text = String(raw ?? "").trim()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    const match = /\{[\s\S]*\}/.exec(text)
    if (!match) return null
    try {
      return JSON.parse(match[0])
    } catch {
      return null
    }
  }
}

function normalizeIntent(raw, destinations) {
  const parsed = parseJsonObject(raw)
  if (!parsed || parsed.action !== "navigate") return null
  const destination = destinations.find((item) => item.id === parsed.destinationId)
  if (!destination) return null
  return {
    action: "navigate",
    label: destination.label,
    href: destination.href,
    state: destination.state,
  }
}

export async function resolveChatNavigationIntent({ text, context }) {
  const destinations = destinationsForContext(context)
  const prompt = [
    "Classify whether this chat message asks to open a product page in the right panel.",
    "Return ONLY compact JSON. Do not explain.",
    'If it asks to open/navigate/show a page, return: {"action":"navigate","destinationId":"<id>"}',
    'If it is not a navigation request, return: {"action":"none"}',
    "Users may refer to records by full id, partial id, full title, or partial title. Choose the best matching allowed destination.",
    "Prefer a specific Issue or Project record over the generic Issues or Projects list when the message includes an id or name.",
    "Allowed destination ids:",
    destinations
      .map((item) => {
        const aliases = Array.isArray(item.aliases) && item.aliases.length > 0 ? ` aliases: ${item.aliases.join(", ")}` : ""
        return `- ${item.id}: ${item.label}${aliases}`
      })
      .join("\n"),
    "",
    `Message: ${JSON.stringify(String(text ?? ""))}`,
  ].join("\n")

  const response = await getAiResponse(prompt)
  return normalizeIntent(response, destinations)
}
