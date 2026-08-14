import { useState } from "react"
import { NavPanel } from "./NavPanel"
import { teamById } from "../lib/workspaceLabels"

const coreProject = {
  id: "Project-0001",
  name: "Core",
  team: "Core",
  title: "Build core flow for feature",
}

const meta = {
  title: "Components/NavPanel",
  component: NavPanel,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    defaultSelectedItemId: {
      control: "select",
      options: [
        "computer",
        "team:chat",
        "team:page:issues",
        "team:page:sprints",
        "team:page:projects",
        "project:chat",
        "project:page:overview",
        "project:page:scope",
        "chat-arjun",
        "chat-sneha",
        "chat-rohan",
        "chat-leela",
        "inbox",
        "discover",
        "agent-studio",
        "me",
      ],
    },
  },
  args: {
    defaultSelectedItemId: "team:chat",
    activeTeam: teamById("Team-0001"),
    activeProject: coreProject,
    projectId: "Project-0001",
    teamId: "Team-0001",
    scope: "project",
  },
}

export default meta

function NavPanelWorkbench(props) {
  const [selected, setSelected] = useState(props.defaultSelectedItemId)
  return (
    <div className="h-[640px] w-[260px] rounded-[8px] border border-[#ececec]">
      <NavPanel
        {...props}
        selectedItemId={selected}
        onSelectItem={setSelected}
      />
    </div>
  )
}

export const Default = {
  render: (args) => <NavPanelWorkbench {...args} />,
}

export const WithProjectPages = {
  args: {
    defaultSelectedItemId: "project:page:overview",
  },
  render: (args) => <NavPanelWorkbench {...args} />,
}
