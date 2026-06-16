import { ChatHeader } from "./ChatHeader"
import { CHAT_CANVAS_LABEL } from "../lib/chatRelatedLinks"

const meta = {
  title: "Components/ChatHeader",
  component: ChatHeader,
  parameters: {
    layout: "padded",
  },
  args: {
    title: "Build team chat",
    memberCount: 12,
    canvasLabel: CHAT_CANVAS_LABEL,
    relatedLinks: [
      { key: "Doc-0001", title: "Q2 planning brief" },
      { key: "Doc-0002", title: "Core flow spec" },
      { key: "Doc-0003", title: "Nav interaction notes" },
    ],
  },
}

export default meta

export const Default = {
  render: (args) => (
    <div className="w-full max-w-[377px] bg-white">
      <ChatHeader {...args} />
    </div>
  ),
}

/** Figma `5893:38592` — AI/computer lane uses dark tile + glyph. */
export const Computer = {
  args: {
    title: "Computer",
    iconName: "computer",
    avatarInitial: null,
  },
  render: Default.render,
}

/** Person DMs: grey chip avatar (same as nav CHATS list). */
export const PersonChat = {
  args: {
    title: "Arjun Patel",
    avatarInitial: "A",
    iconName: "chat",
  },
  render: Default.render,
}

/** Narrow layout — leading icon opens the workspace nav menu (Figma `6199:11474`). */
export const NarrowNavMenu = {
  args: {
    title: "Build Team Chat",
    memberCount: 12,
    navMenuEnabled: true,
    teamId: "Team-0001",
    projectId: "Project-0001",
    showProjectSection: true,
    onNavigate: () => {},
  },
  render: Default.render,
}

/** Group chat — member-count avatar (same as nav). */
export const TeamGroupChat = {
  args: {
    title: "Build team chat",
    memberCount: 12,
    avatarInitial: null,
  },
  render: Default.render,
}

/** Project group chat — member-count avatar (same as nav). */
export const ProjectGroupChat = {
  args: {
    title: "Project chat",
    memberCount: 23,
    avatarInitial: null,
  },
  render: Default.render,
}
