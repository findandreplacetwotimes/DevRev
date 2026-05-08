import { Icon } from "./Icon"

const meta = {
  title: "Components/Icon",
  component: Icon,
  parameters: {
    layout: "centered",
  },
  args: {
    name: "team",
    size: "default",
  },
  argTypes: {
    name: {
      control: "select",
      options: [
        "team",
        "chat",
        "calendar",
        "search",
        "check",
        "circle",
        "selected",
        "person",
        "avatarWhite",
        "chevronDown",
        "chevronUp",
        "more",
        "close",
        "plus",
        "arrowUp",
        "arrowRight",
        "page",
        "project",
        "agent",
        "inbox",
        "discover",
        "filter",
        "clock",
        "computer",
      ],
    },
    size: {
      control: "select",
      options: ["default", "large"],
    },
  },
}

export default meta

export const Team = {}

export const Calendar = {
  args: {
    name: "calendar",
  },
}

export const ChevronDown = {
  args: {
    name: "chevronDown",
  },
}

export const ChevronUp = {
  args: {
    name: "chevronUp",
  },
}

export const More = {
  args: {
    name: "more",
  },
}

export const Search = {
  args: {
    name: "search",
  },
}

export const Check = {
  args: {
    name: "check",
  },
}

export const Circle = {
  args: {
    name: "circle",
  },
}

export const Selected = {
  args: {
    name: "selected",
  },
}

export const Close = {
  args: {
    name: "close",
  },
}

export const Plus = {
  args: {
    name: "plus",
  },
}

export const ArrowUp = {
  args: {
    name: "arrowUp",
  },
}

/** Figma `6003:7021` — `Icons/Arrow.up` rotated 90° inside 28×28. */
export const ArrowRight = {
  args: {
    name: "arrowRight",
  },
}

export const Page = {
  args: {
    name: "page",
  },
}

/** Figma `6044:7714` — Icons/Project (nav), 28×28. */
export const Project = {
  args: {
    name: "project",
  },
}

export const Agent = {
  args: {
    name: "agent",
  },
}

export const Inbox = {
  args: {
    name: "inbox",
  },
}

export const Discover = {
  args: {
    name: "discover",
  },
}

export const Filter = {
  args: {
    name: "filter",
  },
}

export const Clock = {
  args: {
    name: "clock",
  },
}
