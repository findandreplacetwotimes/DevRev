import { Icon } from "./Icon"

/** Figma `6070:8071` Micro control — 22px rail, Fill `#f5f5f5`. */
const RAIL_CLASS = "inline-flex h-[22px] shrink-0 items-center justify-center rounded-[2px] bg-[#f5f5f5]"

/** 9px uppercase label / tab chip (Figma nested text). */
const LABEL_STYLE = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "9px",
  lineHeight: "16px",
  letterSpacing: "2px",
  fontVariationSettings: '"wght" 560',
  fontFeatureSettings: '"lnum" 1, "tnum" 1',
  color: "rgba(48,46,47,0.94)",
}

/**
 * Compact control rail for inline metadata (thinking state, TAB badge, reply affordance).
 * @param {"iconOnly"|"textOnly"|"tab"} variant
 */
export function MicroControl({
  variant = "iconOnly",
  textLabel = "Thinking",
  tabLabel = "TAB",
  iconName = "reply",
  ariaLabel,
  className = "",
  onPress,
}) {
  const padded = variant === "textOnly" || variant === "tab"
  const rootClass = `${RAIL_CLASS} ${padded ? "px-[8px]" : "w-[22px] min-w-[22px]"} ${className}`.trim()

  if (variant === "iconOnly") {
    const content = (
      <span className="inline-flex size-[22px] items-center justify-center">
        <Icon name={iconName} size="micro" />
      </span>
    )
    if (typeof onPress === "function") {
      return (
        <button
          type="button"
          className={`${rootClass} cursor-pointer border-0 p-0 text-[var(--foreground-primary)] appearance-none transition-colors hover:brightness-[0.98]`}
          aria-label={ariaLabel ?? `Micro control: ${iconName}`}
          onClick={onPress}
        >
          {content}
        </button>
      )
    }
    return (
      <span
        className={rootClass}
        {...(ariaLabel ? { role: "img", "aria-label": ariaLabel } : { "aria-hidden": true })}
      >
        {content}
      </span>
    )
  }

  const label = variant === "tab" ? tabLabel : textLabel

  const inner = (
    <span
      className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap uppercase"
      style={LABEL_STYLE}
    >
      {label}
    </span>
  )

  if (typeof onPress === "function") {
    return (
      <button
        type="button"
        className={`${rootClass} cursor-pointer border-0 p-0 text-left appearance-none transition-colors hover:brightness-[0.98]`}
        aria-label={ariaLabel ?? label}
        onClick={onPress}
      >
        {inner}
      </button>
    )
  }

  return (
    <span className={rootClass} aria-label={ariaLabel}>
      {inner}
    </span>
  )
}
