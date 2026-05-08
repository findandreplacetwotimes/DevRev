import { useEffect, useMemo, useState } from "react"
import { Navigate, useOutletContext, useParams } from "react-router-dom"
import { useIssues } from "../context/IssuesContext"
import { EMPTY_PROJECT_TITLE_PLACEHOLDER, projectBreadcrumbProjectSuffix } from "../lib/projectsApi"
import { dueDateIdFromDate, parseDateInput } from "../lib/dueDates"
import { ENABLE_AI_SLASH_COMMAND_SIGNAL, ENABLE_LOCAL_SLASH_DATE_COMMAND } from "../lib/slashCommandConfig"
import { isDueDateSlashCommand, resolveDueDateIdFromCommand } from "../lib/slashDateCommand"
import { OWNERS } from "../lib/owners"
import { BUILD_PAGE_TAB_IDS } from "../lib/topbarTabs"
import { AppDocumentPageShell } from "./AppDocumentPageShell"
import { Control } from "./Control"
import { Breadcrumbs } from "./Breadcrumbs"
import { DueDateSelector } from "./DueDateSelector"
import { ProjectHealthSelector } from "./ProjectHealthSelector"
import { OwnerSelector } from "./OwnerSelector"
import { Page } from "./Page"
import { TabPageTitle } from "./TabPageTitle"
import { TextEdit } from "./TextEdit"
import { TextEditTitle } from "./TextEditTitle"
import { ChatToggleIcon } from "./ChatToggleIcon"
import { DocumentHistoryPlaceholder } from "./DocumentHistoryPlaceholder"
import { ProjectMilestonesOverview } from "./ProjectMilestonesOverview"

