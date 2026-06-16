import { ChatAvatar } from "./ChatAvatar"
import { Icon } from "./Icon"
import { TabItem } from "./TabItem"

const meta = {
  title: "Components/TabItem",
  component: TabItem,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    type: {
      control: "select",
      options: ["nonSelected", "selected"],
    },
    state: {
      control: "select",
      options: ["rest", "hover"],
    },
  },
  args: {
    type: "nonSelected",
    state: "rest",
    label: "Issue-0001",
  },
}

export default meta

export const NonSelectedRest = {}

export const NonSelectedHover = {
  args: {
    state: "hover",
  },
}

export const SelectedRest = {
  args: {
    type: "selected",
  },
}

export const SelectedHover = {
  args: {
    type: "selected",
    state: "hover",
  },
}

export const LongLabelTruncated = {
  args: {
    type: "nonSelected",
    state: "rest",
    label: "Design refresh project chat",
  },
}

/** Figma `5817:37515` — close on trailing edge at hover; leading icon stays put. */
export const TabRow = {
  render: () => (
    <div className="flex w-[640px] border-b border-[#ececec] bg-[var(--control-bg-rest)]">
      <TabItem type="nonSelected" label="Issue-0001" onSelect={() => {}} onClose={() => {}} />
      <TabItem type="selected" label="Issue-0001" onSelect={() => {}} onClose={() => {}} />
      <TabItem type="nonSelected" state="hover" label="Issue-0001" onSelect={() => {}} onClose={() => {}} />
      <TabItem type="selected" state="hover" label="Issue-0001" onSelect={() => {}} onClose={() => {}} />
    </div>
  ),
}

/** Figma `5817:37515` — split tabs show two icons, no label. */
export const SplitTabRow = {
  render: () => (
    <div className="flex w-[360px] border-b border-[#ececec] bg-[var(--control-bg-rest)]">
      <TabItem
        type="nonSelected"
        split
        leading={<Icon name="computer" />}
        secondaryLeading={<Icon name="page" />}
        onSelect={() => {}}
        onClose={() => {}}
      />
      <TabItem
        type="selected"
        split
        leading={<Icon name="computer" />}
        secondaryLeading={<Icon name="page" />}
        onSelect={() => {}}
        onClose={() => {}}
      />
      <TabItem
        type="selected"
        state="hover"
        split
        leading={<Icon name="computer" />}
        secondaryLeading={<ChatAvatar initial="A" />}
        onSelect={() => {}}
        onClose={() => {}}
      />
    </div>
  ),
}
