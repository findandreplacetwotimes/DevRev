import { kv } from "@vercel/kv"

import { sanitizeSprint, sanitizeStage } from "../src/lib/issueProjectSchema.js"
import { deriveSprintEndDate, sanitizeSprintStartDate } from "../src/lib/sprints.js"
import {
  reconcileIssueProjectFields,
  sanitizeIssueProjectId,
  sanitizeIssueMilestoneId,
} from "../src/lib/issueProjectLinks.js"
import { sanitizeProjectHealthId } from "../src/lib/projectHealth.js"
import {
  applySequentialMilestoneTitles,
  sanitizeProjectMilestonesArray,
} from "../src/lib/projectMilestones.js"
import {
  createInitialIssues,
  createInitialProjects,
  createInitialSprints,
  mergeSeedIssueProjectLinks,
  mergeSeedMilestonesIntoProjects,
} from "../src/lib/issuesSeed.js"

const STORAGE_KEY = "devrev:issues:v1"

/**
 * IDs like `Issue-0001`.
 * @param {unknown} raw
 * @returns {import("../src/lib/issuesApi.js").Issue | null}
 */
function sanitizeIssue(raw) {
  if (!raw || typeof raw !== "object") return null

  const rawId = typeof raw.id === "string" ? raw.id.trim() : ""
  const m = /^Issue-(\d+)$/i.exec(rawId)
  if (!m) return null
  const id = `Issue-${m[1]}`

  const team = typeof raw.team === "string" ? raw.team.trim() : ""
  if (!team.length) return null

  const title = typeof raw.title === "string" ? raw.title : ""
  const description = typeof raw.description === "string" ? raw.description : ""

  let ownerId = null
  if (typeof raw.ownerId === "string" && raw.ownerId.trim()) ownerId = raw.ownerId.trim()
  else if (raw.ownerId === null || typeof raw.ownerId === "undefined") ownerId = null
  else return null

  let dueDateId = null
  if (typeof raw.dueDateId === "string" && raw.dueDateId.trim()) dueDateId = raw.dueDateId.trim()
  else if (raw.dueDateId === null || typeof raw.dueDateId === "undefined") dueDateId = null
  else return null

  let projectId = sanitizeIssueProjectId(raw.projectId)
  let milestoneId = projectId ? sanitizeIssueMilestoneId(raw.milestoneId) : null

  return {
    id,
    team,
    title,
    description,
    ownerId,
    dueDateId,
    sprint: sanitizeSprint(raw.sprint),
    stage: sanitizeStage(raw.stage),
    projectId,
    milestoneId,
  }
}

/**
 * IDs like `Project-0001`; Issue fields plus `healthId`.
 * @param {unknown} raw
 * @returns {import("../src/lib/issuesApi.js").Project | null}
 */
function sanitizeProject(raw) {
  if (!raw || typeof raw !== "object") return null

  const rawId = typeof raw.id === "string" ? raw.id.trim() : ""
  const m = /^Project-(\d+)$/i.exec(rawId)
  if (!m) return null
  const num = Number.parseInt(m[1], 10)
  if (!Number.isFinite(num) || num < 1) return null
  const id = `Project-${String(num).padStart(4, "0")}`

  const team = typeof raw.team === "string" ? raw.team.trim() : ""
  if (!team.length) return null

  const title = typeof raw.title === "string" ? raw.title : ""
  const description = typeof raw.description === "string" ? raw.description : ""

  let ownerId = null
  if (typeof raw.ownerId === "string" && raw.ownerId.trim()) ownerId = raw.ownerId.trim()
  else if (raw.ownerId === null || typeof raw.ownerId === "undefined") ownerId = null
  else return null

  let dueDateId = null
  if (typeof raw.dueDateId === "string" && raw.dueDateId.trim()) dueDateId = raw.dueDateId.trim()
  else if (raw.dueDateId === null || typeof raw.dueDateId === "undefined") dueDateId = null
  else return null

  return {
    id,
    team,
    title,
    description,
    ownerId,
    dueDateId,
    sprint: sanitizeSprint(raw.sprint),
    stage: sanitizeStage(raw.stage),
    healthId: sanitizeProjectHealthId(raw.healthId),
    milestones: sanitizeProjectMilestonesArray(raw.milestones),
  }
}

