import { MenuItem } from "./MenuItem"

const meta = {
  title: "Components/MenuItem",
  component: MenuItem,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    type: {
      control: "select",
      options: ["leading", "textOnly", "label"],
    },
    state: {
      control: "select",
      options: ["rest", "hover", "selected"],
    },
  },
  args: {
    type: "leading",
    state: "rest",
    label: "Date",
  },
}

export default meta

export const Leading = {}
export const TextOnly = { args: { type: "textOnly" } }
export const Label = { args: { type: "label", label: "Label" } }
