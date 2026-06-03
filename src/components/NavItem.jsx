import { forwardRef } from "react"
import { Icon } from "./Icon"
import { MenuItemLabel } from "./MenuItem"

const labelStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
}

export const NavItem = forwardRef(function NavItem(
  {
    label = "Issues",
    selected = false,
    onClick,
    iconName = "page",
    className = "",
    leading = null,
    toggle = false,
    idLabel,
    ...rest
  },
  ref
) {
  const isIdVariant = typeof idLabel === "string" && idLabel.trim().length > 0
  const baseClass = `inline-flex h-[28px] items-center rounded-[2px] pr-[6px] transition-colors duration-150 ${
    selected ? "bg-[var(--background-primary-subtle)]" : "bg-white hover:bg-[var(--background-primary-subtle)]"
  }`

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-pressed={toggle ? selected : undefined}
      className={`group ${baseClass} ${className || "w-[174px]"}`}
      {...rest}
    >
      {leading || <Icon name={iconName} />}
      {isIdVariant ? (
        <span className="flex h-full min-w-0 flex-1 items-center gap-[4px] py-[6px]" style={labelStyle}>
          <span className="shrink-0 whitespace-nowrap text-[#737072]">{idLabel}</span>
          <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[var(--foreground-primary)]">
            {label}
          </span>
        </span>
      ) : (
        <MenuItemLabel label={label} />
      )}
    </button>
  )
})

NavItem.displayName = "NavItem"
