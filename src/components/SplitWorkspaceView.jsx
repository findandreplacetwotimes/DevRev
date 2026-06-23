import { useCallback, useEffect, useRef, useState } from "react"
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
  const splitLeftWidthRef = useRef(splitLeftWidthPx)
  const onSplitLeftWidthChangeRef = useRef(onSplitLeftWidthChange)
  const [dragWidthPx, setDragWidthPx] = useState(null)

  splitLeftWidthRef.current = splitLeftWidthPx
  onSplitLeftWidthChangeRef.current = onSplitLeftWidthChange
  const displayLeftWidth = dragWidthPx ?? splitLeftWidthPx

  const applyWidth = useCallback((nextWidth, persist = false) => {
    const layoutWidth = layoutRef.current?.clientWidth ?? 0
    if (!layoutWidth) return null
    const clamped = clampSplitLeftWidth(nextWidth, layoutWidth)
    if (persist) {
      onSplitLeftWidthChangeRef.current?.(clamped)
      return clamped
    }
    setDragWidthPx(clamped)
    return clamped
  }, [])

  const handleResizeMove = useCallback((event) => {
    if (!dragStateRef.current) return
    const deltaX = event.clientX - dragStateRef.current.startX
    applyWidth(dragStateRef.current.startWidth + deltaX)
  }, [applyWidth])

  const stopResize = useCallback(
    (event) => {
      if (!dragStateRef.current) return
      const deltaX = event.clientX - dragStateRef.current.startX
      const finalWidth = applyWidth(dragStateRef.current.startWidth + deltaX, true)
      dragStateRef.current = null
      setDragWidthPx(null)
      if (finalWidth != null) splitLeftWidthRef.current = finalWidth
      event.currentTarget?.releasePointerCapture?.(event.pointerId)
    },
    [applyWidth]
  )

  const startResize = useCallback(
    (event) => {
      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      dragStateRef.current = { startX: event.clientX, startWidth: splitLeftWidthRef.current }
    },
    []
  )

  useEffect(() => {
    const updateBounds = () => {
      applyWidth(splitLeftWidthRef.current, true)
    }
    updateBounds()
    window.addEventListener("resize", updateBounds)
    return () => window.removeEventListener("resize", updateBounds)
  }, [applyWidth])

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
        style={{ width: displayLeftWidth }}
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
          onPointerMove={handleResizeMove}
          onPointerUp={stopResize}
          onPointerCancel={stopResize}
          className="absolute left-1/2 top-0 h-full w-[12px] -translate-x-1/2 cursor-col-resize bg-transparent touch-none"
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
