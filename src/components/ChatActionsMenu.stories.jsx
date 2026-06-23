import { CHAT_ACTIONS_MENU_ROW_GAP_PX, ChatActionsMenuItems } from "./ChatActionsMenu"

const modalShadow =
  "0px 6px 13px rgba(0,0,0,0.10), 0px 23px 23px rgba(0,0,0,0.09), 0px 52px 31px rgba(0,0,0,0.05), 0px 92px 37px rgba(0,0,0,0.01), 0px 144px 40px rgba(0,0,0,0)"

const meta = {
  title: "Components/ChatActionsMenu",
  component: ChatActionsMenuItems,
  parameters: {
    layout: "centered",
  },
}

export default meta

function MenuShell(args) {
  return (
    <div
      className="inline-flex w-[202px] flex-col items-start rounded-[2px] bg-white p-[6px]"
      style={{ boxShadow: modalShadow, gap: `${CHAT_ACTIONS_MENU_ROW_GAP_PX}px` }}
      role="menu"
      aria-label="Chat actions"
    >
      <ChatActionsMenuItems {...args} />
    </div>
  )
}

/** Figma `6234:11748`. */
export const WithRelatedChats = {
  args: {
    showBranch: true,
    showArchive: true,
    currentChatId: "chat-branch-1",
    relatedChats: [
      {
        id: "chat-project-Project-0001",
        title: "Project chat",
        participants: [],
        context: { type: "project", projectId: "Project-0001" },
        parentChatId: null,
        rootChatId: "chat-project-Project-0001",
        createdAt: 0,
      },
      {
        id: "chat-branch-1",
        title: "Arjun, Sneha",
        participants: [
          { id: "arjun", label: "Arjun Patel", initial: "A" },
          { id: "sneha", label: "Sneha Sharma", initial: "S" },
        ],
        context: { type: "project", projectId: "Project-0001" },
        parentChatId: "chat-project-Project-0001",
        rootChatId: "chat-project-Project-0001",
        createdAt: 1,
      },
    ],
  },
  render: (args) => <MenuShell {...args} />,
}

export const BranchOnly = {
  args: {
    showBranch: true,
    showArchive: false,
    relatedChats: [],
  },
  render: (args) => <MenuShell {...args} />,
}
