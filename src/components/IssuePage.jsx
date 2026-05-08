import { useMemo, useRef, useState } from "react"
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom"
import { useIssues } from "../context/IssuesContext"
import { EMPTY_ISSUE_TITLE_PLACEHOLDER } from "../lib/issuesApi"
import { ticketChipFromProjectId } from "../lib/projectsApi"
import { dueDateIdFromDate, parseDateInput } from "../lib/dueDates"
import {
  ENABLE_AI_SLASH_COMMAND_SIGNAL,
  ENABLE_ISSUE_ATTRIBUTES_MODAL,
  ENABLE_LOCAL_SLASH_DATE_COMMAND,
} from "../lib/slashCommandConfig"
import { isDueDateSlashCommand, resolveDueDateIdFromCommand } from "../lib/slashDateCommand"
import { OWNERS } from "../lib/owners"
import { ISSUE_PAGE_TAB_IDS } from "../lib/topbarTabs"
import { AppDocumentPageShell } from "./AppDocumentPageShell"
import { Breadcrumbs } from "./Breadcrumbs"
import { DueDateSelector } from "./DueDateSelector"
import { OwnerSelector } from "./OwnerSelector"
import { Page } from "./Page"
import { TabPageTitle } from "./TabPageTitle"
import { TextEdit } from "./TextEdit"
import { TextEditTitle } from "./TextEditTitle"
import { DocumentHistoryPlaceholder } from "./DocumentHistoryPlaceholder"
import { ListItemRow } from "./ListItem"
import { Control } from "./Control"
import { Icon } from "./Icon"
import { IssueAttributesModal } from "./IssueAttributesModal"

