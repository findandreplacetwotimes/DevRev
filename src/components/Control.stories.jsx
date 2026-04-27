import { Control } from "./Control"

const meta = {
  title: "Components/Control",
  component: Control,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["leadingIcon", "leadingIconStroke", "textOnly"],
    },
  },
  args: {
    label: "Date",
    variant: "leadingIcon",
  },
}

export default meta

export const LeadingIcon = {}

export const LeadingIconStroke = {
  args: {
    variant: "leadingIconStroke",
  },
}

export const TextOnly = {
  args: {
    variant: "textOnly",
  },
}
