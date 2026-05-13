import { useEffect, useRef, useState } from "react"
import { AiMessageBubble } from "./AiMessageBubble"
import { ChatHeader } from "./ChatHeader"
import { MessageBubble } from "./MessageBubble"
import { MessageInput } from "./MessageInput"
import { getAiResponse } from "../lib/aiClient"

const PERSON_REPLY_PROMPT_PREFIX =
  "You are a real teammate in a direct chat. Reply naturally, concise, and conversational in 1-3 sentences."

const CHAT_META = {
  "build-team": { title: "Build chat", iconName: "chat", avatarInitial: null, members: [] },
  "chat-project": {
    title: "SummerEdge",
    avatarInitial: "SE",
    members: [
      { initial: "A", name: "Alex" },
      { initial: "P", name: "Priya" },
      { initial: "D", name: "Dev" },
      { initial: "T", name: "Tim" },
    ],
  },
  "chat-arjun": { title: "Arjun Patel", avatarInitial: "A", members: [] },
  "chat-sneha": { title: "Sneha Sharma", avatarInitial: "S", members: [] },
  "chat-rohan": { title: "Rohan Verma", avatarInitial: "R", members: [] },
  "chat-leela": { title: "Leela Nair", avatarInitial: "L", members: [] },
  ai: { title: "Computer", iconName: "computer", avatarInitial: null, members: [] },
}

