import { useState } from "react"
import { MemoryRouter } from "react-router-dom"
import { OWNERS } from "../lib/owners"
import { Breadcrumbs } from "./Breadcrumbs"
import { Control } from "./Control"
import { DueDateSelector } from "./DueDateSelector"
import { OwnerSelector } from "./OwnerSelector"
import { Page } from "./Page"
import { ProjectHealthSelector } from "./ProjectHealthSelector"
import { SprintSelected } from "./SprintSelected"
import { AppDocumentPageShell } from "./AppDocumentPageShell"

const meta = {
  title: "Components/AppDocumentPageShell",
  component: AppDocumentPageShell,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (StoryFn) => (
      <MemoryRouter initialEntries={["/"]}>
        {StoryFn()}
      </MemoryRouter>
    ),
  ],
}

export default meta

const shellBody = (
  <div className="mx-auto w-full max-w-[828px] px-[44px] pt-[60px] text-[22px] leading-[28px] font-semibold text-[var(--fg-neutral-prominent)]">
    Page body
  </div>
)

export const IssueTopbar = {
  render: () => {
    const [activeTab, setActiveTab] = useState("Overview")
    const [ownerId, setOwnerId] = useState(OWNERS[0]?.id ?? null)
    const [dueDateId, setDueDateId] = useState("today")
    const tabs = ["Overview", "Links", "Activity"]

    return (
      <div className="h-screen w-full bg-white">
        <AppDocumentPageShell
          breadcrumbs={<Breadcrumbs root="Issues" item="Issue" itemSuffix="-0001" rootHref="/issues" />}
          pagePills={
            <div className="flex items-center gap-[4px]" role="tablist" aria-label="Issue sections">
              {tabs.map((label) => (
                <Page key={label} label={label} selected={activeTab === label} onSelect={() => setActiveTab(label)} />
              ))}
            </div>
          }
          metaSlot={
            <div className="flex w-full items-center gap-[4px]">
              <OwnerSelector owners={OWNERS} selectedOwnerId={ownerId} onChange={setOwnerId} />
              <DueDateSelector value={dueDateId} onChange={setDueDateId} />
              <span className="flex-1" />
            </div>
          }
        >
          {shellBody}
        </AppDocumentPageShell>
      </div>
    )
  },
}

export const ProjectTopbar = {
  render: () => {
    const [activeTab, setActiveTab] = useState("Overview")
    const [ownerId, setOwnerId] = useState(OWNERS[0]?.id ?? null)
    const [dueDateId, setDueDateId] = useState("today")
    const [healthId, setHealthId] = useState("on-track")
    const tabs = ["Overview", "Brief", "Scope", "Links", "Activity"]

    return (
      <div className="h-screen w-full bg-white">
        <AppDocumentPageShell
          breadcrumbs={<Breadcrumbs root="Projects" item="Project" itemSuffix="-0001" rootHref="/projects" />}
          pagePills={
            <div className="flex items-center gap-[4px]" role="tablist" aria-label="Project sections">
              {tabs.map((label) => (
                <Page key={label} label={label} selected={activeTab === label} onSelect={() => setActiveTab(label)} />
              ))}
            </div>
          }
          headerAfterPagePills={<Control type="leading" label="Discuss" />}
          metaSlot={
            <div className="flex w-full items-center gap-[4px]">
              <OwnerSelector owners={OWNERS} selectedOwnerId={ownerId} onChange={setOwnerId} />
              <DueDateSelector value={dueDateId} onChange={setDueDateId} />
              <ProjectHealthSelector value={healthId} onChange={setHealthId} />
              <span className="flex-1" />
            </div>
          }
        >
          {shellBody}
        </AppDocumentPageShell>
      </div>
    )
  },
}

export const SprintsTopbar = {
  render: () => {
    const [activeFilterId, setActiveFilterId] = useState("filterB")
    const filterIds = ["filterA", "filterB"]
    const [filtersById, setFiltersById] = useState({
      filterA: { sprint: "Sprint 4", startDate: "2026-05-13" },
      filterB: { sprint: "Sprint 5", startDate: "2026-05-27" },
    })

    return (
      <div className="h-screen w-full bg-white">
        <AppDocumentPageShell
          breadcrumbs={<Breadcrumbs root="Sprints" item={null} />}
          pagePills={
            <div className="flex items-center gap-[4px]" role="tablist" aria-label="Sprint sections">
              {filterIds.map((filterId) => {
                const filter = filtersById[filterId]
                if (!filter) return null
                return activeFilterId === filterId ? (
                  <SprintSelected
                    key={filterId}
                    sprint={filter.sprint}
                    sprintOptions={["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4", "Sprint 5"]}
                    onSprintChange={(sprint) =>
                      setFiltersById((prev) => ({ ...prev, [filterId]: { ...prev[filterId], sprint } }))
                    }
                    startDate={filter.startDate}
                    onStartDateChange={(startDate) =>
                      setFiltersById((prev) => ({ ...prev, [filterId]: { ...prev[filterId], startDate } }))
                    }
                  />
                ) : (
                  <Page
                    key={filterId}
                    label={filter.sprint}
                    selected={false}
                    onSelect={() => setActiveFilterId(filterId)}
                  />
                )
              })}
            </div>
          }
        >
          {shellBody}
        </AppDocumentPageShell>
      </div>
    )
  },
}
