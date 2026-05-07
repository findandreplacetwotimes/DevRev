import { useState } from "react"
import { SprintSelected } from "./SprintSelected"

const meta = {
  title: "Components/SprintSelected",
  component: SprintSelected,
  parameters: {
    layout: "centered",
  },
}

export default meta

export const Default = {
  render: () => {
    const [sprint, setSprint] = useState("Sprint 5")
    const [startDate, setStartDate] = useState("2026-05-27")
    return (
      <SprintSelected
        sprint={sprint}
        sprintOptions={["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4", "Sprint 5"]}
        onSprintChange={setSprint}
        startDate={startDate}
        onStartDateChange={setStartDate}
      />
    )
  },
}
