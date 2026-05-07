const TAG_STYLE = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "9px",
  lineHeight: "16px",
  letterSpacing: "2px",
  fontVariationSettings: '"wght" 460',
  fontFeatureSettings: "'lnum' 1, 'tnum' 1",
}

const TEXT_STYLE = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "20px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
  fontFeatureSettings: "'lnum' 1, 'tnum' 1",
}

export function AiMessageBubble({
  text = "Hi, can you help me with itHi, can you help me with it Hi, can you help me with itHi, can you help me with",
  loading = false,
}) {
  const stageLabel = loading ? "Thinking" : "Thoughts"

  return (
    <section className="flex w-full flex-col items-start gap-[8px]">
      <div className="inline-flex h-[22px] items-center rounded-[2px] bg-[#f5f5f5] px-[8px]">
        <span className="uppercase text-[rgba(48,46,47,0.94)]" style={TAG_STYLE}>
          {stageLabel}
        </span>
      </div>
      <p className="w-full whitespace-pre-wrap break-words text-[rgba(48,46,47,0.94)]" style={TEXT_STYLE}>
        {text}
      </p>
    </section>
  )
}
