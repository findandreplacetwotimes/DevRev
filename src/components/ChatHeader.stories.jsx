import { ChatHeader } from "./ChatHeader"

const meta = {
  title: "Components/ChatHeader",
  component: ChatHeader,
  parameters: {
    layout: "padded",
  },
  args: {
    title: "Build chat",
    iconName: "chat",
  },
}

export default meta

export const Default = {
  render: (args) => (
    <div className="w-full max-w-[410px] bg-[#f2f2f3]">
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

/** Project chat lane — Figma project icon (`6044:7714`). */
export const ProjectChat = {
  args: {
    title: "Project chat",
    iconName: "project",
    avatarInitial: null,
  },
  render: Default.render,
}
