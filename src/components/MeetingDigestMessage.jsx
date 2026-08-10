import { useState } from "react"
import { DIGEST_MEETINGS } from "../lib/meetingDigest"
import { MicroControl } from "./MicroControl"
import { Selector } from "./Selector"

/** Figma `5879:37970` — Paragraph/Body Small (13/20, –0.13px). Shared with AiMessageBubble. */
const BODY_STYLE = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "20px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
}

const TITLE_STYLE = {
  ...BODY_STYLE,
  fontVariationSettings: '"wght" 560',
}

const META_STYLE = {
  ...BODY_STYLE,
  fontSize: "12px",
  lineHeight: "16px",
}

const FG_PROMINENT = "rgba(48, 46, 47, 0.94)"

/** The 3 meetings the PM Agent found related to this project (spec § Daily digest). */
const MEETINGS = DIGEST_MEETINGS

/** Member whose action the transparency ledger attributes (prototype: a fixed project member). */
const ACTOR = "Priyanka"

/** "All 3 meetings" / "2 of 3 meetings" / "Sprint sync" — phrasing for the ledger line. */
function describeSelection(count) {
  if (count >= MEETINGS.length) return `All ${MEETINGS.length} meetings`
  if (count === 1) return "1 meeting"
  return `${count} of ${MEETINGS.length} meetings`
}

/** Friendly ledger line shown in place of the digest once any member acts. */
function collapsedCopy(status, count) {
  const subject = describeSelection(count)
  if (status === "revoked") {
    return {
      emoji: "🔒",
      line: `${subject} — content access kept private by ${ACTOR}.`,
      note: "Got it — they stay linked for context, but their content stays private.",
    }
  }
  if (status === "unlinked") {
    return {
      emoji: "🙈",
      line: `${subject} unlinked from this project by ${ACTOR}.`,
      note: "No worries — they won’t show up here again.",
    }
  }
  return {
    emoji: "🔓",
    line: `${subject} linked today. Content access: granted by ${ACTOR}.`,
    note: "Nice — your briefings and status updates can now pull decisions and action items from these meetings.",
  }
}

