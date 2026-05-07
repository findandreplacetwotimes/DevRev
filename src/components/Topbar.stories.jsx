import { useState } from "react"
import { getDueDateOptions } from "../lib/dueDates"
import { OWNERS } from "../lib/owners"
import { Topbar } from "./Topbar"

const meta = {
  title: "Components/Topbar",
  component: Topbar,
  parameters: {
    layout: "padded",
  },
}

export default meta

function TopbarPlayground() {
  const [activeTab, setActiveTab] = useState("Overview")
  const [ownerId, setOwnerId] = useState(OWNERS[0]?.id ?? null)
  const [dueDateId, setDueDateId] = useState(getDueDateOptions()[0]?.id ?? null)
  return (
    <div className="w-full max-w-[960px] rounded-[2px] border border-[#e8e8e8] bg-white">
      <Topbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="twoLine"
        owners={OWNERS}
        ownerId={ownerId}
        onOwnerChange={setOwnerId}
        dueDateId={dueDateId}
        onDueDateChange={setDueDateId}
      />
      <p className="p-4 text-sm text-[#211e20]">Active tab: {activeTab}</p>
    </div>
  )
}

export const Default = {
  render: () => <TopbarPlayground />,
}

export const OneLine = {
  render: () => {
    const [activeTab, setActiveTab] = useState("Overview")
    return (
      <div className="w-full max-w-[960px] rounded-[2px] border border-[#e8e8e8] bg-white">
        <Topbar activeTab={activeTab} onTabChange={setActiveTab} variant="oneLine" />
      </div>
    )
  },
}
