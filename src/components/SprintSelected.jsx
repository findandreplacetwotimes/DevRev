import { SprintSelector } from "./SprintSelector"
import { StartDateSelector } from "./StartDateSelector"

export function SprintSelected({ sprint, sprintOptions, onSprintChange, startDate, onStartDateChange, showStartDate = true }) {
  return (
    <div className="inline-flex items-center">
      <SprintSelector value={sprint} options={sprintOptions} onChange={onSprintChange} />
      {showStartDate ? (
        <>
          <span aria-hidden className="relative h-0 w-[5px] shrink-0">
            <span className="absolute inset-x-0 top-0 block border-t border-[var(--border-subtle)]" />
          </span>
          <StartDateSelector value={startDate} onChange={onStartDateChange} />
        </>
      ) : null}
    </div>
  )
}
