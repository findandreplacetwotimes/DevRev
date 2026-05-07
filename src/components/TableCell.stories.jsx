import { useState } from "react"
import { getDueDateOptions } from "../lib/dueDates"
import { OWNERS } from "../lib/owners"
import { TableCell } from "./TableCell"

const meta = {
  title: "Components/TableCell",
  component: TableCell,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "control", "team", "smallText"],
    },
    selectorType: {
      control: "select",
      options: ["owner", "date"],
    },
  },
  args: {
    type: "text",
    ticketPrefix: "BLD",
    ticketNumber: "2343",
    text: "Build core flow for feature",
    selectorType: "owner",
    showSelectionControl: true,
    rowSelected: false,
    teamName: "Manasa Lingamallu",
    teamInitial: "M",
    smallText: "Product Manager",
  },
}

export default meta

export const Text = {}

export const TextMutedNoSelect = {
  args: {
    showSelectionControl: false,
  },
}

export const TextWithSelectUnchecked = {
  args: {
    showSelectionControl: true,
    rowSelected: false,
  },
}

export const TextWithSelectChecked = {
  args: {
    showSelectionControl: true,
    rowSelected: true,
  },
}

export const Team = {
  args: {
    type: "team",
    teamName: "Manasa Lingamallu",
    teamInitial: "M",
  },
}

export const SmallText = {
  args: {
    type: "smallText",
    smallText: "manasa.lingamallu@devrev.ai",
  },
}

function ControlCellPlayground({ selectorType = "owner" }) {
  const [ownerId, setOwnerId] = useState(OWNERS[0]?.id ?? null)
  const [dueDateId, setDueDateId] = useState(getDueDateOptions()[0]?.id ?? null)

  return (
    <div className="w-[691px] bg-white">
      <TableCell
        type="control"
        selectorType={selectorType}
        owners={OWNERS}
        ownerId={ownerId}
        onOwnerChange={setOwnerId}
        dueDateId={dueDateId}
        onDueDateChange={setDueDateId}
      />
    </div>
  )
}

export const ControlOwner = {
  render: () => <ControlCellPlayground selectorType="owner" />,
}

export const ControlDate = {
  render: () => <ControlCellPlayground selectorType="date" />,
}

export const ControlDateEmpty = {
  args: {
    type: "control",
    selectorType: "date",
    dueDateId: null,
    tableEmptyGreyLabels: true,
  },
}

export const ControlOwnerEmpty = {
  args: {
    type: "control",
    selectorType: "owner",
    ownerId: null,
    tableEmptyGreyLabels: true,
  },
}
