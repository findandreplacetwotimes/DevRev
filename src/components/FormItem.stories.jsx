import { useState } from "react"
import { Control } from "./Control"
import { FormItem } from "./FormItem"

const meta = {
  title: "Components/FormItem",
  component: FormItem,
  parameters: {
    layout: "centered",
  },
  args: {
    label: "Priority",
    subtitle: "",
  },
}

export default meta

export const WithInlineControl = {
  render: (args) => {
    const [value, setValue] = useState("P0")
    return (
      <div className="w-[387px] bg-[var(--background-primary-subtle)]">
        <FormItem {...args}>
          <Control
            type="trailing"
            state="inline"
            label={value}
            trailingIcon="chevronDown"
            onClick={() => setValue((prev) => (prev === "P0" ? "P1" : "P0"))}
          />
        </FormItem>
      </div>
    )
  },
}

export const WithSubtitle = {
  args: {
    label: "Created date",
    subtitle: "READ ONLY",
  },
  render: (args) => (
    <div className="w-[387px] bg-[var(--background-primary-subtle)]">
      <FormItem {...args}>
        <Control type="textOnly" state="inline" label="28 Apr 2026" />
      </FormItem>
    </div>
  ),
}
