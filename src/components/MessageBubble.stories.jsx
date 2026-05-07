import { MessageBubble } from "./MessageBubble"

const meta = {
  title: "Components/MessageBubble",
  component: MessageBubble,
  parameters: {
    layout: "padded",
  },
  args: {
    text: "Hi, can you help me with it",
    type: "me",
  },
  argTypes: {
    type: {
      control: "select",
      options: ["me", "person", "groupPerson"],
    },
    senderInitial: { control: "text", if: { arg: "type", eq: "groupPerson" } },
  },
}

export default meta

export const OneLine = {}

export const ManyLines = {
  args: {
    text: "Hi, can you help me with it\nHi, can you help me with it\nHi, can you help me with it",
  },
}

export const PersonOneLine = {
  args: {
    type: "person",
    text: "Hi, can you help me with it",
  },
}

export const PersonManyLines = {
  args: {
    type: "person",
    text: "Hi, can you help me with it\nHi, can you help me with it\nHi, can you help me with it",
  },
}

export const PersonWriting = {
  args: {
    type: "person",
    state: "writing",
  },
}

/** Figma `6003:6852` — group / channel reply with sender chip + bubble (`items-end`, 14px gap). */
export const GroupPersonOneLine = {
  args: {
    type: "groupPerson",
    senderInitial: "M",
    text: "Hi, can you help me with it",
  },
}

export const GroupPersonManyLines = {
  args: {
    type: "groupPerson",
    senderInitial: "R",
    text: "Yes, backend is stable. We still need keyboard nav + final QA pass on breadcrumbs and chat state.",
  },
}

export const GroupPersonWriting = {
  args: {
    type: "groupPerson",
    senderInitial: "A",
    state: "writing",
  },
}
