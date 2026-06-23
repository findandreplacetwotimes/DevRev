import { ChatHeader } from "./ChatHeader"

const meta = {
  title: "Components/ChatHeader",
  component: ChatHeader,
  parameters: {
    layout: "padded",
  },
  args: {
    title: "Build team chat",
    memberCount: 12,
    showCanvasToggle: true,
    canvasPanelOpen: true,
    onToggleCanvasPanel: () => {},
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

export const CanvasPanelClosed = {
  args: {
    title: "Computer",
    iconName: "computer",
    showCanvasToggle: true,
    canvasPanelOpen: false,
    onToggleCanvasPanel: () => {},
  },
  render: Default.render,
}
