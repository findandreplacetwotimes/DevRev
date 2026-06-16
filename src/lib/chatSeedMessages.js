/** Demo seed threads keyed by chat variant (or project-scoped project chat). */
export const PROJECT_CHAT_THREAD_KEY = "chat-project:Project-0001"

export const SEED_MESSAGES_BY_VARIANT = {
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
    { id: "seed-arjun-1", role: "user", text: "Hey Arjun, can you review the project milestones table before standup?" },
    { id: "seed-arjun-2", role: "person", text: "Yep, looking now. I already see one mismatch in due date formatting." },
    { id: "seed-arjun-3", role: "user", text: "Good catch. Is it only on the projects page or in issue details too?" },
    { id: "seed-arjun-4", role: "person", text: "Only projects page. Issue details are using the correct helper." },
    { id: "seed-arjun-5", role: "user", text: "Can you open a small PR for that and tag me?" },
    { id: "seed-arjun-6", role: "person", text: "Will do. I can have it up in about 20 minutes." },
  ],
  "chat-sneha": [
    { id: "seed-sneha-1", role: "user", text: "Morning! How are we looking on the Issues vs Backlog filtering?" },
    { id: "seed-sneha-2", role: "person", text: "Functionally done. I am validating edge cases with empty sprint values." },
    { id: "seed-sneha-3", role: "user", text: "Perfect. We should also persist the selected tab after refresh." },
    { id: "seed-sneha-4", role: "person", text: "Already added localStorage for that. Want me to add a quick Storybook note too?" },
    { id: "seed-sneha-5", role: "user", text: "Yes please, especially around Backlog behavior." },
    { id: "seed-sneha-6", role: "person", text: "Done. I'll paste a short QA checklist in the PR description." },
    { id: "seed-sneha-7", role: "user", text: "Great, thanks." },
    { id: "seed-sneha-8", role: "person", text: "Anytime. I will ping once CI is green." },
  ],
  "chat-rohan": [
    { id: "seed-rohan-1", role: "user", text: "Rohan, did you confirm nav order with design?" },
    { id: "seed-rohan-2", role: "person", text: "Yes. Sprints should be above Projects in primary nav." },
    { id: "seed-rohan-3", role: "user", text: "Nice. How about Build team placement?" },
    { id: "seed-rohan-4", role: "person", text: "It belongs under Chats as the first entry, with chat icon." },
    { id: "seed-rohan-5", role: "user", text: "Exactly what I needed. Can we keep Projects icon as page?" },
    { id: "seed-rohan-6", role: "person", text: "Yep, project icon only for project chat contexts." },
    { id: "seed-rohan-7", role: "user", text: "Great, thanks for helping align the details." },
    { id: "seed-rohan-8", role: "person", text: "No problem. I can sanity-check the whole nav once more before release." },
    { id: "seed-rohan-9", role: "user", text: "Please do, especially active state behavior from nested pages." },
    { id: "seed-rohan-10", role: "person", text: "On it. I will share a quick video if I find anything odd." },
  ],
  "chat-leela": [
    { id: "seed-leela-1", role: "user", text: "Leela, can you help draft rollout notes for this week's deploy?" },
    { id: "seed-leela-2", role: "person", text: "Sure. Do you want separate notes for app and Storybook?" },
    { id: "seed-leela-3", role: "user", text: "Yes, plus a short section on known warnings that are non-blocking." },
    { id: "seed-leela-4", role: "person", text: "Got it. I'll mention npm env warnings and chunk-size warning context." },
    { id: "seed-leela-5", role: "user", text: "Perfect. Also add links to prod aliases." },
    { id: "seed-leela-6", role: "person", text: "Will do. I will include both app and components URLs." },
    { id: "seed-leela-7", role: "user", text: "Can you finish before noon?" },
    { id: "seed-leela-8", role: "person", text: "Yes, I can post a draft in the next 30 minutes." },
    { id: "seed-leela-9", role: "user", text: "Awesome, thank you." },
    { id: "seed-leela-10", role: "person", text: "Happy to help." },
    { id: "seed-leela-11", role: "user", text: "After that, let's prep a tiny FAQ for support." },
    { id: "seed-leela-12", role: "person", text: "Great idea. I will include common questions about panel state persistence." },
  ],
}

export function getMessageVariantKey(variant, linkedProjectChat) {
  if (variant === "chat-project" && linkedProjectChat?.projectId) {
    return `chat-project:${linkedProjectChat.projectId}`
  }
  return variant
}

export function createSeedMessagesForSession(variant, linkedProjectChat) {
  const key = getMessageVariantKey(variant, linkedProjectChat)
  const seed = SEED_MESSAGES_BY_VARIANT[key] ?? []
  return seed.map((message) => ({ ...message }))
}
