export function Control({ label = "Date", variant = "leadingIcon", iconSrc = "/icons/calendar.svg" }) {
  const showLeadingIcon = variant === "leadingIcon" || variant === "leadingIconStroke"
  const resolvedIconSrc = variant === "leadingIconStroke" ? "/icons/calendar-stroke.svg" : iconSrc

  return (
    <button
      type="button"
      className={`inline-flex items-center overflow-hidden rounded-[2px] border-0 bg-[#f2f1f2] text-[#211e20] appearance-none ${
        showLeadingIcon ? "pr-[10px]" : "px-[10px]"
      }`}
      style={{
        fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: "13px",
        lineHeight: "16px",
        letterSpacing: "-0.13px",
        fontVariationSettings: '"wght" 460',
      }}
    >
      {showLeadingIcon && (
        <span className="flex w-[28px] shrink-0 items-center justify-center py-[6px]">
          <span className="size-[16px] overflow-hidden">
            <img src={resolvedIconSrc} alt="" className="size-full" />
          </span>
        </span>
      )}
      <span className="inline-flex items-center py-[6px] whitespace-nowrap">{label}</span>
    </button>
  )
}
