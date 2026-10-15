import { useState } from "react"
import { OWNERS } from "../lib/owners"
import { OwnerSelector } from "./OwnerSelector"

const meta = {
  title: "Components/OwnerSelector",
  component: OwnerSelector,
  parameters: {
    layout: "centered",
  },
}

export default meta

export const Default = {
  render: () => {
    const [selectedOwnerId, setSelectedOwnerId] = useState(OWNERS[0]?.id ?? null)
    return (
      <OwnerSelector
        owners={OWNERS}
        selectedOwnerId={selectedOwnerId}
        onChange={setSelectedOwnerId}
      />
    )
  },
}

export const Empty = {
  render: () => {
    const [selectedOwnerId, setSelectedOwnerId] = useState(null)
    return (
      <OwnerSelector
        owners={OWNERS}
        selectedOwnerId={selectedOwnerId}
        onChange={setSelectedOwnerId}
      />
    )
  },
}
