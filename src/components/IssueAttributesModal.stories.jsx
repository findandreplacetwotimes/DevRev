import { useRef, useState } from "react"
import { IssueAttributesModal } from "./IssueAttributesModal"

const meta = {
  title: "Components/IssueAttributesModal",
  component: IssueAttributesModal,
  parameters: {
    layout: "centered",
  },
}

export default meta

export const Default = {
  render: () => {
    const anchorRef = useRef(null)
    const [open, setOpen] = useState(false)
    const [issue, setIssue] = useState({
      id: "Issue-0001",
      priority: "P0",
      sprint: "Sprint 2",
      createdDate: "2026-04-28",
    })

    return (
      <div className="h-[420px] w-[560px] bg-white p-[24px]">
        <button
          ref={anchorRef}
          type="button"
          className="inline-flex h-[28px] items-center rounded-[2px] bg-[var(--background-primary-subtle)] px-[10px]"
          onClick={() => setOpen((prev) => !prev)}
        >
          Open attributes
        </button>
        <IssueAttributesModal
          open={open}
          issue={issue}
          anchorRef={anchorRef}
          onPatchIssue={(_id, patch) => setIssue((prev) => ({ ...prev, ...patch }))}
          onClose={() => setOpen(false)}
        />
      </div>
    )
  },
}
