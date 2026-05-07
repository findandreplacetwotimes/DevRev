import { Timestamp } from "./Timestamp"

const meta = {
  title: "Components/Timestamp",
  component: Timestamp,
  parameters: {
    layout: "centered",
  },
  args: {
    datePart: "today,",
    timePart: "9:15 AM",
    dateTime: undefined,
    className: "",
  },
  argTypes: {
    dateTime: { control: "text", description: "ISO8601 for semantic time, e.g. 2026-05-05T09:15:00" },
  },
}

export default meta

export const Default = {}

export const Yesterday = {
  args: {
    datePart: "yesterday,",
    timePart: "4:30 PM",
  },
}

export const WithDatetime = {
  args: {
    datePart: "today,",
    timePart: "9:15 AM",
    dateTime: "2026-05-05T09:15:00",
  },
}
