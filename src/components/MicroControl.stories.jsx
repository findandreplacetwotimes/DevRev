import { MicroControl } from "./MicroControl"

const meta = {
  title: "Components/MicroControl",
  component: MicroControl,
  parameters: {
    layout: "centered",
  },
}

export default meta

/** Figma `6070:7981` — icon-only 22×22 (default reply micro icon). */
export const IconOnly = {
  args: {
    variant: "iconOnly",
    iconName: "reply",
  },
}

/** Figma `6070:8076` — text-only capsule ("Thinking"). */
export const Thinking = {
  args: {
    variant: "textOnly",
    textLabel: "Thinking",
  },
}

/** Figma `6071:7937` — TAB badge variant. */
export const TabBadge = {
  args: {
    variant: "tab",
    tabLabel: "TAB",
  },
}

export const InteractiveIcon = {
  args: {
    variant: "iconOnly",
    ariaLabel: "Reply",
    onPress: () => {},
  },
}
