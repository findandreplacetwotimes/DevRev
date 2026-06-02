import { useMemo, useState } from "react"
import { HistoryDetailItem, HistoryEventsCollapsed, HistoryItem, HistoryTimelineGroup } from "./HistoryItem"
import { MicroControl } from "./MicroControl"
import { generateProjectActivity } from "../lib/projectEvents"
import { buildProjectActivityFeed } from "../lib/projectActivityFeed"

const meta = {
  title: "Components/HistoryItem",
  parameters: {
    layout: "padded",
  },
}

export default meta

/** Figma `6003:7034` attribute row (“Owner”). */
export function OwnerChange() {
  return (
    <div className="w-full max-w-[742px] bg-white">
      <HistoryItem actorInitial="M" attribute="Owner" fromValue="Manasa" toValue="Greg" />
    </div>
  )
}

/** Figma `6085:8279` Hover variant — hover over the row to reveal the More micro control; click for a one-item Delete menu. */
export function OwnerChangeWithDelete() {
  return (
    <div className="w-full max-w-[742px] bg-white">
      <HistoryItem
        actorInitial="M"
        attribute="Owner"
        fromValue="Manasa"
        toValue="Greg"
        onDelete={() => {}}
      />
    </div>
  )
}

/** Figma stacked example (`6003:7426`): “Date”. */
export function DateChange() {
  return (
    <div className="w-full max-w-[742px] bg-white">
      <HistoryItem actorInitial="M" attribute="Date" fromValue="25 April" toValue="26 April" />
    </div>
  )
}

export function HealthChange() {
  return (
    <div className="w-full max-w-[742px] bg-white">
      <HistoryItem actorInitial="M" attribute="Health" fromValue="At risk" toValue="On track" />
    </div>
  )
}

export function DescriptionBlock() {
  return (
    <div className="w-full max-w-[742px] bg-white">
      <HistoryDetailItem
        actorInitial="M"
        attribute="Description"
        detail="The team is actively working on improving sprint efficiency. Next step is aligning capacity with stakeholder asks before Friday."
      />
    </div>
  )
}

/** Figma `6085:8421` Hover post variant — change-line row reveals More on hover; menu has Delete only. */
export function DescriptionBlockWithDelete() {
  return (
    <div className="w-full max-w-[742px] bg-white">
      <HistoryDetailItem
        actorInitial="M"
        attribute="Description"
        detail="The team is actively working on improving sprint efficiency. Next step is aligning capacity with stakeholder asks before Friday."
        onDelete={() => {}}
      />
    </div>
  )
}

/** Matches `261:11242` / `6003:7587`,`6003:7843`: 12px below tag only; rows abut (gap 0). */
export function GroupWithTimestamp() {
  return (
    <div className="w-full max-w-[742px] bg-white">
      <HistoryTimelineGroup
        timestamp={<MicroControl type="tag" layout="timestamp" datePart="today," timePart="9:15 AM" />}
      >
        <HistoryItem actorInitial="M" attribute="Owner" fromValue="Manasa" toValue="Greg" />
        <HistoryItem actorInitial="M" attribute="Date" fromValue="25 April" toValue="26 April" />
        <HistoryItem actorInitial="M" attribute="Owner" fromValue="Greg" toValue="Sneha Sharma" />
      </HistoryTimelineGroup>
    </div>
  )
}

/** Figma `6086:10599` — collapsed event row in isolation ("25 events hidden. Show"). */
export function CollapsedEventRow() {
  return (
    <div className="w-full max-w-[742px] bg-white">
      <HistoryEventsCollapsed count={25} onExpand={() => {}} />
    </div>
  )
}

const UPDATE_BODY =
  "The team is actively working on improving sprint efficiency by addressing current challenges in sprint management. Efforts are focused on streamlining communication, automating task tracking, and enhancing visibility to reduce time spent on administrative activities. Progress is being monitored closely to ensure timely identification and resolution of issues, aiming to optimize overall sprint execution."

function ActivitySlot({ timestamp, updates = [], events = [], collapsedCount = 0 }) {
  return (
    <HistoryTimelineGroup
      timestamp={
        <MicroControl
          type="tag"
          layout="timestamp"
          datePart={timestamp.datePart}
          timePart={timestamp.timePart ?? ""}
        />
      }
    >
      <div className="flex w-full min-w-0 flex-col gap-[12px]">
        {updates.length > 0 ? (
          <div className="flex w-full min-w-0 flex-col gap-[12px]">
            {updates.map((up, idx) => (
              <HistoryDetailItem
                key={idx}
                actorInitial={up.actorInitial}
                attribute={up.attribute}
                fromValue={up.fromValue}
                toValue={up.toValue}
                detail={up.detail}
              />
            ))}
          </div>
        ) : null}
        {events.length > 0 || collapsedCount > 0 ? (
          <div className="flex w-full min-w-0 flex-col gap-0">
            {events.map((ev, idx) => (
              <HistoryItem
                key={idx}
                actorInitial={ev.actorInitial}
                attribute={ev.attribute}
                fromValue={ev.fromValue}
                toValue={ev.toValue}
              />
            ))}
            {collapsedCount > 0 ? (
              <HistoryEventsCollapsed count={collapsedCount} onExpand={() => {}} />
            ) : null}
          </div>
        ) : null}
      </div>
    </HistoryTimelineGroup>
  )
}

