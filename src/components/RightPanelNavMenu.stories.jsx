import { useRef, useState } from "react"
import { teamById } from "../lib/workspaceLabels"
import { RightPanelNavMenu } from "./RightPanelNavMenu"

const coreProject = {
  id: "Project-0001",
  name: "Core",
  team: "Core",
  title: "Build core flow for feature",
}

const meta = {
  title: "Components/RightPanelNavMenu",
  component: RightPanelNavMenu,
  parameters: {
    layout: "centered",
  },
}

export default meta

export const Open = {
  render: () => {
    const anchorRef = useRef(null)
    const menuRef = useRef(null)
    const [open, setOpen] = useState(true)
    return (
      <div className="relative h-[480px] w-[280px]">
        <button
          ref={anchorRef}
          type="button"
          className="rounded-[4px] border border-[#ececec] px-[10px] py-[6px]"
          onClick={() => setOpen((value) => !value)}
        >
          Nav menu
        </button>
        <RightPanelNavMenu
          open={open}
          anchorRef={anchorRef}
          menuRef={menuRef}
          onClose={() => setOpen(false)}
          onNavigate={() => setOpen(false)}
          projectId="Project-0001"
          project={coreProject}
          activeTeam={teamById("Team-0001")}
          teamId="Team-0001"
          selectedHref="/computer"
          showProjectSection
        />
      </div>
    )
  },
}
