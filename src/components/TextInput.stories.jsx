import { TextInput } from "./TextInput"

const meta = {
  title: "Components/TextInput",
  component: TextInput,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    type: {
      control: "select",
      options: ["default", "leading", "inline", "inlineRight", "rounded"],
    },
    construction: {
      control: "select",
      options: [undefined, "Rounded", "Leading"],
    },
    state: {
      control: "select",
      options: ["default", "empty", "filled", "hover"],
    },
    size: {
      control: "select",
      options: ["default", "large"],
    },
  },
  args: {
    type: "default",
    state: "empty",
  },
}

export default meta

export const Default = {}

export const Leading = {
  args: { type: "leading" },
}

export const Inline = {
  args: { type: "inline" },
}

export const InlineRight = {
  args: { type: "inlineRight" },
}

export const Large = {
  args: { size: "large" },
}

export const Rounded = {
  args: {
    type: "rounded",
    value: "14 — 28 Jan",
    state: "default",
  },
}
