import { NavItem } from "./NavItem"

const meta = {
  title: "Components/NavItem",
  component: NavItem,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    selected: {
      control: "boolean",
    },
  },
  args: {
    label: "Issues",
    selected: false,
  },
}

export default meta

export const Default = {}

export const Selected = {
  args: {
    selected: true,
  },
}

export const ID = {
  args: {
    idLabel: "ISS-0001",
    label: "Long name as",
    iconName: "page",
  },
}

export const IDSelected = {
  args: {
    ...ID.args,
    selected: true,
  },
}
