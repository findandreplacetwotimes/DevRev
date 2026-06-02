import { createPortal } from "react-dom"
import { useEffect, useRef, useState } from "react"
import { useAnchoredPopoverPosition } from "../hooks/useAnchoredPopoverPosition"
import { Icon } from "./Icon"
import { MicroControl } from "./MicroControl"

/** Figma `6003:6860` — Body Small / Chip Text Variable Semibold. */
const bodySmallPrimary = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "20px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
  fontFeatureSettings: "'lnum' 1, 'tnum' 1",
}

/** Figma `6070:8082` — menu row (13px / 16px, Medium). */
const MENU_ROW_STYLE = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 520',
  fontFeatureSettings: "'lnum' 1, 'tnum' 1",
}

const ATTR_COLOR = "rgba(122, 117, 121, 0.96)"
const FG_MENU = "rgba(0, 0, 0, 0.9)"

const MODAL_SHADOW =
  "0px 6px 13px rgba(0,0,0,0.10), 0px 23px 23px rgba(0,0,0,0.09), 0px 52px 31px rgba(0,0,0,0.05), 0px 92px 37px rgba(0,0,0,0.01), 0px 144px 40px rgba(0,0,0,0)"

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

/** Figma `6070:8077` analogue — Reverse / Explain are wired as placeholders (no functionality yet) and Delete fires `onDelete`. */
const ROW_MENU_ACTIONS = [
  { id: "reverse", label: "Reverse" },
  { id: "explain", label: "Explain" },
  { id: "delete", label: "Delete" },
]

/**
 * Hover-revealed `more` `MicroControl` + portal menu (`Reverse`, `Explain`, `Delete`).
 * Visible when the parent row (which must set `className="group"`) is hovered, when the
 * trigger has keyboard focus, or while the menu is open — stays in the layout otherwise
 * (transparent) to avoid hover-induced layout shift.
 */
