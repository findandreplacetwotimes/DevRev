import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AiMessageBubble } from "./AiMessageBubble"
import { ChatHeader } from "./ChatHeader"
import { MessageBubble } from "./MessageBubble"
import { MessageInput } from "./MessageInput"
import { getAiResponse } from "../lib/aiClient"
import { messageTagsComputer } from "../lib/mentionUtils"
import { appendProjectActivity } from "../lib/projectActivityStore"

const PERSON_REPLY_PROMPT_PREFIX =
  "You are a real teammate in a direct chat. Reply naturally, concise, and conversational in 1-3 sentences."

const COMPUTER_PROJECT_REPLY_PREFIX =
  "You are Computer, the AI assistant in this project chat. Reply helpfully and concisely for an engineering team (usually 2–5 sentences). Reference project context when relevant."

/** Matches `chat-project:${projectId}` in message state — seeded thread for the demo project. */
const PROJECT_CHAT_THREAD_KEY = "chat-project:Project-0001"

const CHAT_META = {
  "build-team": { title: "Build chat", iconName: "chat", avatarInitial: null },
  "chat-project": { title: "Project chat", iconName: "project", avatarInitial: null },
  "chat-arjun": { title: "Arjun Patel", avatarInitial: "A" },
  "chat-sneha": { title: "Sneha Sharma", avatarInitial: "S" },
  "chat-rohan": { title: "Rohan Verma", avatarInitial: "R" },
  "chat-leela": { title: "Leela Nair", avatarInitial: "L" },
  ai: { title: "Computer", iconName: "computer", avatarInitial: null },
}

