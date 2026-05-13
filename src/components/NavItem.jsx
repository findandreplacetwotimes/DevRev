import { forwardRef } from "react"
import { Icon } from "./Icon"
import { MenuItemLabel } from "./MenuItem"

export const NavItem = forwardRef(function NavItem(
  { label = "Issues", selected = false, onClick, iconName = "page", className = "", leading = null, trailing = null, toggle = false, ...rest },
  ref
) {
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
      <MenuItemLabel label={label} />
      {trailing}
    </button>
  )
})

NavItem.displayName = "NavItem"
