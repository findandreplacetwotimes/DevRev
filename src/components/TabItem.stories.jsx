import { TabItem } from "./TabItem"

const meta = {
  title: "Components/TabItem",
  component: TabItem,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    type: {
      control: "select",
      options: ["nonSelected", "selected"],
    },
    state: {
      control: "select",
      options: ["rest", "hover"],
    },
  },
  args: {
    type: "nonSelected",
    state: "rest",
    prefix: "Issue",
    suffix: "-0001",
  },
}

export default meta

export const NonSelectedRest = {}

export const NonSelectedHover = {
  args: {
    state: "hover",
  },
}

export const SelectedRest = {
  args: {
    type: "selected",
  },
}

export const SelectedHover = {
  args: {
    type: "selected",
    state: "hover",
  },
}