function ActionButton({ children, tone = "neutral", disabled = false, onClick }) {
  const toneClass =
    tone === "primary"
      ? "bg-[#6e56cf] text-white hover:bg-[#5b45b0]"
      : "bg-[var(--background-primary-subtle)] text-[var(--foreground-primary)] hover:bg-[var(--control-bg-hover)]"
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-[28px] shrink-0 items-center rounded-[4px] border-0 px-[12px] appearance-none transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${toneClass}`}
      style={{
        fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: "12px",
        letterSpacing: "-0.12px",
        fontVariationSettings: '"wght" 520',
      }}
    >
      {children}
    </button>
  )
}

/**
 * PM Agent daily digest posted into the project multiplayer chat (spec § Daily digest + transparency
 * ledger). `pending` lists the found meetings with per-meeting bulk select (all on by default) plus
 * grant / keep-private / unlink controls that apply to the selected subset; any member's action
 * collapses it in place to a friendly transparency line attributed to {@link ACTOR}.
 */
export function MeetingDigestMessage({ status = "pending", actedMeetingIds, onAction, onProcess }) {
  const [selected, setSelected] = useState(() => new Set(MEETINGS.map((m) => m.id)))

  if (status !== "pending") {
    const acted = Array.isArray(actedMeetingIds) ? actedMeetingIds : []
    const c = collapsedCopy(status, acted.length || MEETINGS.length)
    const canProcess = status === "granted" && acted.length > 0
    return (
      <section className="flex w-full flex-col items-start gap-[8px]">
        <MicroControl type="tag" layout="textOnly" label="PM Agent" />
        <div className="flex w-full flex-col gap-[10px] rounded-[8px] border border-[#ece9f6] bg-[#faf8ff] px-[12px] py-[10px]">
          <div className="flex items-start gap-[8px]">
            <span className="text-[14px] leading-[20px]" aria-hidden>
              {c.emoji}
            </span>
            <div className="flex min-w-0 flex-col gap-[2px]">
              <span style={{ ...TITLE_STYLE, color: FG_PROMINENT }}>{c.line}</span>
              <span style={{ ...META_STYLE, color: "#737072" }}>{c.note}</span>
            </div>
          </div>
          {canProcess ? (
            <div className="flex flex-wrap items-center gap-[8px] pl-[22px]">
              <ActionButton tone="primary" onClick={() => onProcess?.(acted)}>
                ✨ Process meetings → action items
              </ActionButton>
            </div>
          ) : null}
        </div>
      </section>
    )
  }

  const allSelected = selected.size === MEETINGS.length
  const toggleMeeting = (id) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const toggleAll = () =>
    setSelected((prev) => (prev.size === MEETINGS.length ? new Set() : new Set(MEETINGS.map((m) => m.id))))

  return (
    <section className="flex w-full flex-col items-start gap-[8px]">
      <MicroControl type="tag" layout="textOnly" label="PM Agent" />
      <div className="flex w-full flex-col gap-[12px] rounded-[10px] border border-[#e8e0f8] bg-[#faf8ff] px-[14px] py-[12px]">
        <div className="flex items-start gap-[10px]">
          <span className="inline-flex size-[28px] shrink-0 items-center justify-center rounded-full bg-[#6e56cf]/10">
            <img src="/icons/calendar.svg" alt="" className="block size-[14px]" draggable={false} />
          </span>
          <div className="flex min-w-0 flex-col gap-[2px]">
            <span style={{ ...TITLE_STYLE, color: FG_PROMINENT }}>
              I found 3 meetings related to this project today 👋
            </span>
            <span style={{ ...META_STYLE, color: "#737072" }}>
              They’re linked for context. Pick which ones I can read for briefings and status updates.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={toggleAll}
            className="inline-flex items-center gap-[4px] rounded-[4px] border-0 bg-transparent p-0 appearance-none hover:opacity-80"
            style={{ ...META_STYLE, fontVariationSettings: '"wght" 520', color: "#6e56cf" }}
          >
            {allSelected ? "Clear selection" : "Select all"}
          </button>
          <span style={{ ...META_STYLE, color: "#a5a0a3" }}>
            {selected.size} of {MEETINGS.length} selected
          </span>
        </div>

        <ul className="m-0 flex list-none flex-col gap-[8px] p-0">
          {MEETINGS.map((m) => {
            const isOn = selected.has(m.id)
            return (
              <li key={m.id}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isOn}
                  onClick={() => toggleMeeting(m.id)}
                  className={`flex w-full items-start gap-[8px] rounded-[6px] border bg-white px-[10px] py-[7px] text-left appearance-none transition-colors duration-150 ${
                    isOn ? "border-[#cdbcf2]" : "border-[#efeaf9] opacity-55 hover:opacity-80"
                  }`}
                >
                  <Selector className="-ml-[6px] -my-[5px]" variant={isOn ? "selected" : "notSelected"} />
                  <span className="flex min-w-0 flex-col gap-[1px]">
                    <span style={{ ...BODY_STYLE, fontVariationSettings: '"wght" 520', color: FG_PROMINENT }}>
                      {m.title}
                      <span style={{ color: "#a5a0a3" }}> · {m.time}</span>
                    </span>
                    <span style={{ ...META_STYLE, color: "#737072" }}>{m.topics}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <div className="flex flex-wrap items-center gap-[8px]">
          <ActionButton tone="primary" disabled={selected.size === 0} onClick={() => onAction?.("granted", [...selected])}>
            ✨ Grant content access
          </ActionButton>
          <ActionButton disabled={selected.size === 0} onClick={() => onAction?.("revoked", [...selected])}>
            Keep private
          </ActionButton>
          <ActionButton disabled={selected.size === 0} onClick={() => onAction?.("unlinked", [...selected])}>
            Unlink
          </ActionButton>
        </div>
      </div>
    </section>
  )
}