export function ProjectPage() {
  const { projectId: projectIdParam } = useParams()
  const { toggleProjectChat, chatPanelOpen } = useOutletContext() ?? {}
  const { projects, issues, patchProject, patchIssue } = useIssues()
  const [activeTab, setActiveTab] = useState("Overview")

  const canonicalId = useMemo(() => {
    const raw = projectIdParam != null ? decodeURIComponent(projectIdParam).trim() : ""
    const m = /^Project-(\d+)$/i.exec(raw)
    return m ? `Project-${m[1]}` : raw || ""
  }, [projectIdParam])

  const project = useMemo(
    () => projects?.find((row) => row.id === canonicalId) ?? null,
    [projects, canonicalId]
  )

  useEffect(() => {
    setActiveTab("Overview")
  }, [canonicalId])

  if (projects === null) {
    return (
      <section className="flex h-full min-h-0 w-full flex-col rounded-[2px] bg-white" aria-busy="true">
        <div className="flex flex-1 items-center justify-center p-[40px] text-[13px] text-[#939393]">
          Loading project…
        </div>
      </section>
    )
  }

  if (!project) {
    return <Navigate to="/projects" replace />
  }

  const titleId = `project-title-${project.id}`
  const trimmedTitle = project.title.trim()
  const titleValue = trimmedTitle.length ? project.title : ""
  const titlePlaceholderUi = trimmedTitle.length ? "Title" : EMPTY_PROJECT_TITLE_PLACEHOLDER
  const showTextEditContent = activeTab === "Overview" || activeTab === "Brief"
  const showMilestonesContent = activeTab === "Overview" || activeTab === "Scope"
  const runProjectSlashCommand = async ({ command, valueWithoutCommand }) => {
    if (!ENABLE_LOCAL_SLASH_DATE_COMMAND) return { handled: false }
    if (!isDueDateSlashCommand(command)) return { handled: false }
    const dueDateId = resolveDueDateIdFromCommand(command)
    if (dueDateId) patchProject(project.id, { dueDateId })
    return { handled: true, nextValue: valueWithoutCommand }
  }
  const runProjectAiSignal = async (signal) => {
    if (!ENABLE_AI_SLASH_COMMAND_SIGNAL) return false
    if (!signal || signal.type !== "set_due_date") return false
    const parsed = parseDateInput(signal.value)
    if (!parsed) return false
    patchProject(project.id, { dueDateId: dueDateIdFromDate(parsed) })
    return true
  }

  return (
    <AppDocumentPageShell
      role="tabpanel"
      id={`project-${project.id.replace(/[^\w.-]+/g, "-")}-panel-${activeTab}`}
      aria-labelledby={activeTab === "Overview" ? titleId : `tab-${activeTab}`}
      breadcrumbs={
        <Breadcrumbs
          root="Projects"
          rootHref="/projects"
          item="Project"
          itemSuffix={projectBreadcrumbProjectSuffix(project.id)}
        />
      }
      pagePills={
        <div className="flex flex-wrap items-center gap-[4px]" role="tablist" aria-label="Page sections">
          {BUILD_PAGE_TAB_IDS.map((label) => (
            <Page
              key={label}
              id={`tab-${label}`}
              label={label}
              selected={activeTab === label}
              onSelect={() => setActiveTab(label)}
            />
          ))}
        </div>
      }
      headerAfterPagePills={
        <Control
          type="leading"
          label="Discuss"
          leadingSlot={<ChatToggleIcon isOpen={chatPanelOpen} />}
          aria-label="Toggle project chat"
          onClick={() => toggleProjectChat?.()}
        />
      }
      metaSlot={
        <div className="flex w-full min-w-0 flex-nowrap items-center gap-1">
          <OwnerSelector
            owners={OWNERS}
            selectedOwnerId={project.ownerId}
            onChange={(ownerId) => patchProject(project.id, { ownerId })}
          />
          <DueDateSelector
            value={project.dueDateId}
            onChange={(dueDateId) => patchProject(project.id, { dueDateId })}
          />
          <ProjectHealthSelector
            value={project.healthId}
            onChange={(healthId) => patchProject(project.id, { healthId })}
          />
          <span aria-hidden className="min-w-[1px] shrink-0 flex-1" />
        </div>
      }
    >
      {/** All page body content (except top bar) sits in one centered `max-w-[828px]` container. */}
      <div className="mx-auto flex w-full min-w-0 max-w-[828px] flex-col">
        <div className="flex w-full min-w-0 flex-col">
          <div className="w-full shrink-0 px-[44px] pt-[60px]">
            <div className="w-full">
              {activeTab === "Overview" ? (
                <TextEditTitle
                  id={titleId}
                  placeholder={titlePlaceholderUi}
                  value={titleValue}
                  onChange={(next) => patchProject(project.id, { title: typeof next === "string" ? next : "" })}
                />
              ) : (
                <TabPageTitle>{activeTab}</TabPageTitle>
              )}
            </div>
          </div>

          {showTextEditContent && (
            <div className="w-full shrink-0 px-[44px]">
              <div className="h-[24px] w-full" />
              <div className="w-full">
                <TextEdit
                  value={project.description}
                  onChange={(description) => patchProject(project.id, { description })}
                  onSlashCommand={runProjectSlashCommand}
                  onAiCommandSignal={runProjectAiSignal}
                />
              </div>
            </div>
          )}

          {showMilestonesContent && (
            <>
              <div className="w-full shrink-0 px-[44px]">
                <div className="h-[24px] w-full" />
              </div>
              {(project.milestones ?? []).length > 0 ? (
                <div className="mt-[24px] w-full min-w-0">
                  <ProjectMilestonesOverview
                    project={project}
                    issues={issues ?? []}
                    patchProject={patchProject}
                    patchIssue={patchIssue}
                  />
                </div>
              ) : null}
            </>
          )}

          {activeTab === "History" && (
            <div className="w-full shrink-0 px-[44px] pb-[40px] pt-[24px]">
              <div className="mx-auto w-full max-w-[740px]">
                <DocumentHistoryPlaceholder recordKind="project" recordId={project.id} />
              </div>
            </div>
          )}
        </div>
      </div>
    </AppDocumentPageShell>
  )
}
