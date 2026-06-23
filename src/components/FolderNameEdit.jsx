import { useEffect, useRef, useState } from "react"
import { Icon } from "./Icon"

/** Figma `6227:11598` — TextInput Label Small; trailing check `6227:11614`. */
const FOLDER_NAME_TYPOGRAPHY = {
  fontFamily: '"Chip Mono", "Chip Text Variable", monospace',
  fontSize: "10px",
  lineHeight: "10px",
  letterSpacing: "0px",
}

const DEFAULT_PLACEHOLDER = "Folder name"

export function FolderNameEdit({
  value: valueProp,
  defaultValue = "",
  placeholder = DEFAULT_PLACEHOLDER,
  onChange,
  onCommit,
  onCancel,
  autoFocus = true,
  selectOnFocus = true,
  commitOnBlur = false,
  showConfirmButton = false,
  className = "",
}) {
  const inputRef = useRef(null)
  const skipBlurCommitRef = useRef(false)
  const isControlled = valueProp !== undefined && typeof onChange === "function"
  const [internalValue, setInternalValue] = useState(defaultValue)
  const value = isControlled ? valueProp : internalValue
  const setValue = isControlled ? onChange : setInternalValue

  useEffect(() => {
    if (!autoFocus) return
    const input = inputRef.current
    if (!input) return
    input.focus()
    if (selectOnFocus) input.select()
  }, [autoFocus, selectOnFocus])

  const commit = () => {
    const trimmed = value.trim()
    if (showConfirmButton && !trimmed) return
    onCommit?.(trimmed)
  }

  const cancel = () => {
    skipBlurCommitRef.current = true
    onCancel?.()
  }

  const handleKeyDown = (event) => {
    event.stopPropagation()
    if (event.key === "Enter") {
      event.preventDefault()
      if (showConfirmButton) {
        if (!canConfirm) return
        skipBlurCommitRef.current = true
        commit()
        inputRef.current?.blur()
        return
      }
      if (commitOnBlur) {
        commit()
      }
      inputRef.current?.blur()
    } else if (event.key === "Escape") {
      event.preventDefault()
      cancel()
      inputRef.current?.blur()
    }
  }

  const handleBlur = () => {
    if (!commitOnBlur) return
    if (skipBlurCommitRef.current) {
      skipBlurCommitRef.current = false
      return
    }
    commit()
  }

  const isEmpty = value.trim().length === 0
  const textColor = isEmpty
    ? "text-[#939393] placeholder:text-[#939393]"
    : "text-[var(--fg-neutral-prominent,#211e20)] placeholder:text-[#939393]"
  const canConfirm = value.trim().length > 0

  const shellPadding = showConfirmButton ? "pl-[10px] pr-0" : "px-[10px]"

  return (
    <div
      className={`inline-flex h-[28px] w-full min-w-0 items-center justify-between rounded-[2px] bg-[var(--control-bg-rest)] ${shellPadding} ${className}`}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement) return
        event.preventDefault()
        inputRef.current?.focus()
      }}
    >
      <div className="inline-flex min-w-0 flex-1 items-center justify-center py-[10.5px]">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap bg-transparent uppercase outline-none ${textColor}`}
          style={FOLDER_NAME_TYPOGRAPHY}
          aria-label="Folder name"
        />
      </div>
      {showConfirmButton ? (
        <button
          type="button"
          className="inline-flex size-[28px] shrink-0 items-center justify-center border-0 bg-transparent p-0 text-[var(--foreground-primary)] disabled:cursor-default disabled:opacity-40 appearance-none"
          aria-label="Confirm folder name"
          disabled={!canConfirm}
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => {
            event.stopPropagation()
            commit()
          }}
        >
          <Icon name="check" />
        </button>
      ) : null}
    </div>
  )
}
