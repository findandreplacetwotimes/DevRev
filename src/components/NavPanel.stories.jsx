import { useState } from "react"
import { NavPanel } from "./NavPanel"

const meta = {
  title: "Components/NavPanel",
  component: NavPanel,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    defaultSelectedItemId: {
      control: "select",
      options: ["build-team", "issues", "sprints", "inbox", "discover", "agent-studio", "me"],
    },
  },
  args: {
    defaultSelectedItemId: "build-team",
  },
}

export default meta

function NavPanelWorkbench(props) {
  const [chat, setChat] = useState(true)
  const [record, setRecord] = useState(true)
  return (
    <div className="h-[560px] w-[260px] border border-[#ececec] rounded-[8px]">
      <NavPanel
        {...props}
        chatPanelOpen={chat}
        recordPanelOpen={record}
        onToggleChatPanel={() =>
          setChat((c) => {
            if (c && !record) return c
            return !c
          })
        }
        onToggleRecordPanel={() =>
          setRecord((r) => {
            if (r && !chat) return r
            return !r
          })
        }
      />
    </div>
  )
}

export const Default = {
  render: (args) => <NavPanelWorkbench {...args} />,
}
