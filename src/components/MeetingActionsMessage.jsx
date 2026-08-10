import { DIGEST_MEETINGS } from "../lib/meetingDigest"
import { MicroControl } from "./MicroControl"

const BODY_STYLE = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "20px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
}

const TITLE_STYLE = { ...BODY_STYLE, fontVariationSettings: '"wght" 560' }
const META_STYLE = { ...BODY_STYLE, fontSize: "12px", lineHeight: "16px" }
const FG_PROMINENT = "rgba(48, 46, 47, 0.94)"

/**
 * PM Agent output for "process the meetings": action items + next steps extracted from the meetings
 * the user granted content access to (spec § Graceful degradation — full content for granted). Only
 * granted meetings appear; everything else contributes metadata only and is omitted here.
 */
export function MeetingActionsMessage({ meetingIds }) {
  const ids = Array.isArray(meetingIds) ? meetingIds : []
  const meetings = DIGEST_MEETINGS.filter((m) => ids.includes(m.id))
  if (meetings.length === 0) return null

  const totalItems = meetings.reduce((n, m) => n + m.actionItems.length, 0)

  return (
    <section className="flex w-full flex-col items-start gap-[8px]">
      <MicroControl type="tag" layout="textOnly" label="Worked 3s" />
      <p className="w-full" style={{ ...BODY_STYLE, color: FG_PROMINENT }}>
        Done — I read {meetings.length} {meetings.length === 1 ? "meeting" : "meetings"} you granted access to and
        pulled out {totalItems} action {totalItems === 1 ? "item" : "items"} and next steps. 📋
      </p>

      <div className="flex w-full flex-col gap-[12px] rounded-[10px] border border-[#e8e0f8] bg-[#faf8ff] px-[14px] py-[12px]">
        {meetings.map((m) => (
          <div key={m.id} className="flex flex-col gap-[6px]">
            <div className="flex items-baseline gap-[6px]">
              <span style={{ ...TITLE_STYLE, color: FG_PROMINENT }}>{m.title}</span>
              <span style={{ ...META_STYLE, color: "#a5a0a3" }}>· {m.time}</span>
            </div>
            <ul className="m-0 flex list-none flex-col gap-[5px] p-0">
              {m.actionItems.map((item, i) => (
                <li key={i} className="flex items-start gap-[8px]">
                  <span className="mt-[6px] inline-block size-[5px] shrink-0 rounded-full bg-[#6e56cf]" aria-hidden />
                  <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-[8px] gap-y-[2px]">
                    <span style={{ ...BODY_STYLE, color: FG_PROMINENT }}>{item.text}</span>
                    <span className="inline-flex items-center gap-[6px]">
                      <MicroControl type="tag" layout="textOnly" label={item.owner} />
                      <MicroControl type="tag" layout="textOnly" tone="muted" label={`Due ${item.due}`} />
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex items-start gap-[6px] pl-[13px]">
              <span style={{ ...META_STYLE, fontVariationSettings: '"wght" 520', color: "#6e56cf" }}>Next:</span>
              <span style={{ ...META_STYLE, color: "#737072" }}>{m.nextStep}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
