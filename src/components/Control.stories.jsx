import { Control } from "./Control"

const meta = {
  title: "Components/Control",
  component: Control,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    type: {
      control: "select",
      options: ["leadingTrailing", "leading", "inline", "iconOnly", "trailing", "textOnly"],
    },
    size: {
      control: "select",
      options: ["default", "large"],
    },
    shape: {
      control: "select",
      options: ["square", "pill"],
    },
    state: {
      control: "select",
      options: ["rest", "hover", "inline"],
    },
  },
  args: {
    label: "Date",
    type: "leadingTrailing",
    shape: "square",
    state: "rest",
  },
}

export default meta

export const LeadingTrailing = {}

export const Leading = {
  args: {
    type: "leading",
  },
}

export const LeadingInline = {
  args: {
    type: "leading",
    state: "inline",
  },
}

export const Inline = {
  args: {
    type: "inline",
  },
}

export const TextOnly = {
  args: {
    type: "textOnly",
  },
}

export const TextOnlyInline = {
  args: {
    type: "textOnly",
    state: "inline",
  },
}

export const IconOnly = {
  args: {
    type: "iconOnly",
  },
}

export const IconOnlyInline = {
  args: {
    type: "iconOnly",
    state: "inline",
  },
}

export const Trailing = {
  args: {
    type: "trailing",
  },
}

export const TrailingInline = {
  args: {
    type: "trailing",
    state: "inline",
  },
}

export const LeadingTrailingInline = {
  args: {
    type: "leadingTrailing",
    state: "inline",
  },
}

export const PillLeadingTrailing = {
  args: {
    shape: "pill",
  },
}

export const PillLeading = {
  args: {
    shape: "pill",
    type: "leading",
  },
}

export const PillTextOnly = {
  args: {
    shape: "pill",
    type: "textOnly",
  },
}

export const PillIconOnly = {
  args: {
    shape: "pill",
    type: "iconOnly",
  },
}

export const PillTrailing = {
  args: {
    shape: "pill",
    type: "trailing",
  },
}

export const LargeIconOnly = {
  args: {
    size: "large",
    type: "iconOnly",
    leadingIcon: "plus",
  },
}

export const LargeLeading = {
  args: {
    size: "large",
    type: "leading",
    leadingIcon: "plus",
  },
}