/**
 * @param {unknown} body
 * @returns {ReturnType<typeof sanitizeIssue>[] | null}
 */
function normalizeIssuesBody(body) {
  if (!body || typeof body !== "object" || !Array.isArray(body.issues)) return null
  const seen = new Set()
  /** @type {ReturnType<typeof sanitizeIssue>[]} */
  const out = []
  for (const item of body.issues) {
    const row = sanitizeIssue(item)
    if (!row || seen.has(row.id)) return null
    seen.add(row.id)
    out.push(row)
  }
  if (out.length === 0) return null
  return out
}

/**
 * @param {unknown} body
 * @returns {ReturnType<typeof sanitizeProject>[] | null}
 */
function normalizeProjectsBody(body) {
  if (!body || typeof body !== "object" || !Array.isArray(body.projects)) return null
  const seen = new Set()
  /** @type {ReturnType<typeof sanitizeProject>[]} */
  const out = []
  for (const item of body.projects) {
    const row = sanitizeProject(item)
    if (!row || seen.has(row.id)) return null
    seen.add(row.id)
    out.push(row)
  }
  if (out.length === 0) return null
  return out
}

/**
 * @param {unknown} record
 * @returns {ReturnType<typeof sanitizeProject>[]}
 */
function projectsFromRecord(record) {
  const rawList = record && typeof record === "object" && Array.isArray(record.projects) ? record.projects : null
  if (!rawList || rawList.length === 0) return []
  const validated = rawList.map((row) => sanitizeProject(row)).filter(Boolean)
  return validated.length === rawList.length ? validated : []
}

/**
 * @param {unknown} raw
 * @returns {import("../src/lib/issuesApi.js").Sprint | null}
 */
function sanitizeSprintEntity(raw) {
  if (!raw || typeof raw !== "object") return null
  const id = typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : null
  if (!id) return null
  const startDate = sanitizeSprintStartDate(raw.startDate)
  return {
    id,
    startDate,
    endDate: deriveSprintEndDate(startDate),
  }
}

function sprintsFromRecord(record) {
  const rawList = record && typeof record === "object" && Array.isArray(record.sprints) ? record.sprints : null
  if (!rawList || rawList.length === 0) return []
  const validated = rawList.map((row) => sanitizeSprintEntity(row)).filter(Boolean)
  return validated.length === rawList.length ? validated : []
}

