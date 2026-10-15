import { ChatAvatar } from "./ChatAvatar"

const meta = {
  title: "Components/ChatAvatar",
  component: ChatAvatar,
  parameters: {
    layout: "centered",
  },
}

export default meta

export const Initial = {
  args: { initial: "A" },
}

export const MemberCount = {
  args: { memberCount: 12 },
}
