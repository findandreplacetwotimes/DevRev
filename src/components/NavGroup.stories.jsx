import { useState } from "react"
import { NavGroup } from "./NavGroup"
import { NavItem } from "./NavItem"

const meta = {
  title: "Components/NavGroup",
  component: NavGroup,
  parameters: {
    layout: "centered",
  },
  args: {
    label: "Build team",
    iconName: "team",
    defaultExpanded: true,
  },
}

export default meta

const navShell = (node) => (
  <div className="w-[220px] rounded-[8px] border border-[#ececec] bg-white px-[12px] py-[14px]">
    {node}
  </div>
)

export const Default = {
  render: (args) =>
    navShell(
      <NavGroup {...args}>
        <NavItem label="Chat" iconName="mp" className="w-full" />
        <NavItem label="Issues" iconName="page" className="w-full" />
        <NavItem label="Sprints" iconName="page" className="w-full" />
        <NavItem label="Projects" iconName="page" className="w-full" />
        <NavItem label="About" iconName="page" className="w-full" />
      </NavGroup>
    ),
}

export const Collapsed = {
  args: {
    defaultExpanded: false,
  },
  render: Default.render,
}

export const EditingFolderName = {
  args: {
    label: "New folder",
    sectionLabel: true,
    editing: true,
    onLabelCommit: () => {},
    onLabelCancel: () => {},
  },
  render: (args) => navShell(<NavGroup {...args} />),
}

export const EditingFolderNameInteractive = {
  render: () => {
    const [label, setLabel] = useState("Design research")
    const [editing, setEditing] = useState(true)
    const [lastAction, setLastAction] = useState(null)

    return navShell(
      <div className="flex w-full flex-col gap-[8px]">
        <NavGroup
          label={label}
          sectionLabel
          editing={editing}
          onLabelCommit={(next) => {
            if (next) setLabel(next)
            setEditing(false)
            setLastAction(next ? `Renamed to “${next}”` : "Cancelled (empty name)")
          }}
          onLabelCancel={() => {
            setEditing(false)
            setLastAction("Cancelled")
          }}
        >
          <NavItem label="Build team" iconName="chat" className="w-full" />
        </NavGroup>
        {!editing ? (
          <button
            type="button"
            className="text-left text-[11px] text-[#737072] underline"
            onClick={() => {
              setEditing(true)
              setLastAction(null)
            }}
          >
            Restart rename
          </button>
        ) : null}
        {lastAction ? <p className="text-[11px] text-[#737072]">{lastAction}</p> : null}
      </div>
    )
  },
}
