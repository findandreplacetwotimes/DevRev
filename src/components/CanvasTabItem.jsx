import { Icon } from "./Icon"

/** Figma typography — UI/System (Chip Text Variable, 13 / 16, –0.13px). */
const LABEL_STYLE = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
  color: "var(--foreground-primary)",
}

const TAB_PILL_CLASS = "bg-[var(--control-bg-rest-white)]"

/**
 * Single canvas page tab — Figma `6234:11831`.
 * Selected rest `6234:11832`, selected hover `6235:11791`.
 * Non-selected rest `6235:11778`, non-selected hover `6235:11816`.
 */
export function CanvasTabItem({
  label = "Issue-0001",
  leadingIcon = "team",
  selected = false,
  closable = true,
  onClick,
  onClose,
  className = "",
  tabWidth = 180,
}) {
  return (
    <div
      role="tab"
      tabIndex={0}
      aria-selected={selected}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onClick?.()
        }
      }}
      className={`group flex h-[56px] shrink-0 cursor-default items-center bg-[var(--control-bg-rest)] px-[3px] text-left ${className}`}
      style={{ width: tabWidth }}
    >
      <span
        className={`flex h-[28px] min-w-0 flex-1 items-center rounded-[2px] ${
          selected ? TAB_PILL_CLASS : "bg-transparent group-hover:bg-[var(--control-bg-rest-white)]"
        } transition-colors duration-150`}
      >
        <span className="flex min-w-0 flex-1 items-center">
          <Icon name={leadingIcon} />
          <span className="min-w-0 truncate whitespace-nowrap" style={LABEL_STYLE}>
            {label}
          </span>
        </span>
        {closable ? (
          <button
            type="button"
            aria-label="Close tab"
            className="inline-flex size-[28px] shrink-0 cursor-default items-center justify-center border-0 bg-transparent p-0 text-[var(--foreground-primary)] opacity-0 pointer-events-none transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100"
            onClick={(event) => {
              event.stopPropagation()
              onClose?.()
            }}
          >
            <Icon name="close" />
          </button>
        ) : null}
      </span>
    </div>
  )
}
