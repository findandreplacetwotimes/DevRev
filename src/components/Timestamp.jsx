/** Figma `6003:7134` (Tag) → pill `6003:7056`: h 18, `bg #f2f2f3`, px 6, radius 2. Content `6003:7057`: 9px / 16 lh, tracking 2px uppercase, single Chip Text line `wght` 560. */

const textStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "9px",
  lineHeight: "16px",
  letterSpacing: "2px",
  fontVariationSettings: '"wght" 560',
  fontFeatureSettings: "'lnum' 1, 'tnum' 1",
}

/**
 * Activity / history timestamp chip (`datePart` + `timePart` concatenated for one label).
 *
 * @param {object} props
 * @param {string} [props.datePart]
 * @param {string} [props.timePart]
 * @param {string} [props.dateTime] — optional ISO8601 for `<time datetime>`
 * @param {string} [props.className]
 */
export function Timestamp({ datePart = "today,", timePart = "9:15 AM", dateTime, className = "" }) {
  const text = `${String(datePart).trimEnd()} ${String(timePart).trim()}`.replace(/\s+/g, " ").trim()

  return (
    <time
      dateTime={dateTime}
      className={`inline-flex h-[18px] w-fit max-w-full shrink-0 items-center rounded-[2px] bg-[#f2f2f3] px-[6px] text-[length:9px] uppercase text-[rgba(0,0,0,0.9)] ${className}`.trim()}
    >
      <span className="whitespace-nowrap leading-[16px]" style={textStyle}>
        {text}
      </span>
    </time>
  )
}
