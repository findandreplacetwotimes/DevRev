import { NavGroup } from "./NavGroup"
import { NavItem } from "./NavItem"

const meta = {
  title: "Components/NavGroup",
  component: NavGroup,
  parameters: {
    layout: "centered",
  },
  args: {
    label: "Build team",
    iconName: "team",
    defaultExpanded: true,
  },
}

export default meta

export const Default = {
  render: (args) => (
    <div className="w-[220px] rounded-[8px] border border-[#ececec] bg-white p-[12px]">
      <NavGroup {...args}>
        <NavItem label="Chat" iconName="mp" className="w-full" />
        <NavItem label="Issues" iconName="page" className="w-full" />
        <NavItem label="Sprints" iconName="page" className="w-full" />
        <NavItem label="Projects" iconName="page" className="w-full" />
        <NavItem label="About" iconName="page" className="w-full" />
      </NavGroup>
    </div>
  ),
}

export const Collapsed = {
  args: {
    defaultExpanded: false,
  },
  render: Default.render,
}
