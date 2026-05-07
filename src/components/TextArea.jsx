import { useEffect, useMemo, useRef, useState } from "react"
import { getInlineSlashState, SLASH_ACTIVE_COLOR, SLASH_TEXT_PROMINENT } from "../lib/slashCommandConfig"
import { useInlineSuggestion } from "../hooks/useInlineSuggestion"
import { useSlashCommandWorkflow } from "../hooks/useSlashCommandWorkflow"

const systemTextStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
}

const LINE_HEIGHT_PX = 16

export function TextArea({
  initialValue,
  value: valueProp,
  onChange,
  workflow,
  onFocusChange,
  onSubmit,
  placeholder = "Placeholder",
  fullWidth = false,
  minRows = 1,
}) {
  const textareaRef = useRef(null)
  const isControlled = valueProp !== undefined && typeof onChange === "function"
  const [uncontrolledSeed] = useState(() => initialValue ?? valueProp ?? "")
  const workflowArgs = isControlled ? { value: valueProp, onChange } : { initialValue: uncontrolledSeed }
  const internalWorkflow = useSlashCommandWorkflow(workflowArgs)
  const {
    value,
    setValue,
    loading,
    pendingFocusMainRef,
    runCommand,
    runGrammarFix,
  } = workflow ?? internalWorkflow
  const inlineSlashState = useMemo(() => getInlineSlashState(value), [value])
  const hasInlineSlash = inlineSlashState.active
  const [isCaretAtEnd, setIsCaretAtEnd] = useState(true)
  const [isFocused, setIsFocused] = useState(false)
  const { suggestion, clearSuggestion, acceptNextSuggestionWord } = useInlineSuggestion({
    value,
    loading,
    isFocused,
    isCaretAtEnd,
    disabled: hasInlineSlash,
    setValue,
  })

  const autoResize = (element) => {
    if (!element) return
    element.style.height = "auto"
    const minHeight = LINE_HEIGHT_PX * Math.max(1, minRows)
    element.style.height = `${Math.max(minHeight, element.scrollHeight)}px`
  }

  useEffect(() => {
    autoResize(textareaRef.current)
  }, [value, minRows])

  useEffect(() => {
    if (!pendingFocusMainRef.current) return
    const element = textareaRef.current
    if (!element) return
    pendingFocusMainRef.current = false
    element.focus()
    const end = element.value.length
    element.setSelectionRange(end, end)
    setIsFocused(true)
    setIsCaretAtEnd(true)
  }, [value, pendingFocusMainRef])

  const updateCaretState = () => {
    const element = textareaRef.current
    if (!element) return
    const atEnd = element.selectionStart === element.selectionEnd && element.selectionEnd === element.value.length
    setIsCaretAtEnd(atEnd)
    if (!atEnd) clearSuggestion()
  }

  const handleFocus = () => {
    setIsFocused(true)
    onFocusChange?.(true)
    window.requestAnimationFrame(updateCaretState)
  }

  const handleKeyDown = async (event) => {
    if (onSubmit && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      clearSuggestion()
      await onSubmit(value)
      return
    }
    if (event.key === "Tab" && event.ctrlKey) {
      event.preventDefault()
      clearSuggestion()
      await runGrammarFix()
      return
    }
    if (event.key === "Tab" && suggestion) {
      event.preventDefault()
      acceptNextSuggestionWord()
      return
    }
    if (event.key === "Escape") {
      clearSuggestion()
      return
    }
    if (event.key === "Enter" && event.metaKey) {
      event.preventDefault()
      clearSuggestion()
      await runCommand()
    }
  }

  const beforeSlash = hasInlineSlash ? value.slice(0, inlineSlashState.start) : value
  const slashSegment = hasInlineSlash ? value.slice(inlineSlashState.start) : ""
  const shouldPadMirror = value.endsWith("\n")
  const isEmpty = value.length === 0

  return (
    <div className={`${fullWidth ? "w-full" : "w-[215px]"}`}>
      <div
        className="relative inline-flex w-full items-start rounded-[2px] bg-[var(--background-primary-subtle)] px-[14px] py-[12px]"
        onPointerDown={(event) => {
          if (event.target instanceof HTMLTextAreaElement) return
          event.preventDefault()
          textareaRef.current?.focus()
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-[14px] right-[14px] top-[12px] whitespace-pre-wrap break-words"
          style={{ ...systemTextStyle, color: SLASH_TEXT_PROMINENT }}
        >
          {isEmpty ? <span className="text-[var(--control-content-secondary)]">{placeholder}</span> : beforeSlash}
          {hasInlineSlash && <span style={{ color: SLASH_ACTIVE_COLOR }}>{slashSegment}</span>}
          {suggestion && isCaretAtEnd && isFocused && !hasInlineSlash && <span className="text-[#8e8a8f]">{suggestion}</span>}
          {shouldPadMirror && "\n"}
        </div>
        <textarea
          ref={textareaRef}
          rows={Math.max(1, minRows)}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onInput={(event) => autoResize(event.currentTarget)}
          onFocus={handleFocus}
          onBlur={() => {
            setIsFocused(false)
            onFocusChange?.(false)
            clearSuggestion()
          }}
          onClick={updateCaretState}
          onKeyUp={updateCaretState}
          onSelect={updateCaretState}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="relative w-full resize-none overflow-hidden bg-transparent text-transparent outline-none"
          style={{
            ...systemTextStyle,
            padding: 0,
            margin: 0,
            border: 0,
            caretColor: SLASH_TEXT_PROMINENT,
          }}
        />
      </div>
    </div>
  )
}
