import { ChatRelatedLinksPanel } from "./ChatRelatedLinksMenu"
import { CHAT_CANVAS_LABEL } from "../lib/chatRelatedLinks"

const meta = {
  title: "Components/ChatRelatedLinksPanel",
  component: ChatRelatedLinksPanel,
  parameters: {
    layout: "fullscreen",
  },
}

export default meta

export const PersonChat = {
  args: {
    canvasLabel: CHAT_CANVAS_LABEL,
    links: [
      { key: "Doc-0001", title: "Core flow spec" },
      { key: "Doc-0002", title: "Nav interaction notes" },
      { key: "Doc-0003", title: "Build core flow overview" },
    ],
  },
  render: (args) => (
    <div className="flex h-screen w-[274px] bg-white">
      <ChatRelatedLinksPanel {...args} />
    </div>
  ),
}

export const TeamChat = {
  args: {
    canvasLabel: CHAT_CANVAS_LABEL,
    links: [
      { key: "Doc-0001", title: "Q2 planning brief" },
      { key: "Doc-0002", title: "Core flow spec" },
      { key: "Doc-0003", title: "Nav interaction notes" },
      { key: "Doc-0004", title: "API schema reference" },
    ],
  },
  render: PersonChat.render,
}

export const ProjectChat = {
  args: {
    canvasLabel: CHAT_CANVAS_LABEL,
    links: [
      { key: "Doc-0001", title: "Project brief" },
      { key: "Doc-0002", title: "Scope and milestones" },
      { key: "Doc-0003", title: "Reference links" },
    ],
  },
  render: PersonChat.render,
}
