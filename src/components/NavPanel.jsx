import { createPortal } from "react-dom"
import { forwardRef, useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useAnchoredPopoverPosition } from "../hooks/useAnchoredPopoverPosition"
import {
  NAV_CHAT_CATALOG,
  NAV_CHAT_DRAG_MIME,
  NAV_FOLDER_DRAG_MIME,
  NAV_FOLDER_OTHER_ID,
  NAV_FOLDER_PROJECTS_ID,
  prependNavChatItem,
  createInitialNavFolders,
  deleteNavFolder,
  isDefaultNewFolderLabel,
  isNavChatArchivable,
  isNavFolderDeletable,
  isNavFolderDraggable,
  isNavFolderRenamable,
  moveNavChatItem,
  moveNavFolder,
  removeNavFolder,
  removeNavChatItemFromFolders,
  renameNavFolder,
} from "../lib/navFolderState"
import {
  canBranchFromChat,
  getRelatedChatFamily,
  isBranchedChatId,
  isComputerChatId,
  isGroupChatId,
  isProjectMainChatId,
  relatedChatToNavItem,
  resolveRootChatId,
  supportsChatActionsMenu,
} from "../lib/relatedChats"
import { ChatAvatar } from "./ChatAvatar"
import {
  CHAT_ACTIONS_MENU_ROW_GAP_PX,
  ChatActionsMenuItems,
  measureChatActionsMenuHeight,
} from "./ChatActionsMenu"
import { Control } from "./Control"
import { MenuItem } from "./MenuItem"
import { NavGroup } from "./NavGroup"
import { NavItem } from "./NavItem"

const modalShadow =
  "0px 6px 13px rgba(0,0,0,0.10), 0px 23px 23px rgba(0,0,0,0.09), 0px 52px 31px rgba(0,0,0,0.05), 0px 92px 37px rgba(0,0,0,0.01), 0px 144px 40px rgba(0,0,0,0)"
const MENU_WIDTH_PX = 202
const EDGE_GUTTER_PX = 8

