import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import {
  reconcileIssueProjectFields,
  sanitizeIssueProjectId,
  sanitizeIssueMilestoneId,
} from "../lib/issueProjectLinks"
import { sanitizeCreatedDate, sanitizePriority, sanitizeSprint, sanitizeStage } from "../lib/issueProjectSchema"
import { sanitizeProjectHealthId } from "../lib/projectHealth"
import { applySequentialMilestoneTitles, sanitizeProjectMilestonesArray } from "../lib/projectMilestones"
import { deriveSprintEndDate, sanitizeSprintStartDate } from "../lib/sprints"
import { OWNERS } from "../lib/owners"
import {
  createInitialIssues,
  createInitialProjects,
  createInitialSprints,
  mergeMissingSeedIssues,
  mergeSeedIssueProjectLinks,
  mergeSeedMilestonesIntoProjects,
} from "../lib/issuesSeed"
import { createEarlyIdeationChat, createArcadeOriginChat } from "../lib/demoConversionSeed"
import { ISSUES_API_PATH } from "../lib/issuesApi"

const IssuesContext = createContext(null)

const PERSIST_DEBOUNCE_MS = 400
/** Local backup when `/api/issues` is unavailable (e.g. `vite` dev) so issue-page edits survive refresh. */
const LS_ISSUES_KEY = "devrev.issues.local.v1"
const LS_PROJECTS_KEY = "devrev.projects.local.v1"
const LS_SPRINTS_KEY = "devrev.sprints.local.v1"
const LS_CHATS_KEY = "devrev.chats.local.v1"

/** @typedef {import("../lib/issuesApi").Issue} Issue */
/** @typedef {import("../lib/issuesApi").Project} Project */
/** @typedef {import("../lib/issuesApi").Sprint} Sprint */
/**
 * @typedef {Object} Chat
 * @property {string} id - Unique chat identifier
 * @property {string[]} participants - Array of participant IDs (includes 'computer' for AI agent)
 * @property {Array<{id: string, senderId: string, text: string, timestamp: number}>} messages - Chat messages
 * @property {Array<{id: string, name: string, url: string}>} files - Generated artifacts/files
 * @property {number} createdAt - Unix timestamp
 * @property {number} lastActivity - Unix timestamp of last message
 * @property {string|null} projectId - Project ID if converted to project, null otherwise
 * @property {string} title - Auto-generated or custom title
 */
const DUE_DATE_ROTATION = ["today", "tomorrow", "endOfWeek", "endOfNextWeek"]

function pickDeterministicIndex(id, length) {
  const m = /(\d+)$/.exec(String(id))
  const n = m ? Number.parseInt(m[1], 10) : 1
  return Number.isFinite(n) && length > 0 ? n % length : 0
}

function withExactLength(text, fallback, targetLength = 200) {
  const source = typeof text === "string" && text.trim().length > 0 ? text.trim() : fallback
  let out = source
  while (out.length < targetLength) out = `${out} ${fallback}`
  return out.slice(0, targetLength)
}

function normalizeIssueDisplayFields(row) {
  const ownerId = typeof row.ownerId === "string" && row.ownerId.trim().length > 0
    ? row.ownerId.trim()
    : OWNERS[pickDeterministicIndex(row.id, OWNERS.length)]?.id ?? OWNERS[0]?.id ?? null
  const dueDateId = typeof row.dueDateId === "string" && row.dueDateId.trim().length > 0
    ? row.dueDateId.trim()
    : DUE_DATE_ROTATION[pickDeterministicIndex(row.id, DUE_DATE_ROTATION.length)]
  const title = typeof row.title === "string" && row.title.trim().length > 0
    ? row.title.trim()
    : `Execution plan for ${row.id}`
  const description = withExactLength(
    row.description,
    `Execution details for ${row.id} covering scope, ownership, dependencies, risk controls, rollout readiness, and measurable completion criteria.`,
    600
  )

  return { title, description, ownerId, dueDateId }
}

