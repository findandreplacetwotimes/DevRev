import { useEffect, useMemo, useState } from "react"
import { useIssues } from "../context/IssuesContext"
import { Breadcrumbs } from "./Breadcrumbs"
import { Control } from "./Control"
import { Page } from "./Page"
import { TabPageTitle } from "./TabPageTitle"
import { Table } from "./Table"

const LS_ISSUES_ACTIVE_SECTION = "devrev.issues.activeSection.v1"

function loadInitialIssuesSection() {
  if (typeof window === "undefined") return "issues"
  try {
    const raw = window.localStorage.getItem(LS_ISSUES_ACTIVE_SECTION)
    if (raw === "issues" || raw === "backlog") return raw
  } catch {
    /* ignore */
  }
  return "issues"
}

/** Issues backlog table (Figma issues hub). */
export function IssuesListPage() {
  const { issues } = useIssues()
  const [activePageId, setActivePageId] = useState(loadInitialIssuesSection)

  useEffect(() => {
    try {
      window.localStorage.setItem(LS_ISSUES_ACTIVE_SECTION, activePageId)
    } catch {
      /* quota / private mode */
    }
  }, [activePageId])
  const filteredRows = useMemo(() => {
    const rows = Array.isArray(issues) ? issues : []
    if (activePageId === "backlog") {
      return rows.filter((row) => !row.sprint || row.sprint === "Backlog")
    }
    return rows.filter((row) => row.sprint && row.sprint !== "Backlog")
  }, [issues, activePageId])

  return (
    <section className="flex h-full min-h-0 w-full min-w-0 flex-col rounded-[2px] bg-white" aria-label="Issues">
      <div className="min-h-[56px] w-full shrink-0">
        <header className="w-full p-[14px]">
          <div className="flex w-full items-start justify-between gap-[8px]">
            <div className="flex min-w-0 flex-wrap items-center gap-[4px]">
              <Breadcrumbs root="Issues" item={null} />
              <div className="flex flex-wrap items-center gap-[4px]" role="presentation">
                <Page label="Issues" selected={activePageId === "issues"} onSelect={() => setActivePageId("issues")} />
                <Page label="Backlog" selected={activePageId === "backlog"} onSelect={() => setActivePageId("backlog")} />
              </div>
            </div>
            <Control type="iconOnly" leadingIcon="more" label="" />
          </div>
        </header>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-y-contain pb-0">
        <div className="w-full shrink-0 px-[44px] pt-[36px]">
          <div className="w-full">
            <TabPageTitle>{activePageId === "backlog" ? "Backlog" : "Issues"}</TabPageTitle>
          </div>
        </div>
        <div className="mt-[24px] w-full min-w-0">
          <Table rows={filteredRows} />
        </div>
      </div>
    </section>
  )
}
