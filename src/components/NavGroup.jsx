import { useId, useState } from "react"
import { Icon } from "./Icon"
import { MenuItemLabel } from "./MenuItem"

export function NavGroup({
  label,
  children,
  className = "",
  iconName = "team",
  leading = null,
  defaultExpanded = true,
  expanded,
  onExpandedChange,
}) {
  const contentId = useId()
  const isControlled = expanded !== undefined
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded)
  const isExpanded = isControlled ? expanded : uncontrolledExpanded

  const toggleExpanded = () => {
    const next = !isExpanded
    if (!isControlled) setUncontrolledExpanded(next)
    onExpandedChange?.(next)
  }

  return (
    <section className={`flex w-[194px] flex-col gap-[4px] ${className}`} aria-label={label}>
      <button
        type="button"
        className="group inline-flex h-[28px] w-full items-center rounded-[2px] bg-white pr-[6px] transition-colors duration-150 hover:bg-[var(--background-primary-subtle)]"
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={toggleExpanded}
      >
        {leading || <Icon name={iconName} />}
        <MenuItemLabel label={label} />
      </button>
      {isExpanded ? (
        <div id={contentId} className="flex w-full flex-col gap-[4px] px-[22px]">
          {children}
        </div>
      ) : null}
    </section>
  )
}
