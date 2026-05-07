import { Control } from "./Control"

/**
 * Shared document frame for issue detail and Build team routes (breadcrumb row + page pills + owner/due strip + centered body).
 */
export function AppDocumentPageShell({
  breadcrumbs,
  pagePills,
  headerAfterPagePills,
  metaSlot,
  headerTrailing,
  singleRowTopbar = false,
  bodyClassName = "",
  children,
  ...sectionProps
}) {
  const { className: sectionClassName, ...restSection } = sectionProps

  return (
    <section
      {...restSection}
      className={`flex h-full min-h-0 w-full min-w-0 flex-col rounded-[2px] bg-white${sectionClassName ? ` ${sectionClassName}` : ""}`}
    >
      <div className={`${singleRowTopbar ? "min-h-[56px]" : "min-h-[88px]"} w-full shrink-0`}>
        <header className="w-full p-[14px]">
          <div className={`flex ${singleRowTopbar ? "flex-row items-start justify-between gap-[8px]" : "flex-col gap-[4px]"}`}>
            <div className="flex w-full items-start justify-between gap-[8px]">
              <div className="flex min-w-0 flex-wrap items-center gap-[4px]">
                {breadcrumbs}
                {pagePills}
                {headerAfterPagePills}
              </div>
              <div className="flex shrink-0 items-center gap-[4px]">
                {headerTrailing}
                <Control type="iconOnly" leadingIcon="more" label="" />
              </div>
            </div>
            {!singleRowTopbar ? metaSlot : null}
          </div>
        </header>
      </div>

      <div
        className={`flex min-h-0 min-w-0 flex-1 flex-col items-center overflow-y-auto overscroll-y-contain pb-[20px] ${
          bodyClassName || ""
        }`.trim()}
      >
        {children}
      </div>
    </section>
  )
}
