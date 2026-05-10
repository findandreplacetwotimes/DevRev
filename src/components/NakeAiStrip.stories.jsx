import { useState } from "react"
import { NakeAiStrip } from "./NakeAiStrip"

const meta = {
  title: "Components/NakeAiStrip",
  component: NakeAiStrip,
  parameters: {
    layout: "centered",
  },
}

export default meta

export const Default = {
  render: () => {
    const [value, setValue] = useState("")
    return (
      <div className="w-[680px] max-w-[90vw] p-4 bg-white">
        <NakeAiStrip
          value={value}
          onChange={setValue}
          onSubmit={(text) => {
            window.console.log("submit", text)
            setValue("")
          }}
        />
      </div>
    )
  },
}

export const Disabled = {
  render: () => (
    <div className="w-[680px] max-w-[90vw] p-4 bg-white">
      <NakeAiStrip value="" placeholder="Text" disabled />
    </div>
  ),
}
