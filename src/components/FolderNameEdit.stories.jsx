import { useState } from "react"
import { FolderNameEdit } from "./FolderNameEdit"

const meta = {
  title: "Components/FolderNameEdit",
  component: FolderNameEdit,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-[235px] rounded-[8px] border border-[#ececec] bg-white p-[12px]">
        <Story />
      </div>
    ),
  ],
  args: {
    placeholder: "Folder name",
    defaultValue: "",
  },
}

export default meta

export const Empty = {}

export const Filled = {
  args: {
    defaultValue: "Design",
  },
}

export const Interactive = {
  render: (args) => {
    const [value, setValue] = useState(args.defaultValue ?? "")
    const [committed, setCommitted] = useState(null)

    return (
      <div className="flex w-full flex-col gap-[8px]">
        <FolderNameEdit
          {...args}
          value={value}
          onChange={setValue}
          onCommit={(next) => setCommitted(next || "(empty)")}
          onCancel={() => setCommitted("(cancelled)")}
        />
        {committed ? (
          <p className="text-[11px] text-[#737072]">Committed: {committed}</p>
        ) : null}
      </div>
    )
  },
}

export const WithConfirmButton = {
  args: {
    defaultValue: "Design",
    showConfirmButton: true,
  },
  render: Interactive.render,
}

/** Nav rename flow — input + check confirm (matches folder header edit). */
export const NavRenameFlow = {
  args: {
    defaultValue: "New folder",
    showConfirmButton: true,
    placeholder: "Folder name",
  },
  render: Interactive.render,
}
