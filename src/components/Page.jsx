import { Icon } from "./Icon"

export function Page({
  label = "Date",
  selected = false,
  state = "default",
  variant = "default",
  onSelect,
  role = "tab",
  id,
  tabIndex,
}) {
  const isForcedHover = state === "hover"
  const isDatePicker = variant === "datePicker"
  const isSelectedWithSelector = variant === "selectedWithSelector"
  const isSelected = selected || isSelectedWithSelector

  const bgClass = isSelected
    ? "bg-transparent"
    : isDatePicker
      ? "bg-white"
    : isForcedHover
      ? "bg-[var(--control-bg-hover)]"
      : "bg-[var(--background-primary-subtle)] hover:bg-[var(--control-bg-hover)]"
  const roundingClass = isDatePicker ? "rounded-[28px]" : "rounded-[2px]"
  const horizontalPadding = isSelectedWithSelector ? "pl-[10px] pr-0" : "px-[10px]"
  const transitionClass = isDatePicker ? "" : "transition-colors duration-150"

  return (
    <button
      type="button"
      id={id}
      role={role}
      aria-selected={isSelected}
      tabIndex={tabIndex}
      onClick={onSelect}
      className={`inline-flex items-center ${roundingClass} ${horizontalPadding} ${transitionClass} ${bgClass}`}
      style={{
        border: "none",
        boxShadow: isSelected || isDatePicker ? "inset 0 0 0 1.5px var(--border-subtle)" : "none",
      }}
    >
      <span
        className="inline-flex items-center py-[6px] text-[var(--foreground-primary)] whitespace-nowrap"
        style={{
          fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: "13px",
          lineHeight: "16px",
          letterSpacing: "-0.13px",
          fontVariationSettings: '"wght" 460',
        }}
      >
        {label}
      </span>
      {isSelectedWithSelector ? <Icon name="chevronDown" /> : null}
    </button>
  )
}
