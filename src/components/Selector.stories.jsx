import { Selector } from "./Selector"

const meta = {
  title: "Components/Selector",
  component: Selector,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["hidden", "notSelected", "selected"],
    },
    interactive: { control: "boolean" },
  },
  args: {
    variant: "notSelected",
    interactive: true,
    onPress: () => {},
  },
}

export default meta

export const Hidden = {
  args: {
    variant: "hidden",
    interactive: false,
  },
}

export const NotSelected = {
  args: {
    variant: "notSelected",
    interactive: true,
  },
}

export const Selected = {
  args: {
    variant: "selected",
    interactive: true,
  },
}

export const HeaderDecorator = {
  name: "Not selected (non-interactive)",
  args: {
    variant: "notSelected",
    interactive: false,
  },
}
