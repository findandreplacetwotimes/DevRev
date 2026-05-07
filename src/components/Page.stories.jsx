import { Page } from "./Page"

const meta = {
  title: "Components/Page",
  component: Page,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    selected: { control: "boolean" },
    variant: {
      control: "select",
      options: ["default", "selectedWithSelector", "datePicker"],
    },
    state: {
      control: "select",
      options: ["default", "hover"],
    },
  },
  args: {
    label: "Date",
    selected: false,
    variant: "default",
    state: "default",
  },
}

export default meta

export const NonSelected = {}

export const NonSelectedHover = {
  args: {
    state: "hover",
  },
}

export const Selected = {
  args: {
    selected: true,
  },
}

export const SelectedWithSelector = {
  args: {
    variant: "selectedWithSelector",
  },
}

export const DatePicker = {
  args: {
    label: "14 — 28 Jan",
    variant: "datePicker",
  },
}
