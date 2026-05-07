import { MessageInput } from "./MessageInput"

const meta = {
  title: "Components/MessageInput",
  component: MessageInput,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    mode: {
      control: "select",
      options: ["ai", "message"],
    },
  },
  args: {
    mode: "ai",
    initialValue: "",
  },
}

export default meta

export const AI = {}

export const Message = {
  args: {
    mode: "message",
  },
}