function normalizeProjectDisplayFields(row) {
  const ownerId = typeof row.ownerId === "string" && row.ownerId.trim().length > 0
    ? row.ownerId.trim()
    : OWNERS[pickDeterministicIndex(row.id, OWNERS.length)]?.id ?? OWNERS[0]?.id ?? null
  const dueDateId = typeof row.dueDateId === "string" && row.dueDateId.trim().length > 0
    ? row.dueDateId.trim()
    : DUE_DATE_ROTATION[pickDeterministicIndex(row.id, DUE_DATE_ROTATION.length)]
  const title = typeof row.title === "string" && row.title.trim().length > 0
    ? row.title.trim()
    : `Delivery roadmap for ${row.id}`
  const description = withExactLength(
    row.description,
    `Project brief for ${row.id} outlining milestones, execution approach, stakeholder alignment, timeline assumptions, risk mitigation, and expected delivery outcomes.`,
    600
  )
  const history = Array.isArray(row.history) ? row.history : []

  return { title, description, ownerId, dueDateId, history }
}

function readIssuesFromLocalStorage() {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(LS_ISSUES_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const list = parsed?.issues
    if (!Array.isArray(list) || list.length === 0) return null
    /** @type {Issue[]} */
    const out = []
    for (const row of list) {
      if (!row || typeof row !== "object") return null
      if (typeof row.id !== "string" || typeof row.team !== "string") return null
      const projectId = sanitizeIssueProjectId(row.projectId)
      out.push({
        id: row.id,
        team: row.team,
        title: typeof row.title === "string" ? row.title : "",
        description: typeof row.description === "string" ? row.description : "",
        ownerId:
          typeof row.ownerId === "string" && row.ownerId.trim() ? row.ownerId.trim() : null,
        dueDateId:
          typeof row.dueDateId === "string" && row.dueDateId.trim()
            ? row.dueDateId.trim()
            : null,
        priority: sanitizePriority(row.priority),
        createdDate: sanitizeCreatedDate(row.createdDate),
        sprint: sanitizeSprint(row.sprint),
        stage: sanitizeStage(row.stage),
        projectId,
        milestoneId: projectId ? sanitizeIssueMilestoneId(row.milestoneId) : null,
      })
    }
    return out.length > 0 ? out : null
  } catch {
    return null
  }
}

function writeIssuesToLocalStorage(issues) {
  try {
    window.localStorage.setItem(LS_ISSUES_KEY, JSON.stringify({ issues }))
  } catch {
    /* quota / private mode */
  }
}

function readProjectsFromLocalStorage() {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(LS_PROJECTS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const list = parsed?.projects
    if (!Array.isArray(list) || list.length === 0) return null
    /** @type {Project[]} */
    const out = []
    for (const row of list) {
      if (!row || typeof row !== "object") return null
      if (typeof row.id !== "string" || typeof row.team !== "string") return null
      out.push({
        id: row.id,
        team: row.team,
        title: typeof row.title === "string" ? row.title : "",
        description: typeof row.description === "string" ? row.description : "",
        ownerId:
          typeof row.ownerId === "string" && row.ownerId.trim() ? row.ownerId.trim() : null,
        dueDateId:
          typeof row.dueDateId === "string" && row.dueDateId.trim()
            ? row.dueDateId.trim()
            : null,
        sprint: sanitizeSprint(row.sprint),
        stage: sanitizeStage(row.stage),
        healthId: sanitizeProjectHealthId(row.healthId),
        milestones: sanitizeProjectMilestonesArray(row.milestones),
        history: Array.isArray(row.history) ? row.history : [],
      })
    }
    return out.length > 0 ? out : null
  } catch {
    return null
  }
}

function writeProjectsToLocalStorage(projects) {
  try {
    window.localStorage.setItem(LS_PROJECTS_KEY, JSON.stringify({ projects }))
  } catch {
    /* quota / private mode */
  }
}

function readSprintsFromLocalStorage() {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(LS_SPRINTS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const list = parsed?.sprints
    if (!Array.isArray(list) || list.length === 0) return null
    /** @type {Sprint[]} */
    const out = []
    for (const row of list) {
      if (!row || typeof row !== "object") return null
      const id = typeof row.id === "string" && row.id.trim() ? row.id.trim() : null
      if (!id) return null
      const startDate = sanitizeSprintStartDate(row.startDate)
      out.push({
        id,
        startDate,
        endDate: deriveSprintEndDate(startDate),
      })
    }
    return out.length > 0 ? out : null
  } catch {
    return null
  }
}

