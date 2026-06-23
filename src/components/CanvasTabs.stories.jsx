import { useState } from "react"
import { createDocTabFromLink } from "../lib/canvasTabs"
import { CanvasTabAddButton, CanvasTabIndexButton, CanvasTabs } from "./CanvasTabs"
import { CanvasTabItem } from "./CanvasTabItem"

const meta = {
  title: "Components/CanvasTabs",
  component: CanvasTabs,
  parameters: {
    layout: "padded",
  },
}

export default meta

const shell = (children) => (
  <div className="w-full max-w-[1114px] border border-[#ececec] bg-white">{children}</div>
)

const DOC_TABS = [
  createDocTabFromLink({ title: "Build core flow for feature", href: "/issues/Issue-0001" }),
  createDocTabFromLink(
    { title: "Overview", href: "/projects/Project-0001" },
    {
      projects: [{ id: "Project-0001", title: "Build core flow for feature" }],
    }
  ),
]

/** Figma `6235:11943` — canvas index icon + doc tabs, add on hover. */
export const Default = {
  render: () =>
    shell(
      <CanvasTabs
        tabs={DOC_TABS}
        selectedId={DOC_TABS[0].id}
        showIndexButton
        indexActive={false}
        showAdd
        addVisible={false}
        revealAddOnHover
      />
    ),
}

/** Figma `6235:12011` — add control visible. */
export const WithAddVisible = {
  render: () =>
    shell(
      <CanvasTabs
        tabs={DOC_TABS}
        selectedId={DOC_TABS[0].id}
        showIndexButton
        showAdd
        onAdd={() => {}}
      />
    ),
}

export const Interactive = {
  render: () => {
    const [tabs, setTabs] = useState(DOC_TABS)
    const [selectedId, setSelectedId] = useState(DOC_TABS[0].id)
    const [indexActive, setIndexActive] = useState(false)

    return shell(
      <CanvasTabs
        tabs={tabs}
        selectedId={selectedId}
        showIndexButton
        indexActive={indexActive}
        onSelectIndex={() => {
          setIndexActive(true)
          setSelectedId(null)
        }}
        onSelect={(id) => {
          setIndexActive(false)
          setSelectedId(id)
        }}
        onClose={(id) => {
          setTabs((prev) => {
            const next = prev.filter((tab) => tab.id !== id)
            if (selectedId === id) {
              setSelectedId(next[0]?.id ?? null)
              setIndexActive(next.length === 0)
            }
            return next
          })
        }}
        showAdd
        revealAddOnHover
        addVisible={false}
        onAdd={() => {
          const nextIndex = tabs.length + 1
          const tab = createDocTabFromLink({
            title: `Issue 000${nextIndex}`,
            href: `/issues/Issue-000${nextIndex}`,
          })
          setTabs((prev) => [...prev, tab])
          setSelectedId(tab.id)
          setIndexActive(false)
        }}
      />
    )
  },
}

/** Figma `6234:11832` — selected rest. */
export const TabItemSelected = {
  render: () => (
    <div className="bg-[var(--control-bg-rest)] p-4">
      <CanvasTabItem label="Issue-0001" leadingIcon="team" selected />
    </div>
  ),
}

/** Figma `6235:11778` — non-selected rest (transparent pill). */
export const TabItemNonSelected = {
  render: () => (
    <div className="bg-[var(--control-bg-rest)] p-4">
      <CanvasTabItem label="Issue-0001" leadingIcon="team" selected={false} />
    </div>
  ),
}

/** Figma `6235:11816` — non-selected hover (white pill). */
export const TabItemNonSelectedHover = {
  render: () => (
    <div className="group bg-[var(--control-bg-rest)] p-4">
      <p className="mb-2 text-[12px] text-[#737072]">Hover the tab to preview the white pill.</p>
      <CanvasTabItem label="Issue-0001" leadingIcon="team" selected={false} />
    </div>
  ),
}

/** Figma `6237:11857` — selected rest. */
export const IndexButtonSelected = {
  render: () => (
    <div className="bg-[var(--control-bg-rest)] p-4">
      <CanvasTabIndexButton active onClick={() => {}} />
    </div>
  ),
}

/** Figma `6238:11882` — non-selected rest. */
export const IndexButtonUnselected = {
  render: () => (
    <div className="bg-[var(--control-bg-rest)] p-4">
      <CanvasTabIndexButton active={false} onClick={() => {}} />
    </div>
  ),
}

/** Figma `6240:12839` — non-selected hover (white pill). */
export const IndexButtonUnselectedHover = {
  render: () => (
    <div className="bg-[var(--control-bg-rest)] p-4">
      <p className="mb-2 text-[12px] text-[#737072]">Hover the link tab to preview the white pill.</p>
      <CanvasTabIndexButton active={false} onClick={() => {}} />
    </div>
  ),
}

/** Figma `6235:11961` — add control. */
export const AddButton = {
  render: () => (
    <div className="bg-[var(--control-bg-rest)] p-4">
      <CanvasTabAddButton onClick={() => {}} />
    </div>
  ),
}
