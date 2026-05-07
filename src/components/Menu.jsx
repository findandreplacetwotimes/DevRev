import { MenuItem } from "./MenuItem"
import { TextInput } from "./TextInput"

const modalShadow =
  "0px 6px 13px rgba(0,0,0,0.10), 0px 23px 23px rgba(0,0,0,0.09), 0px 52px 31px rgba(0,0,0,0.05), 0px 92px 37px rgba(0,0,0,0.01), 0px 144px 40px rgba(0,0,0,0)"

export function Menu() {
  return (
    <div
      className="inline-flex w-[202px] flex-col items-start gap-[4px] rounded-[2px] bg-white p-[6px]"
      style={{ boxShadow: modalShadow }}
    >
      <TextInput type="inline" fullWidth />
      <div className="h-px w-[190px] bg-[#f4f3f3]" />
      <MenuItem type="label" label="Owner" fullWidth />
      <MenuItem type="leading" state="selected" label="Manasa" fullWidth />
      <MenuItem type="leading" label="Manasa" fullWidth />
      <MenuItem type="leading" label="Manasa" fullWidth />
      <MenuItem type="leading" label="Manasa" fullWidth />
      <MenuItem type="leading" label="Manasa" fullWidth />
    </div>
  )
}
