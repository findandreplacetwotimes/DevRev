import { Breadcrumbs } from "./Breadcrumbs"
import { MemoryRouter } from "react-router-dom"

const meta = {
  title: "Components/Breadcrumbs",
  component: Breadcrumbs,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (StoryFn) => (
      <MemoryRouter initialEntries={["/"]}>
        {StoryFn()}
      </MemoryRouter>
    ),
  ],
  argTypes: {
    rootHref: {
      control: "text",
      description: "When set, root segment (icon + label) renders as `<a href>`. Omit until routes exist.",
    },
  },
}

export default meta

export const Default = {}

export const IssueDetail = {
  args: {
    root: "Issues",
    rootHref: "/issues",
    item: "Issue",
    itemSuffix: "-0001",
  },
}

export const ThreeLevel = {
  args: {
    segments: [
      { label: "Projects", href: "/projects", iconName: "team", showIcon: true },
      { label: "Project-0001", href: "/projects/Project-0001", showIcon: false },
      { label: "Issue-0001", showIcon: false },
    ],
  },
}
