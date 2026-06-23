import { getChatLinkPanelSections } from "../lib/chatRelatedLinks"
import { CanvasLinkPanelTab } from "./CanvasLinkPanelTab"

const meta = {
  title: "Components/CanvasLinkPanelTab",
  component: CanvasLinkPanelTab,
  parameters: {
    layout: "fullscreen",
  },
}

export default meta

const sections = getChatLinkPanelSections({
  variant: "build-team",
  linkedProjectChat: null,
  relatedChatsRegistry: {},
  currentChatId: "build-team",
})

export const BuildTeam = {
  render: () => (
    <div className="flex h-[600px] w-full border border-[#ececec]">
      <CanvasLinkPanelTab
        sections={sections}
        currentChatId="build-team"
        onSelect={() => {}}
        onSelectChat={() => {}}
        onNavigate={() => {}}
      />
    </div>
  ),
}
