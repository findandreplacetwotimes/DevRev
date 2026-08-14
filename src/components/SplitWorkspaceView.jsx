import { useCallback, useEffect, useRef } from "react"
import { WorkspaceWindow } from "./WorkspaceWindow"

const MIN_PANE_WIDTH = 280

export function clampSplitLeftWidth(nextWidth, layoutWidth) {
  const available = Math.max(0, layoutWidth)
  const maxLeft = Math.max(0, available - MIN_PANE_WIDTH)
  const minLeft = Math.min(MIN_PANE_WIDTH, maxLeft || MIN_PANE_WIDTH)
  return Math.min(maxLeft, Math.max(minLeft, nextWidth))
}

export function SplitWorkspaceView({
  leftRoute,
  rightRoute,
  leftNavItemId,
  rightNavItemId,
  splitLeftWidthPx,
  onSplitLeftWidthChange,
  outletContext,
  defaultTeam,
}) {
  const layoutRef = useRef(null)
  const dragStateRef = useRef(null)

  const handleResizeMove = useCallback(
    (event) => {
      if (!dragStateRef.current) return
      const deltaX = event.clientX - dragStateRef.current.startX
      const layoutWidth = layoutRef.current?.clientWidth ?? 0
      const nextWidth = dragStateRef.current.startWidth + deltaX
      onSplitLeftWidthChange?.(clampSplitLeftWidth(nextWidth, layoutWidth))
    },
    [onSplitLeftWidthChange]
  )

  const stopResize = useCallback(() => {
    dragStateRef.current = null
    window.removeEventListener("pointermove", handleResizeMove)
    window.removeEventListener("pointerup", stopResize)
    window.removeEventListener("pointercancel", stopResize)
  }, [handleResizeMove])

  const startResize = useCallback(
    (event) => {
      event.preventDefault()
      dragStateRef.current = { startX: event.clientX, startWidth: splitLeftWidthPx }
      window.addEventListener("pointermove", handleResizeMove)
      window.addEventListener("pointerup", stopResize)
      window.addEventListener("pointercancel", stopResize)
    },
    [handleResizeMove, splitLeftWidthPx, stopResize]
  )

  useEffect(() => {
    const updateBounds = () => {
      const layoutWidth = layoutRef.current?.clientWidth ?? 0
      if (!layoutWidth) return
      onSplitLeftWidthChange?.(clampSplitLeftWidth(splitLeftWidthPx, layoutWidth))
    }
    updateBounds()
    window.addEventListener("resize", updateBounds)
    return () => window.removeEventListener("resize", updateBounds)
  }, [onSplitLeftWidthChange, splitLeftWidthPx])

  useEffect(() => () => stopResize(), [stopResize])

  return (
    <div ref={layoutRef} className="flex h-full min-h-0 w-full items-stretch">
      <WorkspaceWindow
        route={leftRoute}
        selectedNavItemId={leftNavItemId}
        paneId="left"
        isMainPane
        baseOutletContext={outletContext}
        defaultTeam={defaultTeam}
        className="shrink-0"
        style={{ width: splitLeftWidthPx }}
      />
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize split panes"
        className="relative h-full w-px shrink-0 bg-[#ececec]"
      >
        <button
          type="button"
          aria-label="Resize split panes"
          onPointerDown={startResize}
          className="absolute left-1/2 top-0 h-full w-[12px] -translate-x-1/2 cursor-col-resize bg-transparent"
        />
      </div>
      <WorkspaceWindow
        route={rightRoute}
        selectedNavItemId={rightNavItemId}
        paneId="right"
        baseOutletContext={outletContext}
        defaultTeam={defaultTeam}
        className="min-w-0 flex-1"
      />
    </div>
  )
}
