/** 28×28 frame with 18px circular chip — matches chat rows in `NavPanel` (Figma lane avatars). */
export function ChatAvatar({ initial = "A", count = null }) {
  const label = count != null ? String(count) : initial
  const isCount = count != null
  return (
    <span className="relative inline-flex size-[28px] shrink-0 items-center justify-center overflow-hidden">
      <span className="absolute left-[5px] top-[5px] size-[18px] rounded-[999px] bg-[#e8e8e9]" />
      <span
        className={`relative z-[1] inline-flex items-center justify-center text-center text-[#737072] ${
          isCount ? "h-[11px] min-w-[18px] px-[2px] text-[9px]" : "h-[11px] w-[18px] text-[9.9px]"
        }`}
        style={{ fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif', fontVariationSettings: '"wght" 520' }}
      >
        {label}
      </span>
    </span>
  )
}
