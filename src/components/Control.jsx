import { Icon } from "./Icon"

function mapLegacyVariant(variant) {
  if (variant === "leadingIcon" || variant === "leadingIconStroke") return "leading"
  if (variant === "textOnly") return "textOnly"
  return null
}

export function Control({
  label = "Date",
  type = "leadingTrailing",
  state = "rest",
  size = "default",
  shape = "square",
  leadingIcon = "calendar",
  trailingIcon = "calendar",
  variant,
  leadingSlot = null,
  ...rest
}) {
  const resolvedType = mapLegacyVariant(variant) || type
  const isInlineState = state === "inline"
  const isInlineType = resolvedType === "inline"
  const hasLeading = resolvedType === "leading" || resolvedType === "leadingTrailing" || resolvedType === "iconOnly" || isInlineType
  const hasLabel = resolvedType !== "iconOnly"
  const hasTrailing = resolvedType === "trailing" || resolvedType === "leadingTrailing"
  const isLarge = size === "large"
  const horizontalPadding =
    isInlineType
      ? "pr-[10px]"
      : resolvedType === "textOnly"
      ? isLarge
        ? "px-[14px]"
        : "px-[10px]"
      : resolvedType === "trailing"
        ? isLarge
          ? "pl-[14px]"
          : "pl-[10px]"
        : resolvedType === "leading"
          ? isLarge
            ? "pr-[14px]"
            : "pr-[10px]"
          : ""

  const bgClass = isInlineState
    ? "bg-transparent"
    : state === "hover"
      ? "bg-[var(--control-bg-hover)]"
      : "bg-[var(--background-primary-subtle)] hover:bg-[var(--control-bg-hover)]"
  const roundingClass = shape === "pill" ? "rounded-[28px]" : "rounded-[2px]"
  const sizeClass = isLarge
    ? resolvedType === "iconOnly"
      ? "size-[40px] justify-center"
      : "h-[40px]"
    : ""
  const transitionClass = isInlineState ? "" : "transition-colors duration-150"

  return (
    <button
      type="button"
      className={`inline-flex items-center overflow-hidden border-0 text-[var(--foreground-primary)] appearance-none ${transitionClass} ${roundingClass} ${bgClass} ${horizontalPadding} ${sizeClass}`}
      style={{
        fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: "13px",
        lineHeight: "16px",
        letterSpacing: "-0.13px",
        fontVariationSettings: '"wght" 460',
      }}
      {...rest}
    >
      {hasLeading && (leadingSlot ?? <Icon name={leadingIcon} size={isLarge ? "large" : "default"} />)}
      {hasLabel && <span className="inline-flex items-center py-[6px] whitespace-nowrap">{label}</span>}
      {hasTrailing && <Icon name={trailingIcon} size={isLarge ? "large" : "default"} />}
    </button>
  )
}
