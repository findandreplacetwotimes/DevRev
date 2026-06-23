import { useState } from "react"
import { ChatHeader } from "./ChatHeader"

const meta = {
  title: "Components/ChatHeader",
  component: ChatHeader,
  parameters: {
    layout: "padded",
  },
  args: {
    title: "Build team",
    iconName: "chat",
    relatedLinks: [
      { title: "Issues", href: "/issues" },
      { title: "Sprints", href: "/sprints" },
      { title: "Projects", href: "/projects" },
      { title: "About", href: "/about" },
    ],
  },
}

export default meta

const columnShell = (args) => (
  <div className="w-full max-w-[377px] bg-white">
    <ChatHeader {...args} />
  </div>
)

export const Default = {
  render: (args) => {
    const [tabsSideOpen, setTabsSideOpen] = useState(false)
    return columnShell({
      ...args,
      tabsSideOpen,
      onToggleTabsSide: () => setTabsSideOpen((value) => !value),
    })
  },
}

/** Figma `5893:38592` — team chat. */
export const Computer = {
  args: {
    title: "Computer",
    iconName: "computer",
    avatarInitial: null,
  },
  render: Default.render,
}

/** Figma `6232:11732` — one person after confirm. */
export const PersonChat = {
  args: {
    title: "Arjun Patel",
    avatarInitial: "A",
    iconName: "chat",
  },
  render: Default.render,
}

/** Figma `6232:11773` — many people after confirm. */
export const GroupMemberCount = {
  args: {
    title: "Arjun, Sneha, Rohan",
    memberCount: 3,
    iconName: "chat",
    avatarInitial: null,
  },
  render: Default.render,
}

/** Figma `6234:11748` — Branch, Archive, RELATED CHATS section with family rows. */
export const TeamChatWithActions = {
  args: {
    title: "Build team",
    iconName: "chat",
    hasPanelContent: true,
    showChatActionsMenu: true,
    showBranch: true,
    showArchive: true,
    relatedChats: [
      {
        id: "build-team",
        title: "Build team",
        participants: [],
        context: { type: "team" },
        parentChatId: null,
        rootChatId: "build-team",
        createdAt: 0,
      },
      {
        id: "chat-branch-1",
        title: "Arjun, Sneha",
        participants: [
          { id: "arjun", label: "Arjun Patel", initial: "A" },
          { id: "sneha", label: "Sneha Sharma", initial: "S" },
        ],
        context: { type: "team" },
        parentChatId: "build-team",
        rootChatId: "build-team",
        createdAt: 1,
      },
    ],
    currentChatId: "chat-branch-1",
  },
  render: (args) => {
    const [tabsSideOpen, setTabsSideOpen] = useState(false)
    return columnShell({
      ...args,
      tabsSideOpen,
      onToggleTabsSide: () => setTabsSideOpen((value) => !value),
    })
  },
}

export const ProjectChat = {
  args: {
    title: "Core flow",
    iconName: "projectChat",
    avatarInitial: null,
    hasPanelContent: true,
    showChatActionsMenu: true,
    showBranch: true,
    showArchive: false,
    relatedChats: [],
  },
  render: TeamChatWithActions.render,
}

/** Figma `6228:12015` / `6232:11866`. */
export const NewChatEmpty = {
  args: {
    mode: "newChat",
    participants: [],
    hideLinksPanelControl: true,
  },
  render: (args) => {
    const [participants, setParticipants] = useState(args.participants)
    return columnShell({
      ...args,
      participants,
      onParticipantsChange: setParticipants,
      onConfirm: () => {},
    })
  },
}

/** Figma `6228:12016` — type in the search field. */
export const NewChatTyping = {
  render: () => {
    const [participants, setParticipants] = useState([])
    return columnShell({
      mode: "newChat",
      participants,
      onParticipantsChange: setParticipants,
      onConfirm: () => {},
      hideLinksPanelControl: true,
    })
  },
}

/** Figma `6228:12017` / `6232:11792`. */
export const NewChatOneAdded = {
  args: {
    mode: "newChat",
    participants: [{ id: "arjun", label: "Arjun Patel", initial: "A" }],
    hideLinksPanelControl: true,
  },
  render: (args) => {
    const [participants, setParticipants] = useState(args.participants)
    return columnShell({
      ...args,
      participants,
      onParticipantsChange: setParticipants,
      onConfirm: () => {},
    })
  },
}

/** Figma `6232:11890`. */
export const NewChatTwoAdded = {
  args: {
    mode: "newChat",
    participants: [
      { id: "arjun", label: "Arjun Patel", initial: "A" },
      { id: "leela", label: "Leela Nair", initial: "L" },
    ],
    hideLinksPanelControl: true,
  },
  render: (args) => {
    const [participants, setParticipants] = useState(args.participants)
    return columnShell({
      ...args,
      participants,
      onParticipantsChange: setParticipants,
      onConfirm: () => {},
    })
  },
}

/** Figma `6232:11791` — 377px in-context column. */
export const NewChatInContext = {
  args: {
    mode: "newChat",
    participants: [{ id: "arjun", label: "Arjun Patel", initial: "A" }],
    hideLinksPanelControl: true,
  },
  render: (args) => {
    const [participants, setParticipants] = useState(args.participants)
    return (
      <div className="flex w-[377px] flex-col bg-white">
        <ChatHeader
          {...args}
          participants={participants}
          onParticipantsChange={setParticipants}
          onConfirm={() => {}}
        />
        <div className="min-h-[320px] flex-1 border-t border-[var(--border-subtle)]" />
        <div className="pointer-events-none px-[20px] pb-[20px] opacity-40">
          <div className="h-[88px] rounded-[2px] bg-[var(--background-primary-subtle)]" aria-hidden />
        </div>
      </div>
    )
  },
}
