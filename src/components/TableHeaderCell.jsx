const LABEL_STYLE = {
  fontFamily: '"Chip Mono", "Chip Text Variable", ui-monospace, monospace',
  fontSize: "10px",
  lineHeight: "10px",
  letterSpacing: "0px",
  color: "var(--control-content-secondary)",
}

/**
 * Header framing from Figma `5926:40161` (table header variants).
 */
export function TableHeaderCell({
  label = "Label",
  type = "text",
  state = "rest",
  showResizeHandle = true,
  onResizePointerDown,
  /** `trailing` (default): grip on right edge. `leading`: grip on left (e.g. last column splitter). */
  resizePlacement = "trailing",
  leading,
  /** Separator variant: muted rule before LABEL (non-leading columns). */
  dividerBefore = false,
}) {
  const isControlType = type === "control"
  const isHover = state === "hover"
  const canResize = typeof onResizePointerDown === "function"
  const trailingResize = resizePlacement === "trailing"
  const leadingResize = resizePlacement === "leading"
  const trimmedLabel = typeof label === "string" ? label.trim() : String(label ?? "").trim()
  const hasLabel = trimmedLabel.length > 0

  const controlLayout = isControlType && hasLabel ? "gap-[6px] pl-[6px]" : ""
  const textLeadingGap =
    !isControlType && hasLabel && (leading != null || dividerBefore)
      ? "gap-1"
      : ""

  return (
    <div
      className={`relative flex h-[32px] min-w-0 items-center p-0 ${controlLayout} ${textLeadingGap}`}
    >
      {dividerBefore && hasLabel && !leading ? (
        <span aria-hidden className="h-[11px] w-[2px] shrink-0 translate-y-[0.5px] bg-[#d9d9d9]" />
      ) : null}
      {isControlType && showResizeHandle && isHover && trailingResize && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-[-1px] top-[calc(50%+0.5px)] h-[11px] w-[2px] -translate-y-1/2 bg-[#d9d9d9]"
        />
      )}
      {isControlType && showResizeHandle && isHover && leadingResize && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 top-[calc(50%+0.5px)] h-[11px] w-[2px] -translate-y-1/2 bg-[#d9d9d9]"
        />
      )}
      {leading}
      {hasLabel ? (
        <span className="min-w-0 whitespace-normal break-words uppercase" style={LABEL_STYLE}>
          {label.trim()}
        </span>
      ) : null}
      {canResize && trailingResize && (
        <button
          type="button"
          aria-label={`Resize column after ${hasLabel ? trimmedLabel : "column"}`}
          onPointerDown={onResizePointerDown}
          className="absolute right-[-6px] top-0 z-[20] h-full w-[12px] cursor-col-resize bg-transparent"
        />
      )}
      {canResize && leadingResize && (
        <button
          type="button"
          aria-label={`Resize column before ${hasLabel ? trimmedLabel : "column"}`}
          onPointerDown={onResizePointerDown}
          className="absolute left-[-6px] top-0 z-[20] h-full w-[12px] cursor-col-resize bg-transparent"
        />
      )}
    </div>
  )
}
