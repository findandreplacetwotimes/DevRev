import { useEffect, useMemo, useRef, useState } from "react"
import { useIssues } from "../context/IssuesContext"
import { AppDocumentPageShell } from "./AppDocumentPageShell"
import { Breadcrumbs } from "./Breadcrumbs"
import { Page } from "./Page"
import { SprintSelected } from "./SprintSelected"
import { Table } from "./Table"
import { TabPageTitle } from "./TabPageTitle"

const SPRINT_PAGE_FILTER_IDS = ["filterA", "filterB"]
const LS_SPRINT_PAGE_FILTERS = "devrev.sprints.pageFilters.v1"
const LS_SPRINT_ACTIVE_FILTER = "devrev.sprints.activeFilter.v1"

function loadInitialFilters() {
  const fallback = {
    activeFilterId: "filterB",
    filtersById: {
      filterA: { sprintId: "Sprint 4" },
      filterB: { sprintId: "Sprint 5" },
    },
  }
  if (typeof window === "undefined") return fallback
  try {
    const rawFilters = window.localStorage.getItem(LS_SPRINT_PAGE_FILTERS)
    const rawActive = window.localStorage.getItem(LS_SPRINT_ACTIVE_FILTER)
    const parsed = rawFilters ? JSON.parse(rawFilters) : null
    const filtersById = {
      filterA: {
        sprintId:
          typeof parsed?.filterA?.sprintId === "string" && parsed.filterA.sprintId.trim().length > 0
            ? parsed.filterA.sprintId.trim()
            : fallback.filtersById.filterA.sprintId,
      },
      filterB: {
        sprintId:
          typeof parsed?.filterB?.sprintId === "string" && parsed.filterB.sprintId.trim().length > 0
            ? parsed.filterB.sprintId.trim()
            : fallback.filtersById.filterB.sprintId,
      },
    }
    const activeFilterId = rawActive === "filterA" || rawActive === "filterB" ? rawActive : fallback.activeFilterId
    return { activeFilterId, filtersById }
  } catch {
    return fallback
  }
}

export function SprintsPage() {
  const { issues, sprints, patchSprint } = useIssues()
  const persistedRef = useRef(null)
  if (persistedRef.current === null) {
    persistedRef.current = loadInitialFilters()
  }
  const persisted = persistedRef.current
  const [activeFilterId, setActiveFilterId] = useState(persisted.activeFilterId)
  const [filtersById, setFiltersById] = useState(persisted.filtersById)
  const activeFilter = filtersById[activeFilterId] ?? filtersById.filterA
  const sprintMap = useMemo(() => new Map((sprints ?? []).map((row) => [row.id, row])), [sprints])
  const sprintOptions = useMemo(() => (sprints ?? []).map((row) => row.id), [sprints])
  const activeSprint = sprintMap.get(activeFilter.sprintId) ?? null

  const filtered = useMemo(() => {
    const rows = Array.isArray(issues) ? issues : []
    const targetSprintId = activeSprint?.id ?? activeFilter.sprintId
    return rows.filter((row) => row.sprint === targetSprintId)
  }, [issues, activeSprint?.id, activeFilter.sprintId])

  useEffect(() => {
    try {
      window.localStorage.setItem(LS_SPRINT_ACTIVE_FILTER, activeFilterId)
      window.localStorage.setItem(LS_SPRINT_PAGE_FILTERS, JSON.stringify(filtersById))
    } catch {
      /* ignore storage failures */
    }
  }, [activeFilterId, filtersById])

  return (
    <AppDocumentPageShell
      aria-label="Sprints"
      singleRowTopbar
      breadcrumbs={<Breadcrumbs root="Sprints" item={null} />}
      pagePills={
        <div className="flex items-center gap-[4px]" role="tablist" aria-label="Sprints sections">
          {SPRINT_PAGE_FILTER_IDS.map((filterId) => {
            const filter = filtersById[filterId]
            if (!filter) return null
            return activeFilterId === filterId ? (
              <SprintSelected
                key={filterId}
                sprint={filter.sprintId}
                sprintOptions={sprintOptions}
                onSprintChange={(sprintId) =>
                  setFiltersById((prev) => ({
                    ...prev,
                    [filterId]: { ...prev[filterId], sprintId },
                  }))
                }
                startDate={activeSprint?.startDate}
                onStartDateChange={(startDate) => patchSprint(filter.sprintId, { startDate })}
              />
            ) : (
              <Page key={filterId} label={filter.sprintId} selected={false} onSelect={() => setActiveFilterId(filterId)} />
            )
          })}
        </div>
      }
    >
      <div className="flex w-full min-w-0 flex-col pb-0">
        <div className="w-full shrink-0 px-[44px] pt-[36px]">
          <div className="w-full">
            <TabPageTitle>{activeSprint?.id ?? activeFilter.sprintId}</TabPageTitle>
          </div>
        </div>
        <div className="mt-[24px] w-full min-w-0">
          <Table rows={filtered} issueNavState={{ sourceSprints: true }} />
        </div>
      </div>
    </AppDocumentPageShell>
  )
}
