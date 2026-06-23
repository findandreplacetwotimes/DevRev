import { useId, useState } from "react"
import { FolderNameEdit } from "./FolderNameEdit"
import { Icon } from "./Icon"
import { MenuItem, MenuItemLabel } from "./MenuItem"

export function NavGroup({
  label,
  children,
  className = "",
  iconName = "team",
  leading = null,
  defaultExpanded = true,
  expanded,
  onExpandedChange,
  /** Uppercase section label (Projects / Other) instead of icon + title row. */
  sectionLabel = false,
  folderId,
  isDropTarget = false,
  onFolderDragOver,
  onFolderDrop,
  showEmptyDropZone = false,
  editing = false,
  headerDraggable = false,
  isDragging = false,
  onHeaderDragStart,
  onHeaderDrag,
  onHeaderDragEnd,
  onBeforeHeaderClick,
  onHeaderContextMenu,
  onLabelCommit,
  onLabelCancel,
}) {
  const contentId = useId()
  const isControlled = expanded !== undefined
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded)
  const isExpanded = isControlled ? expanded : uncontrolledExpanded

  const toggleExpanded = () => {
    if (editing) return
    if (onBeforeHeaderClick?.() === false) return
    const next = !isExpanded
    if (!isControlled) setUncontrolledExpanded(next)
    onExpandedChange?.(next)
  }

  const headerDragProps = headerDraggable
    ? {
        draggable: true,
        onDragStart: onHeaderDragStart,
        onDrag: onHeaderDrag,
        onDragEnd: onHeaderDragEnd,
      }
    : {}

  const headerClassName = `group inline-flex h-[28px] w-full items-center rounded-[2px] bg-white transition-colors duration-150 hover:bg-[var(--background-primary-subtle)] ${
    sectionLabel ? "" : "pr-[6px]"
  } ${isDropTarget ? "bg-[var(--background-primary-subtle)]" : ""} ${isDragging ? "opacity-50" : ""}`

  const headerContent = sectionLabel ? (
    <MenuItem type="label" label={label} fullWidth />
  ) : (
    <>
      {leading || <Icon name={iconName} />}
      <MenuItemLabel label={label} />
    </>
  )

  const dropHandlers = {
    onDragOver: onFolderDragOver,
    onDrop: onFolderDrop,
  }

  const handleHeaderContextMenu = (event) => {
    if (editing) return
    event.preventDefault()
    event.stopPropagation()
    onHeaderContextMenu?.(event)
  }

  return (
    <section
      data-nav-folder
      className={`flex w-full flex-col gap-[4px] ${className}`}
      aria-label={label}
      onContextMenu={(event) => {
        if (!event.target.closest("[data-nav-folder-header]")) return
        handleHeaderContextMenu(event)
      }}
    >
      {editing ? (
        <div data-nav-folder-drop={folderId} className="inline-flex h-[28px] w-full items-center" {...dropHandlers}>
          <FolderNameEdit
            defaultValue={label}
            showConfirmButton
            onCommit={onLabelCommit}
            onCancel={onLabelCancel}
          />
        </div>
      ) : (
        <button
          type="button"
          data-nav-folder-header
          data-nav-folder-drop={folderId}
          className={headerClassName}
          aria-expanded={isExpanded}
          aria-controls={contentId}
          onClick={toggleExpanded}
          {...headerDragProps}
          {...dropHandlers}
        >
          {headerContent}
        </button>
      )}
      {isExpanded ? (
        <div
          id={contentId}
          data-nav-folder-drop={folderId}
          className={`flex min-h-[28px] w-full flex-col gap-[4px] rounded-[2px] ${sectionLabel ? "" : "px-[22px]"} ${
            isDropTarget ? "bg-[var(--background-primary-subtle)]" : ""
          }`}
          onDragOver={onFolderDragOver}
          onDrop={onFolderDrop}
        >
          {children}
          {showEmptyDropZone ? <div className="h-[28px] w-full shrink-0" aria-hidden /> : null}
        </div>
      ) : null}
    </section>
  )
}
