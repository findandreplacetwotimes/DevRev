const MENTION_COLORS = {
  alex: "#5c3d2e",
  priya: "#6b7c3a",
  dev: "#2d4a3e",
  tim: "#7a4a2a",
  sam: "#3d5c6b",
}

function MentionChip({ name }) {
  const initial = name[0].toUpperCase()
  const color = MENTION_COLORS[name.toLowerCase()] ?? "#5c5c5c"

  return (
    <span className="inline-flex items-center gap-[4px] rounded-full border border-[#e8e8e9] bg-white px-[6px] py-[1px] align-baseline">
      <span className="relative inline-flex size-[14px] shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: color }}>
        <span
          className="text-[7px] text-white"
          style={{ fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif', fontVariationSettings: '"wght" 520' }}
        >
          {initial}
        </span>
        <span className="absolute -bottom-[1px] -right-[1px] size-[5px] rounded-full border border-white bg-[#34a853]" />
      </span>
      <span
        className="text-[12px] text-[#302e2f]"
        style={{ fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif', fontVariationSettings: '"wght" 480' }}
      >
        {name}
      </span>
    </span>
  )
}

export function renderTextWithMentions(text) {
  if (!text || typeof text !== "string") return text
  const parts = text.split(/(@\w+)/g)
  if (parts.length === 1) return text
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      const name = part.slice(1)
      return <MentionChip key={i} name={name} />
    }
    return part
  })
}