/** Figma `6086:10574` ActivityItem — `state=Default`, `type=Update only`: timestamp + update (attribute change + body). */
export function ActivityItem_UpdateOnly() {
  return (
    <div className="w-full max-w-[742px] bg-white">
      <ActivitySlot
        timestamp={{ datePart: "25 April" }}
        updates={[
          { actorInitial: "M", attribute: "Owner", fromValue: "Manasa", toValue: "Greg", detail: UPDATE_BODY },
        ]}
      />
    </div>
  )
}

/** Figma `6086:10610` ActivityItem — `state=Not collapsed`, `type=Events only`: timestamp + 3 events. */
export function ActivityItem_EventsOnly_NotCollapsed() {
  return (
    <div className="w-full max-w-[742px] bg-white">
      <ActivitySlot
        timestamp={{ datePart: "25 April" }}
        events={[
          { actorInitial: "M", attribute: "Owner", fromValue: "Manasa", toValue: "Greg" },
          { actorInitial: "M", attribute: "Owner", fromValue: "Manasa", toValue: "Greg" },
          { actorInitial: "M", attribute: "Owner", fromValue: "Manasa", toValue: "Greg" },
        ]}
      />
    </div>
  )
}

/** Figma `6086:10693` ActivityItem — `state=Not collapsed`, `type=Update + event`: timestamp + update + 3 events. */
export function ActivityItem_UpdateAndEvents_NotCollapsed() {
  return (
    <div className="w-full max-w-[742px] bg-white">
      <ActivitySlot
        timestamp={{ datePart: "25 April" }}
        updates={[
          { actorInitial: "M", attribute: "Owner", fromValue: "Manasa", toValue: "Greg", detail: UPDATE_BODY },
        ]}
        events={[
          { actorInitial: "M", attribute: "Owner", fromValue: "Manasa", toValue: "Greg" },
          { actorInitial: "M", attribute: "Owner", fromValue: "Manasa", toValue: "Greg" },
          { actorInitial: "M", attribute: "Owner", fromValue: "Manasa", toValue: "Greg" },
        ]}
      />
    </div>
  )
}

/** Figma `6086:10762` ActivityItem — `state=Collapsed`, `type=Events only`: timestamp + "N events hidden. Show". */
export function ActivityItem_EventsOnly_Collapsed() {
  return (
    <div className="w-full max-w-[742px] bg-white">
      <ActivitySlot timestamp={{ datePart: "25 April" }} collapsedCount={25} />
    </div>
  )
}

/** Figma `6086:10814` ActivityItem — `state=Collapsed`, `type=Update + event`: timestamp + update + collapsed events. */
export function ActivityItem_UpdateAndEvents_Collapsed() {
  return (
    <div className="w-full max-w-[742px] bg-white">
      <ActivitySlot
        timestamp={{ datePart: "25 April" }}
        updates={[
          { actorInitial: "M", attribute: "Owner", fromValue: "Manasa", toValue: "Greg", detail: UPDATE_BODY },
        ]}
        collapsedCount={3}
      />
    </div>
  )
}

/** Figma `6086:10883` ActivityItem — `state=Collapsed`, `type=Events only` over a date range: timestamp "first — last". */
export function ActivityItem_DateRange_Collapsed() {
  return (
    <div className="w-full max-w-[742px] bg-white">
      <ActivitySlot timestamp={{ datePart: "25 April — 28 April" }} collapsedCount={25} />
    </div>
  )
}

/** Figma `6086:10552` Update component in isolation — change line ("Owner Manasa → Greg") + body, no timestamp wrapper. */
export function UpdateWithAttributeChangeOnly() {
  return (
    <div className="w-full max-w-[742px] bg-white">
      <HistoryDetailItem
        actorInitial="M"
        attribute="Owner"
        fromValue="Manasa"
        toValue="Greg"
        detail={UPDATE_BODY}
      />
    </div>
  )
}

