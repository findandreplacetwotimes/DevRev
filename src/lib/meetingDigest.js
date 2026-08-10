/**
 * Meetings the PM Agent found related to the project (spec § Daily digest). Action items and next
 * steps are the "extracted content" that only becomes readable once a member grants content access —
 * see {@link ../components/MeetingActionsMessage}.
 */
export const DIGEST_MEETINGS = [
  {
    id: "sprint-sync",
    title: "Sprint sync",
    time: "10:00am",
    topics: "API contract · permissions model",
    actionItems: [
      { text: "Finalize the memory-retrieval API contract", owner: "Shivam", due: "Thu" },
      { text: "Lock the single-tenant permissions model for v1", owner: "Priyanka", due: "Wed" },
    ],
    nextStep: "Circulate the contract draft for async sign-off before next sprint.",
  },
  {
    id: "design-review",
    title: "Design review",
    time: "2:00pm",
    topics: "Memory retrieval · storage format",
    actionItems: [
      { text: "Decide the storage format for memory artifacts", owner: "Tim", due: "Fri" },
      { text: "Benchmark retrieval latency on the spike branch", owner: "Sneha", due: "Mon" },
    ],
    nextStep: "Share latency numbers in this chat once the spike lands.",
  },
  {
    id: "platform-align",
    title: "Platform alignment",
    time: "3:00pm",
    topics: "Agent identity · shared deps",
    actionItems: [
      { text: "Align on the shared agent-identity model", owner: "Rohan", due: "Thu" },
      { text: "Resolve the storage-API dependency with the Memory team", owner: "Leela", due: "next sprint" },
    ],
    nextStep: "Book a 30-min follow-up to close the cross-team dependency.",
  },
]

/** Prompt the "Process meetings" CTA mirrors into the chat as if the user typed it. */
export const PROCESS_PROMPT = "@Computer process the above meetings to post action items and next steps"

/** True when a chat message asks the agent to process / summarize the linked meetings. */
export function wantsMeetingProcessing(text) {
  if (!text || typeof text !== "string") return false
  return /\b(process|summari[sz]e|action items?|next steps?)\b/i.test(text) && /\bmeetings?\b/i.test(text)
}
