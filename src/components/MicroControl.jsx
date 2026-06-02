import { forwardRef } from "react"
import { Icon } from "./Icon"

/** Figma `6070:8071` — 9px uppercase chip label, +2px tracking, Chip Text 560. */
const LABEL_STYLE = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "9px",
  lineHeight: "16px",
  letterSpacing: "2px",
  fontVariationSettings: '"wght" 560',
  fontFeatureSettings: '"lnum" 1, "tnum" 1',
  color: "rgba(48,46,47,0.94)",
}

const BASE_CLASS =
  "inline-flex h-[18px] w-fit shrink-0 items-center justify-center rounded-[2px]"
const HOVER_CLASS =
  "border-0 p-0 appearance-none transition-colors hover:bg-[#eceaeb] focus-visible:bg-[#eceaeb] outline-none"

/**
 * Tonal variants (Figma `6086:10252`):
 * - `primary` — `bg #f5f5f5`, `px-[8px]` — used by MicroControl and ActivityItem timestamps that head a populated block.
 * - `muted`   — `bg #f2f2f3`, `px-[6px]` — used by the older `Tag` (`6003:7054`) for date headers that only carry collapsed/empty content.
 */
const TONE_CLASS = {
  primary: "bg-[#f5f5f5]",
  muted: "bg-[#f2f2f3]",
}
const TONE_TEXT_PADDING = {
  primary: "px-[8px]",
  muted: "px-[6px]",
}

/**
 * Compact 18px rail used inline (Figma `6070:8071`).
 *
 * @typedef {object} MicroControlProps
 * @property {"control"|"tag"} [type]
 *  - `control` — interactive (hover bg `#eceaeb`); use with `iconOnly` or `textOnly`.
 *  - `tag` — static label/timestamp (no hover); use with `textOnly` or `timestamp`.
 * @property {"iconOnly"|"textOnly"|"timestamp"} [layout]
 * @property {string} [iconName] — for `iconOnly`.
 * @property {string} [label] — for `textOnly`.
 * @property {string} [datePart] — for `timestamp`.
 * @property {string} [timePart] — for `timestamp`.
 * @property {string} [dateTime] — ISO8601 for semantic `<time datetime>`.
 * @property {() => void} [onPress] — required for interactive `control`.
 * @property {string} [ariaLabel]
 * @property {string} [className]
 */
export const MicroControl = forwardRef(function MicroControl(
  {
    type = "control",
    layout = "iconOnly",
    /** Visual variant for the chip background + horizontal padding. See `TONE_CLASS`. */
    tone = "primary",
    iconName = "reply",
    label = "",
    datePart = "today,",
    timePart = "9:15 AM",
    dateTime,
    onPress,
    ariaLabel,
    className = "",
    ...rest
  },
  ref
) {
  const isControl = type === "control"
  const isIconOnly = layout === "iconOnly"
  const isTimestamp = layout === "timestamp"
  const safeTone = TONE_CLASS[tone] ? tone : "primary"
  const toneBg = TONE_CLASS[safeTone]
  const layoutClass = isIconOnly ? "w-[18px]" : TONE_TEXT_PADDING[safeTone]
  const interactiveClass = isControl ? HOVER_CLASS : ""
  const rootClass = `${BASE_CLASS} ${toneBg} ${layoutClass} ${interactiveClass} ${className}`.trim()

  if (isIconOnly) {
    const iconNode = <Icon name={iconName} size="micro" aria-hidden />

    if (isControl) {
      return (
        <button
          ref={ref}
          type="button"
          className={rootClass}
          aria-label={ariaLabel ?? `Micro control: ${iconName}`}
          onClick={onPress}
          {...rest}
        >
          {iconNode}
        </button>
      )
    }
    return (
      <span
        ref={ref}
        className={rootClass}
        {...(ariaLabel ? { role: "img", "aria-label": ariaLabel } : { "aria-hidden": true })}
        {...rest}
      >
        {iconNode}
      </span>
    )
  }

  if (isTimestamp) {
    const text = `${String(datePart).trimEnd()} ${String(timePart).trim()}`.replace(/\s+/g, " ").trim()
    return (
      <time
        ref={ref}
        dateTime={dateTime}
        className={rootClass}
        aria-label={ariaLabel}
        {...rest}
      >
        <span
          className="max-w-[240px] overflow-hidden text-ellipsis whitespace-nowrap uppercase"
          style={LABEL_STYLE}
        >
          {text}
        </span>
      </time>
    )
  }

  const textNode = (
    <span
      className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap uppercase"
      style={LABEL_STYLE}
    >
      {label}
    </span>
  )

  if (isControl) {
    return (
      <button
        ref={ref}
        type="button"
        className={`${rootClass} text-left`}
        aria-label={ariaLabel ?? label}
        onClick={onPress}
        {...rest}
      >
        {textNode}
      </button>
    )
  }

  return (
    <span ref={ref} className={rootClass} aria-label={ariaLabel} {...rest}>
      {textNode}
    </span>
  )
})
