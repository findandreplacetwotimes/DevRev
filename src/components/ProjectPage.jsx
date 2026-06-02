import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import {
  Navigate,
  useLocation,
  useOutletContext,
  useParams,
  useSearchParams,
} from "react-router-dom"
import { useIssues } from "../context/IssuesContext"
import { EMPTY_PROJECT_TITLE_PLACEHOLDER, projectBreadcrumbProjectSuffix } from "../lib/projectsApi"
import { dueDateIdFromDate, parseDateInput } from "../lib/dueDates"
import { ENABLE_AI_SLASH_COMMAND_SIGNAL, ENABLE_LOCAL_SLASH_DATE_COMMAND } from "../lib/slashCommandConfig"
import { isDueDateSlashCommand, resolveDueDateIdFromCommand } from "../lib/slashDateCommand"
import { OWNERS } from "../lib/owners"
import { BUILD_PAGE_TAB_IDS } from "../lib/topbarTabs"
import { AppDocumentPageShell } from "./AppDocumentPageShell"
import { Breadcrumbs } from "./Breadcrumbs"
import { Control } from "./Control"
import { Icon } from "./Icon"
import { DueDateSelector } from "./DueDateSelector"
import { MenuItem } from "./MenuItem"
import { ProjectHealthSelector } from "./ProjectHealthSelector"
import { OwnerSelector } from "./OwnerSelector"
import { Page } from "./Page"
import { TabPageTitle } from "./TabPageTitle"
import { TextEdit } from "./TextEdit"
import { TextEditTitle } from "./TextEditTitle"
import { HistoryDetailItem, HistoryEventsCollapsed, HistoryItem, HistoryTimelineGroup } from "./HistoryItem"
import { MicroControl } from "./MicroControl"
import { deleteProjectActivity, getProjectActivities } from "../lib/projectActivityStore"
import { generateProjectActivity } from "../lib/projectEvents"
import { buildProjectActivityFeed } from "../lib/projectActivityFeed"
import { ProjectMilestonesOverview } from "./ProjectMilestonesOverview"
import { ProjectSettingsTab } from "./ProjectSettingsTab"
import { ProjectSetupBanner } from "./ProjectSetupBanner"

const modalShadow =
  "0px 6px 13px rgba(0,0,0,0.10), 0px 23px 23px rgba(0,0,0,0.09), 0px 52px 31px rgba(0,0,0,0.05), 0px 92px 37px rgba(0,0,0,0.01), 0px 144px 40px rgba(0,0,0,0)"

function ProjectMoreMenu({ onSettings }) {
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })
  const triggerRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open || !triggerRef.current) return undefined
    const compute = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      setMenuPos({
        top: Math.round(rect.bottom + 4),
        right: Math.round(window.innerWidth - rect.right),
      })
    }
    compute()
    window.addEventListener("scroll", compute, true)
    window.addEventListener("resize", compute)
    const onDocDown = (event) => {
      const t = event.target
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    const onEsc = (event) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("pointerdown", onDocDown)
    document.addEventListener("keydown", onEsc)
    return () => {
      window.removeEventListener("scroll", compute, true)
      window.removeEventListener("resize", compute)
      document.removeEventListener("pointerdown", onDocDown)
      document.removeEventListener("keydown", onEsc)
    }
  }, [open])

  const items = [
    { id: "settings", label: "Settings" },
    { id: "copy-link", label: "Copy link" },
    { id: "subscribe", label: "Subscribe" },
    { id: "delete", label: "Delete" },
  ]

  function handleItemClick(id) {
    setOpen(false)
    if (id === "settings") onSettings?.()
  }

  const menu = (
    <div
      ref={menuRef}
      className="fixed z-[210] inline-flex w-[180px] flex-col items-start gap-[2px] rounded-[4px] bg-white p-[6px]"
      style={{ boxShadow: modalShadow, top: `${menuPos.top}px`, right: `${menuPos.right}px` }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="w-full text-left"
          onClick={() => handleItemClick(item.id)}
        >
          <MenuItem type="textOnly" state="rest" label={item.label} fullWidth />
        </button>
      ))}
    </div>
  )

  return (
    <div className="relative inline-flex">
      <div ref={triggerRef}>
        <Control type="iconOnly" leadingIcon="more" label="" onClick={() => setOpen((v) => !v)} />
      </div>
      {open && typeof document !== "undefined" ? createPortal(menu, document.body) : null}
    </div>
  )
}

function persistedToActivityItem(entry) {
  return {
    id: entry.id,
    kind: "update",
    createdAt: entry.createdAt,
    actorInitial: "C",
    actorName: "Computer",
    text: entry.text,
    source: entry.source ?? "computer-chat",
  }
}

function groupKey(group) {
  if (group.kind === "range") return `range:${group.firstDayKey}:${group.lastDayKey}`
  return `day:${group.dayKey}`
}

