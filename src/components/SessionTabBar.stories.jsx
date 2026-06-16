import { SessionTabBar } from "./SessionTabBar"
import { createDefaultSession, createDefaultSplitSession } from "../lib/workspaceSessions"

const meta = {
  title: "Components/SessionTabBar",
  component: SessionTabBar,
  parameters: {
    layout: "fullscreen",
  },
}

export default meta

const sampleSessions = [
  createDefaultSession({ id: "session-1", tabTitle: "Computer" }),
  createDefaultSession({
    id: "session-2",
    tabTitle: "Issue-0001",
    route: "/team/Team-0001/issues/Issue-0001",
    selectedNavItemId: "team:page:issues",
  }),
]

const noop = () => {}

export const Default = {
  render: () => (
    <div className="w-full border border-[#ececec]">
      <SessionTabBar
        sessions={sampleSessions}
        activeSessionId="session-1"
        onSelectSession={noop}
        onCloseSession={noop}
        onAddSession={noop}
        onAddSplitSession={noop}
      />
    </div>
  ),
}

export const MultipleTabs = {
  render: () => (
    <div className="w-[640px] border border-[#ececec]">
      <SessionTabBar
        sessions={sampleSessions}
        activeSessionId="session-2"
        onSelectSession={noop}
        onCloseSession={noop}
        onAddSession={noop}
        onAddSplitSession={noop}
      />
    </div>
  ),
}

export const WithSplitTab = {
  render: () => (
    <div className="w-[640px] border border-[#ececec]">
      <SessionTabBar
        sessions={[createDefaultSession({ id: "session-1" }), createDefaultSplitSession({ id: "session-split" })]}
        activeSessionId="session-split"
        onSelectSession={noop}
        onCloseSession={noop}
        onAddSession={noop}
        onAddSplitSession={noop}
      />
    </div>
  ),
}

export const TabBarStrip = {
  render: () => (
    <div className="w-[1015px]">
      <SessionTabBar
        sessions={[
          createDefaultSession({ id: "session-1", tabTitle: "Issue-0001" }),
          createDefaultSession({ id: "session-2", tabTitle: "Issue-0001" }),
          createDefaultSplitSession({ id: "session-3" }),
        ]}
        activeSessionId="session-3"
        onSelectSession={noop}
        onCloseSession={noop}
        onAddSession={noop}
        onAddSplitSession={noop}
      />
    </div>
  ),
}
