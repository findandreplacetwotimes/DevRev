import { Icon } from "./Icon"
import { useRef, useState } from "react"

const systemLabelStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
}

function defaultPlaceholder(type) {
  return type === "leading" || type === "inline" ? "Search" : "Placeholder"
}

export function TextInput({
  type = "default",
  construction,
  variantType,
  size = "default",
  state,
  value: valueProp,
  onChange,
  placeholder,
  fullWidth = false,
}) {
  const inputRef = useRef(null)
  const isControlled = valueProp !== undefined && typeof onChange === "function"
  const [internalValue, setInternalValue] = useState("")
  const value = isControlled ? valueProp : internalValue
  const setValue = isControlled ? onChange : setInternalValue

  const normalizedConstruction =
    construction === "leading" || construction === "Leading"
      ? "leading"
      : construction === "rounded" || construction === "Rounded"
        ? "rounded"
        : "textOnly"
  const normalizedVariantTypeRaw =
    typeof variantType === "string" && variantType.trim().length > 0 ? variantType.trim().toLowerCase() : null
  const normalizedType = (() => {
    if (normalizedVariantTypeRaw) {
      if (normalizedVariantTypeRaw === "inline right" || normalizedVariantTypeRaw === "inline-right") return "inlineRight"
      if (normalizedVariantTypeRaw === "inline") return "inline"
      if (normalizedVariantTypeRaw === "rounded") return "rounded"
      return "default"
    }
    if (type === "inlineRight" || type === "inline-right" || type === "Inline Right") return "inlineRight"
    if (type === "inline") return "inline"
    if (type === "rounded" || type === "Rounded") return "rounded"
    if (type === "leading") return "leading"
    return "default"
  })()

  const isLeading = normalizedConstruction === "leading" || normalizedType === "leading"
  const isRounded = normalizedConstruction === "rounded" || normalizedType === "rounded"
  const isInline = normalizedType === "inline"
  const isInlineRight = normalizedType === "inlineRight"
  const resolvedState = state ?? (value.length > 0 ? "filled" : "empty")
  const isPrimary = resolvedState === "filled" || resolvedState === "default" || value.length > 0
  const isLarge = size === "large"

  const bgClass =
    resolvedState === "hover"
      ? "bg-[var(--control-bg-hover)]"
      : isRounded
        ? "bg-white"
      : isInline
        ? "bg-[var(--control-bg-rest-white)]"
        : isInlineRight
          ? "bg-transparent"
        : "bg-[var(--background-primary-subtle)] hover:bg-[var(--control-bg-hover)] transition-colors duration-150"
  const horizontalPadding = isLeading || isInline ? (isLarge ? "pr-[14px]" : "pr-[10px]") : isLarge ? "px-[14px]" : "px-[10px]"
  const contentColor = isPrimary
    ? "text-[var(--control-content-primary)]"
    : "text-[var(--control-content-secondary)] placeholder:text-[var(--control-content-secondary)]"
  const displayValue = resolvedState === "filled" && !value ? "Text" : value
  const displayPlaceholder = placeholder ?? defaultPlaceholder(isLeading ? "leading" : normalizedType)
  const controlWidth = isLarge ? "w-[235px]" : "w-[235px]"
  const roundedShellClass = isRounded ? "rounded-[14px] border-[1.5px] border-[var(--border-subtle)]" : "rounded-[2px]"

  return (
    <div
      className={`inline-flex ${isLarge ? "h-[40px]" : "h-[28px]"} ${fullWidth ? "w-full" : controlWidth} items-center ${roundedShellClass} ${isInlineRight ? "justify-end" : ""} ${bgClass} ${horizontalPadding}`}
      onPointerDown={(event) => {
        if (event.target instanceof HTMLInputElement) return
        event.preventDefault()
        inputRef.current?.focus()
      }}
    >
      {(isLeading || isInline) && <Icon name="search" className="text-[var(--fg-neutral-prominent)]" />}
      <div className={`inline-flex items-center justify-center py-[6px] ${fullWidth ? "min-w-0 flex-1" : ""}`}>
        <input
          ref={inputRef}
          value={displayValue}
          onChange={(event) => setValue(event.target.value)}
          placeholder={displayPlaceholder}
          className={`${contentColor} ${fullWidth ? "w-full min-w-0 flex-1" : "w-[120px]"} ${isInlineRight ? "text-right" : ""} bg-transparent outline-none`}
          style={systemLabelStyle}
        />
      </div>
    </div>
  )
}
