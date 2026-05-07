import { Breadcrumbs } from "./Breadcrumbs"
import { Control } from "./Control"
import { ProjectsTable } from "./ProjectsTable"
import { TabPageTitle } from "./TabPageTitle"

export function ProjectsListPage() {
  return (
    <section className="flex h-full min-h-0 w-full min-w-0 flex-col rounded-[2px] bg-white" aria-label="Projects">
      <div className="min-h-[56px] w-full shrink-0">
        <header className="w-full p-[14px]">
          <div className="flex w-full items-start justify-between gap-[8px]">
            <div className="flex min-w-0 flex-wrap items-center gap-[4px]">
              <Breadcrumbs root="Projects" item={null} />
            </div>
            <Control type="iconOnly" leadingIcon="more" label="" />
          </div>
        </header>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-y-contain pb-0">
        <div className="w-full shrink-0 px-[44px] pt-[36px]">
          <div className="w-full">
            <TabPageTitle>Projects</TabPageTitle>
          </div>
        </div>
        <div className="mt-[24px] w-full min-w-0">
          <ProjectsTable />
        </div>
      </div>
    </section>
  )
}
