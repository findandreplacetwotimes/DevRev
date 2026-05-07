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
