import { NewChatParticipantChip } from "./NewChatParticipantChip"

const meta = {
  title: "Components/NewChatParticipantChip",
  component: NewChatParticipantChip,
  parameters: { layout: "padded" },
}

export default meta

/** Figma `6232:11750`. */
export const Default = {
  args: {
    label: "Arjun Patel",
    initial: "A",
    onRemove: () => {},
  },
  render: (args) => (
    <div className="bg-white p-4">
      <NewChatParticipantChip {...args} />
    </div>
  ),
}

export const TwoChips = {
  render: () => (
    <div className="flex gap-[6px] bg-white p-4">
      <NewChatParticipantChip label="Arjun Patel" initial="A" onRemove={() => {}} />
      <NewChatParticipantChip label="Manasa" initial="M" onRemove={() => {}} />
    </div>
  ),
}