function writeSprintsToLocalStorage(sprints) {
  try {
    window.localStorage.setItem(LS_SPRINTS_KEY, JSON.stringify({ sprints }))
  } catch {
    /* quota / private mode */
  }
}

function createInitialChats() {
  return [
    // Demo: Early ideation - just Dejan + Computer creating files
    // Shows file creation but NO convert button (only 2 participants)
    createEarlyIdeationChat(),

    // Demo: Collaborative chat - team has joined, ready to convert
    // Shows convert button (4 participants, files, conversation)
    createArcadeOriginChat(),
  ]
}

function readChatsFromLocalStorage() {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(LS_CHATS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const list = parsed?.chats
    if (!Array.isArray(list) || list.length === 0) return null
    /** @type {Chat[]} */
    const out = []
    for (const row of list) {
      if (!row || typeof row !== "object") return null
      if (typeof row.id !== "string") return null
      out.push({
        id: row.id,
        participants: Array.isArray(row.participants) ? row.participants : [],
        messages: Array.isArray(row.messages) ? row.messages : [],
        files: Array.isArray(row.files) ? row.files : [],
        createdAt: typeof row.createdAt === "number" ? row.createdAt : Date.now(),
        lastActivity: typeof row.lastActivity === "number" ? row.lastActivity : Date.now(),
        projectId: typeof row.projectId === "string" ? row.projectId : null,
        title: typeof row.title === "string" ? row.title : "New Chat",
      })
    }
    return out.length > 0 ? out : null
  } catch {
    return null
  }
}

function writeChatsToLocalStorage(chats) {
  try {
    window.localStorage.setItem(LS_CHATS_KEY, JSON.stringify({ chats }))
  } catch {
    /* quota / private mode */
  }
}

