import { Icon } from "./Icon"

const chipSystemTextStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
}

const suffixTextStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
  color: "rgba(0, 0, 0, 0.9)",
}

export function TabItem({
  type = "nonSelected",
  state = "rest",
  prefix = "Issue",
  suffix = "-0001",
  closable = true,
  onSelect,
  onClose,
}) {
  const isSelected = type === "selected"
  const isForcedHover = state === "hover"
  const showClose = closable && isForcedHover
  const separatorColor = isSelected ? (isForcedHover ? "#ffffff" : "transparent") : "#ffffff"
  const bgClass = isSelected ? "bg-white" : isForcedHover ? "bg-white" : "bg-[#f2f2f3]"

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
      className={`group flex h-[44px] w-[160px] items-center justify-between border-r-[1.5px] px-[10px] text-left ${bgClass}`}
      aria-current={isSelected ? "page" : undefined}
      style={{ borderRightColor: separatorColor }}
    >
      <div className="flex h-full items-center">
        <Icon name="team" />
        <div className="flex h-[28px] items-center whitespace-nowrap">
          <span className="text-[var(--foreground-primary)]" style={chipSystemTextStyle}>
            {prefix}
          </span>
          <span style={suffixTextStyle}>{suffix}</span>
        </div>
      </div>
      <button
        type="button"
        className={`inline-flex h-[28px] items-center justify-center self-center text-[var(--foreground-primary)] transition-opacity duration-150 ${
          showClose
            ? "opacity-100"
            : closable
              ? "opacity-0 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100"
              : "opacity-0 pointer-events-none"
        }`}
        onClick={(event) => {
          event.stopPropagation()
          onClose?.()
        }}
        aria-label="Close tab"
      >
        <Icon name="close" />
      </button>
    </div>
  )
}
