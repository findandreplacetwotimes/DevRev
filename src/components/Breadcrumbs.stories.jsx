import { Breadcrumbs } from "./Breadcrumbs"
import { MemoryRouter } from "react-router-dom"
import { DEFAULT_TEAM_ID, teamIssuesHref, teamProjectsHref } from "../lib/teams"

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
    rootHref: teamIssuesHref(DEFAULT_TEAM_ID),
    item: "Issue",
    itemSuffix: "-0001",
  },
}

export const MenuOpenListPage = {
  args: {
    root: "Issues",
    item: null,
    defaultMenuOpen: true,
  },
}

export const ThreeLevel = {
  args: {
    segments: [
      { label: "Projects", href: teamProjectsHref(DEFAULT_TEAM_ID), iconName: "project", showIcon: true, showLabel: false },
      { label: "Project", suffix: "-0001", href: "/project/project-0001", showIcon: false },
      { label: "Issue", suffix: "-0001", showIcon: false },
    ],
    projectId: "Project-0001",
  },
}

/** Issue opened from team Issues — team pictogram. */
export const IssueFromTeam = {
  args: {
    segments: [
      { label: "Issues", href: teamIssuesHref(DEFAULT_TEAM_ID), iconName: "team", showIcon: true },
      { label: "Issue", suffix: "-0001", showIcon: false },
    ],
  },
}

/** Issue opened from project scope — project pictogram + Project-####. */
export const IssueFromProject = {
  args: {
    segments: [
      { label: "Projects", href: teamProjectsHref(DEFAULT_TEAM_ID), iconName: "project", showIcon: true, showLabel: false },
      { label: "Project", suffix: "-0001", href: "/project/project-0001", showIcon: false },
      { label: "Issue", suffix: "-0002", showIcon: false },
    ],
    projectId: "Project-0001",
  },
}

export const ProjectMenuOpen = {
  args: {
    root: "Projects",
    rootHref: teamProjectsHref(DEFAULT_TEAM_ID),
    item: "Project",
    itemSuffix: "-0001",
    projectId: "Project-0001",
    iconName: "project",
    defaultMenuOpen: true,
  },
}

export const MenuDisabled = {
  args: {
    root: "Projects",
    rootHref: teamProjectsHref(DEFAULT_TEAM_ID),
    item: "Project",
    itemSuffix: "-0001",
    projectId: "Project-0001",
    iconName: "project",
    defaultMenuOpen: true,
    menuEnabled: false,
  },
}
