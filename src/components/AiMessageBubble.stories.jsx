import { AiMessageBubble } from "./AiMessageBubble"

const meta = {
  title: "Components/AiMessageBubble",
  component: AiMessageBubble,
  parameters: {
    layout: "padded",
  },
  args: {
    loading: true,
    text: "Hi, can you help me with itHi, can you help me with it Hi, can you help me with itHi, can you help me with",
  },
}

export default meta

export const Thinking = {}

export const Thoughts = {
  args: {
    loading: false,
  },
}
