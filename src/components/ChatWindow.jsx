import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AiMessageBubble } from "./AiMessageBubble"
import { ChatHeader } from "./ChatHeader"
import { MeetingActionsMessage } from "./MeetingActionsMessage"
import { MeetingDigestMessage } from "./MeetingDigestMessage"
import { MessageBubble } from "./MessageBubble"
import { MessageInput } from "./MessageInput"
import { useIssues } from "../context/IssuesContext"
import { getAiResponse } from "../lib/aiClient"
import { createSeedMessagesForSession, getMessageVariantKey } from "../lib/chatSeedMessages"
import { resolveChatNavigationIntent } from "../lib/chatNavigationIntent"
import { PROCESS_PROMPT, wantsMeetingProcessing } from "../lib/meetingDigest"
import { messageTagsComputer } from "../lib/mentionUtils"
import { projectChatDestination, projectTabHref, teamChatDestination } from "../lib/navDestinations"
import { appendProjectActivity } from "../lib/projectActivityStore"

import { teamById, teamChatHeaderTitle } from "../lib/workspaceLabels"
import { projectChatHeaderTitle, projectPathId } from "../lib/projectsApi"

const PERSON_REPLY_PROMPT_PREFIX =
  "You are a real teammate in a direct chat. Reply naturally, concise, and conversational in 1-3 sentences."

const COMPUTER_PROJECT_REPLY_PREFIX =
  "You are Computer, the AI assistant in this project chat. Reply helpfully and concisely for an engineering team (usually 2–5 sentences). Reference project context when relevant."

const CHAT_META = {
  "chat-arjun": { title: "Arjun Patel", avatarInitial: "A" },
  "chat-sneha": { title: "Sneha Sharma", avatarInitial: "S" },
  "chat-rohan": { title: "Rohan Verma", avatarInitial: "R" },
  "chat-leela": { title: "Leela Nair", avatarInitial: "L" },
  ai: { title: "Computer", iconName: "computer", avatarInitial: null },
}

/** Meeting IDs the project has granted content access to (latest grant on any digest in a thread). */
function findGrantedMeetingIds(thread) {
  if (!Array.isArray(thread)) return []
  for (let i = thread.length - 1; i >= 0; i -= 1) {
    const m = thread[i]
    if (m.kind === "meeting-digest" && m.digestStatus === "granted") return m.digestMeetingIds ?? []
  }
  return []
}