/** Chat column: fixed `width`, or `flexFill` to grow when the record panel is hidden. */
export function ChatWindow({
  width = 377,
  variant = "ai",
  flexFill = false,
  linkedProjectChat = null,
}) {
  const navigate = useNavigate()
  const [chatMessagesByVariant, setChatMessagesByVariant] = useState({
    ai: [],
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
    [PROJECT_CHAT_THREAD_KEY]: [
      {
        id: "seed-proj-chat-1",
        role: "user",
        text: "Can we lock milestone dates for the scope tab before we invite design review?",
      },
      {
        id: "seed-proj-chat-2",
        role: "person",
        senderInitial: "M",
        text: "Yes — I'll sync Health + due dates today so the table tells one story.",
      },
      {
        id: "seed-proj-chat-3",
        role: "user",
        text: "Perfect. I'll thread linked issues under each milestone once labels are stable.",
      },
      {
        id: "seed-proj-chat-4",
        role: "person",
        senderInitial: "L",
        text: "Sounds good. Ping me when Overview copy is final and I'll skim Brief for tone.",
      },
    ],
    "chat-arjun": [
      {
        id: "seed-arjun-1",
        role: "user",
        text: "Hey Arjun, can you review the project milestones table before standup?",
      },
      {
        id: "seed-arjun-2",
        role: "person",
        text: "Yep, looking now. I already see one mismatch in due date formatting.",
      },
      {
        id: "seed-arjun-3",
        role: "user",
        text: "Good catch. Is it only on the projects page or in issue details too?",
      },
      {
        id: "seed-arjun-4",
        role: "person",
        text: "Only projects page. Issue details are using the correct helper.",
      },
      {
        id: "seed-arjun-5",
        role: "user",
        text: "Can you open a small PR for that and tag me?",
      },
      {
        id: "seed-arjun-6",
        role: "person",
        text: "Will do. I can have it up in about 20 minutes.",
      },
    ],
    "chat-sneha": [
      {
        id: "seed-sneha-1",
        role: "user",
        text: "Morning! How are we looking on the Issues vs Backlog filtering?",
      },
      {
        id: "seed-sneha-2",
        role: "person",
        text: "Functionally done. I am validating edge cases with empty sprint values.",
      },
      {
        id: "seed-sneha-3",
        role: "user",
        text: "Perfect. We should also persist the selected tab after refresh.",
      },
      {
        id: "seed-sneha-4",
        role: "person",
        text: "Already added localStorage for that. Want me to add a quick Storybook note too?",
      },
      {
        id: "seed-sneha-5",
        role: "user",
        text: "Yes please, especially around Backlog behavior.",
      },
      {
        id: "seed-sneha-6",
        role: "person",
        text: "Done. I'll paste a short QA checklist in the PR description.",
      },
      {
        id: "seed-sneha-7",
        role: "user",
        text: "Great, thanks.",
      },
      {
        id: "seed-sneha-8",
        role: "person",
        text: "Anytime. I will ping once CI is green.",
      },
    ],
    "chat-rohan": [
      {
        id: "seed-rohan-1",
        role: "user",
        text: "Rohan, did you confirm nav order with design?",
      },
      {
        id: "seed-rohan-2",
        role: "person",
        text: "Yes. Sprints should be above Projects in primary nav.",
      },
      {
        id: "seed-rohan-3",
        role: "user",
        text: "Nice. How about Build team placement?",
      },
      {
        id: "seed-rohan-4",
        role: "person",
        text: "It belongs under Chats as the first entry, with chat icon.",
      },
      {
        id: "seed-rohan-5",
        role: "user",
        text: "Exactly what I needed. Can we keep Projects icon as page?",
      },
      {
        id: "seed-rohan-6",
        role: "person",
        text: "Yep, project icon only for project chat contexts.",
      },
      {
        id: "seed-rohan-7",
        role: "user",
        text: "Great, thanks for helping align the details.",
      },
      {
        id: "seed-rohan-8",
        role: "person",
        text: "No problem. I can sanity-check the whole nav once more before release.",
      },
      {
        id: "seed-rohan-9",
        role: "user",
        text: "Please do, especially active state behavior from nested pages.",
      },
      {
        id: "seed-rohan-10",
        role: "person",
        text: "On it. I will share a quick video if I find anything odd.",
      },
    ],
    "chat-leela": [
      {
        id: "seed-leela-1",
        role: "user",
        text: "Leela, can you help draft rollout notes for this week's deploy?",
      },
      {
        id: "seed-leela-2",
        role: "person",
        text: "Sure. Do you want separate notes for app and Storybook?",
      },
      {
        id: "seed-leela-3",
        role: "user",
        text: "Yes, plus a short section on known warnings that are non-blocking.",
      },
      {
        id: "seed-leela-4",
        role: "person",
        text: "Got it. I'll mention npm env warnings and chunk-size warning context.",
      },
      {
        id: "seed-leela-5",
        role: "user",
        text: "Perfect. Also add links to prod aliases.",
      },
      {
        id: "seed-leela-6",
        role: "person",
        text: "Will do. I will include both app and components URLs.",
      },
      {
        id: "seed-leela-7",
        role: "user",
        text: "Can you finish before noon?",
      },
      {
        id: "seed-leela-8",
        role: "person",
        text: "Yes, I can post a draft in the next 30 minutes.",
      },
      {
        id: "seed-leela-9",
        role: "user",
        text: "Awesome, thank you.",
      },
      {
        id: "seed-leela-10",
        role: "person",
        text: "Happy to help.",
      },
      {
        id: "seed-leela-11",
        role: "user",
        text: "After that, let's prep a tiny FAQ for support.",
      },
      {
        id: "seed-leela-12",
        role: "person",
        text: "Great idea. I will include common questions about panel state persistence.",
      },
    ],
  })
  const scrollContainerRef = useRef(null)
  const isPersonChat = variant !== "ai"
  /** One thread per linked project; generic `chat-project` only when nav chosen before linking. */
  const messageVariantKey =
    variant === "chat-project" && linkedProjectChat?.projectId
      ? `chat-project:${linkedProjectChat.projectId}`
      : variant
  const chatMessages = chatMessagesByVariant[messageVariantKey] ?? []
  const meta = useMemo(() => {
    if (variant === "chat-project" && linkedProjectChat?.projectId) {
      const base = CHAT_META["chat-project"]
      return { ...base, title: linkedProjectChat.title }
    }
    return CHAT_META[variant] ?? CHAT_META.ai
  }, [variant, linkedProjectChat?.projectId, linkedProjectChat?.title])
  const isGroupChat = variant === "build-team" || variant === "chat-project"

  const handleSendMessage = async (text) => {
    const userId = `user-${Date.now()}`
    const replyId = `reply-${Date.now()}`
    const isProjectChat =
      variant === "chat-project" ||
      (typeof messageVariantKey === "string" && messageVariantKey.startsWith("chat-project:"))
    const replyAsComputer = isProjectChat && messageTagsComputer(text)
    const replyInitial =
      !replyAsComputer && isGroupChat && ["A", "R", "S", "M", "L"][Math.floor(Math.random() * 5)]

    setChatMessagesByVariant((prev) => ({
      ...prev,
      [messageVariantKey]: [
        ...(prev[messageVariantKey] ?? []),
        { id: userId, role: "user", text },
        {
          id: replyId,
          role: replyAsComputer ? "ai" : isPersonChat ? "person" : "ai",
          text: "...",
          loading: true,
          ...(replyInitial != null ? { senderInitial: replyInitial } : {}),
        },
      ],
    }))

    try {
      const prompt = replyAsComputer
        ? `${COMPUTER_PROJECT_REPLY_PREFIX}\n\n${text}`
        : isPersonChat
          ? `${PERSON_REPLY_PROMPT_PREFIX}\n\nUser: ${text}`
          : text
      const response = await getAiResponse(prompt)
      setChatMessagesByVariant((prev) => ({
        ...prev,
        [messageVariantKey]: (prev[messageVariantKey] ?? []).map((message) =>
          message.id === replyId ? { ...message, text: response.trim(), loading: false } : message
        ),
      }))
    } catch (error) {
      const fallback = error?.message || "AI request failed. Check API key and network."
      setChatMessagesByVariant((prev) => ({
        ...prev,
        [messageVariantKey]: (prev[messageVariantKey] ?? []).map((message) =>
          message.id === replyId ? { ...message, text: fallback, loading: false } : message
        ),
      }))
    }
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    container.scrollTop = container.scrollHeight
  }, [chatMessages, messageVariantKey])

  return (
    <aside
      className={`flex h-full min-h-0 flex-col bg-white ${flexFill ? "min-w-[300px] flex-1" : "shrink-0"}`}
      style={flexFill ? undefined : { width }}
    >
      <ChatHeader title={meta.title} iconName={meta.iconName} avatarInitial={meta.avatarInitial} />

      <div className="flex min-h-0 flex-1 flex-col">
        <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto px-[20px] pt-[10px]">
          {chatMessages.map((message, index) => {
            const previous = index > 0 ? chatMessages[index - 1] : null
            const sameRole = previous != null && message.role === previous.role
            const sameGroupPersonSender =
              isGroupChat &&
              message.role === "person" &&
              previous.role === "person" &&
              (message.senderInitial ?? "") === (previous.senderInitial ?? "")
            const isConsecutiveSameSender = sameRole && (!isGroupChat || message.role !== "person" || sameGroupPersonSender)
            /** Figma `5910:39547` — `h-[14px]` strips between groups; first row uses container `pt-[10px]` only. */
            const spacingClass =
              index === 0
                ? ""
                : isConsecutiveSameSender
                  ? "pt-[4px]"
                  : "pt-[14px]"

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
                  <AiMessageBubble
                    text={message.text}
                    loading={Boolean(message.loading)}
                    onMenuAction={(actionId) => {
                      if (actionId !== "postInProject") return
                      const pid = linkedProjectChat?.projectId
                      if (!pid || message.loading) return
                      const t = String(message.text ?? "").trim()
                      if (!t) return
                      appendProjectActivity(pid, t)
                      navigate(`/projects/${encodeURIComponent(pid)}?tab=Activity`)
                    }}
                  />
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