export function IssuePage() {
  const { issueId: issueIdParam } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { issues, projects, patchIssue } = useIssues()
  const [activeTab, setActiveTab] = useState("Overview")
  const [isAttributesModalOpen, setIsAttributesModalOpen] = useState(false)
  const attributesTriggerRef = useRef(null)

  const canonicalId = useMemo(() => {
    const raw = issueIdParam != null ? decodeURIComponent(issueIdParam).trim() : ""
    const m = /^Issue-(\d+)$/i.exec(raw)
    return m ? `Issue-${m[1]}` : raw || ""
  }, [issueIdParam])

  const issue = useMemo(() => issues?.find((row) => row.id === canonicalId) ?? null, [issues, canonicalId])

  if (issues === null) {
    return (
      <section className="flex h-full min-h-0 w-full flex-col rounded-[2px] bg-white" aria-busy="true">
        <div className="flex flex-1 items-center justify-center p-[40px] text-[13px] text-[#939393]">
          Loading issue…
        </div>
      </section>
    )
  }

  if (!issue) {
    return <Navigate to="/issues" replace />
  }

  const titleId = `issue-title-${issue.id}`
  const trimmedTitle = issue.title.trim()
  const titleValue = trimmedTitle.length ? issue.title : ""
  const titlePlaceholderUi = trimmedTitle.length ? "Title" : EMPTY_ISSUE_TITLE_PLACEHOLDER
  const sourceProjectId =
    typeof location.state?.sourceProjectId === "string" && location.state.sourceProjectId.trim().length > 0
      ? location.state.sourceProjectId.trim()
      : null
  const sourceSprints = location.state?.sourceSprints === true
  const breadcrumbSegments = sourceProjectId
    ? [
        { label: "Projects", href: "/projects", iconName: "team", showIcon: true, showLabel: false },
        { label: sourceProjectId, href: `/projects/${encodeURIComponent(sourceProjectId)}`, showIcon: false },
        { label: issue.id, showIcon: false },
      ]
    : sourceSprints
      ? [
          { label: "Sprints", href: "/sprints", iconName: "team", showIcon: true },
          { label: issue.id, showIcon: false },
        ]
      : [
          { label: "Issues", href: "/issues", iconName: "team", showIcon: true },
          { label: issue.id, showIcon: false },
        ]

  const runIssueSlashCommand = async ({ command, valueWithoutCommand }) => {
    if (!ENABLE_LOCAL_SLASH_DATE_COMMAND) return { handled: false }
    if (!isDueDateSlashCommand(command)) return { handled: false }
    const dueDateId = resolveDueDateIdFromCommand(command)
    if (dueDateId) patchIssue(issue.id, { dueDateId })
    return { handled: true, nextValue: valueWithoutCommand }
  }

  const runIssueAiSignal = async (signal) => {
    if (!ENABLE_AI_SLASH_COMMAND_SIGNAL) return false
    if (!signal || signal.type !== "set_due_date") return false
    const parsed = parseDateInput(signal.value)
    if (!parsed) return false
    patchIssue(issue.id, { dueDateId: dueDateIdFromDate(parsed) })
    return true
  }
  const parentProject = issue.projectId ? (projects ?? []).find((p) => p.id === issue.projectId) ?? null : null
  const parentProjectChip = parentProject ? ticketChipFromProjectId(parentProject.id) : null

  return (
    <AppDocumentPageShell
      role="tabpanel"
      id={`issue-${issue.id.replace(/[^\w.-]+/g, "-")}-panel-${activeTab}`}
      aria-labelledby={activeTab === "Overview" ? titleId : `tab-${activeTab}`}
      breadcrumbs={
        <Breadcrumbs
          segments={breadcrumbSegments}
        />
      }
      pagePills={
        <div className="flex flex-wrap items-center gap-[4px]" role="tablist" aria-label="Page sections">
          {ISSUE_PAGE_TAB_IDS.map((label) => (
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
      metaSlot={
        <div className="flex w-full min-w-0 flex-nowrap items-center gap-1">
          <OwnerSelector
            owners={OWNERS}
            selectedOwnerId={issue.ownerId}
            onChange={(ownerId) => patchIssue(issue.id, { ownerId })}
          />
          <DueDateSelector value={issue.dueDateId} onChange={(dueDateId) => patchIssue(issue.id, { dueDateId })} />
          {ENABLE_ISSUE_ATTRIBUTES_MODAL ? (
            <div ref={attributesTriggerRef} className="inline-flex">
              <Control
                type="iconOnly"
                leadingSlot={<Icon name="more" />}
                onClick={() => setIsAttributesModalOpen((value) => !value)}
                aria-label="Issue attributes"
              />
            </div>
          ) : null}
          <span aria-hidden className="min-w-[1px] shrink-0 flex-1" />
        </div>
      }
    >
      <IssueAttributesModal
        open={ENABLE_ISSUE_ATTRIBUTES_MODAL && isAttributesModalOpen}
        issue={issue}
        anchorRef={attributesTriggerRef}
        onPatchIssue={patchIssue}
        onClose={() => setIsAttributesModalOpen(false)}
      />
      {/** Same body layout as `ProjectPage`: centered max width + stacked sections with px-[44px]. */}
      <div className="mx-auto flex w-full min-w-0 max-w-[828px] flex-col">
        <div className="flex w-full min-w-0 flex-col">
          <div className="w-full shrink-0 px-[44px] pt-[60px]">
            <div className="w-full">
              {activeTab === "Overview" ? (
                <TextEditTitle
                  id={titleId}
                  placeholder={titlePlaceholderUi}
                  value={titleValue}
                  onChange={(next) => patchIssue(issue.id, { title: typeof next === "string" ? next : "" })}
                />
              ) : (
                <TabPageTitle>{activeTab}</TabPageTitle>
              )}
            </div>
          </div>

          {activeTab === "Overview" && (
            <div className="w-full shrink-0 px-[44px]">
              <div className="h-[24px] w-full" />
              <div className="w-full">
                <TextEdit
                  value={issue.description}
                  onChange={(description) => patchIssue(issue.id, { description })}
                  onSlashCommand={runIssueSlashCommand}
                  onAiCommandSignal={runIssueAiSignal}
                />
              </div>
            </div>
          )}

          {activeTab === "Links" && parentProject ? (
            <>
              <div className="w-full shrink-0 px-[44px]">
                <div className="h-[24px] w-full" />
                <div className="w-full min-w-0 py-[12px]">
                  <h2
                    className="m-0 min-h-[32px] text-[22px] leading-[28px] font-semibold text-[var(--fg-neutral-prominent)]"
                    style={{
                      fontFamily: '"Chip Display Variable", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontFeatureSettings: '"lnum" 1, "tnum" 1',
                    }}
                  >
                    Parent
                  </h2>
                </div>
              </div>
              <div className="mt-[24px] w-full min-w-0">
                <div className="flex w-full min-w-0 flex-col">
                  <ListItemRow
                    ticketPrefix={parentProjectChip?.ticketPrefix ?? "Project"}
                    ticketNumber={parentProjectChip?.ticketNumber || "?"}
                    text={parentProject.title}
                    owners={OWNERS}
                    ownerId={parentProject.ownerId}
                    onOwnerChange={() => {}}
                    dueDateId={parentProject.dueDateId}
                    onDueDateChange={() => {}}
                    showMore={false}
                    onRowClick={() => navigate(`/projects/${encodeURIComponent(parentProject.id)}`)}
                  />
                </div>
              </div>
            </>
          ) : null}

          {activeTab === "History" && (
            <div className="w-full shrink-0 px-[44px] pb-[40px] pt-[24px]">
              <div className="mx-auto w-full max-w-[740px]">
                <DocumentHistoryPlaceholder recordKind="issue" recordId={issue.id} />
              </div>
            </div>
          )}
        </div>
      </div>
    </AppDocumentPageShell>
  )
}
