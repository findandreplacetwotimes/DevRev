import { Selector } from "./Selector"
import { TableHeaderCell } from "./TableHeaderCell"

const meta = {
  title: "Components/TableHeaderCell",
  component: TableHeaderCell,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "control"],
    },
    state: {
      control: "select",
      options: ["rest", "hover"],
    },
    dividerBefore: { control: "boolean" },
  },
  args: {
    label: "Label",
    type: "text",
    state: "rest",
    dividerBefore: false,
  },
}

export default meta

export const Text = {}

/** Figma variant: LABEL only. */
export const TextPlain = {
  args: {
    leading: undefined,
    dividerBefore: false,
  },
}

/** Figma variant: divider + LABEL */
export const TextSeparator = {
  args: {
    dividerBefore: true,
    leading: undefined,
  },
}

/** Figma variant: row-select + LABEL */
export const TextWithSelection = {
  args: {
    leading: <Selector variant="notSelected" />,
    dividerBefore: false,
  },
}

export const ControlRest = {
  args: {
    type: "control",
    state: "rest",
  },
}

/** Hover left chrome `5926:40208`: 11×2 @ −1 left */
export const ControlHover = {
  args: {
    type: "control",
    state: "hover",
  },
}
