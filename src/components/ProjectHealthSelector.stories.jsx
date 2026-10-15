import { useState } from "react"
import { ProjectHealthSelector } from "./ProjectHealthSelector"

const meta = {
  title: "Components/ProjectHealthSelector",
  component: ProjectHealthSelector,
  parameters: {
    layout: "centered",
  },
}

export default meta

export const Default = {
  render: () => {
    const [value, setValue] = useState("on-track")
    return <ProjectHealthSelector value={value} onChange={setValue} />
  },
}
