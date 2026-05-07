import { ChatWindow } from "./ChatWindow"

const meta = {
  title: "Components/ChatWindow",
  component: ChatWindow,
  parameters: {
    layout: "padded",
  },
}

export default meta

export const Default = {
  render: () => (
    <div className="bg-white">
      <ChatWindow />
    </div>
  ),
}

export const PersonChat = {
  render: () => (
    <div className="bg-white">
      <ChatWindow variant="person" />
    </div>
  ),
}
