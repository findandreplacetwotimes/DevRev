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
        "chatBubbles",
        "mp",
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
        "sidePanel",
        "close",
        "plus",
        "arrowUp",
        "arrowRight",
        "arrowRightSmall",
        "reply",
        "page",
        "canvas",
        "project",
        "projectChat",
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
      options: ["default", "large", "micro"],
    },
  },
}

export default meta

export const Team = {}

/** Figma `5517:35117` — Icons/Chat.bubbles. */
export const ChatBubbles = {
  args: {
    name: "chatBubbles",
  },
}

/** Figma `5991:7650` — MP icon variant, using the message/chat bubble glyph. */
export const Mp = {
  args: {
    name: "mp",
  },
}

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

/** Figma `6069:8208` — Reply, Micro (22×22). */
export const ReplyMicro = {
  args: {
    name: "reply",
    size: "micro",
  },
}

/** Figma `6003:7021` — `Icons/Arrow.up` rotated 90° inside 28×28. */
export const ArrowRight = {
  args: {
    name: "arrowRight",
  },
}

/** Figma `6089:9419` — `Icons/Arrow.right` Small (thin stroked), 28×28. */
export const ArrowRightSmall = {
  args: {
    name: "arrowRightSmall",
  },
}

export const Page = {
  args: {
    name: "page",
  },
}

/** Figma `6235:12006` — Icons/Three.bars.horizontal (Canvas). */
export const Canvas = {
  args: {
    name: "canvas",
  },
}

/** Figma `6044:7714` — Icons/Project (nav), 28×28. */
export const Project = {
  args: {
    name: "project",
  },
}

/** Figma `6152:15072` — Icons/Project chat (circle + grid). */
export const ProjectChat = {
  args: {
    name: "projectChat",
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

/** Figma `6232:11970` — Icons/Dot.in.left.window (Side panel). */
export const SidePanel = {
  args: {
    name: "sidePanel",
  },
}
