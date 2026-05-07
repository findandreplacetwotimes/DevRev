import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useProjects } from "../context/IssuesContext"
import { EMPTY_PROJECT_TITLE_PLACEHOLDER, ticketChipFromProjectId } from "../lib/projectsApi"
import { OWNERS } from "../lib/owners"
import { Selector } from "./Selector"
import { TableCell } from "./TableCell"
import { TableHeaderCell } from "./TableHeaderCell"

const MIN_WIDTHS = {
  task: 160,
  dueDate: 120,
  owner: 120,
}
const SELECTOR_COL_WIDTH = 44
const MORE_COL_WIDTH = 44
const FIXED_SIDE_COLUMNS_WIDTH = SELECTOR_COL_WIDTH + MORE_COL_WIDTH

const INITIAL_WIDTHS = {
  task: 560,
  dueDate: 160,
  owner: 160,
}

const COLUMN_WIDTHS_STORAGE_KEY = "devrev.projects.columnWidths"

function loadStoredColumnWidths() {
  if (typeof localStorage === "undefined") {
    return { ...INITIAL_WIDTHS }
  }
  try {
    const raw = localStorage.getItem(COLUMN_WIDTHS_STORAGE_KEY)
    if (!raw) return { ...INITIAL_WIDTHS }
    const o = JSON.parse(raw)
    const pick = (key) => {
      const v = o[key]
      if (typeof v !== "number" || !Number.isFinite(v)) return null
      return Math.max(MIN_WIDTHS[key], Math.round(v))
    }
    return {
      task: pick("task") ?? INITIAL_WIDTHS.task,
      dueDate: pick("dueDate") ?? INITIAL_WIDTHS.dueDate,
      owner: pick("owner") ?? INITIAL_WIDTHS.owner,
    }
  } catch {
    return { ...INITIAL_WIDTHS }
  }
}

function persistColumnWidths(widths) {
  try {
    localStorage.setItem(
      COLUMN_WIDTHS_STORAGE_KEY,
      JSON.stringify({
        task: widths.task,
        dueDate: widths.dueDate,
        owner: widths.owner,
      })
    )
  } catch {
    /* quota / private mode */
  }
}

function fitColumnWidths(widths, containerInnerWidth) {
  const out = {
    task: widths.task,
    dueDate: widths.dueDate,
    owner: widths.owner,
  }
  const minSum = MIN_WIDTHS.task + MIN_WIDTHS.dueDate + MIN_WIDTHS.owner
  const availableWidth = Math.max(0, containerInnerWidth - FIXED_SIDE_COLUMNS_WIDTH)

  if (!containerInnerWidth || containerInnerWidth <= 0) {
    return out
  }

  if (availableWidth < minSum) {
    return {
      task: MIN_WIDTHS.task,
      dueDate: MIN_WIDTHS.dueDate,
      owner: MIN_WIDTHS.owner,
    }
  }

  const total = out.task + out.dueDate + out.owner
  if (total < availableWidth) {
    out.task += availableWidth - total
    return out
  }

  let excess = total - availableWidth

  let take = Math.min(excess, Math.max(0, out.task - MIN_WIDTHS.task))
  out.task -= take
  excess -= take

  take = Math.min(excess, Math.max(0, out.dueDate - MIN_WIDTHS.dueDate))
  out.dueDate -= take
  excess -= take

  take = Math.min(excess, Math.max(0, out.owner - MIN_WIDTHS.owner))
  out.owner -= take

  return out
}

