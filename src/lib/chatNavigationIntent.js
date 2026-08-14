import { getAiResponse } from "./aiClient"
import { issueHref, projectOverviewHref, projectTabHref } from "./navDestinations"
import { DEFAULT_PROJECT_ID, projectPathId } from "./projectsApi"
import { DEFAULT_TEAM_ID, teamAboutHref, teamIssuesHref, teamProjectsHref, teamSprintsHref } from "./teams"

function pathIdForProjectId(projectId, projects) {
  const list = Array.isArray(projects) ? projects : []
  const record = list.find((row) => row?.id === projectId)
  if (record) return projectPathId(record)
  return projectId || DEFAULT_PROJECT_ID
}

function buildTeamDestinations(teamId) {
  const id = teamId || DEFAULT_TEAM_ID
  return [
    { id: "issues", label: "Issues", href: teamIssuesHref(id) },
    { id: "sprints", label: "Sprints", href: teamSprintsHref(id) },
    { id: "projects", label: "Projects", href: teamProjectsHref(id) },
    { id: "about", label: "About", href: teamAboutHref(id) },
  ]
}

function displayTitle(row, fallback) {
  const trimmed = typeof row?.title === "string" ? row.title.trim() : ""
  return trimmed.length > 0 ? trimmed : fallback
}

function projectDestinations(projectId, projects) {
  const sourceProjectId = projectId || DEFAULT_PROJECT_ID
  const pathId = pathIdForProjectId(sourceProjectId, projects)
  return [
    { id: "overview", label: "Overview", href: projectOverviewHref(pathId), state: { sourceProjectId } },
    { id: "scope", label: "Scope", href: projectTabHref(pathId, "Scope"), state: { sourceProjectId } },
    { id: "activity", label: "Activity", href: projectTabHref(pathId, "Activity"), state: { sourceProjectId } },
  ]
}

function issueDestinations(issues, context) {
  const list = Array.isArray(issues) ? issues : []
  const projectScoped =
    context?.variant === "chat-project" && context.projectId
      ? list.filter((issue) => issue.projectId === context.projectId)
      : list

  const scope =
    context?.variant === "chat-project"
      ? { scope: "project", projectId: pathIdForProjectId(context.projectId, context.projects) }
      : { scope: "team", teamId: context?.teamId ?? DEFAULT_TEAM_ID }

  return projectScoped.map((issue) => ({
    id: `issue:${issue.id}`,
    label: `${issue.id} ${displayTitle(issue, "No title")}`,
    href: issueHref(issue.id, scope, context?.projects),
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
      href: projectOverviewHref(projectPathId(project)),
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
    return [...projectDestinations(context.projectId, context.projects), ...recordDestinations]
  }
  return [...buildTeamDestinations(context?.teamId), ...recordDestinations]
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
