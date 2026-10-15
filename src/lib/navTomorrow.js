/**
 * Tomorrow-vision nav layout for the computer track.
 * Page rows open canvas; TEAMS / CHATS / SESSIONS hold session chats only.
 */

export const NAV_TOMORROW_STORAGE_KEY = "devrev.nav.tomorrow.v1"

export const TOMORROW_BUCKETS = [
  { id: "favourites", title: "FAVOURITES" },
  { id: "chats", title: "CHATS" },
  { id: "sessions", title: "SESSIONS" },
]

/** Primary page rows — open in canvas, not as session routes. */
export const TOMORROW_PAGE_ITEMS = [
  { id: "team:page:issues", label: "Issues", iconName: "page" },
  { id: "team:page:projects", label: "Projects", iconName: "page" },
]

const DEFAULT_TEAMS_SESSION_IDS = ["team:chat"]
const DEFAULT_CHATS_SESSION_IDS = ["chat-arjun", "chat-sneha", "chat-rohan", "chat-leela"]
const DEFAULT_SESSIONS_SESSION_IDS = ["computer", "project:chat"]

function emptyLayout() {
  return {
    sectionOrder: TOMORROW_BUCKETS.map((bucket) => bucket.id),
    sections: {
      favourites: { id: "favourites", title: "FAVOURITES", sessionIds: [] },
      chats: { id: "chats", title: "CHATS", sessionIds: [...DEFAULT_CHATS_SESSION_IDS] },
      sessions: { id: "sessions", title: "SESSIONS", sessionIds: [...DEFAULT_SESSIONS_SESSION_IDS] },
    },
    teamsSessionIds: [...DEFAULT_TEAMS_SESSION_IDS],
  }
}

export function loadTomorrowLayout() {
  if (typeof window === "undefined") return emptyLayout()
  try {
    const raw = window.localStorage.getItem(NAV_TOMORROW_STORAGE_KEY)
    if (!raw) return emptyLayout()
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") return emptyLayout()
    const base = emptyLayout()
    return {
      ...base,
      teamsSessionIds: Array.isArray(parsed.teamsSessionIds)
        ? parsed.teamsSessionIds
        : base.teamsSessionIds,
      sectionOrder: Array.isArray(parsed.sectionOrder) ? parsed.sectionOrder : base.sectionOrder,
      sections: {
        ...base.sections,
        ...(parsed.sections && typeof parsed.sections === "object" ? parsed.sections : {}),
      },
    }
  } catch {
    return emptyLayout()
  }
}

export function saveTomorrowLayout(layout) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(NAV_TOMORROW_STORAGE_KEY, JSON.stringify(layout))
  } catch {
    /* ignore */
  }
}