export function ProjectPage() {
  const { projectId: projectIdParam } = useParams()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { openProjectChat } = useOutletContext() ?? {}
  const { projects, issues, patchProject, patchIssue } = useIssues()
  const [activeTab, setActiveTab] = useState("Overview")
  /** Deep-linkable full-page settings (`?settings=1`), not a pill tab. */
  const showSettings = searchParams.get("settings") === "1"
  const [showSetupBanner, setShowSetupBanner] = useState(location.state?.justCreated === true)
  const [projectActivities, setProjectActivities] = useState([])
  const [expandedGroupKeys, setExpandedGroupKeys] = useState(() => new Set())
  /** Locally-hidden synthetic activity ids (events + updates generated by the seeded feed). */
  const [hiddenSyntheticIds, setHiddenSyntheticIds] = useState(() => new Set())

  const canonicalId = useMemo(() => {
    const raw = projectIdParam != null ? decodeURIComponent(projectIdParam).trim() : ""
    const m = /^Project-(\d+)$/i.exec(raw)
    return m ? `Project-${m[1]}` : raw || ""
  }, [projectIdParam])

  const project = useMemo(
    () => projects?.find((row) => row.id === canonicalId) ?? null,
    [projects, canonicalId]
  )

  const openSettingsView = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set("settings", "1")
        return next
      },
      { replace: true }
    )
  }

  const closeSettingsView = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete("settings")
        return next
      },
      { replace: true }
    )
  }

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && BUILD_PAGE_TAB_IDS.includes(tab)) {
      setActiveTab(tab)
    } else {
      setActiveTab("Overview")
    }
  }, [canonicalId, searchParams])

  useEffect(() => {
    if (!project?.id) return undefined
    function refresh() {
      setProjectActivities(getProjectActivities(project.id))
    }
    refresh()
    const onActivity = (event) => {
      if (event.detail?.projectId === project.id) refresh()
    }
    window.addEventListener("devrev-project-activity", onActivity)
    return () => window.removeEventListener("devrev-project-activity", onActivity)
  }, [project?.id])

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

  const syntheticActivity = useMemo(
    () => (project?.id ? generateProjectActivity(project.id) : []),
    [project?.id]
  )

  const mergedActivity = useMemo(() => {
    const persisted = projectActivities.map(persistedToActivityItem)
    return [...persisted, ...syntheticActivity]
      .filter((item) => !hiddenSyntheticIds.has(item.id))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }, [projectActivities, syntheticActivity, hiddenSyntheticIds])

  const activityFeed = useMemo(() => buildProjectActivityFeed(mergedActivity), [mergedActivity])

  const toggleGroupExpanded = (key) => {
    setExpandedGroupKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  /**
   * Persisted chat updates (`source: "computer-chat"`) are removed from `localStorage` so the
   * change survives reloads. Synthetic events + updates are hidden locally — the seed function
   * stays pure, and the hidden set is forgotten on a hard refresh, which is the same behavior
   * the placeholder activity has elsewhere in the app.
   */
  const handleActivityDelete = (item) => {
    if (!item || !project?.id) return
    if (item.source === "computer-chat") {
      deleteProjectActivity(project.id, item.id)
      return
    }
    setHiddenSyntheticIds((prev) => {
      const next = new Set(prev)
      next.add(item.id)
      return next
    })
  }

  const titleId = `project-title-${project.id}`
  const trimmedTitle = project.title.trim()
  const titleValue = trimmedTitle.length ? project.title : ""
  const titlePlaceholderUi = trimmedTitle.length ? "Title" : EMPTY_PROJECT_TITLE_PLACEHOLDER
  const showTextEditContent = (activeTab === "Overview" || activeTab === "Brief") && !showSettings
  const showMilestonesContent = (activeTab === "Overview" || activeTab === "Scope") && !showSettings
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
              onSelect={() => {
                setActiveTab(label)
                setSearchParams(
                  (prev) => {
                    const next = new URLSearchParams(prev)
                    next.delete("settings")
                    if (label === "Overview") next.delete("tab")
                    else next.set("tab", label)
                    return next
                  },
                  { replace: true }
                )
              }}
            />
          ))}
        </div>
      }
      headerAfterPagePills={
        <Control
          type="leading"
          label="Discuss"
          leadingSlot={<Icon name="project" />}
          aria-label="Open project chat"
          onClick={() => openProjectChat?.()}
        />
      }
      headerTrailing={
        <ProjectMoreMenu onSettings={openSettingsView} />
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
              {showSettings ? (
                <div className="flex items-center gap-[6px]">
                  <button
                    type="button"
                    onClick={closeSettingsView}
                    className="inline-flex size-[28px] items-center justify-center rounded-[2px] border-0 bg-transparent p-0 text-[var(--foreground-primary)] hover:bg-[var(--control-bg-hover)] appearance-none"
                  >
                    <img src="/icons/breadcrumb-chevron.svg" alt="Back" className="block size-[16px] rotate-180" draggable={false} />
                  </button>
                  <TabPageTitle>Settings</TabPageTitle>
                </div>
              ) : activeTab === "Overview" ? (
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

          {activeTab === "Activity" && !showSettings && (
            <div className="w-full shrink-0 px-[44px] pb-[20px] pt-[24px]">
              <div className="w-full">
                {activityFeed.length === 0 ? (
                  <p className="m-0 text-[13px] leading-[20px] text-[var(--fg-neutral-medium)]">
                    No activity yet.
                  </p>
                ) : (
                  (() => {
                    /**
                     * Flatten the feed into "rows" so the separator pass below can treat
                     * an expanded range group's per-day children as siblings of normal day
                     * groups (with their own dividers between them).
                     *
                     * Figma `6086:10252` differentiates "Activity item" (populated block →
                     * primary tag) from "Date" (collapsed/events-only block → muted tag);
                     * tone is picked per-row.
                     */
                    const rows = activityFeed.flatMap((group) => {
                      const key = groupKey(group)
                      const expanded = expandedGroupKeys.has(key)

                      if (group.kind === "range" && expanded) {
                        return group.days.map((day) => ({
                          key: `${key}/${day.dayKey}`,
                          tone: "muted",
                          timestamp: day.timestamp,
                          updates: [],
                          events: day.events,
                          collapsedCount: 0,
                        }))
                      }

                      const tone =
                        group.kind === "range"
                          ? "muted"
                          : group.updates.length === 0
                            ? "muted"
                            : "primary"

                      const events =
                        group.kind === "range"
                          ? []
                          : group.collapseEvents && !expanded
                            ? []
                            : group.events
                      const collapsedCount =
                        group.kind === "range"
                          ? group.hiddenCount
                          : group.collapseEvents && !expanded
                            ? group.events.length
                            : 0

                      return [
                        {
                          key,
                          tone,
                          timestamp: group.timestamp,
                          updates: group.kind === "range" ? [] : group.updates,
                          events,
                          collapsedCount,
                          onExpand:
                            collapsedCount > 0 ? () => toggleGroupExpanded(key) : undefined,
                        },
                      ]
                    })

                    return (
                      <div className="flex w-full min-w-0 flex-col">
                        {rows.map((row, idx) => {
                          const isFirst = idx === 0
                          const isLast = idx === rows.length - 1
                          return (
                            <div
                              key={row.key}
                              className={`${isFirst ? "" : "pt-[30px]"} ${
                                isLast ? "" : "border-b border-[#f2f2f3] pb-[24px]"
                              }`.trim()}
                            >
                              <HistoryTimelineGroup
                                timestamp={
                                  <MicroControl
                                    type="tag"
                                    layout="timestamp"
                                    tone={row.tone}
                                    datePart={row.timestamp.datePart}
                                    timePart={row.timestamp.timePart}
                                  />
                                }
                              >
                                <div className="flex w-full min-w-0 flex-col gap-[12px]">
                                  {row.updates.length > 0 ? (
                                    <div className="flex w-full min-w-0 flex-col gap-[12px]">
                                      {row.updates.map((up) => (
                                        <HistoryDetailItem
                                          key={up.id}
                                          actorInitial={up.actorInitial}
                                          attribute={up.attribute ?? "Update"}
                                          fromValue={up.fromValue}
                                          toValue={up.toValue}
                                          detail={up.text}
                                          onDelete={() => handleActivityDelete(up)}
                                        />
                                      ))}
                                    </div>
                                  ) : null}
                                  {row.events.length > 0 || row.collapsedCount > 0 ? (
                                    <div className="flex w-full min-w-0 flex-col gap-0">
                                      {row.events.map((ev) => (
                                        <HistoryItem
                                          key={ev.id}
                                          actorInitial={ev.actorInitial}
                                          attribute={ev.attribute}
                                          fromValue={ev.fromValue}
                                          toValue={ev.toValue}
                                          onDelete={() => handleActivityDelete(ev)}
                                        />
                                      ))}
                                      {row.collapsedCount > 0 ? (
                                        <HistoryEventsCollapsed
                                          count={row.collapsedCount}
                                          onExpand={row.onExpand}
                                        />
                                      ) : null}
                                    </div>
                                  ) : null}
                                </div>
                              </HistoryTimelineGroup>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()
                )}
              </div>
            </div>
          )}

          {showSettings && (
            <ProjectSettingsTab project={project} patchProject={patchProject} />
          )}
        </div>

        {showSetupBanner && !showSettings && (
          <ProjectSetupBanner
            onGoToSettings={openSettingsView}
            onDismiss={() => setShowSetupBanner(false)}
          />
        )}
      </div>
    </AppDocumentPageShell>
  )
}
