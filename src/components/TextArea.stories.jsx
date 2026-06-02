import { TextArea } from "./TextArea"

const meta = {
  title: "Components/TextArea",
  component: TextArea,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    minRows: {
      control: { type: "number", min: 1, max: 6, step: 1 },
    },
  },
  args: {
    placeholder: "Placeholder",
    minRows: 1,
  },
}

export default meta

export const Placeholder = {}

export const Filled = {
  args: {
    initialValue: "adcasascfasdfsfadsfdasfasfasfa\ncddscdsc",
  },
}

/** Type `@` to open the mention menu — Figma `5893:38435`, menu `6077:38175`. */
export const WithAtMentionInText = {
  args: {
    initialValue: "@Computer please review",
  },
}
