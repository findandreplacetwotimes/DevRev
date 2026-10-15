import { SessionTabAddControl } from "./SessionTabAddControl"

const meta = {
  title: "Components/SessionTabAddControl",
  component: SessionTabAddControl,
  parameters: {
    layout: "centered",
  },
}

export default meta

export const Default = {
  render: () => (
    <div className="rounded-[8px] bg-[var(--control-bg-rest)] p-[12px]">
      <SessionTabAddControl onAddSession={() => {}} />
    </div>
  ),
}
