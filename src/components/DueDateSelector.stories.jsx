import { useState } from "react"
import { DueDateSelector } from "./DueDateSelector"

const meta = {
  title: "Components/DueDateSelector",
  component: DueDateSelector,
  parameters: {
    layout: "centered",
  },
}

export default meta

export const Default = {
  render: () => {
    const [value, setValue] = useState("today")
    return <DueDateSelector value={value} onChange={setValue} />
  },
}

export const Empty = {
  render: () => {
    const [value, setValue] = useState(null)
    return <DueDateSelector value={value} onChange={setValue} />
  },
}
