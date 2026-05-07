/** Read-only page title (same typography as `TextEditTitle`, Figma Title1). */
const TITLE_STYLE = {
  fontFamily: '"Chip Display Variable", "Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "33px",
  lineHeight: "40px",
  letterSpacing: "0px",
  fontStyle: "normal",
  fontVariationSettings: '"wght" 650',
  color: "rgba(48, 46, 47, 0.94)",
}

export function TabPageTitle({ children }) {
  return (
    <h1
      className="m-0 w-full max-w-[740px] whitespace-normal break-words"
      style={TITLE_STYLE}
    >
      {children}
    </h1>
  )
}
