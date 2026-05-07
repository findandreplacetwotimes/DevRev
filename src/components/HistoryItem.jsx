import { Icon } from "./Icon"
import { Timestamp } from "./Timestamp"

/** Figma `6003:6860` — Body Small / Chip Text Variable Semibold. */
const bodySmallPrimary = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "20px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
  fontFeatureSettings: "'lnum' 1, 'tnum' 1",
}

const ATTR_COLOR = "rgba(122, 117, 121, 0.96)"

function HistoryActorAvatar({ initial = "M" }) {
  const letter = (initial?.trim?.()?.[0] ?? "M").toUpperCase()
  return (
    <div
      className="flex size-[28px] w-[18px] shrink-0 flex-col items-center justify-center overflow-visible"
      aria-hidden
    >
      <div className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-[var(--control-bg-hover)]">
        <span
          className="text-[9.9px] capitalize text-[var(--foreground-secondary)]"
          style={{ fontFamily: bodySmallPrimary.fontFamily, fontVariationSettings: '"wght" 500' }}
        >
          {letter}
        </span>
      </div>
    </div>
  )
}

/**
 * Timestamp + stacked rows (canvas **`261:11242`** / **`6003:7587`**, Issue history **`6003:7843`**): tag **18px** → **12px** → stacked rows (**28px** each, **0** px between rows).
 */
export function HistoryTimelineGroup({ children, timestamp, showTimestamp = true, className = "" }) {
  const header =
    timestamp != null ? (
      timestamp
    ) : (
      <Timestamp datePart="today," timePart="9:15 AM" />
    )

  return (
    <div className={`flex w-full min-w-0 flex-col ${className}`.trim()}>
      {showTimestamp ? header : null}
      <div
        className={
          showTimestamp
            ? "mt-[12px] flex w-full min-w-0 flex-col gap-0"
            : "flex w-full min-w-0 flex-col gap-0"
        }
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Single activity row (`6003:7034`): actor chip, muted field name, prominent before → after.
 */
export function HistoryItem({ actorInitial = "M", attribute, fromValue, toValue, className = "" }) {
  return (
    <div
      className={`flex min-h-[28px] w-full min-w-0 flex-nowrap items-center gap-[4px] ${className}`}
      role="group"
      aria-label={`${attribute}: ${fromValue} to ${toValue}`}
    >
      <HistoryActorAvatar initial={actorInitial} />
      <span
        className="inline-flex shrink-0 items-center whitespace-nowrap text-[length:13px] leading-[20px]"
        style={{ ...bodySmallPrimary, color: ATTR_COLOR }}
      >
        {attribute}
      </span>
      <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-0">
        <span
          className="inline-flex min-w-0 items-center truncate text-[length:13px] leading-[20px]"
          style={{ ...bodySmallPrimary, color: "var(--fg-neutral-prominent)" }}
          title={fromValue}
        >
          {fromValue}
        </span>
        <span className="inline-flex shrink-0 items-center">
          <Icon name="arrowRight" className="shrink-0" />
        </span>
        <span
          className="inline-flex min-w-0 items-center truncate text-[length:13px] leading-[20px]"
          style={{ ...bodySmallPrimary, color: "var(--fg-neutral-prominent)" }}
          title={toValue}
        >
          {toValue}
        </span>
      </div>
    </div>
  )
}

/**
 * Many-line value (`6003:7125`): “Chage line” row (avatar + **4px** + type), then **12px** gap, then full-width body text (left edges align with avatar column in Figma — no quote rail).
 */
export function HistoryDetailItem({ actorInitial = "M", attribute = "Description", detail, className = "" }) {
  return (
    <div className={`flex w-full min-w-0 flex-col gap-[12px] ${className}`} role="group" aria-label={`${attribute} update`}>
      <div className="flex min-h-[28px] w-full min-w-0 shrink-0 items-center gap-[4px]" data-part="change-line">
        <HistoryActorAvatar initial={actorInitial} />
        <p className="m-0 inline-flex min-w-0 items-center text-[length:13px] leading-[20px]" style={{ ...bodySmallPrimary, color: ATTR_COLOR }}>
          {attribute}
        </p>
      </div>
      <div
        className="w-full min-w-0 text-[length:13px] leading-[20px]"
        data-part="value"
        style={{
          ...bodySmallPrimary,
          color: "var(--fg-neutral-prominent)",
          whiteSpace: "pre-wrap",
        }}
      >
        {detail}
      </div>
    </div>
  )
}

export { Timestamp } from "./Timestamp"
export { Timestamp as HistoryTimestampTag } from "./Timestamp"
