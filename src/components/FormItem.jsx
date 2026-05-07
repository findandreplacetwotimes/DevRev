const labelStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 520',
}

const subtitleStyle = {
  fontFamily: '"Chip Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: "10px",
  lineHeight: "10px",
  letterSpacing: "0px",
}

export function FormItem({ label = "Label", subtitle = "", children }) {
  return (
    <div className="flex h-[40px] w-full items-center justify-between border-b border-white px-[14px] py-[9px]">
      <div className="flex min-w-0 flex-col justify-center">
        <span className="truncate text-[var(--control-content-secondary)]" style={labelStyle}>
          {label}
        </span>
        {subtitle ? (
          <span className="mt-[2px] truncate text-[#939393]" style={subtitleStyle}>
            {subtitle}
          </span>
        ) : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}