function MeAvatar({ selected = false }) {
  return (
    <span className="relative inline-flex size-[28px] shrink-0 items-center justify-center overflow-hidden">
      <span
        className={`absolute left-[5px] top-[5px] size-[18px] rounded-[999px] border border-transparent transition-colors duration-150 ${
          selected
            ? "border border-white bg-white"
            : "bg-[var(--background-primary-subtle)] group-hover:border-white group-hover:bg-white"
        }`}
      />
      <span
        className="relative z-[1] inline-flex h-[11px] w-[18px] items-center justify-center text-center text-[9.9px] text-[#737072]"
        style={{ fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif', fontVariationSettings: '"wght" 560' }}
      >
        M
      </span>
    </span>
  )
}

const SECONDARY_ITEMS = [
  { id: "inbox", label: "Inbox", iconName: "inbox" },
  { id: "discover", label: "Discover", iconName: "discover" },
  { id: "agent-studio", label: "Agent studio", iconName: "agent" },
  { id: "me", label: "Me", leading: <MeAvatar /> },
]

export const COMPUTER_NAV_ITEM_ID = "computer"

export const NavPanel = forwardRef(function NavPanel(
  {
    className = "",
    selectedItemId,
    defaultSelectedItemId = "build-team",
    onSelectItem,
    onNewChat,
    onNewComputerChat,
    onDeleteChat,
    onBranchChat,
    onSelectRelatedChat,
    relatedChatsRegistry = {},
    onResetChats,
    /** @deprecated project titles now come from per-project nav items */
    projectChatNavLabel,
    onCreateFolder,
  },
  ref
) {
  const [uncontrolledSelectedItemId, setUncontrolledSelectedItemId] = useState(defaultSelectedItemId)
  const [folders, setFolders] = useState(createInitialNavFolders)
  const [extraCatalog, setExtraCatalog] = useState({})
  const [editingFolderId, setEditingFolderId] = useState(null)
  const [draggingChatId, setDraggingChatId] = useState(null)
  const [draggingFolderId, setDraggingFolderId] = useState(null)
  const [dropTarget, setDropTarget] = useState(null)
  const [folderReorderTarget, setFolderReorderTarget] = useState(null)
  const didDragRef = useRef(false)

  const isControlledSelection = selectedItemId !== undefined
  const currentSelectedItemId = isControlledSelection ? selectedItemId : uncontrolledSelectedItemId
  const chatCatalog = useMemo(() => ({ ...NAV_CHAT_CATALOG, ...extraCatalog }), [extraCatalog])
  const allItemIds = useMemo(
    () => [...Object.keys(chatCatalog), ...SECONDARY_ITEMS.map((item) => item.id)],
    [chatCatalog]
  )

  useImperativeHandle(
    ref,
    () => ({
      /** @param {import("../lib/navFolderState").NavChatItemDef} itemDef */
      registerGroupChat(itemDef) {
        if (!itemDef?.id) return
        setExtraCatalog((prev) => ({ ...prev, [itemDef.id]: itemDef }))
        setFolders((prev) => prependNavChatItem(prev, NAV_FOLDER_OTHER_ID, itemDef.id))
      },
      registerProjectChat(itemDef) {
        if (!itemDef?.id) return
        setExtraCatalog((prev) => ({ ...prev, [itemDef.id]: itemDef }))
        setFolders((prev) => prependNavChatItem(prev, NAV_FOLDER_PROJECTS_ID, itemDef.id))
      },
      rehydrateRelatedChats(registry) {
        if (!registry || typeof registry !== "object") return
        const catalogEntries = {}
        const projectIds = []
        const branchIds = []
        const computerIds = []
        const groupIds = []
        for (const record of Object.values(registry)) {
          if (!record?.id || record.id === "build-team") continue
          catalogEntries[record.id] = relatedChatToNavItem(record)
          if (isProjectMainChatId(record.id)) projectIds.push(record.id)
          else if (isBranchedChatId(record.id)) branchIds.push(record.id)
          else if (isComputerChatId(record.id)) computerIds.push(record.id)
          else if (isGroupChatId(record.id)) groupIds.push(record.id)
        }
        setExtraCatalog((prev) => ({ ...prev, ...catalogEntries }))
        const sortIdsByCreatedAt = (ids) =>
          [...ids].sort(
            (a, b) => (registry[a]?.createdAt ?? 0) - (registry[b]?.createdAt ?? 0)
          )
        setFolders((prev) => {
          let next = prev.map((folder) => ({ ...folder, itemIds: [...folder.itemIds] }))
          const projectsFolder = next.find((folder) => folder.id === NAV_FOLDER_PROJECTS_ID)
          const otherFolder = next.find((folder) => folder.id === NAV_FOLDER_OTHER_ID)
          if (projectsFolder) {
            for (const id of sortIdsByCreatedAt(projectIds)) {
              if (!projectsFolder.itemIds.includes(id)) projectsFolder.itemIds.unshift(id)
            }
          }
          if (otherFolder) {
            for (const id of sortIdsByCreatedAt(groupIds)) {
              if (!otherFolder.itemIds.includes(id)) otherFolder.itemIds.unshift(id)
            }
            for (const id of sortIdsByCreatedAt(branchIds)) {
              if (!otherFolder.itemIds.includes(id)) otherFolder.itemIds.unshift(id)
            }
            for (const id of sortIdsByCreatedAt(computerIds)) {
              if (!otherFolder.itemIds.includes(id)) otherFolder.itemIds.unshift(id)
            }
          }
          return next
        })
      },
      deleteChatItem(itemId) {
        if (!isNavChatArchivable(itemId)) return false
        setExtraCatalog((prev) => {
          if (!(itemId in prev)) return prev
          const next = { ...prev }
          delete next[itemId]
          return next
        })
        setFolders((prev) => removeNavChatItemFromFolders(prev, itemId))
        return true
      },
      resetNav() {
        setExtraCatalog({})
        setFolders(createInitialNavFolders())
        setEditingFolderId(null)
      },
    }),
    []
  )

  const meMenuId = useId()
  const navContextMenuId = useId()
  const meTriggerRef = useRef(null)
  const meMenuRef = useRef(null)
  const navContextMenuRef = useRef(null)
  const navContextMenuOpenedAtRef = useRef(0)
  const [meMenuOpen, setMeMenuOpen] = useState(false)
  const [navContextMenu, setNavContextMenu] = useState(null)
  const mePopoverPos = useAnchoredPopoverPosition(meTriggerRef, meMenuOpen, 2)
  const [meMenuStyle, setMeMenuStyle] = useState({ top: 0, left: 0 })

  const handleResetChats = () => {
    setMeMenuOpen(false)
    onResetChats?.()
  }

  const contextMenuFolder = useMemo(
    () => (navContextMenu?.kind === "folder" ? folders.find((folder) => folder.id === navContextMenu.folderId) : null),
    [folders, navContextMenu]
  )

  const clampContextMenuPosition = (clientX, clientY, menuHeight) => {
    const viewportW = window.innerWidth
    const viewportH = window.innerHeight
    let top = Math.round(clientY)
    let left = Math.round(clientX)
    top = Math.max(EDGE_GUTTER_PX, Math.min(top, viewportH - menuHeight - EDGE_GUTTER_PX))
    left = Math.max(EDGE_GUTTER_PX, Math.min(left, viewportW - MENU_WIDTH_PX - EDGE_GUTTER_PX))
    return { top, left }
  }

  const openContextMenuAt = (clientX, clientY, menuHeight, menu) => {
    setMeMenuOpen(false)
    navContextMenuOpenedAtRef.current = Date.now()
    const { top, left } = clampContextMenuPosition(clientX, clientY, menuHeight)
    setNavContextMenu({ top, left, ...menu })
  }

  const closeNavContextMenu = () => setNavContextMenu(null)

  const handleSelectItem = (itemId) => {
    if (didDragRef.current) return
    if (itemId !== COMPUTER_NAV_ITEM_ID && !allItemIds.includes(itemId)) return
    if (!isControlledSelection) {
      setUncontrolledSelectedItemId(itemId)
    }
    onSelectItem?.(itemId)
  }

  const finishDrag = () => {
    setDraggingChatId(null)
    setDraggingFolderId(null)
    setDropTarget(null)
    setFolderReorderTarget(null)
    window.setTimeout(() => {
      didDragRef.current = false
    }, 0)
  }

  const readDraggedFolderId = (event) => {
    const fromMime = event.dataTransfer.getData(NAV_FOLDER_DRAG_MIME)
    if (fromMime) return fromMime
    return draggingFolderId
  }

  const readDraggedChatId = (event) => {
    const fromMime = event.dataTransfer.getData(NAV_CHAT_DRAG_MIME)
    if (fromMime) return fromMime
    const fromPlain = event.dataTransfer.getData("text/plain")
    return fromPlain || draggingChatId
  }

  const handleChatDragStart = (itemId, event) => {
    didDragRef.current = false
    setDraggingChatId(itemId)
    event.dataTransfer.setData(NAV_CHAT_DRAG_MIME, itemId)
    event.dataTransfer.setData("text/plain", itemId)
    event.dataTransfer.effectAllowed = "move"
  }

  const handleChatDrag = () => {
    didDragRef.current = true
  }

  const handleChatDragEnd = () => {
    finishDrag()
  }

  const handleFolderDragOver = (folderId, index, event) => {
    if (draggingFolderId) return
    event.preventDefault()
    event.stopPropagation()
    event.dataTransfer.dropEffect = "move"
    setDropTarget({ folderId, index })
    setFolderReorderTarget(null)
  }

  const handleFolderDrop = (folderId, index, event) => {
    if (draggingFolderId) return
    event.preventDefault()
    event.stopPropagation()
    const itemId = readDraggedChatId(event)
    if (!itemId || !chatCatalog[itemId]) return
    setFolders((prev) => moveNavChatItem(prev, itemId, folderId, index))
    finishDrag()
  }

  const handleFolderLabelDragStart = (folderId, event) => {
    if (editingFolderId) return
    didDragRef.current = false
    setDraggingFolderId(folderId)
    setDropTarget(null)
    event.dataTransfer.setData(NAV_FOLDER_DRAG_MIME, folderId)
    event.dataTransfer.effectAllowed = "move"
    event.stopPropagation()
  }

  const handleFolderLabelDrag = () => {
    didDragRef.current = true
  }

  const handleFolderLabelDragEnd = () => {
    finishDrag()
  }

  const handleFolderReorderDragOver = (index, event) => {
    if (!draggingFolderId) return
    event.preventDefault()
    event.stopPropagation()
    event.dataTransfer.dropEffect = "move"
    setFolderReorderTarget({ index })
    setDropTarget(null)
  }

  const handleFolderReorderDrop = (index, event) => {
    event.preventDefault()
    event.stopPropagation()
    const folderId = readDraggedFolderId(event)
    if (!folderId) return
    setFolders((prev) => moveNavFolder(prev, folderId, index))
    finishDrag()
  }

  const handleDeleteChatItem = (itemId) => {
    closeNavContextMenu()
    if (!isNavChatArchivable(itemId)) return
    setExtraCatalog((prev) => {
      if (!(itemId in prev)) return prev
      const next = { ...prev }
      delete next[itemId]
      return next
    })
    setFolders((prev) => removeNavChatItemFromFolders(prev, itemId))
    onDeleteChat?.(itemId)
  }

  const handleChatItemContextMenu = (itemId, event) => {
    if (!supportsChatActionsMenu(itemId, relatedChatsRegistry)) return
    event.preventDefault()
    event.stopPropagation()
    const rootId = resolveRootChatId(itemId, relatedChatsRegistry)
    const relatedChats = rootId ? getRelatedChatFamily(rootId, relatedChatsRegistry) : []
    const menuHeight = measureChatActionsMenuHeight({
      showBranch: canBranchFromChat(itemId, relatedChatsRegistry),
      showArchive: isNavChatArchivable(itemId),
      relatedChats,
    })
    openContextMenuAt(event.clientX, event.clientY, menuHeight, { kind: "chat", itemId })
  }

  const handleChatItemBranch = () => {
    const itemId = navContextMenu?.kind === "chat" ? navContextMenu.itemId : null
    closeNavContextMenu()
    if (itemId) onBranchChat?.(itemId)
  }

  const handleChatItemSelectRelatedChat = (chatId) => {
    closeNavContextMenu()
    onSelectRelatedChat?.(chatId)
  }

  const contextMenuRelatedChats = useMemo(() => {
    if (navContextMenu?.kind !== "chat") return []
    const rootId = resolveRootChatId(navContextMenu.itemId, relatedChatsRegistry)
    return rootId ? getRelatedChatFamily(rootId, relatedChatsRegistry) : []
  }, [navContextMenu, relatedChatsRegistry])

  const renderChatNavItem = (itemId, folderId, index) => {
    const item = chatCatalog[itemId]
    if (!item) return null

    const label = item.label

    return (
      <div
        key={item.id}
        onDragOver={(event) => handleFolderDragOver(folderId, index, event)}
        onDrop={(event) => handleFolderDrop(folderId, index, event)}
      >
        <NavItem
          label={label}
          iconName={item.iconName ?? "page"}
          leading={
            item.memberCount != null ? (
              <ChatAvatar count={item.memberCount} />
            ) : item.iconName ? undefined : (
              <ChatAvatar initial={item.initial ?? "?"} />
            )
          }
          selected={currentSelectedItemId === item.id}
          className={`w-full ${draggingChatId === item.id ? "opacity-50" : ""}`}
          draggable
          onDragStart={(event) => handleChatDragStart(item.id, event)}
          onDrag={handleChatDrag}
          onDragEnd={handleChatDragEnd}
          onClick={() => handleSelectItem(item.id)}
          onContextMenu={(event) => handleChatItemContextMenu(item.id, event)}
        />
      </div>
    )
  }

  const renderFolder = (folder) => {
    const canDragLabel = isNavFolderDraggable(folder) && editingFolderId !== folder.id

    return (
      <NavGroup
        folderId={folder.id}
        label={folder.label}
        sectionLabel={folder.sectionLabel ?? !folder.builtin}
        iconName="page"
        defaultExpanded
        showEmptyDropZone={folder.itemIds.length === 0}
        isDropTarget={dropTarget?.folderId === folder.id}
        onFolderDragOver={(event) => handleFolderDragOver(folder.id, folder.itemIds.length, event)}
        onFolderDrop={(event) => handleFolderDrop(folder.id, folder.itemIds.length, event)}
        editing={editingFolderId === folder.id}
        headerDraggable={canDragLabel}
        isDragging={draggingFolderId === folder.id}
        onHeaderDragStart={(event) => handleFolderLabelDragStart(folder.id, event)}
        onHeaderDrag={handleFolderLabelDrag}
        onHeaderDragEnd={handleFolderLabelDragEnd}
        onBeforeHeaderClick={() => !didDragRef.current}
        onHeaderContextMenu={(event) => handleFolderHeaderContextMenu(folder, event)}
        onLabelCommit={(nextLabel) => {
          setEditingFolderId(null)
          if (!nextLabel) {
            if (isDefaultNewFolderLabel(folder.label)) {
              setFolders((prev) => removeNavFolder(prev, folder.id))
            }
            return
          }
          setFolders((prev) => renameNavFolder(prev, folder.id, nextLabel))
        }}
        onLabelCancel={() => {
          setEditingFolderId(null)
          if (isDefaultNewFolderLabel(folder.label)) {
            setFolders((prev) => removeNavFolder(prev, folder.id))
          }
        }}
      >
        {folder.itemIds.map((itemId, index) => renderChatNavItem(itemId, folder.id, index))}
      </NavGroup>
    )
  }

  const handleMeClick = () => {
    handleSelectItem("me")
    closeNavContextMenu()
    setMeMenuOpen((prev) => !prev)
  }

  const handleFolderHeaderContextMenu = (folder, event) => {
    const renamable = isNavFolderRenamable(folder)
    const deletable = isNavFolderDeletable(folder)
    if (!renamable && !deletable) return

    const itemCount = Number(renamable) + Number(deletable)
    const menuHeight = itemCount * 32 + 12 + Math.max(0, itemCount - 1) * 2
    openContextMenuAt(event.clientX, event.clientY, menuHeight, { kind: "folder", folderId: folder.id })
  }

  const handleEmptyContextMenu = (event) => {
    if (event.target.closest("[data-nav-folder-header], a, [role='menuitem']")) return
    event.preventDefault()
    event.stopPropagation()
    openContextMenuAt(event.clientX, event.clientY, 40, { kind: "empty" })
  }

  const handleRenameFolder = (folderId) => {
    closeNavContextMenu()
    setEditingFolderId(folderId)
  }

  const handleDeleteFolder = (folderId) => {
    closeNavContextMenu()
    if (editingFolderId === folderId) setEditingFolderId(null)
    setFolders((prev) => deleteNavFolder(prev, folderId))
  }

  const handleCreateFolder = () => {
    const folderId = `folder-${Date.now()}`
    setFolders((prev) => {
      const nextIndex = prev.filter((folder) => !folder.builtin).length + 1
      const label = nextIndex === 1 ? "New folder" : `New folder ${nextIndex}`
      return [
        ...prev,
        { id: folderId, label, sectionLabel: true, builtin: false, itemIds: [] },
      ]
    })
    setEditingFolderId(folderId)
    onCreateFolder?.()
    closeNavContextMenu()
  }

  useEffect(() => {
    if (!navContextMenu) return undefined

    const onDocumentPointerDown = (event) => {
      if (Date.now() - navContextMenuOpenedAtRef.current < 250) return
      const t = event.target
      if (navContextMenuRef.current?.contains(t)) return
      closeNavContextMenu()
    }

    const id = window.requestAnimationFrame(() => {
      document.addEventListener("pointerdown", onDocumentPointerDown, true)
    })

    return () => {
      window.cancelAnimationFrame(id)
      document.removeEventListener("pointerdown", onDocumentPointerDown, true)
    }
  }, [navContextMenu])

  useEffect(() => {
    if (!navContextMenu) return undefined
    const onKey = (event) => {
      if (event.key === "Escape") closeNavContextMenu()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [navContextMenu])

  useEffect(() => {
    if (!meMenuOpen) return undefined
    const onDocumentPointerDown = (event) => {
      const t = event.target
      if (meTriggerRef.current?.contains(t) || meMenuRef.current?.contains(t)) return
      setMeMenuOpen(false)
    }
    document.addEventListener("pointerdown", onDocumentPointerDown)
    return () => document.removeEventListener("pointerdown", onDocumentPointerDown)
  }, [meMenuOpen])

  useLayoutEffect(() => {
    if (!meMenuOpen) return undefined

    const positionMenu = () => {
      const triggerRect = meTriggerRef.current?.getBoundingClientRect()
      if (!triggerRect) return
      const menuHeight = meMenuRef.current?.offsetHeight ?? 120
      const viewportW = window.innerWidth
      const viewportH = window.innerHeight

      let top = Math.round(triggerRect.bottom + 2)
      const bottomOverflow = top + menuHeight - viewportH + EDGE_GUTTER_PX
      if (bottomOverflow > 0) {
        top = Math.round(triggerRect.top - menuHeight - 2)
      }
      top = Math.max(EDGE_GUTTER_PX, Math.min(top, viewportH - menuHeight - EDGE_GUTTER_PX))

      let left = Math.round(triggerRect.left)
      left = Math.max(EDGE_GUTTER_PX, Math.min(left, viewportW - MENU_WIDTH_PX - EDGE_GUTTER_PX))

      setMeMenuStyle({ top, left })
    }

    positionMenu()
    const id = window.requestAnimationFrame(positionMenu)
    window.addEventListener("scroll", positionMenu, true)
    window.addEventListener("resize", positionMenu)
    return () => {
      window.cancelAnimationFrame(id)
      window.removeEventListener("scroll", positionMenu, true)
      window.removeEventListener("resize", positionMenu)
    }
  }, [meMenuOpen, mePopoverPos])

  useEffect(() => {
    if (!meMenuOpen) return undefined
    const onKey = (event) => {
      if (event.key === "Escape") setMeMenuOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [meMenuOpen])

  return (
    <aside
      className={`flex h-full min-h-0 w-[220px] shrink-0 flex-col items-start overflow-hidden border-r border-[#ececec] bg-white px-[12px] py-[14px] ${className}`}
    >
      <div className="flex w-full items-center gap-[4px]">
        <button
          type="button"
          onClick={() => onNewComputerChat?.()}
          className="flex h-[29px] min-w-0 flex-1 items-center justify-center rounded-[999px] bg-[var(--background-primary-subtle)] pb-[3px] pt-[5px] transition-colors duration-150 hover:bg-[var(--control-bg-hover)]"
          aria-label="New chat with Computer"
        >
          <img src="/icons/computer-wordmark.svg" alt="computer" className="h-[14px] w-[80px]" draggable={false} />
        </button>
        <Control
          type="iconOnly"
          leadingIcon="plus"
          label=""
          aria-label="New chat"
          onClick={() => onNewChat?.()}
        />
      </div>

      <div className="h-[20px] w-[192px] shrink-0 bg-white" />

      <div className="flex min-h-0 w-[192px] flex-1 flex-col bg-white">
        {folders.map((folder, index) => (
          <div key={folder.id} className="flex w-full flex-col gap-[4px]">
            <div
              className={`flex w-full flex-col gap-[4px] rounded-[2px] ${
                folderReorderTarget?.index === index ? "bg-[var(--background-primary-subtle)]" : ""
              }`}
              onDragOver={(event) => handleFolderReorderDragOver(index, event)}
              onDrop={(event) => handleFolderReorderDrop(index, event)}
            >
              {renderFolder(folder)}
            </div>
            {index < folders.length - 1 ? (
              <div className="h-[20px] w-full shrink-0 bg-white" aria-hidden />
            ) : null}
          </div>
        ))}
        <div
          data-nav-empty-zone
          className={`min-h-[28px] w-full flex-1 shrink-0 rounded-[2px] ${
            folderReorderTarget?.index === folders.length ? "bg-[var(--background-primary-subtle)]" : ""
          }`}
          onContextMenu={handleEmptyContextMenu}
          onDragOver={(event) => handleFolderReorderDragOver(folders.length, event)}
          onDrop={(event) => handleFolderReorderDrop(folders.length, event)}
        />
      </div>

      <div className="flex w-full flex-col gap-[4px]">
        {SECONDARY_ITEMS.slice(0, 3).map((item) => (
          <NavItem
            key={item.id}
            label={item.label}
            iconName={item.iconName}
            selected={currentSelectedItemId === item.id}
            className="w-full"
            onClick={() => handleSelectItem(item.id)}
          />
        ))}
        <div className="h-[12px] w-full shrink-0 bg-white" />
        <NavItem
          ref={meTriggerRef}
          label="Me"
          className="w-full"
          id={`${meMenuId}-trigger`}
          leading={<MeAvatar selected={currentSelectedItemId === "me" || meMenuOpen} />}
          selected={currentSelectedItemId === "me" || meMenuOpen}
          onClick={handleMeClick}
          aria-haspopup="menu"
          aria-expanded={meMenuOpen}
          aria-controls={meMenuOpen ? `${meMenuId}-menu` : undefined}
        />
      </div>

      {meMenuOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={meMenuRef}
              id={`${meMenuId}-menu`}
              role="menu"
              aria-label="Account"
              className="fixed z-[2147483646] inline-flex w-[202px] flex-col items-start gap-[4px] rounded-[2px] bg-white p-[6px]"
              style={{
                boxShadow: modalShadow,
                top: `${meMenuStyle.top}px`,
                left: `${meMenuStyle.left}px`,
              }}
            >
              <button type="button" className="w-full text-left" onClick={handleResetChats}>
                <MenuItem type="textOnly" state="rest" label="Reset" fullWidth />
              </button>
            </div>,
            document.body
          )
        : null}

      {navContextMenu && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={navContextMenuRef}
              id={`${navContextMenuId}-menu`}
              role="menu"
              aria-label={
                navContextMenu.kind === "empty"
                  ? "Navigation actions"
                  : navContextMenu.kind === "chat"
                    ? "Chat actions"
                    : "Folder actions"
              }
              className="fixed z-[2147483646] inline-flex w-[202px] flex-col items-start rounded-[2px] bg-white p-[6px]"
              style={{
                boxShadow: modalShadow,
                top: `${navContextMenu.top}px`,
                left: `${navContextMenu.left}px`,
                gap: `${CHAT_ACTIONS_MENU_ROW_GAP_PX}px`,
              }}
            >
              {navContextMenu.kind === "empty" ? (
                <button type="button" className="w-full text-left" onClick={handleCreateFolder}>
                  <MenuItem type="textOnly" state="rest" label="Create new folder" fullWidth />
                </button>
              ) : navContextMenu.kind === "chat" ? (
                <ChatActionsMenuItems
                  onBranch={handleChatItemBranch}
                  onArchive={() => handleDeleteChatItem(navContextMenu.itemId)}
                  onSelectRelatedChat={handleChatItemSelectRelatedChat}
                  relatedChats={contextMenuRelatedChats}
                  currentChatId={navContextMenu.itemId}
                  showBranch={canBranchFromChat(navContextMenu.itemId, relatedChatsRegistry)}
                  showArchive={isNavChatArchivable(navContextMenu.itemId)}
                />
              ) : (
                <>
                  {contextMenuFolder && isNavFolderRenamable(contextMenuFolder) ? (
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => handleRenameFolder(contextMenuFolder.id)}
                    >
                      <MenuItem type="textOnly" state="rest" label="Rename" fullWidth />
                    </button>
                  ) : null}
                  {contextMenuFolder && isNavFolderDeletable(contextMenuFolder) ? (
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => handleDeleteFolder(contextMenuFolder.id)}
                    >
                      <MenuItem type="textOnly" state="rest" label="Delete" fullWidth />
                    </button>
                  ) : null}
                </>
              )}
            </div>,
            document.body
          )
        : null}
    </aside>
  )
})
