import { MicroControl } from "./MicroControl"

/**
 * Figma `6070:8071` — `MicroControl`.
 *
 * Variants (`type` × `layout`):
 *  - `control` / `iconOnly` — interactive icon button (hover `#eceaeb`).
 *  - `control` / `textOnly` — interactive uppercase chip (hover `#eceaeb`).
 *  - `tag` / `textOnly` — static uppercase chip (no hover).
 *  - `tag` / `timestamp` — static `<time>` chip with date + time.
 */
const meta = {
  title: "Components/MicroControl",
  component: MicroControl,
  parameters: { layout: "centered" },
  args: {
    type: "control",
    layout: "iconOnly",
    iconName: "reply",
    label: "Post",
    datePart: "today,",
    timePart: "9:15 AM",
  },
  argTypes: {
    type: { control: "inline-radio", options: ["control", "tag"] },
    layout: { control: "inline-radio", options: ["iconOnly", "textOnly", "timestamp"] },
    iconName: { control: "text" },
    label: { control: "text" },
    datePart: { control: "text" },
    timePart: { control: "text" },
    dateTime: { control: "text" },
    onPress: { action: "press" },
  },
}

export default meta

export const ControlIconOnly = {
  args: { type: "control", layout: "iconOnly", iconName: "reply", onPress: () => {} },
}

export const ControlTextOnly = {
  args: { type: "control", layout: "textOnly", label: "Post", onPress: () => {} },
}

export const TagTextOnly = {
  args: { type: "tag", layout: "textOnly", label: "Thinking" },
}

export const TagTimestamp = {
  args: { type: "tag", layout: "timestamp", datePart: "today,", timePart: "9:15 AM" },
}

export const AllVariants = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex flex-col items-start gap-[12px] bg-white p-[16px]">
      <div className="flex items-center gap-[8px]">
        <span className="w-[140px] text-[12px] text-[#666]">control / iconOnly</span>
        <MicroControl type="control" layout="iconOnly" iconName="reply" onPress={() => {}} />
      </div>
      <div className="flex items-center gap-[8px]">
        <span className="w-[140px] text-[12px] text-[#666]">control / textOnly</span>
        <MicroControl type="control" layout="textOnly" label="Post" onPress={() => {}} />
      </div>
      <div className="flex items-center gap-[8px]">
        <span className="w-[140px] text-[12px] text-[#666]">tag / textOnly</span>
        <MicroControl type="tag" layout="textOnly" label="Thinking" />
      </div>
      <div className="flex items-center gap-[8px]">
        <span className="w-[140px] text-[12px] text-[#666]">tag / timestamp</span>
        <MicroControl type="tag" layout="timestamp" datePart="today," timePart="9:15 AM" />
      </div>
    </div>
  ),
}