export function IssuesProvider({ children }) {
  /** @type {[Issue[] | null, React.Dispatch<React.SetStateAction<Issue[] | null>>]} */
  const [issues, setIssues] = useState(null)
  /** @type {[Project[] | null, React.Dispatch<React.SetStateAction<Project[] | null>>]} */
  const [projects, setProjects] = useState(null)
  /** @type {[Sprint[] | null, React.Dispatch<React.SetStateAction<Sprint[] | null>>]} */
  const [sprints, setSprints] = useState(null)
  /** @type {[Chat[] | null, React.Dispatch<React.SetStateAction<Chat[] | null>>]} */
  const [chats, setChats] = useState(null)
  const skipInitialSaveRef = useRef(true)
  /** @type {React.RefObject<Project[] | null>} */
  const projectsRef = useRef(null)

  useEffect(() => {
    projectsRef.current = projects
  }, [projects])

  function normalizeProjectsClient(projectList) {
    const normalized = projectList.slice(0, 3).map((projectRow) => ({
      ...projectRow,
      ...normalizeProjectDisplayFields(projectRow),
      healthId: sanitizeProjectHealthId(projectRow.healthId),
      milestones: sanitizeProjectMilestonesArray(projectRow.milestones),
    }))
    return applySequentialMilestoneTitles(mergeSeedMilestonesIntoProjects(normalized))
  }

  function normalizeIssuesClient(issueList) {
    return issueList.map((row) => {
      const projectId = sanitizeIssueProjectId(row.projectId)
      return {
        ...row,
        ...normalizeIssueDisplayFields(row),
        priority: sanitizePriority(row.priority),
        createdDate: sanitizeCreatedDate(row.createdDate),
        sprint: sanitizeSprint(row.sprint),
        stage: sanitizeStage(row.stage),
        projectId,
        milestoneId: projectId ? sanitizeIssueMilestoneId(row.milestoneId) : null,
      }
    })
  }

  function normalizeSprintsClient(sprintList) {
    return sprintList.map((row) => {
      const id = typeof row.id === "string" && row.id.trim().length > 0 ? row.id.trim() : "Sprint"
      const startDate = sanitizeSprintStartDate(row.startDate)
      return {
        id,
        startDate,
        endDate: deriveSprintEndDate(startDate),
      }
    })
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const response = await fetch(ISSUES_API_PATH)
        if (!response.ok) throw new Error("Issues GET failed.")
        const payload = await response.json()
        const issueList = payload?.issues
        const projectList = payload?.projects
        const sprintList = payload?.sprints
        const chatList = payload?.chats
        if (!cancelled && Array.isArray(issueList) && issueList.length > 0) {
          const normalizedProjects =
            Array.isArray(projectList) && projectList.length > 0
              ? normalizeProjectsClient(projectList)
              : normalizeProjectsClient(createInitialProjects())
          const reconciledIssues = reconcileIssueProjectFields(
            mergeSeedIssueProjectLinks(mergeMissingSeedIssues(normalizeIssuesClient(issueList))),
            normalizedProjects
          )
          const normalizedSprints =
            Array.isArray(sprintList) && sprintList.length > 0
              ? normalizeSprintsClient(sprintList)
              : normalizeSprintsClient(createInitialSprints())
          const normalizedChats =
            Array.isArray(chatList) && chatList.length > 0 ? chatList : createInitialChats()
          writeIssuesToLocalStorage(reconciledIssues)
          writeProjectsToLocalStorage(normalizedProjects)
          writeSprintsToLocalStorage(normalizedSprints)
          writeChatsToLocalStorage(normalizedChats)
          setProjects(normalizedProjects)
          setIssues(reconciledIssues)
          setSprints(normalizedSprints)
          setChats(normalizedChats)
          return
        }
        throw new Error("Empty payload.")
      } catch {
        const storedIssues = !cancelled ? readIssuesFromLocalStorage() : null
        const storedProjects = !cancelled ? readProjectsFromLocalStorage() : null
        const storedSprints = !cancelled ? readSprintsFromLocalStorage() : null
        const storedChats = !cancelled ? readChatsFromLocalStorage() : null
        const fallbackProjects = !cancelled
          ? normalizeProjectsClient(storedProjects ?? createInitialProjects())
          : null
        const fallbackSprints = !cancelled
          ? normalizeSprintsClient(storedSprints ?? createInitialSprints())
          : null
        const fallbackChats = !cancelled ? storedChats ?? createInitialChats() : null
        const fallbackIssues = !cancelled
          ? reconcileIssueProjectFields(
              mergeSeedIssueProjectLinks(
                mergeMissingSeedIssues(normalizeIssuesClient(storedIssues ?? createInitialIssues()))
              ),
              fallbackProjects ?? []
            )
          : null
        if (fallbackIssues && fallbackProjects && fallbackSprints && fallbackChats) {
          setProjects(fallbackProjects)
          setIssues(fallbackIssues)
          setSprints(fallbackSprints)
          setChats(fallbackChats)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (issues === null || projects === null) return undefined
    setIssues((prev) => {
      if (!prev) return prev
      const next = reconcileIssueProjectFields(prev, projects)
      return JSON.stringify(next) === JSON.stringify(prev) ? prev : next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reconcile issues when milestone list / ids change per project only
  }, [projects])

  useEffect(() => {
    if (issues === null || projects === null || sprints === null || chats === null) return undefined

    if (skipInitialSaveRef.current) {
      skipInitialSaveRef.current = false
      return undefined
    }

    const id = window.setTimeout(async () => {
      writeIssuesToLocalStorage(issues)
      writeProjectsToLocalStorage(projects)
      writeSprintsToLocalStorage(sprints)
      writeChatsToLocalStorage(chats)
      try {
        await fetch(ISSUES_API_PATH, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ issues, projects, sprints, chats }),
        })
      } catch {
        /** ignore — localStorage keeps a copy when the API route is unreachable */
      }
    }, PERSIST_DEBOUNCE_MS)

    return () => window.clearTimeout(id)
  }, [issues, projects, sprints, chats])

  /** @type {(issueId: string, patch: Partial<Issue>) => void} */
  const patchIssue = useCallback((issueId, patch) => {
    setIssues((prev) => {
      if (!prev) return prev
      const next = prev.map((row) => {
        if (row.id !== issueId) return row
        const { createdDate: _ignoredCreatedDate, ...safePatch } = patch
        const merged = { ...row, ...safePatch, createdDate: row.createdDate }
        if (Object.prototype.hasOwnProperty.call(patch, "projectId") && !merged.projectId) {
          merged.projectId = null
          merged.milestoneId = null
        }
        merged.priority = sanitizePriority(merged.priority)
        merged.sprint = sanitizeSprint(merged.sprint)
        merged.stage = sanitizeStage(merged.stage)
        return merged
      })
      const projs = projectsRef.current
      return projs && Array.isArray(projs) ? reconcileIssueProjectFields(next, projs) : next
    })
  }, [])

  /** @type {(projectId: string, patch: Partial<Project>) => void} */
  const patchProject = useCallback((projectId, patch) => {
    setProjects((prev) => {
      if (!prev) return prev
      const mapped = prev.map((row) => {
        if (row.id !== projectId) return row
        const merged = { ...row, ...patch }
        return {
          ...merged,
          healthId: sanitizeProjectHealthId(merged.healthId),
          milestones: sanitizeProjectMilestonesArray(merged.milestones),
        }
      })
      return applySequentialMilestoneTitles(mapped)
    })
  }, [])

  /** @type {(sprintId: string, patch: Partial<Sprint>) => void} */
  const patchSprint = useCallback((sprintId, patch) => {
    setSprints((prev) => {
      if (!prev) return prev
      return prev.map((row) => {
        if (row.id !== sprintId) return row
        const merged = { ...row, ...patch }
        const startDate = sanitizeSprintStartDate(merged.startDate)
        return {
          ...merged,
          startDate,
          endDate: deriveSprintEndDate(startDate),
        }
      })
    })
  }, [])

  /** @type {(chatId: string, patch: Partial<Chat>) => void} */
  const patchChat = useCallback((chatId, patch) => {
    setChats((prev) => {
      if (!prev) return prev
      return prev.map((row) => {
        if (row.id !== chatId) return row
        return { ...row, ...patch }
      })
    })
  }, [])

  /** @type {(chatId: string) => string | null} */
  const convertChatToProject = useCallback((chatId) => {
    const chat = chats?.find(c => c.id === chatId)
    if (!chat) return null

    // For the demo, always navigate to the pre-seeded Arcade Design System project
    const projectId = "Project-0004"

    // Update chat with projectId link to mark it as converted
    patchChat(chatId, { projectId })

    return projectId
  }, [chats, patchChat])

  const value = useMemo(
    () => ({
      issues,
      projects,
      sprints,
      chats,
      loading: issues === null || projects === null || sprints === null || chats === null,
      patchIssue,
      patchProject,
      patchSprint,
      patchChat,
      convertChatToProject,
      setIssues,
      setProjects,
      setSprints,
      setChats,
    }),
    [issues, projects, sprints, chats, patchIssue, patchProject, patchSprint, patchChat, convertChatToProject]
  )

  return <IssuesContext.Provider value={value}>{children}</IssuesContext.Provider>
}

// Hook is intentionally co-located with the Provider.
// eslint-disable-next-line react-refresh/only-export-components -- shared hook export
export function useIssues() {
  const ctx = useContext(IssuesContext)
  if (!ctx) {
    throw new Error("useIssues must be used within IssuesProvider")
  }
  return ctx
}

// eslint-disable-next-line react-refresh/only-export-components -- shared hook export
export function useProjects() {
  const ctx = useContext(IssuesContext)
  if (!ctx) {
    throw new Error("useProjects must be used within IssuesProvider")
  }
  return {
    projects: ctx.projects,
    loading: ctx.projects === null,
    patchProject: ctx.patchProject,
    setProjects: ctx.setProjects,
  }
}

// eslint-disable-next-line react-refresh/only-export-components -- shared hook export
export function useChats() {
  const ctx = useContext(IssuesContext)
  if (!ctx) {
    throw new Error("useChats must be used within IssuesProvider")
  }
  return {
    chats: ctx.chats,
    loading: ctx.chats === null,
    patchChat: ctx.patchChat,
    setChats: ctx.setChats,
  }
}
