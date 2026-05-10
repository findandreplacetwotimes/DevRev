import { Icon } from "./Icon"

const labelStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
}

const numericalStyle = {
  fontFamily: '"Chip Mono", "Chip Text Variable", monospace',
  fontSize: "10px",
  lineHeight: "10px",
  letterSpacing: "0px",
}

export function MenuItemLabel({ label }) {
  return (
    <div className="inline-flex items-center justify-center py-[6px]">
      <span className="whitespace-nowrap text-[var(--foreground-primary)]" style={labelStyle}>
        {label}
      </span>
    </div>
  )
}

function AvatarIcon({ initial = "M" }) {
  return (
    <span className="relative inline-flex size-[28px] shrink-0 items-center justify-center overflow-hidden">
      <span className="absolute left-[5px] top-[5px] size-[18px] rounded-[999px] bg-[var(--background-primary-subtle)]" />
      <span
        className="relative z-[1] inline-flex h-[11px] w-[18px] items-center justify-center text-center text-[9.9px] text-[#737072]"
        style={{ fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif', fontVariationSettings: '"wght" 560' }}
      >
        {initial}
      </span>
    </span>
  )
}

export function MenuItem({ type = "leading", state = "rest", label = "Date", fullWidth = false, avatarInitial = "M" }) {
  const isHover = state === "hover"
  const isSelected = state === "selected"
  const isLabel = type === "label"
  const hasLeadingIcon = type === "leading"
  const itemBgClass = isLabel
    ? "bg-transparent"
    : isHover
      ? "bg-[var(--background-primary-subtle)]"
      : "bg-transparent hover:bg-[var(--background-primary-subtle)] transition-colors duration-150"
  const widthClass = fullWidth
    ? "w-full"
    : type === "label"
      ? "w-auto"
      : type === "textOnly" && isSelected
        ? "w-[233px]"
        : isSelected || isHover
          ? "w-[224px]"
          : "w-auto"
  const rootPadding =
    type === "textOnly" && isSelected
      ? "pl-[6px]"
      : type === "leading" && !isSelected
        ? "pr-[10px]"
        : type === "leading" && isSelected
          ? ""
          : "px-[6px]"

  return (
    <div
      className={`inline-flex h-[28px] items-center rounded-[2px] ${itemBgClass} ${rootPadding} ${widthClass} ${isSelected ? "justify-between" : ""}`}
    >
      {isLabel ? (
        <div className="inline-flex items-center py-[10.5px]">
          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[#939393]" style={numericalStyle}>
            {label.toUpperCase()}
          </span>
        </div>
      ) : (
        <>
          <div className="inline-flex items-center">
            {hasLeadingIcon && <AvatarIcon initial={avatarInitial} />}
            <MenuItemLabel label={label} />
          </div>
          {isSelected && <Icon name="check" />}
        </>
      )}
    </div>
  )
}
