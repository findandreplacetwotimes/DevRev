const bannerTextStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "18px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
}

const bannerTitleStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "18px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 560',
}

export function ProjectSetupBanner({ onGoToSettings, onDismiss }) {
  return (
    <div className="mx-auto mt-[16px] flex w-full max-w-[828px] items-center gap-[12px] rounded-[6px] border border-[#e8e0f8] bg-[#faf8ff] px-[16px] py-[12px]">
      <span className="inline-flex size-[28px] shrink-0 items-center justify-center rounded-full bg-[#6e56cf]/10">
        <img src="/icons/agent.svg" alt="" className="block size-[14px]" draggable={false} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
        <span className="text-[var(--foreground-primary)]" style={bannerTitleStyle}>
          Set up your PM Agent
        </span>
        <span className="text-[#737072]" style={bannerTextStyle}>
          Configure sources, cadence, and signal thresholds so the agent can start surfacing what matters.
        </span>
      </div>
      <button
        type="button"
        onClick={onGoToSettings}
        className="inline-flex h-[28px] shrink-0 items-center rounded-[4px] border-0 bg-[#6e56cf] px-[12px] text-[12px] text-white hover:bg-[#5b45b0] appearance-none"
        style={{
          fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
          fontVariationSettings: '"wght" 520',
        }}
      >
        Configure
      </button>
      <button
        type="button"
        onClick={onDismiss}
        className="inline-flex size-[24px] shrink-0 items-center justify-center rounded-[2px] border-0 bg-transparent p-0 text-[#939393] hover:bg-[var(--control-bg-hover)] appearance-none"
      >
        <img src="/icons/close.svg" alt="Dismiss" className="block size-[12px] opacity-50" draggable={false} />
      </button>
    </div>
  )
}
