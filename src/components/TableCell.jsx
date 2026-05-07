import { OWNERS } from "../lib/owners"
import { DueDateSelector } from "./DueDateSelector"
import { OwnerSelector } from "./OwnerSelector"
import { Selector } from "./Selector"

/** Figma `5926:40062` — UI/System (ticket prefix segment, e.g. Issue / prefix code). */
const TICKET_PREFIX_STYLE = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
}

/** Typography/Numerical: `-2343` */
const TICKET_NUM_STYLE = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
}

const BODY_STYLE = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "15px",
  lineHeight: "20px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
}

const BODY_SMALL_STYLE = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "20px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
}

export function TableCell({
  className = "",
  type = "text",
  ticketPrefix = "BLD",
  ticketNumber = "2343",
  text = "Build core flow for feature",
  /** Empty title renders `text` with muted styling (“No title”). */
  titleIsPlaceholder = false,
  selectorType = "owner",
  owners = OWNERS,
  ownerId,
  onOwnerChange,
  dueDateId,
  onDueDateChange,
  showSelectionControl = false,
  rowSelected = false,
  onToggleRowSelect,
  /** Keep false when selector is rendered in a dedicated table column. */
  showSelector = true,
  /** Backlog table inline empty UX (Figma `5926:40295`). */
  tableEmptyGreyLabels = false,
  /** Team table variants (`5926:40062`) */
  teamName = "Manasa Lingamallu",
  teamInitial = "M",
  smallText = "product.manager@devrev.ai",
}) {
  if (type === "smallText") {
    return (
      <div className={`flex h-[48px] w-full min-w-0 items-center overflow-visible border-b border-[#f2f2f3] py-[8px] ${className}`}>
        <div className="flex min-w-0 items-center">
          <p className="m-0 min-w-0 truncate text-[var(--fg-neutral-prominent)]" style={BODY_SMALL_STYLE}>
            {smallText}
          </p>
        </div>
      </div>
    )
  }

  if (type === "team") {
    return (
      <div className={`flex h-[48px] w-full min-w-0 items-center overflow-visible border-b border-[#f2f2f3] py-[8px] ${className}`}>
        <span className="inline-flex size-[28px] shrink-0 items-center justify-center">
          <span className="relative inline-flex size-[18px] items-center justify-center rounded-[999px] bg-[var(--control-bg-hover)]">
            <span className="text-[9.9px] text-[var(--foreground-secondary)]">{teamInitial}</span>
          </span>
        </span>
        <div className="flex min-w-0 items-center">
          <p className="m-0 min-w-0 truncate text-[var(--fg-neutral-prominent)]" style={BODY_STYLE}>
            {teamName}
          </p>
        </div>
      </div>
    )
  }

  if (type === "control") {
    const resolvedDueDateId = dueDateId === undefined || dueDateId === null ? null : dueDateId
    const resolvedOwnerId = ownerId === undefined || ownerId === null ? null : ownerId

    if (selectorType === "date") {
      return (
        <div className={`flex min-h-[48px] w-full min-w-0 items-center overflow-visible border-b border-[#f2f2f3] p-0 ${className}`}>
          <DueDateSelector
            value={resolvedDueDateId}
            onChange={onDueDateChange ?? (() => {})}
            appearance="inline"
            tableEmptyGreyLabels={tableEmptyGreyLabels}
          />
        </div>
      )
    }

    return (
      <div
        className={`flex min-h-[48px] w-full min-w-0 items-stretch gap-0 overflow-visible border-b border-[#f2f2f3] p-0 ${className}`}
      >
        <div className="flex min-h-0 min-w-0 flex-1 items-center overflow-visible pl-0">
          <OwnerSelector
            owners={owners}
            selectedOwnerId={resolvedOwnerId}
            onChange={onOwnerChange ?? (() => {})}
            appearance="inline"
            rowSelected={rowSelected}
            tableEmptyGreyLabels={tableEmptyGreyLabels}
          />
        </div>
      </div>
    )
  }

  const selectionVariant =
    rowSelected === true ? "selected" : showSelectionControl === true ? "notSelected" : "hidden"

  return (
    <div
      className={`flex h-[48px] w-full min-w-0 items-center gap-1 overflow-visible border-b border-[#f2f2f3] ${showSelector ? "pl-0 pr-[20px]" : "px-0"} ${className}`}
    >
      {showSelector ? (
        <Selector
          variant={selectionVariant}
          interactive={Boolean(showSelectionControl)}
          onPress={onToggleRowSelect}
        />
      ) : null}
      <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-visible">
        <span className="inline-flex shrink-0 items-center whitespace-nowrap text-[var(--control-content-secondary)]">
          <span style={TICKET_PREFIX_STYLE}>{ticketPrefix}</span>
          <span style={TICKET_NUM_STYLE}>-{ticketNumber}</span>
        </span>
        <p
          className={`m-0 min-w-0 flex-1 truncate ${titleIsPlaceholder ? "text-[var(--control-content-secondary)]" : "text-[var(--fg-neutral-prominent)]"}`}
          style={BODY_STYLE}
        >
          {text}
        </p>
      </div>
    </div>
  )
}
