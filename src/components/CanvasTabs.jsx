import { Icon } from "./Icon"
import { CanvasTabItem } from "./CanvasTabItem"

const TAB_PILL_CLASS = "bg-[var(--control-bg-rest-white)]"

/** Figma `6237:11857` selected / `6238:11882` unselected / `6240:12839` unselected hover. */
export function CanvasTabIndexButton({ active = false, onClick, className = "" }) {
  return (
    <div
      className={`group flex h-[56px] shrink-0 cursor-default items-center bg-[var(--control-bg-rest)] px-[3px] ${className}`}
    >
      <div
        className={`inline-flex shrink-0 items-center rounded-[2px] transition-colors duration-150 ${
          active ? TAB_PILL_CLASS : "bg-transparent group-hover:bg-[var(--control-bg-rest-white)]"
        }`}
      >
        <button
          type="button"
          role="tab"
          aria-selected={active}
          aria-label="Pages"
          onClick={onClick}
          className="inline-flex size-[28px] shrink-0 cursor-default items-center justify-center border-0 bg-transparent text-[var(--foreground-primary)]"
        >
          <Icon name="canvas" />
        </button>
      </div>
    </div>
  )
}

/** Figma `6235:11961` — Add tab with 28×28 white pill plus control. */
export function CanvasTabAddButton({ onClick, className = "", visible = true }) {
  return (
    <div
      className={`flex h-[56px] shrink-0 items-center bg-[var(--control-bg-rest)] px-[3px] transition-opacity duration-150 ${
        visible ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label="Add canvas tab"
        className="inline-flex size-[28px] shrink-0 cursor-default items-center justify-center rounded-[28px] border-0 bg-[var(--control-bg-rest-white)] text-[var(--foreground-primary)]"
      >
        <Icon name="plus" />
      </button>
    </div>
  )
}

/**
 * Canvas tab bar — Figma `6235:12010` (`6235:11943` default, `6235:12011` with add visible).
 */
export function CanvasTabs({
  tabs = [],
  selectedId = null,
  onSelect,
  onClose,
  onAdd,
  showAdd = true,
  addVisible = true,
  revealAddOnHover = false,
  showIndexButton = false,
  indexActive = false,
  onSelectIndex,
  className = "",
}) {
  const addButton = showAdd ? (
    <CanvasTabAddButton
      onClick={onAdd}
      visible={addVisible}
      className={revealAddOnHover ? "opacity-0 group-hover/canvas-tabs:opacity-100" : undefined}
    />
  ) : null

  return (
    <div
      role="tablist"
      aria-label="Canvas tabs"
      className={`group/canvas-tabs flex h-[56px] w-full min-w-0 items-center bg-[var(--control-bg-rest)] px-[11px] ${className}`}
    >
      {showIndexButton ? (
        <CanvasTabIndexButton active={indexActive} onClick={onSelectIndex} />
      ) : null}
      {tabs.map((tab) => (
        <CanvasTabItem
          key={tab.id}
          label={tab.label}
          leadingIcon={tab.leadingIcon}
          closable={tab.closable}
          selected={tab.id === selectedId}
          onClick={() => onSelect?.(tab.id)}
          onClose={() => onClose?.(tab.id)}
        />
      ))}
      {addButton}
    </div>
  )
}
