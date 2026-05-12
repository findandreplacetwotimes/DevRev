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
import { ISSUES_API_PATH } from "../lib/issuesApi"

const IssuesContext = createContext(null)

const PERSIST_DEBOUNCE_MS = 400
/** Local backup when `/api/issues` is unavailable (e.g. `vite` dev) so issue-page edits survive refresh. */
const LS_ISSUES_KEY = "devrev.issues.local.v1"
const LS_PROJECTS_KEY = "devrev.projects.local.v1"
const LS_SPRINTS_KEY = "devrev.sprints.local.v1"

/** @typedef {import("../lib/issuesApi").Issue} Issue */
/** @typedef {import("../lib/issuesApi").Project} Project */
/** @typedef {import("../lib/issuesApi").Sprint} Sprint */
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

  return { title, description, ownerId, dueDateId }
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

export function IssuesProvider({ children }) {
  /** @type {[Issue[] | null, React.Dispatch<React.SetStateAction<Issue[] | null>>]} */
  const [issues, setIssues] = useState(null)
  /** @type {[Project[] | null, React.Dispatch<React.SetStateAction<Project[] | null>>]} */
  const [projects, setProjects] = useState(null)
  /** @type {[Sprint[] | null, React.Dispatch<React.SetStateAction<Sprint[] | null>>]} */
  const [sprints, setSprints] = useState(null)
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
          writeIssuesToLocalStorage(reconciledIssues)
          writeProjectsToLocalStorage(normalizedProjects)
          writeSprintsToLocalStorage(normalizedSprints)
          setProjects(normalizedProjects)
          setIssues(reconciledIssues)
          setSprints(normalizedSprints)
          return
        }
        throw new Error("Empty payload.")
      } catch {
        const storedIssues = !cancelled ? readIssuesFromLocalStorage() : null
        const storedProjects = !cancelled ? readProjectsFromLocalStorage() : null
        const storedSprints = !cancelled ? readSprintsFromLocalStorage() : null
        const fallbackProjects = !cancelled
          ? normalizeProjectsClient(storedProjects ?? createInitialProjects())
          : null
        const fallbackSprints = !cancelled
          ? normalizeSprintsClient(storedSprints ?? createInitialSprints())
          : null
        const fallbackIssues = !cancelled
          ? reconcileIssueProjectFields(
              mergeSeedIssueProjectLinks(
                mergeMissingSeedIssues(normalizeIssuesClient(storedIssues ?? createInitialIssues()))
              ),
              fallbackProjects ?? []
            )
          : null
        if (fallbackIssues && fallbackProjects && fallbackSprints) {
          setProjects(fallbackProjects)
          setIssues(fallbackIssues)
          setSprints(fallbackSprints)
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
    if (issues === null || projects === null || sprints === null) return undefined

    if (skipInitialSaveRef.current) {
      skipInitialSaveRef.current = false
      return undefined
    }

    const id = window.setTimeout(async () => {
      writeIssuesToLocalStorage(issues)
      writeProjectsToLocalStorage(projects)
      writeSprintsToLocalStorage(sprints)
      try {
        await fetch(ISSUES_API_PATH, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ issues, projects, sprints }),
        })
      } catch {
        /** ignore — localStorage keeps a copy when the API route is unreachable */
      }
    }, PERSIST_DEBOUNCE_MS)

    return () => window.clearTimeout(id)
  }, [issues, projects, sprints])

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

  const addProject = useCallback((projectData) => {
    let newId = null
    setProjects((prev) => {
      if (!prev) return prev
      const maxNum = prev.reduce((max, p) => {
        const m = /^Project-(\d+)$/i.exec(p.id)
        return m ? Math.max(max, Number.parseInt(m[1], 10)) : max
      }, 0)
      newId = `Project-${String(maxNum + 1).padStart(4, "0")}`
      const newProject = {
        id: newId,
        team: projectData.team || "Core",
        title: projectData.title || "",
        description: projectData.description || "",
        ownerId: projectData.ownerId || null,
        dueDateId: projectData.dueDateId || null,
        sprint: "Sprint 1",
        stage: "No stage",
        healthId: sanitizeProjectHealthId("on-track"),
        milestones: [],
      }
      return [...prev, newProject]
    })
    return newId
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

  const value = useMemo(
    () => ({
      issues,
      projects,
      sprints,
      loading: issues === null || projects === null || sprints === null,
      patchIssue,
      patchProject,
      addProject,
      patchSprint,
      setIssues,
      setProjects,
      setSprints,
    }),
    [issues, projects, sprints, patchIssue, patchProject, addProject, patchSprint]
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
    addProject: ctx.addProject,
    setProjects: ctx.setProjects,
  }
}
