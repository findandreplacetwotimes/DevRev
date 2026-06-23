/** Figma `6077:38170` — @mention token in message field. */
export const MENTION_COLOR_INPUT = "#6900f2"

/** Readable @mention on outbound bubble (`--foreground-primary` fill). */
export const MENTION_COLOR_ON_DARK = "#e9d5ff"

export const DEFAULT_MENTION_TARGETS = [
  { id: "computer", label: "Computer", kind: "computer" },
  { id: "manasa", label: "Manasa", kind: "person", initial: "M" },
  { id: "arjun", label: "Arjun", kind: "person", initial: "A" },
  { id: "sneha", label: "Sneha", kind: "person", initial: "S" },
  { id: "rohan", label: "Rohan", kind: "person", initial: "R" },
  { id: "leela", label: "Leela", kind: "person", initial: "L" },
]

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** True when the message includes an inserted `@Computer` mention (same label as pick list). */
export function messageTagsComputer(text, targets = DEFAULT_MENTION_TARGETS) {
  if (!text || typeof text !== "string") return false
  const computer = targets.find((t) => t.kind === "computer" || t.id === "computer")
  const label = computer?.label ?? "Computer"
  return new RegExp(`@${escapeRegExp(label)}\\b`).test(text)
}

/**
 * Returns `{ start, query }` when the caret is inside an `@…` mention query (same line, no space in query).
 */
export function getActiveMentionQuery(value, caretIndex) {
  const textBeforeCaret = value.slice(0, caretIndex)
  const atIndex = textBeforeCaret.lastIndexOf("@")
  if (atIndex === -1) return null

  const segment = value.slice(atIndex, caretIndex)
  if (segment.includes("\n")) return null

  const query = segment.slice(1)
  if (query.includes(" ")) return null

  if (atIndex > 0) {
    const prev = value[atIndex - 1]
    if (prev && /\w/.test(prev)) return null
  }

  return { start: atIndex, query }
}

export function filterMentionTargets(targets, queryLower) {
  if (!queryLower) return targets
  return targets.filter((t) => t.label.toLowerCase().startsWith(queryLower))
}

/** People picker for new-chat top bar (no `@`, excludes already picked). */
export function filterPeoplePickerTargets(targets, query, excludeIds = []) {
  const exclude = new Set(excludeIds)
  const people = targets.filter((t) => t.kind === "person" && !exclude.has(t.id))
  const q = query.trim().toLowerCase()
  if (!q) return people
  return filterMentionTargets(people, q)
}

/**
 * Split `text` into plain / mention spans for known `@Label` tokens (labels longest-first).
 */
export function parseMentionSegments(text, targets = DEFAULT_MENTION_TARGETS) {
  if (!text) return [{ type: "text", text: "" }]
  const labels = [...new Set(targets.map((t) => t.label))].sort((a, b) => b.length - a.length)
  if (labels.length === 0) return [{ type: "text", text }]
  const inner = labels.map((l) => escapeRegExp(l)).join("|")
  const re = new RegExp(`@(?:${inner})\\b`, "g")
  const out = []
  let last = 0
  let m
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ type: "text", text: text.slice(last, m.index) })
    out.push({ type: "mention", text: m[0] })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ type: "text", text: text.slice(last) })
  return out.length ? out : [{ type: "text", text }]
}

/**
 * Viewport rect for the caret in a textarea (for positioning the @ menu).
 * The mirror must sit at the same viewport position as the textarea; otherwise
 * `getBoundingClientRect()` is measured from (0,0) on the page and the menu
 * shifts horizontally (e.g. appears to the right of the caret).
 */
export function getTextareaCaretClientRect(textarea, position) {
  const mirror = document.createElement("div")
  const cs = window.getComputedStyle(textarea)
  const taRect = textarea.getBoundingClientRect()

  mirror.setAttribute("aria-hidden", "true")
  mirror.style.position = "fixed"
  mirror.style.left = `${taRect.left}px`
  mirror.style.top = `${taRect.top}px`
  mirror.style.visibility = "hidden"
  mirror.style.pointerEvents = "none"
  mirror.style.whiteSpace = "pre-wrap"
  mirror.style.wordWrap = "break-word"
  mirror.style.overflow = "hidden"
  mirror.style.boxSizing = cs.boxSizing
  mirror.style.width = `${textarea.clientWidth}px`
  mirror.style.padding = cs.padding
  mirror.style.border = cs.border
  mirror.style.font = cs.font
  mirror.style.lineHeight = cs.lineHeight
  mirror.style.letterSpacing = cs.letterSpacing
  mirror.style.fontFamily = cs.fontFamily
  mirror.style.fontSize = cs.fontSize
  mirror.style.fontWeight = cs.fontWeight
  mirror.style.fontVariationSettings = cs.fontVariationSettings ?? ""

  const before = textarea.value.slice(0, position)
  mirror.textContent = ""
  mirror.appendChild(document.createTextNode(before))
  const marker = document.createElement("span")
  marker.textContent = "\u200b"
  mirror.appendChild(marker)

  document.body.appendChild(mirror)
  const rect = marker.getBoundingClientRect()
  document.body.removeChild(mirror)
  return rect
}

/**
 * Matches `MentionMenu` layout: `p-[6px]`, `gap-[4px]`, rows = `max(28px icon rail, py-[6px]+16px label)` ≈ **28px**.
 * Using 40px per row over-counted height (~12px × n), so `top = caretTop - height` placed the menu **too high**.
 */
export function estimateMentionMenuHeight(itemCount) {
  if (itemCount <= 0) return 0
  const pad = 12
  const row = 28
  const gap = 4
  return pad + itemCount * row + Math.max(0, itemCount - 1) * gap
}
