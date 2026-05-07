import { useNavigate } from "react-router-dom"
import { EMPTY_ISSUE_TITLE_PLACEHOLDER, ticketChipFromIssueId } from "../lib/issuesApi"
import { milestoneLabelAtIndex } from "../lib/projectMilestones"
import { OWNERS } from "../lib/owners"
import { DueDateSelector } from "./DueDateSelector"
import { ListItemRow } from "./ListItem"
import { ProjectHealthSelector } from "./ProjectHealthSelector"

function MilestoneTitleBlock({ index, milestone, onPatchMilestone }) {
  return (
    <div className="w-full px-[44px]">
      <div className="mx-auto w-full min-w-0 max-w-[740px] py-[12px]">
        <h2
          className="m-0 mb-[5px] min-h-[32px] text-[22px] leading-[28px] font-semibold text-[var(--fg-neutral-prominent)]"
          style={{
            fontFamily: '"Chip Display Variable", -apple-system, BlinkMacSystemFont, sans-serif',
            fontFeatureSettings: '"lnum" 1, "tnum" 1',
          }}
        >
          {milestoneLabelAtIndex(index)}
        </h2>
        <div className="flex w-full min-w-0 flex-nowrap items-center gap-[4px] py-[8px]">
          <ProjectHealthSelector
            value={milestone.healthId}
            onChange={(healthId) => onPatchMilestone({ healthId })}
          />
          <DueDateSelector
            value={milestone.dueDateId ?? null}
            onChange={(dueDateId) => onPatchMilestone({ dueDateId })}
          />
          <span aria-hidden className="min-w-[1px] shrink-0 flex-1" />
        </div>
      </div>
    </div>
  )
}

function MilestoneListBlock({ issues, navigate, patchIssue, projectId }) {
  return (
    <div className="w-full">
      <div className="flex w-full min-w-0 flex-col">
        {issues.map((issue) => {
          const chip = ticketChipFromIssueId(issue.id)
          const trimmed = typeof issue.title === "string" ? issue.title.trim() : ""
          const display = trimmed.length ? issue.title : EMPTY_ISSUE_TITLE_PLACEHOLDER
          return (
            <ListItemRow
              key={issue.id}
              ticketPrefix={chip.ticketPrefix}
              ticketNumber={chip.ticketNumber || "?"}
              text={display}
              titleIsPlaceholder={!trimmed.length}
              owners={OWNERS}
              ownerId={issue.ownerId}
              onOwnerChange={(ownerId) => patchIssue(issue.id, { ownerId })}
              dueDateId={issue.dueDateId}
              onDueDateChange={(dueDateId) => patchIssue(issue.id, { dueDateId })}
              showMore
              onRowClick={() =>
                navigate(`/issues/${encodeURIComponent(issue.id)}`, { state: { sourceProjectId: projectId } })
              }
              onMoreClick={() => {}}
            />
          )
        })}
      </div>
    </div>
  )
}

/**
 * Project overview: milestone headers (health + due, same chips as page meta) and linked issues (`ListItemRow`).
 * Milestone title and issue list both use `px-[44px]` + centered `max-w-[740px]` (same column as project title/description).
 *
 * @param {object} props
 * @param {import("../lib/issuesApi").Project} props.project
 * @param {import("../lib/issuesApi").Issue[]} props.issues
 * @param {(projectId: string, patch: Partial<import("../lib/issuesApi").Project>) => void} props.patchProject
 * @param {(issueId: string, patch: Partial<import("../lib/issuesApi").Issue>) => void} props.patchIssue
 */
export function ProjectMilestonesOverview({ project, issues, patchProject, patchIssue }) {
  const navigate = useNavigate()
  const milestones = project.milestones ?? []
  if (milestones.length === 0) return null

  const patchMilestone = (milestoneId, partial) => {
    patchProject(project.id, {
      milestones: milestones.map((m) => (m.id === milestoneId ? { ...m, ...partial } : m)),
    })
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-[24px]">
      {milestones.map((milestone, index) => {
        const inMilestone = issues
          .filter((issue) => issue.projectId === project.id && issue.milestoneId === milestone.id)
          .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))

        return (
          <section key={milestone.id} className="flex w-full min-w-0 flex-col">
            <MilestoneTitleBlock
              index={index}
              milestone={milestone}
              onPatchMilestone={(partial) => patchMilestone(milestone.id, partial)}
            />
            <MilestoneListBlock
              issues={inMilestone}
              navigate={navigate}
              patchIssue={patchIssue}
              projectId={project.id}
            />
          </section>
        )
      })}
    </div>
  )
}
