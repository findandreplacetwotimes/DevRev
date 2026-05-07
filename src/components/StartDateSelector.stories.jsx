import { useState } from "react"
import { StartDateSelector } from "./StartDateSelector"

const meta = {
  title: "Components/StartDateSelector",
  component: StartDateSelector,
  parameters: {
    layout: "centered",
  },
}

export default meta

export const Default = {
  render: () => {
    const [value, setValue] = useState("2026-05-27")
    return <StartDateSelector value={value} onChange={setValue} />
  },
}