/** Chat column: fixed `width`, or `flexFill` to grow when the record panel is hidden. */
export function ChatWindow({ width = 377, variant = "ai", flexFill = false }) {
  const [chatMessagesByVariant, setChatMessagesByVariant] = useState({
    ai: [
      {
        id: "ai-sam-1",
        role: "user",
        text: "What are the key decisions made so far?",
      },
      {
        id: "ai-sam-2",
        role: "ai",
        text: "3 confirmed decisions on this project:\n\n1. June 3 — Defer Hubspot integration to v2 (from \"Weekly sync — scope review\"). Reason: timeline risk if we take both.\n2. May 28 — Use OAuth2 for auth, not API keys (from \"API design review\"). Reason: enterprise customers require it.\n3. May 22 — Ship to 10 beta customers before GA (from \"Kickoff sync\"). Success criteria for the deadline.",
      },
      {
        id: "ai-sam-3",
        role: "user",
        text: "Who's working on what right now?",
      },
      {
        id: "ai-sam-4",
        role: "ai",
        text: "Current assignments:\n · @alex — ISS-430 (bulk contact import design), blocked on ISS-412\n · @priya — ISS-412 (fallback auth flow spec), due June 13\n · @dev — ISS-428 (OAuth token refresh), in review\n · @tim — ISS-425 (contact field mapping), in review",
      },
    ],
    "build-team": [
      {
        id: "seed-build-1",
        role: "user",
        text: "Morning team - design sign-off is done for Issues and Projects. Can we ship a beta by Friday?",
      },
      {
        id: "seed-build-2",
        role: "person",
        senderInitial: "R",
        text: "Yes, backend is stable. We still need keyboard nav + final QA pass on breadcrumbs and chat state.",
      },
      {
        id: "seed-build-3",
        role: "user",
        text: "Great. Let's lock scope today and keep non-blockers for next sprint.",
      },
      {
        id: "seed-build-4",
        role: "person",
        senderInitial: "S",
        text: "On it - I'll post a release checklist in this thread and tag owners.",
      },
    ],
    "chat-project": [
      {
        id: "proj-hist-1",
        role: "ai",
        text: "📋 Daily rundown — May 22\n\nKickoff sync completed. Key decisions:\n• Ship to 10 beta customers before GA (success criteria for July 15 deadline)\n• Team: @alex (eng lead), @priya (platform), @dev (backend), @tim (data)\n\nAction items created:\n• ISS-412 — Fallback auth flow spec → @priya\n• ISS-425 — Contact field mapping → @tim\n• ISS-428 — OAuth token refresh → @dev\n• ISS-430 — Bulk contact import design → @alex",
      },
      {
        id: "proj-hist-2",
        role: "person",
        senderInitial: "A",
        text: "Good kickoff. I'll start scoping ISS-430 tomorrow once @priya has the auth spec direction locked.",
      },
      {
        id: "proj-hist-3",
        role: "ai",
        text: "📋 Daily rundown — May 28\n\nAPI design review completed. Decision: Use OAuth2 for auth, not API keys — enterprise customers require it.\n\nProgress:\n• ISS-428 (OAuth token refresh) — @dev moved to In Progress\n• ISS-425 (contact field mapping) — @tim started research on field normalization\n\n⚠️ Dependency flagged: ISS-430 blocked until ISS-412 auth spec is finalized.",
      },
      {
        id: "proj-hist-4",
        role: "person",
        senderInitial: "P",
        text: "Auth spec is taking longer than expected — partner team hasn't shared their API contract yet. Targeting June 5 for a draft regardless.",
      },
      {
        id: "proj-hist-5",
        role: "person",
        senderInitial: "D",
        text: "OAuth token refresh PR is up for review. Used exponential backoff with jitter — handles the enterprise SSO edge case cleanly.",
      },
      {
        id: "proj-hist-6",
        role: "ai",
        text: "📋 Daily rundown — June 3\n\nWeekly sync — scope review completed. Decision: Defer Hubspot integration to v2. Reason: timeline risk if we take both.\n\nProgress:\n• ISS-428 (OAuth token refresh) — @dev moved to In Review ✓\n• ISS-425 (contact field mapping) — @tim moved to In Review ✓\n• ISS-412 (fallback auth flow) — @priya in progress, due June 13\n• ISS-430 (bulk contact import) — @alex in progress, blocked on ISS-412\n\n🟢 Project health: On track\n6 meetings processed | 3 decisions logged | 1 active blocker",
      },
      {
        id: "proj-hist-7",
        role: "person",
        senderInitial: "T",
        text: "Field mapping PR is ready — went with a schema-driven approach so adding new CRM sources later is just config.",
      },
      {
        id: "proj-hist-8",
        role: "person",
        senderInitial: "A",
        text: "Nice. @priya once ISS-412 lands I can unblock the import flow — lmk if you need a hand with the partner API spec.",
      },
    ],
    "chat-arjun": [],
    "chat-sneha": [],
    "chat-rohan": [],
    "chat-leela": [],
  })
  const scrollContainerRef = useRef(null)
  const isPersonChat = variant !== "ai"
  const activeVariant = variant
  const chatMessages = chatMessagesByVariant[activeVariant] ?? []
  const meta = CHAT_META[activeVariant] ?? CHAT_META.ai
  const isGroupChat = activeVariant === "build-team" || activeVariant === "chat-project"

  const handleSendMessage = async (text) => {
    const userId = `user-${Date.now()}`
    const replyId = `reply-${Date.now()}`
    const replyInitial =
      isGroupChat && ["A", "R", "S", "M", "L"][Math.floor(Math.random() * 5)]

    setChatMessagesByVariant((prev) => ({
      ...prev,
      [activeVariant]: [
        ...(prev[activeVariant] ?? []),
        { id: userId, role: "user", text },
        {
          id: replyId,
          role: isPersonChat ? "person" : "ai",
          text: "...",
          loading: true,
          ...(replyInitial != null ? { senderInitial: replyInitial } : {}),
        },
      ],
    }))

    try {
      const response = await getAiResponse(
        isPersonChat ? `${PERSON_REPLY_PROMPT_PREFIX}\n\nUser: ${text}` : text
      )
      setChatMessagesByVariant((prev) => ({
        ...prev,
        [activeVariant]: (prev[activeVariant] ?? []).map((message) =>
          message.id === replyId ? { ...message, text: response.trim(), loading: false } : message
        ),
      }))
    } catch (error) {
      const fallback = error?.message || "AI request failed. Check API key and network."
      setChatMessagesByVariant((prev) => ({
        ...prev,
        [activeVariant]: (prev[activeVariant] ?? []).map((message) =>
          message.id === replyId ? { ...message, text: fallback, loading: false } : message
        ),
      }))
    }
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    container.scrollTop = container.scrollHeight
  }, [chatMessages, activeVariant])

  return (
    <aside
      className={`flex h-full min-h-0 flex-col bg-white ${flexFill ? "min-w-[300px] flex-1" : "shrink-0"}`}
      style={flexFill ? undefined : { width }}
    >
      <ChatHeader title={meta.title} iconName={meta.iconName} avatarInitial={meta.avatarInitial} members={meta.members} />

      <div className="flex min-h-0 flex-1 flex-col">
        <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto pl-[20px] pr-[10px]">
          {chatMessages.map((message, index) => {
            const previous = index > 0 ? chatMessages[index - 1] : null
            const sameRole = previous != null && message.role === previous.role
            const sameGroupPersonSender =
              isGroupChat &&
              message.role === "person" &&
              previous.role === "person" &&
              (message.senderInitial ?? "") === (previous.senderInitial ?? "")
            const isConsecutiveSameSender = sameRole && (!isGroupChat || message.role !== "person" || sameGroupPersonSender)
            const spacingClass = isConsecutiveSameSender ? "pt-[4px]" : isPersonChat ? "pt-[14px]" : "pt-[20px]"

            const personBubbleType = isGroupChat ? "groupPerson" : "person"

            return (
              <div key={message.id} className={`w-full ${spacingClass}`}>
                {message.role === "user" ? (
                  <MessageBubble text={message.text} />
                ) : message.role === "person" ? (
                  <MessageBubble
                    text={message.text}
                    type={personBubbleType}
                    state={message.loading ? "writing" : "default"}
                    senderInitial={message.senderInitial}
                  />
                ) : (
                  <AiMessageBubble text={message.text} loading={Boolean(message.loading)} />
                )}
              </div>
            )
          })}

          <div className="h-[40px] w-full" />
        </div>
        <div className="px-[20px] pb-[20px]">
          <MessageInput mode={isPersonChat ? "message" : "ai"} initialValue="" onSendMessage={handleSendMessage} />
        </div>
      </div>
    </aside>
  )
}
