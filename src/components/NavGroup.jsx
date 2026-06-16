import { useId, useState } from "react"
import { Icon } from "./Icon"
import { MenuItemLabel } from "./MenuItem"

const sectionLabelStyle = {
  fontFamily: '"Chip Mono", "Chip Text Variable", monospace',
  fontSize: "10px",
  lineHeight: "10px",
  letterSpacing: "0px",
}

export function NavGroup({
  label,
  children,
  className = "",
  iconName = "team",
  leading = null,
  variant = "default",
  defaultExpanded = true,
  expanded,
  onExpandedChange,
}) {
  const contentId = useId()
  const isControlled = expanded !== undefined
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded)
  const isExpanded = isControlled ? expanded : uncontrolledExpanded
  const isSection = variant === "section"

  const toggleExpanded = () => {
    const next = !isExpanded
    if (!isControlled) setUncontrolledExpanded(next)
    onExpandedChange?.(next)
  }

  return (
    <section className={`flex w-[194px] flex-col gap-[4px] ${className}`} aria-label={label}>
      <button
        type="button"
        className={`group inline-flex w-full items-center rounded-[2px] bg-white transition-colors duration-150 hover:bg-[var(--background-primary-subtle)] ${
          isSection ? "px-[6px] py-[10.5px]" : "h-[28px] pr-[6px]"
        }`}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={toggleExpanded}
      >
        {isSection ? (
          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[#939393]" style={sectionLabelStyle}>
            {label.toUpperCase()}
          </span>
        ) : (
          <>
            {leading || <Icon name={iconName} />}
            <MenuItemLabel label={label} />
          </>
        )}
      </button>
      {isExpanded ? (
        <div id={contentId} className={`flex w-full flex-col gap-[4px] ${isSection ? "" : "px-[22px]"}`}>
          {children}
        </div>
      ) : null}
    </section>
  )
}
