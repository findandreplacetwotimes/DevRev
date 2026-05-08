import { useEffect, useMemo, useRef } from "react"
import { HistoryDetailItem, HistoryItem, HistoryTimelineGroup } from "./HistoryItem"
import { Timestamp } from "./Timestamp"

function stableHash(str) {
  let h = 0
  for (let i = 0; i < str.length; i += 1) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/**
 * Static timeline blocks for History tab (Figma Build app / Page `6003:7781` — no data source, no actions).
 * `recordKind` + `recordId` pick a variant so each issue/project shows different placeholder copy.
 */
const PRESETS = [
  {
    groups: [
      {
        timestamp: { datePart: "today,", timePart: "9:15 AM" },
        items: [
          { type: "transition", actorInitial: "M", attribute: "Owner", fromValue: "Manasa", toValue: "Greg" },
          { type: "transition", actorInitial: "M", attribute: "Date", fromValue: "25 April", toValue: "26 April" },
          { type: "transition", actorInitial: "R", attribute: "Owner", fromValue: "Greg", toValue: "Sneha Sharma" },
        ],
      },
      {
        timestamp: { datePart: "today,", timePart: "11:41 AM" },
        items: [
          {
            type: "detail",
            actorInitial: "M",
            attribute: "Description",
            detail:
              "The team is actively working on improving sprint efficiency by addressing current challenges in sprint management. Efforts are focused on streamlining communication, automating task tracking, and enhancing visibility to reduce time spent on administrative activities.",
          },
        ],
      },
    ],
  },
  {
    groups: [
      {
        timestamp: { datePart: "yesterday,", timePart: "4:22 PM" },
        items: [
          { type: "transition", actorInitial: "A", attribute: "Title", fromValue: "Backlog polish", toValue: "Ship checklist v1" },
          { type: "transition", actorInitial: "A", attribute: "Health", fromValue: "At risk", toValue: "On track" },
          { type: "transition", actorInitial: "L", attribute: "Due date", fromValue: "End of week", toValue: "Today" },
        ],
      },
    ],
  },
  {
    groups: [
      {
        timestamp: { datePart: "today,", timePart: "2:08 PM" },
        items: [
          { type: "transition", actorInitial: "S", attribute: "Stage", fromValue: "Triage", toValue: "In Progress" },
          { type: "transition", actorInitial: "S", attribute: "Sprint", fromValue: "Backlog", toValue: "Sprint 2" },
          {
            type: "detail",
            actorInitial: "S",
            attribute: "Description",
            detail: "Synced scope with design and filed follow-ups for QA. Next: verify analytics events on the backlog table.",
          },
        ],
      },
    ],
  },
  {
    groups: [
      {
        timestamp: { datePart: "mon,", timePart: "10:00 AM" },
        items: [
          { type: "transition", actorInitial: "G", attribute: "Owner", fromValue: "Unassigned", toValue: "Olivia Brown" },
          { type: "transition", actorInitial: "K", attribute: "Date", fromValue: "No date", toValue: "Tomorrow" },
        ],
      },
      {
        timestamp: { datePart: "mon,", timePart: "10:06 AM" },
        items: [
          {
            type: "detail",
            actorInitial: "G",
            attribute: "Links",
            detail: "Added link to rollout doc and Slack thread summarizing blocker resolution.",
          },
        ],
      },
    ],
  },
  /** Project-ish tone */
  {
    groups: [
      {
        timestamp: { datePart: "today,", timePart: "8:03 AM" },
        items: [
          { type: "transition", actorInitial: "N", attribute: "Milestone", fromValue: "Discovery", toValue: "Build" },
          { type: "transition", actorInitial: "N", attribute: "Health", fromValue: "Off track", toValue: "At risk" },
          { type: "transition", actorInitial: "P", attribute: "Owner", fromValue: "Liam Johnson", toValue: "Ava Martinez" },
        ],
      },
    ],
  },
  {
    groups: [
      {
        timestamp: { datePart: "yesterday,", timePart: "11:52 AM" },
        items: [{ type: "transition", actorInitial: "V", attribute: "Scope", fromValue: "Narrow MVP", toValue: "MVP + pilot" }],
      },
      {
        timestamp: { datePart: "today,", timePart: "9:09 AM" },
        items: [
          {
            type: "detail",
            actorInitial: "V",
            attribute: "Description",
            detail:
              "Pilot customers agreed to a phased rollout: internal dogfood next week, then three design partners with read-only dashboards before full edit capacity.",
          },
        ],
      },
    ],
  },
  {
    groups: [
      {
        timestamp: { datePart: "today,", timePart: "12:41 PM" },
        items: [
          { type: "transition", actorInitial: "C", attribute: "Owner", fromValue: "Ethan Clark", toValue: "Mia Thompson" },
          { type: "transition", actorInitial: "C", attribute: "Stage", fromValue: "In review", toValue: "In Progress" },
        ],
      },
    ],
  },
  {
    groups: [
      {
        timestamp: { datePart: "yesterday,", timePart: "6:05 PM" },
        items: [
          { type: "transition", actorInitial: "D", attribute: "Sprint", fromValue: "Sprint 1", toValue: "Sprint #" },
          { type: "transition", actorInitial: "D", attribute: "Due date", fromValue: "Today", toValue: "End of next week" },
        ],
      },
      {
        timestamp: { datePart: "today,", timePart: "7:12 AM" },
        items: [
          {
            type: "detail",
            actorInitial: "D",
            attribute: "Description",
            detail: "Rolled QA feedback into acceptance criteria for the rollout epic; waiting on infra for feature flag naming.",
          },
        ],
      },
    ],
  },
  {
    groups: [
      {
        timestamp: { datePart: "tue,", timePart: "3:18 PM" },
        items: [
          {
            type: "detail",
            actorInitial: "F",
            attribute: "Brief",
            detail: "Condensed stakeholder interviews into five themes: onboarding friction, latency in search, role visibility, billing clarity, integrations.",
          },
        ],
      },
    ],
  },
  {
    groups: [
      {
        timestamp: { datePart: "today,", timePart: "1:51 PM" },
        items: [
          { type: "transition", actorInitial: "H", attribute: "Health", fromValue: "On track", toValue: "Off track" },
          { type: "transition", actorInitial: "H", attribute: "Owner", fromValue: "Noah Anderson", toValue: "Isabella Davis" },
        ],
      },
    ],
  },
  {
    groups: [
      {
        timestamp: { datePart: "wed,", timePart: "9:03 AM" },
        items: [
          { type: "transition", actorInitial: "J", attribute: "Scope", fromValue: "MVP", toValue: "MVP + compliance" },
          { type: "transition", actorInitial: "W", attribute: "Milestone", fromValue: "Build", toValue: "Validation" },
          { type: "transition", actorInitial: "W", attribute: "Health", fromValue: "At risk", toValue: "On track" },
        ],
      },
    ],
  },
]

export function DocumentHistoryPlaceholder({ history = null, recordKind = "issue", recordId, highlightEventId = null }) {
  const preset = useMemo(() => {
    const key = `${recordKind}:${recordId ?? ""}`
    const h = stableHash(key) ^ stableHash(String(recordId ?? "").split("").reverse().join(""))
    return PRESETS[h % PRESETS.length]
  }, [recordKind, recordId])

  // Use real history if available
  const hasRealHistory = Array.isArray(history) && history.length > 0

  // Group real history events by timestamp
  const groupedHistory = useMemo(() => {
    if (!hasRealHistory) return null

    const groups = []
    let currentGroup = null

    for (const event of history) {
      const timestampKey = `${event.timestamp.datePart}-${event.timestamp.timePart}`

      if (!currentGroup || currentGroup.timestampKey !== timestampKey) {
        currentGroup = {
          timestampKey,
          timestamp: event.timestamp,
          items: []
        }
        groups.push(currentGroup)
      }

      currentGroup.items.push(event)
    }

    return groups
  }, [history, hasRealHistory])

  // Scroll to highlighted event when it changes
  const highlightedRef = useRef(null)
  useEffect(() => {
    if (highlightEventId && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [highlightEventId])

  return (
    <section className="w-full" aria-label={hasRealHistory ? "History timeline" : "Placeholder history timeline (preview only)"} role={hasRealHistory ? "region" : "presentation"}>
      {hasRealHistory ? (
        // Render real history
        groupedHistory.map((group, gi) => (
          <div key={gi} className={gi > 0 ? "mt-[24px]" : ""}>
            <HistoryTimelineGroup timestamp={<Timestamp datePart={group.timestamp.datePart} timePart={group.timestamp.timePart} />}>
              {group.items.map((item) => {
                const isHighlighted = item.id === highlightEventId
                return item.type === "transition" ? (
                  <div
                    key={item.id}
                    ref={isHighlighted ? highlightedRef : null}
                    className={isHighlighted ? "animate-highlight" : ""}
                  >
                    <HistoryItem
                      actorInitial={item.actorInitial}
                      attribute={item.attribute}
                      fromValue={item.fromValue}
                      toValue={item.toValue}
                    />
                  </div>
                ) : (
                  <div
                    key={item.id}
                    ref={isHighlighted ? highlightedRef : null}
                    className={isHighlighted ? "animate-highlight" : ""}
                  >
                    <HistoryDetailItem
                      actorInitial={item.actorInitial}
                      attribute={item.attribute}
                      detail={item.detail}
                    />
                  </div>
                )
              })}
            </HistoryTimelineGroup>
          </div>
        ))
      ) : (
        // Render placeholder
        preset.groups.map((group, gi) => (
          <div key={gi} className={gi > 0 ? "mt-[24px]" : ""}>
            <HistoryTimelineGroup timestamp={<Timestamp datePart={group.timestamp.datePart} timePart={group.timestamp.timePart} />}>
              {group.items.map((item, ii) =>
                item.type === "transition" ? (
                  <HistoryItem
                    key={ii}
                    actorInitial={item.actorInitial}
                    attribute={item.attribute}
                    fromValue={item.fromValue}
                    toValue={item.toValue}
                  />
                ) : (
                  <HistoryDetailItem
                    key={ii}
                    actorInitial={item.actorInitial}
                    attribute={item.attribute}
                    detail={item.detail}
                  />
                )
              )}
            </HistoryTimelineGroup>
          </div>
        ))
      )}
    </section>
  )
}
