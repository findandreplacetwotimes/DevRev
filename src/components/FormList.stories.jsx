import { Control } from "./Control"
import { FormItem } from "./FormItem"
import { FormList } from "./FormList"

const meta = {
  title: "Components/FormList",
  component: FormList,
  parameters: {
    layout: "centered",
  },
}

export default meta

export const Default = {
  render: () => (
    <FormList>
      <FormItem label="Priority">
        <Control type="trailing" state="inline" label="P0" trailingIcon="chevronDown" />
      </FormItem>
      <FormItem label="Sprint">
        <Control type="trailing" state="inline" label="Sprint 1" trailingIcon="chevronDown" />
      </FormItem>
      <FormItem label="Created date">
        <Control type="textOnly" state="inline" label="28 Apr 2026" />
      </FormItem>
    </FormList>
  ),
}
