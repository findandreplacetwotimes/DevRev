import { ChatRelatedLinksPanel } from "./ChatRelatedLinksMenu"

const meta = {
  title: "Components/ChatRelatedLinksPanel",
  component: ChatRelatedLinksPanel,
  parameters: {
    layout: "fullscreen",
  },
}

export default meta

export const AiChat = {
  args: {
    links: [
      { id: "projects", title: "Projects" },
      { id: "issues", title: "Issues" },
      { id: "views", title: "Views" },
    ],
  },
  render: (args) => (
    <div className="flex h-screen w-[274px] bg-white">
      <ChatRelatedLinksPanel {...args} />
    </div>
  ),
}

export const SidePanel = {
  args: {
    links: [
      { key: "Issue-0001", title: "Build core flow for feature", href: "/issues/Issue-0001" },
      { key: "Issue-0003", title: "Polish nav-panel interactions", href: "/issues/Issue-0003" },
      { key: "Project-0001", title: "Overview", href: "/projects/Project-0001" },
    ],
  },
  render: (args) => (
    <div className="flex h-screen w-[274px] bg-white">
      <ChatRelatedLinksPanel {...args} />
    </div>
  ),
}
