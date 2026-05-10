import { forwardRef } from "react"
import { Icon } from "./Icon"

/** Modal elevation — Figma `6072:8071`; applied to field and send control separately (not the row wrapper). */
const MODAL_SHADOW = {
  boxShadow:
    "0px 144px 20px rgba(0,0,0,0), 0px 92px 18.5px rgba(0,0,0,0.01), 0px 52px 15.5px rgba(0,0,0,0.05), 0px 23px 11.5px rgba(0,0,0,0.09), 0px 6px 6.5px rgba(0,0,0,0.1)",
}

const FIELD_TEXT_STYLE = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
  color: "var(--foreground-primary)",
}

/**
 * Nake AI Strip — bordered field + circular send (Figma `6071:8027`), modal shadow `6072:8071`.
 */
export const NakeAiStrip = forwardRef(function NakeAiStrip(
  { value = "", placeholder = "Text", onChange, onSubmit, disabled = false, className = "" },
  ref
) {
  const submit = () => {
    if (disabled || typeof onSubmit !== "function") return
    const trimmed = typeof value === "string" ? value.trim() : ""
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <div
      className={`flex h-fit w-full max-w-full min-w-0 items-center gap-1 ${className}`.trim()}
    >
      <div
        className="flex h-[40px] min-h-[40px] min-w-0 flex-1 items-center rounded-[2px] border border-[#f5f5f5] border-solid bg-white px-[14px] box-border"
        style={MODAL_SHADOW}
      >
        <input
          ref={ref}
          type="text"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={placeholder || "Nake AI strip"}
          className="m-0 h-[16px] min-h-0 w-full min-w-0 border-0 bg-transparent p-0 leading-[16px] outline-none"
          style={FIELD_TEXT_STYLE}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
        />
      </div>
      <button
        type="button"
        disabled={disabled}
        className="inline-flex h-[40px] min-h-[40px] w-[40px] min-w-[40px] shrink-0 items-center justify-center rounded-[28px] border-0 bg-[#ffea00] text-[var(--foreground-primary)] transition-opacity disabled:opacity-40 appearance-none hover:brightness-[1.03]"
        style={MODAL_SHADOW}
        aria-label="Send"
        onClick={submit}
      >
        <Icon name="arrowUp" size="large" />
      </button>
    </div>
  )
})
