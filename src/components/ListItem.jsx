import { OWNERS } from "../lib/owners"
import { DueDateSelector } from "./DueDateSelector"
import { OwnerSelector } from "./OwnerSelector"
import { Selector } from "./Selector"

/** Aligns with backlog `Table` (`5938:39810`). */
const SELECTOR_COL_WIDTH_PX = 44

/** Figma `6004:8003` — UI/System (full ticket segment, e.g. Issue-0001). */
const TICKET_LINE_STYLE = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
}

/** Body small line — wght 460 (matches `TableCell` / ticket line). */
const TITLE_STYLE = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "15px",
  lineHeight: "20px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
  fontFeatureSettings: '"lnum" 1, "tnum" 1',
}

/**
 * Compact list analogue of table cells (Figma `6004:6983` — List Item).
 * Use `type="text"` for the issue id + title cluster, `type="more"` for the 44px actions column.
 * @param {object} props
 * @param {string} [props.className]
 * @param {"text"|"more"} [props.type]
 * @param {string} [props.ticketPrefix]
 * @param {string} [props.ticketNumber]
 * @param {string} [props.text]
 * @param {boolean} [props.titleIsPlaceholder]
 * @param {import("react").ReactNode} [props.children]
 * @param {() => void} [props.onMorePress]
 */
export function ListItem({
  className = "",
  type = "text",
  ticketPrefix = "Issue",
  ticketNumber = "0001",
  text = "",
  titleIsPlaceholder = false,
  children = null,
  onMorePress,
}) {
  if (type === "more") {
    return (
      <div
        className={`relative flex h-[48px] w-[44px] shrink-0 items-center justify-center ${className}`.trim()}
      >
        {children ?? (
          <button
            type="button"
            aria-label="Row actions"
            onClick={onMorePress}
            className="inline-flex size-[28px] shrink-0 items-center justify-center rounded-[2px] border-0 bg-transparent p-0 text-[var(--foreground-primary)] appearance-none"
          >
            <span className="relative block size-[16px]">
              <img src="/icons/more-horizontal.svg" alt="" className="absolute inset-0 block size-full" draggable={false} />
            </span>
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className={`flex min-h-[48px] w-full min-w-0 items-center ${className}`.trim()}
    >
      <div className="flex min-w-0 flex-1 items-center gap-[4px]">
        <p
          className="m-0 shrink-0 whitespace-nowrap text-[#939393]"
          style={TICKET_LINE_STYLE}
        >
          {ticketPrefix}-{ticketNumber}
        </p>
        <p
          className={`m-0 min-w-0 flex-1 truncate ${titleIsPlaceholder ? "text-[var(--control-content-secondary)]" : "text-[var(--fg-neutral-prominent)]"}`}
          style={TITLE_STYLE}
        >
          {text}
        </p>
      </div>
    </div>
  )
}

/**
 * Full-width issue row for non-table surfaces (milestones, panels). Mirrors `Table` row content.
 *
 * @param {object} props
 * @param {boolean} [props.highlighted] — forced row emphasis (`bg-[#f2f2f3]`, e.g. selection); when false, rest uses `hover:bg-[#f2f2f3]` like `Table` rows.
 * @param {boolean} [props.showControls] — owner + due date chips (Figma `gap-[4px]`).
 * @param {boolean} [props.showMore] — reserve the 44px more column.
 * @param {boolean} [props.showMoreIcon] — render the more affordance (hidden until row hover when true).
 * @param {boolean} [props.showSelectorColumn] — leading 44px column (`Selector` hidden), matches milestone/table spec `6004:6983`.
 *
 * Owner/due selectors use default chip styling (same as `Topbar` / issue meta), not table inline grey empty state.
 */
export function ListItemRow({
  className = "",
  highlighted = false,
  ticketPrefix = "Issue",
  ticketNumber = "0001",
  text = "",
  titleIsPlaceholder = false,
  showControls = true,
  showMore = false,
  showMoreIcon = true,
  showSelectorColumn = true,
  owners = OWNERS,
  ownerId,
  onOwnerChange,
  dueDateId,
  onDueDateChange,
  onRowClick,
  onMoreClick,
  children,
}) {
  const goRow = (event) => {
    const el = /** @type {HTMLElement} */ (event.target)
    if (el.closest("[data-list-item-no-nav], button, a")) return
    onRowClick?.(event)
  }

  return (
    <div
      className={`group/row flex w-full min-w-0 items-stretch overflow-visible ${
        onRowClick ? "cursor-pointer" : "cursor-default"
      } ${
        highlighted ? "bg-[var(--control-bg-rest)]" : "hover:bg-[var(--control-bg-rest)]"
      } ${className}`.trim()}
      onClick={onRowClick ? goRow : undefined}
    >
      {showSelectorColumn ? (
        <div
          className="flex h-[48px] shrink-0 items-center justify-end border-0"
          style={{ width: SELECTOR_COL_WIDTH_PX, minWidth: SELECTOR_COL_WIDTH_PX }}
          data-list-item-no-nav
          aria-hidden
        >
          <Selector variant="hidden" />
        </div>
      ) : null}
      <div className="flex min-h-0 min-w-0 flex-1 items-center">
        <ListItem
          type="text"
          ticketPrefix={ticketPrefix}
          ticketNumber={ticketNumber}
          text={text}
          titleIsPlaceholder={titleIsPlaceholder}
          className="w-full min-w-0"
        />
      </div>
      {showControls ? (
        <div
          className="flex h-[48px] shrink-0 items-center gap-[4px]"
          data-list-item-no-nav
        >
          <OwnerSelector
            owners={owners}
            selectedOwnerId={ownerId}
            onChange={onOwnerChange ?? (() => {})}
          />
          <DueDateSelector value={dueDateId} onChange={onDueDateChange ?? (() => {})} />
        </div>
      ) : null}
      {showMore ? (
        <div data-list-item-no-nav>
          {showMoreIcon ? (
            <ListItem
              type="more"
              onMorePress={onMoreClick}
              className="opacity-0 pointer-events-none transition-opacity duration-150 group-hover/row:pointer-events-auto group-hover/row:opacity-100 focus-within:pointer-events-auto focus-within:opacity-100"
            />
          ) : (
            <div className="h-[48px] w-[44px] shrink-0" aria-hidden />
          )}
        </div>
      ) : null}
      {children}
    </div>
  )
}
