import { Breadcrumbs } from "./Breadcrumbs"
import { Control } from "./Control"
import { DueDateSelector } from "./DueDateSelector"
import { OwnerSelector } from "./OwnerSelector"
import { Page } from "./Page"
import { BUILD_PAGE_TAB_IDS } from "../lib/topbarTabs"

export function Topbar({
  activeTab,
  onTabChange,
  variant = "oneLine",
  owners = [],
  ownerId,
  onOwnerChange,
  dueDateId,
  onDueDateChange,
}) {
  const isTwoLine = variant === "twoLine"

  return (
    <header className="w-full p-[14px]">
      <div className={`${isTwoLine ? "flex flex-col gap-[4px]" : "flex"} items-start justify-between`}>
        <div className="flex w-full items-start justify-between">
          <div className="flex items-center gap-[4px]">
            <Breadcrumbs />
            <div className="flex items-center gap-[4px]" role="tablist" aria-label="Page sections">
              {BUILD_PAGE_TAB_IDS.map((label) => (
                <Page
                  key={label}
                  id={`tab-${label}`}
                  label={label}
                  selected={activeTab === label}
                  onSelect={() => onTabChange(label)}
                />
              ))}
            </div>
          </div>
          <Control type="iconOnly" leadingIcon="more" label="" />
        </div>

        {isTwoLine && owners.length > 0 && (
          <div className="flex w-full items-start justify-between gap-[4px]">
            <div className="flex items-start gap-[4px]">
            <OwnerSelector owners={owners} selectedOwnerId={ownerId} onChange={onOwnerChange} />
            <DueDateSelector value={dueDateId} onChange={onDueDateChange} />
            </div>
            <span />
          </div>
        )}
      </div>
    </header>
  )
}
