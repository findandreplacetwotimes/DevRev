import { Icon } from "./Icon"

/** Row / header row-select chrome — Figma table spec `5938:39810`/`5938:41981` (“Selector” unchecked + checked). */
export function Selector({
  className = "",
  /** `hidden`: 28×28 spacer; `notSelected` | `selected`: circle / checked icons. */
  variant = "hidden",
  interactive = false,
  onPress,
}) {
  const hidden = variant === "hidden"
  const selected = variant === "selected"

  const baseWrap = `relative inline-flex shrink-0 items-center justify-center rounded-[2px]`

  if (hidden) {
    return <div className={`${baseWrap} size-[28px] ${className}`} aria-hidden />
  }

  const glyph = <Icon name={selected ? "selected" : "circle"} />

  if (!interactive || typeof onPress !== "function") {
    return (
      <span className={`${baseWrap} size-[28px] bg-transparent ${className}`} aria-hidden>
        {glyph}
      </span>
    )
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      className={`${baseWrap} size-[28px] border-0 bg-transparent p-0 text-[var(--foreground-primary)] appearance-none ${className}`}
      onClick={(event) => {
        event.stopPropagation()
        onPress(event)
      }}
    >
      {glyph}
    </button>
  )
}