function HistoryRowMoreMenu({ onDelete, label = "More" }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const popoverPos = useAnchoredPopoverPosition(triggerRef, menuOpen, 2)

  useEffect(() => {
    if (!menuOpen) return undefined
    const onDocPointerDown = (event) => {
      const t = event.target
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setMenuOpen(false)
    }
    const onKey = (event) => {
      if (event.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("pointerdown", onDocPointerDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onDocPointerDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [menuOpen])

  const visibilityClass = menuOpen
    ? ""
    : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"

  const menuPortal =
    menuOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label="Row actions"
            className="fixed z-[300] inline-flex min-w-[160px] flex-col gap-[4px] rounded-[2px] bg-white p-[6px]"
            style={{
              boxShadow: MODAL_SHADOW,
              top: `${popoverPos.top}px`,
              left: `${popoverPos.left}px`,
            }}
          >
            {ROW_MENU_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                role="menuitem"
                className="flex h-[28px] w-full items-center rounded-[2px] border-0 bg-transparent px-[10px] text-left outline-none transition-colors duration-150 hover:bg-[var(--background-primary-subtle)] focus-visible:bg-[var(--background-primary-subtle)]"
                style={{ ...MENU_ROW_STYLE, color: FG_MENU }}
                onClick={() => {
                  setMenuOpen(false)
                  if (action.id === "delete") onDelete?.()
                }}
              >
                <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{action.label}</span>
              </button>
            ))}
          </div>,
          document.body
        )
      : null

  return (
    <>
      <MicroControl
        ref={triggerRef}
        type="control"
        layout="iconOnly"
        iconName="more"
        ariaLabel={label}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        className={visibilityClass}
        onPress={() => setMenuOpen((o) => !o)}
      />
      {menuPortal}
    </>
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
      <MicroControl type="tag" layout="timestamp" datePart="today," timePart="9:15 AM" />
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
 * When `onDelete` is provided, a hover-revealed `more` micro control appears at the end of
 * the row (Figma `6085:8279` `Hover` variant) and opens a one-item `Delete` menu.
 */
export function HistoryItem({
  actorInitial = "M",
  attribute,
  fromValue,
  toValue,
  onDelete,
  className = "",
}) {
  return (
    <div
      className={`group flex min-h-[28px] w-full min-w-0 flex-nowrap items-center gap-[4px] ${className}`}
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
      <div className="flex min-w-0 shrink flex-nowrap items-center gap-0">
        <span
          className="inline-flex min-w-0 items-center truncate text-[length:13px] leading-[20px]"
          style={{ ...bodySmallPrimary, color: "var(--fg-neutral-prominent)" }}
          title={fromValue}
        >
          {fromValue}
        </span>
        <span className="inline-flex shrink-0 items-center">
          <Icon name="arrowRightSmall" className="shrink-0" />
        </span>
        <span
          className="inline-flex min-w-0 items-center truncate text-[length:13px] leading-[20px]"
          style={{ ...bodySmallPrimary, color: "var(--fg-neutral-prominent)" }}
          title={toValue}
        >
          {toValue}
        </span>
      </div>
      {onDelete ? <HistoryRowMoreMenu onDelete={onDelete} label={`More actions for ${attribute}`} /> : null}
    </div>
  )
}

/**
 * Many-line value (`6003:7125`): “Chage line” row (avatar + **4px** + type), then **12px** gap, then full-width body text (left edges align with avatar column in Figma — no quote rail).
 * `onDelete` mirrors `HistoryItem` — the `more` micro control sits on the change-line
 * row (`6085:8421` `Hover post`).
 *
 * Optional `fromValue` / `toValue` render the inline attribute-change line ("Owner Manasa → Greg")
 * that Figma calls "Update + event" (`6086:10693`).
 */
export function HistoryDetailItem({
  actorInitial = "M",
  attribute = "Description",
  fromValue,
  toValue,
  detail,
  onDelete,
  className = "",
}) {
  const hasChangeValues = fromValue !== undefined || toValue !== undefined
  return (
    <div
      className={`group flex w-full min-w-0 flex-col gap-[12px] ${className}`}
      role="group"
      aria-label={hasChangeValues ? `${attribute}: ${fromValue} to ${toValue} — update` : `${attribute} update`}
    >
      <div className="flex min-h-[28px] w-fit min-w-0 max-w-full shrink-0 items-center gap-[4px]" data-part="change-line">
        <HistoryActorAvatar initial={actorInitial} />
        <p className="m-0 inline-flex min-w-0 items-center text-[length:13px] leading-[20px]" style={{ ...bodySmallPrimary, color: ATTR_COLOR }}>
          {attribute}
        </p>
        {hasChangeValues ? (
          <div className="flex min-w-0 shrink flex-nowrap items-center gap-0">
            <span
              className="inline-flex min-w-0 items-center truncate text-[length:13px] leading-[20px]"
              style={{ ...bodySmallPrimary, color: "var(--fg-neutral-prominent)" }}
              title={fromValue}
            >
              {fromValue}
            </span>
            <span className="inline-flex shrink-0 items-center">
              <Icon name="arrowRightSmall" className="shrink-0" />
            </span>
            <span
              className="inline-flex min-w-0 items-center truncate text-[length:13px] leading-[20px]"
              style={{ ...bodySmallPrimary, color: "var(--fg-neutral-prominent)" }}
              title={toValue}
            >
              {toValue}
            </span>
          </div>
        ) : null}
        {onDelete ? (
          <HistoryRowMoreMenu onDelete={onDelete} label={`More actions for ${attribute}`} />
        ) : null}
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

/**
 * "N events hidden. Show" collapse row (Figma `6003:7035` — `Event/Collapsed`).
 *
 * Rest (`6086:10599`): only `"N events hidden."` is visible.
 * Hover (`6088:9086`): the trailing `Show` token fades in. Keyboard focus on the trigger also
 * reveals it. The token is kept in the DOM at `opacity-0` so the row never shifts width when
 * the mouse enters.
 */
export function HistoryEventsCollapsed({ count, onExpand, label = "events" }) {
  const safe = Number.isFinite(count) ? count : 0
  return (
    <div className="group flex min-h-[28px] w-full min-w-0 items-center">
      <p
        className="m-0 inline-flex min-w-0 items-center text-[length:13px] leading-[20px]"
        style={{ ...bodySmallPrimary, color: ATTR_COLOR }}
      >
        <span className="whitespace-nowrap">{`${safe} ${label} hidden.\u00A0`}</span>
        <button
          type="button"
          onClick={onExpand}
          aria-label={`Show ${safe} hidden ${label}`}
          className="border-0 bg-transparent p-0 opacity-0 outline-none transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:underline"
          style={{ ...bodySmallPrimary, color: "#211e20" }}
        >
          Show
        </button>
      </p>
    </div>
  )
}
