import { useState } from "react"
import { getDueDateOptions } from "../lib/dueDates"
import { EMPTY_ISSUE_TITLE_PLACEHOLDER, ticketChipFromIssueId } from "../lib/issuesApi"
import { OWNERS } from "../lib/owners"
import { DueDateSelector } from "./DueDateSelector"
import { ListItem, ListItemRow } from "./ListItem"
import { ProjectHealthSelector } from "./ProjectHealthSelector"

const meta = {
  title: "Components/ListItem",
  component: ListItem,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "more"],
    },
  },
  args: {
    type: "text",
    ticketPrefix: "Issue",
    ticketNumber: "0001",
    text: "Build core flow for feature",
    titleIsPlaceholder: false,
  },
}

export default meta

/** Figma `6004:8001` — ticket line + title (`gap-[4px]`). */
export const Text = {}

export const TextPlaceholderTitle = {
  args: {
    text: EMPTY_ISSUE_TITLE_PLACEHOLDER,
    titleIsPlaceholder: true,
  },
}

/** Figma trailing `ListItem` (`w-[44px]`, overflow menu). */
export const More = {
  args: {
    type: "more",
  },
}

function RowPlayground() {
  const [ownerId, setOwnerId] = useState(OWNERS[0]?.id ?? null)
  const [dueDateId, setDueDateId] = useState(getDueDateOptions()[0]?.id ?? null)
  const chip = ticketChipFromIssueId("Issue-0001")
  const title = "Build core flow for feature"

  return (
    <div className="w-full bg-white px-[44px]">
      <div className="mx-auto w-full max-w-[740px]">
        <ListItemRow
          ticketPrefix={chip.ticketPrefix}
          ticketNumber={chip.ticketNumber || "0001"}
          text={title}
          ownerId={ownerId}
          onOwnerChange={setOwnerId}
          dueDateId={dueDateId}
          onDueDateChange={setDueDateId}
          showMore
          onRowClick={() => {}}
          onMoreClick={() => {}}
        />
      </div>
    </div>
  )
}

/** Composite row: `px-[44px]` + `max-w-[740px]` like milestone lists on `ProjectPage`. */
export const IssueRow = {
  render: () => <RowPlayground />,
}

function MilestoneSectionStory() {
  const [ownerId, setOwnerId] = useState(OWNERS[1]?.id ?? null)
  const [dueDateId, setDueDateId] = useState(getDueDateOptions()[0]?.id ?? null)
  const [milestoneHealthId, setMilestoneHealthId] = useState("on-track")
  const [milestoneDueDateId, setMilestoneDueDateId] = useState(() => {
    const opts = getDueDateOptions()
    return opts[Math.min(3, Math.max(0, opts.length - 1))]?.id ?? null
  })

  const rows = [
    { id: "Issue-0001", title: "Build core flow for feature" },
    { id: "Issue-0002", title: "" },
    { id: "Issue-0003", title: "Polish nav-panel interactions" },
  ]

  return (
    <div className="flex w-full flex-col bg-white">
      <div className="w-full px-[44px]">
        <div className="mx-auto w-full min-w-0 max-w-[740px] py-[12px]">
          <h2
            className="m-0 mb-[5px] text-[22px] leading-[28px] font-semibold text-[var(--fg-neutral-prominent)]"
            style={{
              fontFamily: '"Chip Display Variable", -apple-system, BlinkMacSystemFont, sans-serif',
              fontFeatureSettings: '"lnum" 1, "tnum" 1',
            }}
          >
            Milestone 1
          </h2>
          {/** Same chip row as milestone header on `ProjectPage` (health + due). */}
          <div className="flex w-full min-w-0 flex-nowrap items-center gap-[4px] py-[8px]">
            <ProjectHealthSelector value={milestoneHealthId} onChange={setMilestoneHealthId} />
            <DueDateSelector value={milestoneDueDateId} onChange={setMilestoneDueDateId} />
            <span aria-hidden className="min-w-[1px] shrink-0 flex-1" />
          </div>
        </div>
      </div>
      <div className="w-full px-[44px]">
        <div className="mx-auto flex w-full min-w-0 max-w-[740px] flex-col">
          {rows.map((issue, index) => {
            const chip = ticketChipFromIssueId(issue.id)
            const trimmed = typeof issue.title === "string" ? issue.title.trim() : ""
            const display = trimmed.length ? trimmed : EMPTY_ISSUE_TITLE_PLACEHOLDER
            return (
              <ListItemRow
                key={issue.id}
                ticketPrefix={chip.ticketPrefix}
                ticketNumber={chip.ticketNumber || "?"}
                text={display}
                titleIsPlaceholder={trimmed.length === 0}
                ownerId={index === 0 ? ownerId : OWNERS[2]?.id ?? null}
                onOwnerChange={index === 0 ? setOwnerId : () => {}}
                dueDateId={index === 0 ? dueDateId : null}
                onDueDateChange={index === 0 ? setDueDateId : () => {}}
                showMore
                onRowClick={() => {}}
                onMoreClick={() => {}}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** Milestone header + list: `px-[44px]` + `max-w-[740px]` (`ProjectMilestonesOverview`). */
export const MilestoneGroup = {
  render: () => <MilestoneSectionStory />,
}
