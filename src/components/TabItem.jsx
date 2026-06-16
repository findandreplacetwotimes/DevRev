import { Icon } from "./Icon"

const labelTextStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
}

export function TabItem({
  type = "nonSelected",
  state = "rest",
  label,
  prefix = "Issue",
  suffix = "-0001",
  iconName = "team",
  leading = null,
  split = false,
  secondaryLeading = null,
  closable = true,
  onSelect,
  onClose,
}) {
  const displayLabel = label ?? `${prefix}${suffix ?? ""}`
  const isSelected = type === "selected"
  const isForcedHover = state === "hover"
  const showCloseTrailing = closable && isForcedHover

  const bgClass = isSelected
    ? isForcedHover
      ? "bg-[var(--control-bg-rest)]"
      : "bg-[var(--control-bg-rest-white)] group-hover:bg-[var(--control-bg-rest)]"
    : isForcedHover
      ? "bg-[var(--control-bg-rest-white)]"
      : "bg-[var(--control-bg-rest)] group-hover:bg-[var(--control-bg-rest-white)]"

  const borderClass = "border-r-[#ececec]"

  const leadingContent = leading ?? <Icon name={iconName} />

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelect?.()
        }
      }}
      className={`group flex h-[44px] w-[160px] shrink-0 items-center border-r-[1.5px] border-solid px-[10px] text-left ${bgClass} ${borderClass}`}
      aria-current={isSelected ? "page" : undefined}
    >
      <div className="flex min-w-0 flex-1 items-center">
        <div className="size-[28px] shrink-0">{leadingContent}</div>
        {split ? (
          <div className="size-[28px] shrink-0">{secondaryLeading}</div>
        ) : (
          <span
            className="min-w-0 flex-1 truncate text-[var(--foreground-primary)]"
            style={labelTextStyle}
            title={displayLabel}
          >
            {displayLabel}
          </span>
        )}
      </div>
      {closable ? (
        <button
          type="button"
          className={`inline-flex size-[28px] shrink-0 items-center justify-center text-[var(--foreground-primary)] transition-opacity duration-150 ${
            showCloseTrailing
              ? "opacity-100"
              : "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100"
          }`}
          onClick={(event) => {
            event.stopPropagation()
            onClose?.()
          }}
          aria-label="Close tab"
        >
          <Icon name="close" />
        </button>
      ) : null}
    </div>
  )
}
