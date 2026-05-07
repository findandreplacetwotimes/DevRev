/** 28×28 frame with 18px circular chip — matches chat rows in `NavPanel` (Figma lane avatars). */
export function ChatAvatar({ initial = "A" }) {
  return (
    <span className="relative inline-flex size-[28px] shrink-0 items-center justify-center overflow-hidden">
      <span className="absolute left-[5px] top-[5px] size-[18px] rounded-[999px] bg-[#e8e8e9]" />
      <span
        className="relative z-[1] inline-flex h-[11px] w-[18px] items-center justify-center text-center text-[9.9px] text-[#737072]"
        style={{ fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif', fontVariationSettings: '"wght" 520' }}
      >
        {initial}
      </span>
    </span>
  )
}