function normalizeSprintsBody(body) {
  if (!body || typeof body !== "object" || !Array.isArray(body.sprints)) return null
  const seen = new Set()
  const out = []
  for (const item of body.sprints) {
    const row = sanitizeSprintEntity(item)
    if (!row || seen.has(row.id)) return null
    seen.add(row.id)
    out.push(row)
  }
  if (out.length === 0) return null
  return out
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      let record = await kv.get(STORAGE_KEY)
      const rawList = record && typeof record === "object" && Array.isArray(record.issues) ? record.issues : null

      /** @type {ReturnType<typeof sanitizeIssue>[]} */
      let issues = []
      if (rawList && rawList.length > 0) {
        const validated = rawList.map((row) => sanitizeIssue(row)).filter(Boolean)
        if (validated.length === rawList.length) issues = validated
      }

      let projects = projectsFromRecord(record)
      let sprints = sprintsFromRecord(record)
      let mutated = false

      if (issues.length === 0) {
        const seeded = createInitialIssues()
        issues = seeded
          .map((i) =>
            sanitizeIssue({
              id: i.id,
              team: i.team,
              title: typeof i.title === "string" ? i.title : "",
              description: typeof i.description === "string" ? i.description : "",
              ownerId: i.ownerId ?? null,
              dueDateId: i.dueDateId ?? null,
              sprint: i.sprint,
              stage: i.stage,
              projectId: i.projectId ?? null,
              milestoneId: i.milestoneId ?? null,
            })
          )
          .filter(Boolean)
        mutated = true
      }

      if (projects.length === 0) {
        projects = createInitialProjects()
          .map((p) =>
            sanitizeProject({
              id: p.id,
              team: p.team,
              title: typeof p.title === "string" ? p.title : "",
              description: typeof p.description === "string" ? p.description : "",
              ownerId: p.ownerId ?? null,
              dueDateId: p.dueDateId ?? null,
              sprint: p.sprint,
              stage: p.stage,
              healthId: p.healthId,
              milestones: p.milestones,
            })
          )
          .filter(Boolean)
        mutated = true
      }

      if (sprints.length === 0) {
        sprints = createInitialSprints().map((row) => sanitizeSprintEntity(row)).filter(Boolean)
        mutated = true
      }

      const projectMilestoneSig = (projs) =>
        projs.map((p) => (p.milestones ?? []).map((m) => `${m.id}:${m.title}`).join("|")).join(";")

      const milestoneLensBefore = projects.map((p) => p.milestones?.length ?? 0)
      const preMilestoneSig = projectMilestoneSig(projects)
      projects = applySequentialMilestoneTitles(mergeSeedMilestonesIntoProjects(projects))
      if (
        projects.some((p, i) => (p.milestones?.length ?? 0) !== milestoneLensBefore[i]) ||
        projectMilestoneSig(projects) !== preMilestoneSig
      ) {
        mutated = true
      }

      const issueLinkKey = (list) =>
        list.map((i) => `${i.id}|${i.projectId ?? ""}|${i.milestoneId ?? ""}`).join(";")
      const linksBeforeMigrate = issueLinkKey(issues)
      issues = mergeSeedIssueProjectLinks(issues)
      issues = reconcileIssueProjectFields(issues, projects)
      if (issueLinkKey(issues) !== linksBeforeMigrate) mutated = true

      if (mutated) {
        record = {
          issues,
          projects,
          sprints,
          updatedAt: new Date().toISOString(),
        }
        await kv.set(STORAGE_KEY, record)
      }

      res.status(200).json({
        issues: issues ?? [],
        projects: projects ?? [],
        sprints: sprints ?? [],
        updatedAt: record && typeof record === "object" && record.updatedAt ? record.updatedAt : null,
      })
      return
    } catch {
      res.status(500).json({ error: "Failed to load issues." })
      return
    }
  }

  if (req.method === "PUT") {
    try {
      const issues = normalizeIssuesBody(req.body)
      if (!issues) {
        res.status(400).json({
          error:
            "Invalid payload. Expect { issues: Issue[] }; each needs id Issue-#, non-empty team, and valid optional ownerId/dueDateId.",
        })
        return
      }

      const existing = await kv.get(STORAGE_KEY)
      const fromBody = normalizeProjectsBody(req.body)
      let projects = fromBody
      if (!projects) {
        const kept = projectsFromRecord(existing)
        projects = kept.length > 0 ? kept : createInitialProjects().map((p) => sanitizeProject(p)).filter(Boolean)
      }

      projects = applySequentialMilestoneTitles(mergeSeedMilestonesIntoProjects(projects))
      let sprints = normalizeSprintsBody(req.body)
      if (!sprints) {
        const kept = sprintsFromRecord(existing)
        sprints = kept.length > 0 ? kept : createInitialSprints().map((row) => sanitizeSprintEntity(row)).filter(Boolean)
      }

      const reconciledIssues = reconcileIssueProjectFields(issues, projects)

      const record = {
        issues: reconciledIssues,
        projects,
        sprints,
        updatedAt: new Date().toISOString(),
      }
      await kv.set(STORAGE_KEY, record)
      res.status(200).json({ ok: true, updatedAt: record.updatedAt })
      return
    } catch {
      res.status(500).json({ error: "Failed to save issues." })
      return
    }
  }

  res.setHeader("Allow", "GET, PUT")
  res.status(405).json({ error: "Method not allowed." })
}
