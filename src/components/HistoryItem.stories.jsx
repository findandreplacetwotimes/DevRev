import { HistoryDetailItem, HistoryItem, HistoryTimelineGroup } from "./HistoryItem"
import { Timestamp } from "./Timestamp"

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

/** Matches `261:11242` / `6003:7587`,`6003:7843`: 12px below tag only; rows abut (gap 0). */
export function GroupWithTimestamp() {
  return (
    <div className="w-full max-w-[742px] bg-white">
      <HistoryTimelineGroup timestamp={<Timestamp datePart="today," timePart="9:15 AM" />}>
        <HistoryItem actorInitial="M" attribute="Owner" fromValue="Manasa" toValue="Greg" />
        <HistoryItem actorInitial="M" attribute="Date" fromValue="25 April" toValue="26 April" />
        <HistoryItem actorInitial="M" attribute="Owner" fromValue="Greg" toValue="Sneha Sharma" />
      </HistoryTimelineGroup>
    </div>
  )
}

/** Variant `6003:7899`: multiline History item sits 12px below tag (same top gap); no spacer between groups here. */
export function GroupTimestampThenDetail() {
  return (
    <div className="w-full max-w-[650px] bg-white">
      <HistoryTimelineGroup timestamp={<Timestamp datePart="today," timePart="9:15 AM" />}>
        <HistoryItem actorInitial="M" attribute="Owner" fromValue="Manasa" toValue="Greg" />
        <HistoryItem actorInitial="M" attribute="Date" fromValue="25 April" toValue="26 April" />
        <HistoryItem actorInitial="M" attribute="Owner" fromValue="Greg" toValue="Sneha Sharma" />
      </HistoryTimelineGroup>
      <HistoryTimelineGroup
        className="mt-[24px]"
        timestamp={<Timestamp datePart="today," timePart="11:41 AM" />}
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
