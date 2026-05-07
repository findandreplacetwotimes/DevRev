export const SLASH_TEXT_STYLE = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "15px",
  lineHeight: "24px",
  letterSpacing: "-0.15px",
  fontStyle: "normal",
}

export const SLASH_TEXT_PROMINENT = "rgba(48, 46, 47, 0.94)"
export const SLASH_ACTIVE_COLOR = "rgba(71, 7, 209, 0.81)"
export const SLASH_LOADING_SUFFIX = [".", "..", "..."]
/** Quick rollback switch for local date-command behavior. */
export const ENABLE_LOCAL_SLASH_DATE_COMMAND = false
/** AI may emit structured command signals (e.g. set_due_date). */
export const ENABLE_AI_SLASH_COMMAND_SIGNAL = true
/** Due-date control opens as combobox input + menu (easy rollback switch). */
export const ENABLE_DUE_DATE_COMBO_INPUT = true
/** Issue page "More" button opens attributes modal (easy rollback switch). */
export const ENABLE_ISSUE_ATTRIBUTES_MODAL = true

export function getInlineSlashState(value) {
  const slashIndex = value.indexOf("/")
  if (slashIndex === -1) return { active: false, start: -1 }

  const afterSlash = value.slice(slashIndex + 1)
  if (!afterSlash || afterSlash.startsWith(" ")) return { active: false, start: slashIndex }

  return { active: true, start: slashIndex }
}