/** Chat column: fixed `width`, or `flexFill` to grow when the record panel is hidden. */
export function ChatWindow({
  width = 377,
  variant = "ai",
  flexFill = false,
  sessionId,
  linkedProjectChat = null,
  teamId = null,
  activeTeam = null,
  activeProject = null,
  messages: controlledMessages,
  onMessagesChange,
  onOpenPageInSession,
  onOpenRecordPanel,
  hideRelatedLinksControl = true,
  relatedLinks = [],
  canvasLabel = "CANVAS",
  onSelectRelatedLink,
  navMenuEnabled = false,
  projectId = null,
  showProjectNavSection = true,
}) {
  const navigate = useNavigate()
  const { issues, projects } = useIssues()
  const [uncontrolledMessages, setUncontrolledMessages] = useState(() => createSeedMessagesForSession(variant, linkedProjectChat))
  const isControlled = controlledMessages !== undefined
  const chatMessages = isControlled ? controlledMessages : uncontrolledMessages
  const setChatMessages = useCallback(
    (updater) => {
      if (isControlled) {
        onMessagesChange?.(updater)
        return
      }
      setUncontrolledMessages(updater)
    },
    [isControlled, onMessagesChange]
  )
  const scrollContainerRef = useRef(null)
  /** Project threads that have already had the PM Agent digest injected (one-time per thread). */
  const digestInjectedRef = useRef(new Set())
  const isPersonChat = variant !== "ai"
  const messageVariantKey = getMessageVariantKey(variant, linkedProjectChat)
  const meta = useMemo(() => {
    if (variant === "build-team") {
      const team = activeTeam ?? teamById(teamId)
      const { memberCount } = teamChatDestination(teamId ?? team?.id)
      return { title: teamChatHeaderTitle(team), memberCount, avatarInitial: null }
    }
    if (variant === "chat-project" && (activeProject || linkedProjectChat?.projectId)) {
      const title = activeProject
        ? projectChatHeaderTitle(activeProject)
        : linkedProjectChat?.title ?? "Project chat"
      const projectKey = activeProject
        ? projectPathId(activeProject)
        : linkedProjectChat?.projectId ?? projectId
      const { memberCount } = projectChatDestination(projectKey)
      return { title, memberCount, avatarInitial: null }
    }
    return CHAT_META[variant] ?? CHAT_META.ai
  }, [activeProject, activeTeam, linkedProjectChat, projectId, teamId, variant])
  const isGroupChat = variant === "build-team" || variant === "chat-project"
  const openPage = (href, navigateOptions) => {
    if (!href) return
    if (onOpenPageInSession) {
      onOpenPageInSession(href)
      return
    }
    onOpenRecordPanel?.()
    navigate(href, navigateOptions)
  }

  const handleSendMessage = async (text) => {
    const userId = `user-${Date.now()}`
    const replyId = `reply-${Date.now()}`
    const isProjectChat =
      variant === "chat-project" ||
      (typeof messageVariantKey === "string" && messageVariantKey.startsWith("chat-project:"))

    /**
     * "@Computer process the meetings…" in a project chat with granted access: post the extracted
     * action items directly instead of the generic model reply (which has no meeting content to read).
     */
    const grantedMeetingIds = findGrantedMeetingIds(chatMessagesByVariant[messageVariantKey])
    if (isProjectChat && messageTagsComputer(text) && wantsMeetingProcessing(text) && grantedMeetingIds.length > 0) {
      setChatMessagesByVariant((prev) => ({
        ...prev,
        [messageVariantKey]: [
          ...(prev[messageVariantKey] ?? []),
          { id: userId, role: "user", text },
          { id: `${userId}-actions`, role: "system", kind: "meeting-actions", meetingIds: grantedMeetingIds },
        ],
      }))
      return
    }

    const replyAsComputer = isProjectChat && messageTagsComputer(text)
    const replyInitial =
      !replyAsComputer && isGroupChat && ["A", "R", "S", "M", "L"][Math.floor(Math.random() * 5)]

    setChatMessages((prev) => [
      ...(prev ?? []),
      { id: userId, role: "user", text },
      {
        id: replyId,
        role: replyAsComputer ? "ai" : isPersonChat ? "person" : "ai",
        text: "...",
        loading: true,
        ...(replyInitial != null ? { senderInitial: replyInitial } : {}),
      },
    ])

    try {
      let navigationIntent = null
      try {
        navigationIntent = await resolveChatNavigationIntent({
          text,
          context: {
            variant,
            projectId: linkedProjectChat?.projectId,
            teamId,
            issues,
            projects,
          },
        })
      } catch {
        navigationIntent = null
      }

      if (navigationIntent?.action === "navigate") {
        openPage(
          navigationIntent.href,
          navigationIntent.state ? { state: navigationIntent.state } : undefined
        )
        setChatMessages((prev) =>
          (prev ?? []).map((message) =>
            message.id === replyId
              ? { ...message, text: `Opening ${navigationIntent.label}.`, loading: false }
              : message
          )
        )
        return
      }

      const prompt = replyAsComputer
        ? `${COMPUTER_PROJECT_REPLY_PREFIX}\n\n${text}`
        : isPersonChat
          ? `${PERSON_REPLY_PROMPT_PREFIX}\n\nUser: ${text}`
          : text
      const response = await getAiResponse(prompt)
      setChatMessages((prev) =>
        (prev ?? []).map((message) =>
          message.id === replyId ? { ...message, text: response.trim(), loading: false } : message
        )
      )
    } catch (error) {
      const fallback = error?.message || "AI request failed. Check API key and network."
      setChatMessages((prev) =>
        (prev ?? []).map((message) =>
          message.id === replyId ? { ...message, text: fallback, loading: false } : message
        )
      )
    }
  }

  /** Any project member's grant/revoke/unlink collapses the digest to a transparency-ledger line. */
  const handleDigestAction = (digestId, status, meetingIds) => {
    setChatMessagesByVariant((prev) => ({
      ...prev,
      [messageVariantKey]: (prev[messageVariantKey] ?? []).map((message) =>
        message.id === digestId ? { ...message, digestStatus: status, digestMeetingIds: meetingIds } : message
      ),
    }))
  }

  /**
   * "Process meetings" CTA: echo the prompt as the user's own message, then post the agent's
   * extracted action items + next steps (scoped to the granted meetings) as a structured message.
   */
  const handleProcessMeetings = (meetingIds) => {
    const ids = (meetingIds ?? []).filter(Boolean)
    if (ids.length === 0) return
    const baseId = `process-${Date.now()}`
    setChatMessagesByVariant((prev) => ({
      ...prev,
      [messageVariantKey]: [
        ...(prev[messageVariantKey] ?? []),
        { id: baseId, role: "user", text: PROCESS_PROMPT },
        { id: `${baseId}-actions`, role: "system", kind: "meeting-actions", meetingIds: ids },
      ],
    }))
  }

  /**
   * Simulate the PM Agent posting its daily digest into the project chat shortly after it opens
   * (spec § Project chat notifications). Injected once per project thread.
   */
  useEffect(() => {
    const isProjectChat = messageVariantKey.startsWith("chat-project:")
    if (!isProjectChat || digestInjectedRef.current.has(messageVariantKey)) return
    digestInjectedRef.current.add(messageVariantKey)
    const key = messageVariantKey
    const timer = setTimeout(() => {
      setChatMessagesByVariant((prev) => {
        const thread = prev[key] ?? []
        if (thread.some((m) => m.role === "system" && m.kind === "meeting-digest")) return prev
        return {
          ...prev,
          [key]: [
            ...thread,
            { id: `digest-${key}`, role: "system", kind: "meeting-digest", digestStatus: "pending" },
          ],
        }
      })
    }, 1800)
    return () => clearTimeout(timer)
  }, [messageVariantKey])

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
      <ChatHeader
        title={meta.title}
        iconName={meta.iconName}
        avatarInitial={meta.avatarInitial}
        memberCount={meta.memberCount ?? null}
        hideRelatedLinksControl={hideRelatedLinksControl}
        relatedLinks={relatedLinks}
        canvasLabel={canvasLabel}
        onSelectRelatedLink={onSelectRelatedLink}
        navMenuEnabled={navMenuEnabled}
        teamId={teamId}
        projectId={projectId}
        project={activeProject}
        activeTeam={activeTeam}
        showProjectSection={showProjectNavSection}
        onNavigate={(href) => openPage(href)}
      />

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
                {message.role === "system" && message.kind === "meeting-digest" ? (
                  <MeetingDigestMessage
                    status={message.digestStatus}
                    actedMeetingIds={message.digestMeetingIds}
                    onAction={(status, meetingIds) => handleDigestAction(message.id, status, meetingIds)}
                    onProcess={handleProcessMeetings}
                  />
                ) : message.role === "system" && message.kind === "meeting-actions" ? (
                  <MeetingActionsMessage meetingIds={message.meetingIds} />
                ) : message.role === "user" ? (
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
                      const pathId = linkedProjectChat?.projectId
                      if (!pathId || message.loading) return
                      const t = String(message.text ?? "").trim()
                      if (!t) return
                      appendProjectActivity(linkedProjectChat.projectId, t)
                      navigate(projectTabHref(pathId, "Activity"))
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
