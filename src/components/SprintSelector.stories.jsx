import { useState } from "react"
import { SPRINT_ALLOWED } from "../lib/issueProjectSchema"
import { SprintSelector } from "./SprintSelector"

const meta = {
  title: "Components/SprintSelector",
  component: SprintSelector,
  parameters: {
    layout: "centered",
  },
}

export default meta

export const Default = {
  render: () => {
    const [value, setValue] = useState("Sprint 3")
    return <SprintSelector value={value} options={SPRINT_ALLOWED} onChange={setValue} />
  },
}
