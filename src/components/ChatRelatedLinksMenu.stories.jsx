import { ChatRelatedLinksPanel } from "./ChatRelatedLinksMenu"
import { createSeedRegistry } from "../lib/relatedChats"

const meta = {
  title: "Components/ChatRelatedLinksPanel",
  component: ChatRelatedLinksPanel,
  parameters: {
    layout: "fullscreen",
  },
}

export default meta

const panelShell = (args) => (
  <div className="flex h-screen w-[274px] bg-white">
    <ChatRelatedLinksPanel {...args} />
  </div>
)

export const PersonChat = {
  args: {
    sections: [
      {
        id: "pages",
        label: "LINKS",
        kind: "record",
        links: [
          { key: "Issue-0001", title: "Build core flow for feature", href: "/issues/Issue-0001" },
          { key: "Issue-0003", title: "Polish nav-panel interactions", href: "/issues/Issue-0003" },
          { key: "Project-0001", title: "Build core flow", href: "/projects/Project-0001" },
        ],
      },
    ],
  },
  render: panelShell,
}

export const AiChat = {
  args: {
    sections: [
      {
        id: "pages",
        label: "PAGES",
        kind: "record",
        links: [
          { id: "projects", title: "Projects" },
          { id: "issues", title: "Issues" },
          { id: "views", title: "Views" },
        ],
      },
    ],
  },
  render: panelShell,
}

export const WithRelatedChats = {
  args: {
    currentChatId: "build-team",
    sections: [
      {
        id: "pages",
        label: "TEAM PAGES",
        kind: "record",
        links: [
          { title: "Issues", href: "/issues" },
          { title: "Sprints", href: "/sprints" },
          { title: "Projects", href: "/projects" },
        ],
      },
      {
        id: "chats",
        label: "RELATED CHATS",
        kind: "chat",
        chats: [
          createSeedRegistry()["build-team"],
      {
        id: "chat-branch-1",
        title: "Arjun, Sneha",
        participants: [
          { id: "arjun", label: "Arjun Patel", initial: "A" },
          { id: "sneha", label: "Sneha Sharma", initial: "S" },
        ],
        context: { type: "team" },
        parentChatId: "build-team",
        rootChatId: "build-team",
        createdAt: 1,
      },
      {
        id: "chat-project-Project-0001",
        title: "Core flow",
        participants: [],
        context: { type: "project", projectId: "Project-0001" },
        parentChatId: null,
        rootChatId: "chat-project-Project-0001",
        createdAt: 0,
      },
        ],
      },
    ],
  },
  render: panelShell,
}