export function ProjectsTable({ className = "" }) {
  const navigate = useNavigate()
  const { projects, patchProject } = useProjects()
  const [columnWidths, setColumnWidths] = useState(loadStoredColumnWidths)
  const columnWidthsRef = useRef(columnWidths)
  columnWidthsRef.current = columnWidths
  const [hoveredHeader, setHoveredHeader] = useState(null)
  const [hoveredRowId, setHoveredRowId] = useState(null)
  const [selectedIds, setSelectedIds] = useState(() => new Set())

  const dragStateRef = useRef(null)
  const tableRef = useRef(null)
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)

  const hasAnyRowSelected = selectedIds.size > 0

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el || typeof ResizeObserver === "undefined") return undefined
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width ?? 0
      setContainerWidth(w)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const displayWidths = useMemo(
    () => fitColumnWidths(columnWidths, containerWidth),
    [columnWidths, containerWidth]
  )

  const minTableDisplay = MIN_WIDTHS.task + MIN_WIDTHS.dueDate + MIN_WIDTHS.owner + FIXED_SIDE_COLUMNS_WIDTH
  const needsHorizontalOverflow = Boolean(containerWidth > 0 && containerWidth < minTableDisplay)

  const projectRows = projects ?? []

  const stopResize = () => {
    dragStateRef.current = null
    window.removeEventListener("pointermove", handleResizeMove)
    window.removeEventListener("pointerup", stopResize)
    document.body.style.cursor = ""
    document.body.style.userSelect = ""
    window.setTimeout(() => {
      persistColumnWidths(columnWidthsRef.current)
    }, 0)
  }

  function handleResizeMove(event) {
    if (!dragStateRef.current) return
    const { leftColumnId, rightColumnId, startX, startLeftWidth, startRightWidth } = dragStateRef.current
    const deltaX = Math.round(event.clientX - startX)
    const minLeft = MIN_WIDTHS[leftColumnId] ?? 0
    const minRight = MIN_WIDTHS[rightColumnId] ?? 0
    const minDelta = minLeft - startLeftWidth
    const maxDelta = startRightWidth - minRight
    let d = deltaX
    if (minDelta <= maxDelta) d = Math.max(minDelta, Math.min(maxDelta, d))
    else d = 0
    setColumnWidths((prev) => ({
      ...prev,
      [leftColumnId]: startLeftWidth + d,
      [rightColumnId]: startRightWidth - d,
    }))
  }

  const startResize = (leftColumnId, rightColumnId) => (event) => {
    event.preventDefault()
    dragStateRef.current = {
      leftColumnId,
      rightColumnId,
      startX: event.clientX,
      startLeftWidth: columnWidths[leftColumnId],
      startRightWidth: columnWidths[rightColumnId],
    }
    window.addEventListener("pointermove", handleResizeMove)
    window.addEventListener("pointerup", stopResize)
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
  }

  const toggleRowSelected = (rowId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(rowId)) next.delete(rowId)
      else next.add(rowId)
      return next
    })
  }

  const toggleAllRowsSelected = () => {
    if (!projectRows.length) return
    setSelectedIds((prev) => {
      if (prev.size === projectRows.length) return new Set()
      return new Set(projectRows.map((project) => project.id))
    })
  }

  useEffect(() => () => stopResize(), [])

  const allRowsSelected = projectRows.length > 0 && selectedIds.size === projectRows.length
  const showHeaderSelect = hasAnyRowSelected

  const ownerColStyle = {
    width: displayWidths.owner,
    minWidth: MIN_WIDTHS.owner,
  }

  return (
    <section
      ref={containerRef}
      className={`w-full min-w-0 bg-white ${needsHorizontalOverflow ? "overflow-x-auto" : "overflow-x-hidden"} ${className}`}
    >
      {projects === null ? (
        <p className="border-b border-[#f2f2f3] px-[12px] py-[16px] text-[13px] text-[#939393]">Loading projects…</p>
      ) : null}
      <div ref={tableRef} className="w-full max-w-full">
        <div className="flex w-full max-w-full border-b border-[#f2f2f3]">
          <div className="shrink-0" style={{ width: SELECTOR_COL_WIDTH, minWidth: SELECTOR_COL_WIDTH }}>
            <div className="flex h-[32px] items-center justify-end py-[8px]">
              {showHeaderSelect ? (
                <Selector
                  variant={allRowsSelected ? "selected" : "notSelected"}
                  interactive
                  onPress={toggleAllRowsSelected}
                />
              ) : (
                <span className="size-[28px] shrink-0" aria-hidden />
              )}
            </div>
          </div>
          <div
            className="min-w-0 shrink-0 overflow-visible"
            style={{ width: displayWidths.task, minWidth: MIN_WIDTHS.task }}
            onMouseEnter={() => setHoveredHeader("task")}
            onMouseLeave={() => setHoveredHeader((value) => (value === "task" ? null : value))}
          >
            <TableHeaderCell
              label="Name"
              type="text"
              state={hoveredHeader === "task" ? "hover" : "rest"}
              showResizeHandle
              onResizePointerDown={startResize("task", "dueDate")}
            />
          </div>
          <div
            className="shrink-0"
            style={{ width: displayWidths.dueDate, minWidth: MIN_WIDTHS.dueDate }}
            onMouseEnter={() => setHoveredHeader("dueDate")}
            onMouseLeave={() => setHoveredHeader((value) => (value === "dueDate" ? null : value))}
          >
            <TableHeaderCell
              label="Due date"
              type="control"
              state={hoveredHeader === "dueDate" ? "hover" : "rest"}
              showResizeHandle={false}
            />
          </div>
          <div
            className="shrink-0 overflow-visible"
            style={ownerColStyle}
            onMouseEnter={() => setHoveredHeader("owner")}
            onMouseLeave={() => setHoveredHeader((value) => (value === "owner" ? null : value))}
          >
            <TableHeaderCell
              label="Owner"
              type="control"
              state={hoveredHeader === "owner" ? "hover" : "rest"}
              showResizeHandle
              resizePlacement="leading"
              onResizePointerDown={startResize("dueDate", "owner")}
            />
          </div>
          <div className="shrink-0" style={{ width: MORE_COL_WIDTH, minWidth: MORE_COL_WIDTH }}>
            <div className="h-[32px] w-full" />
          </div>
        </div>

        {projectRows.map((project) => {
          const chip = ticketChipFromProjectId(project.id)
          const trimmedTitle = typeof project.title === "string" ? project.title.trim() : ""
          const displayTitle = trimmedTitle.length ? trimmedTitle : EMPTY_PROJECT_TITLE_PLACEHOLDER
          const isRowHovered = hoveredRowId === project.id
          const isRowChecked = selectedIds.has(project.id)
          const showSelectControl = hasAnyRowSelected || isRowHovered
          const goToProject = (event) => {
            const el = /** @type {HTMLElement} */ (event.target)
            if (el.closest("[data-project-row-no-nav], button, a")) return
            if (event.shiftKey) {
              toggleRowSelected(project.id)
              return
            }
            navigate(`/projects/${encodeURIComponent(project.id)}`)
          }

          return (
            <div
              key={project.id}
              role="row"
              className={`group/row flex w-full max-w-full cursor-pointer items-stretch overflow-visible ${isRowHovered || isRowChecked ? "bg-[#f2f2f3]" : ""}`}
              onMouseEnter={() => setHoveredRowId(project.id)}
              onMouseLeave={() => setHoveredRowId((current) => (current === project.id ? null : current))}
              onClick={goToProject}
            >
              <div
                className="shrink-0"
                style={{ width: SELECTOR_COL_WIDTH, minWidth: SELECTOR_COL_WIDTH }}
                data-project-row-no-nav
              >
                <div className="flex h-[48px] items-center justify-end border-b border-[#f2f2f3] py-[8px]">
                  <Selector
                    variant={isRowChecked ? "selected" : showSelectControl ? "notSelected" : "hidden"}
                    interactive={Boolean(showSelectControl || isRowChecked || hasAnyRowSelected)}
                    onPress={() => toggleRowSelected(project.id)}
                  />
                </div>
              </div>
              <div
                className="min-w-0 shrink-0 overflow-visible"
                style={{ width: displayWidths.task, minWidth: MIN_WIDTHS.task }}
              >
                <TableCell
                  type="text"
                  ticketPrefix={chip.ticketPrefix}
                  ticketNumber={chip.ticketNumber || "?"}
                  text={displayTitle}
                  titleIsPlaceholder={trimmedTitle.length === 0}
                  showSelectionControl={showSelectControl}
                  rowSelected={isRowChecked}
                  onToggleRowSelect={() => toggleRowSelected(project.id)}
                  showSelector={false}
                />
              </div>
              <div
                className="shrink-0 overflow-visible"
                style={{ width: displayWidths.dueDate, minWidth: MIN_WIDTHS.dueDate }}
                data-project-row-no-nav
              >
                <TableCell
                  type="control"
                  selectorType="date"
                  dueDateId={project.dueDateId}
                  onDueDateChange={(dueDateId) => patchProject(project.id, { dueDateId })}
                  tableEmptyGreyLabels
                />
              </div>
              <div className="shrink-0 overflow-visible" style={ownerColStyle} data-project-row-no-nav>
                <TableCell
                  type="control"
                  selectorType="owner"
                  owners={OWNERS}
                  ownerId={project.ownerId}
                  onOwnerChange={(ownerId) => patchProject(project.id, { ownerId })}
                  rowSelected={isRowChecked}
                  tableEmptyGreyLabels
                />
              </div>
              <div
                className="shrink-0"
                style={{ width: MORE_COL_WIDTH, minWidth: MORE_COL_WIDTH }}
                data-project-row-no-nav
              >
                <div className="flex h-[48px] items-center border-b border-[#f2f2f3] py-[8px]">
                  {isRowHovered ? (
                    <button
                      type="button"
                      aria-label="Row actions"
                      className="inline-flex size-[28px] shrink-0 items-center justify-center rounded-[2px] border-0 bg-transparent p-0 text-[var(--foreground-primary)] appearance-none"
                    >
                      <span className="inline-flex size-[28px] items-center justify-center">
                        <span className="relative block size-[16px]">
                          <img src="/icons/more-horizontal.svg" alt="" className="absolute inset-0 block size-full" draggable={false} />
                        </span>
                      </span>
                    </button>
                  ) : (
                    <span className="size-[28px] shrink-0" aria-hidden />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
