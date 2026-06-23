import { ChatAvatar } from "./ChatAvatar"
import { Icon } from "./Icon"

const CHIP_TEXT_STYLE = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
}

/** Figma `6232:11750` — selected person chip in new-chat title row. */
export function NewChatParticipantChip({ label, initial, onRemove }) {
  const chipInitial = (initial ?? label?.[0] ?? "?").toUpperCase()

  return (
    <button
      type="button"
      className="inline-flex h-[28px] shrink-0 items-center overflow-hidden rounded-[2px] border-0 bg-[var(--background-primary-subtle)] text-[var(--foreground-primary)] transition-colors duration-150 hover:bg-[var(--control-bg-hover)]"
      style={CHIP_TEXT_STYLE}
      onClick={onRemove}
      aria-label={`Remove ${label}`}
    >
      <ChatAvatar initial={chipInitial} />
      <span className="inline-flex items-center py-[6px] whitespace-nowrap">{label}</span>
      <Icon name="close" />
    </button>
  )
}