/** Variant `6003:7899`: multiline History item sits 12px below tag (same top gap); no spacer between groups here. */
export function GroupTimestampThenDetail() {
  return (
    <div className="w-full max-w-[650px] bg-white">
      <HistoryTimelineGroup
        timestamp={<MicroControl type="tag" layout="timestamp" datePart="today," timePart="9:15 AM" />}
      >
        <HistoryItem actorInitial="M" attribute="Owner" fromValue="Manasa" toValue="Greg" />
        <HistoryItem actorInitial="M" attribute="Date" fromValue="25 April" toValue="26 April" />
        <HistoryItem actorInitial="M" attribute="Owner" fromValue="Greg" toValue="Sneha Sharma" />
      </HistoryTimelineGroup>
      <HistoryTimelineGroup
        className="mt-[24px]"
        timestamp={<MicroControl type="tag" layout="timestamp" datePart="today," timePart="11:41 AM" />}
      >
        <HistoryDetailItem
          actorInitial="M"
          attribute="Description"
          detail={
            "The team is actively working on improving sprint efficiency.\nStakeholder review lands Thursday."
          }
        />
      </HistoryTimelineGroup>
    </div>
  )
}

/**
 * Full Activity-tab pipeline from `generateProjectActivity` + `buildProjectActivityFeed`.
 * Exercises every collapse case in a single render (today, single past event, update + event,
 * collapse on a day, update + collapsed events, merged date range).
 */
export function ProjectActivityFeedPipeline() {
  const items = useMemo(() => generateProjectActivity("Project-demo"), [])
  const feed = useMemo(() => buildProjectActivityFeed(items), [items])
  const [expanded, setExpanded] = useState(() => new Set())
  const toggle = (key) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const rows = feed.flatMap((group) => {
    const key = group.kind === "range"
      ? `range:${group.firstDayKey}:${group.lastDayKey}`
      : `day:${group.dayKey}`
    const isExpanded = expanded.has(key)
    if (group.kind === "range" && isExpanded) {
      return group.days.map((day) => ({
        key: `${key}/${day.dayKey}`,
        tone: "muted",
        timestamp: day.timestamp,
        updates: [],
        events: day.events,
        collapsedCount: 0,
      }))
    }
    const tone = group.kind === "range"
      ? "muted"
      : group.updates.length === 0
        ? "muted"
        : "primary"
    const events = group.kind === "range"
      ? []
      : (group.collapseEvents && !isExpanded ? [] : group.events)
    const collapsedCount = group.kind === "range"
      ? group.hiddenCount
      : (group.collapseEvents && !isExpanded ? group.events.length : 0)
    return [{
      key,
      tone,
      timestamp: group.timestamp,
      updates: group.kind === "range" ? [] : group.updates,
      events,
      collapsedCount,
      onExpand: collapsedCount > 0 ? () => toggle(key) : undefined,
    }]
  })

  return (
    <div className="w-full max-w-[742px] bg-white">
      <div className="flex w-full min-w-0 flex-col">
        {rows.map((row, idx) => {
          const isFirst = idx === 0
          const isLast = idx === rows.length - 1
          return (
            <div
              key={row.key}
              className={`${isFirst ? "" : "pt-[30px]"} ${isLast ? "" : "border-b border-[#f2f2f3] pb-[24px]"}`.trim()}
            >
              <HistoryTimelineGroup
                timestamp={
                  <MicroControl
                    type="tag"
                    layout="timestamp"
                    tone={row.tone}
                    datePart={row.timestamp.datePart}
                    timePart={row.timestamp.timePart}
                  />
                }
              >
                <div className="flex w-full min-w-0 flex-col gap-[12px]">
                  {row.updates.length > 0 ? (
                    <div className="flex w-full min-w-0 flex-col gap-[12px]">
                      {row.updates.map((up) => (
                        <HistoryDetailItem
                          key={up.id}
                          actorInitial={up.actorInitial}
                          attribute={up.attribute ?? "Update"}
                          fromValue={up.fromValue}
                          toValue={up.toValue}
                          detail={up.text}
                        />
                      ))}
                    </div>
                  ) : null}
                  {row.events.length > 0 || row.collapsedCount > 0 ? (
                    <div className="flex w-full min-w-0 flex-col gap-0">
                      {row.events.map((ev) => (
                        <HistoryItem
                          key={ev.id}
                          actorInitial={ev.actorInitial}
                          attribute={ev.attribute}
                          fromValue={ev.fromValue}
                          toValue={ev.toValue}
                        />
                      ))}
                      {row.collapsedCount > 0 ? (
                        <HistoryEventsCollapsed count={row.collapsedCount} onExpand={row.onExpand} />
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </HistoryTimelineGroup>
            </div>
          )
        })}
      </div>
    </div>
  )
}
