import { useRef, useState } from "react"
import { MentionMenu } from "./MentionMenu"

const ITEMS = [
  { id: "computer", label: "Computer", kind: "computer" },
  { id: "arjun", label: "Arjun", kind: "person" },
  { id: "sneha", label: "Sneha", kind: "person" },
  { id: "rohan", label: "Rohan", kind: "person" },
]

const meta = {
  title: "Components/MentionMenu",
  component: MentionMenu,
  parameters: {
    layout: "centered",
  },
}

export default meta

export const Open = {
  render: () => {
    const menuRef = useRef(null)
    const [highlightIndex, setHighlightIndex] = useState(0)
    return (
      <div className="relative h-[240px] w-[280px]">
        <MentionMenu
          open
          left={24}
          top={24}
          items={ITEMS}
          highlightIndex={highlightIndex}
          menuRef={menuRef}
          onPick={() => {}}
          onHighlightChange={setHighlightIndex}
        />
      </div>
    )
  },
}
