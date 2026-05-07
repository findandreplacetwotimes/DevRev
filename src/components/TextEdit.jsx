import { useEffect, useMemo, useRef, useState } from "react"
import { getRandomDevTaskSample } from "../lib/devTaskPlaceholders"
import {
  getInlineSlashState,
  SLASH_ACTIVE_COLOR,
  SLASH_LOADING_SUFFIX,
  SLASH_TEXT_PROMINENT,
  SLASH_TEXT_STYLE,
} from "../lib/slashCommandConfig"
import { useInlineSuggestion } from "../hooks/useInlineSuggestion"
import { useSlashCommandWorkflow } from "../hooks/useSlashCommandWorkflow"

export function TextEdit({ initialValue, value, onChange, onSlashCommand, onAiCommandSignal }) {
  const isControlled = value !== undefined && typeof onChange === "function"

  const [uncontrolledSeed] = useState(() =>
    initialValue !== undefined ? initialValue : getRandomDevTaskSample().body
  )

  const workflowArgs = isControlled
    ? {
        value,
        onChange,
        executeLocalSlashCommand: onSlashCommand,
        executeAiSlashSignal: onAiCommandSignal,
      }
    : {
        initialValue: uncontrolledSeed,
        executeLocalSlashCommand: onSlashCommand,
        executeAiSlashSignal: onAiCommandSignal,
      }

  const {
    value: workflowValue,
    setValue,
    loading,
    errorMessage,
    pendingFocusMainRef,
    runCommand,
    runGrammarFix,
  } = useSlashCommandWorkflow(workflowArgs)

  const textareaRef = useRef(null)
  const inlineSlashState = useMemo(() => getInlineSlashState(workflowValue), [workflowValue])
  const hasInlineSlash = inlineSlashState.active
  const [loadingStep, setLoadingStep] = useState(0)
  const [isCaretAtEnd, setIsCaretAtEnd] = useState(true)
  const [isFocused, setIsFocused] = useState(false)
  const { suggestion, clearSuggestion, acceptNextSuggestionWord } = useInlineSuggestion({
    value: workflowValue,
    loading,
    isFocused,
    isCaretAtEnd,
    disabled: hasInlineSlash,
    setValue,
  })

  const autoResize = (element) => {
    if (!element) return
    element.style.height = "auto"
    element.style.height = `${element.scrollHeight}px`
  }

  const handleKeyDown = async (event) => {
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

  const updateCaretState = () => {
    const element = textareaRef.current
    if (!element) return
    const atEnd = element.selectionStart === element.selectionEnd && element.selectionEnd === element.value.length
    setIsCaretAtEnd(atEnd)
    if (!atEnd) clearSuggestion()
  }

  const handleFocus = () => {
    setIsFocused(true)
    window.requestAnimationFrame(updateCaretState)
  }

  useEffect(() => {
    if (!pendingFocusMainRef.current) return

    const element = textareaRef.current
    if (!element) return
    pendingFocusMainRef.current = false
    element.focus()
    const end = element.value.length
    element.setSelectionRange(end, end)
  }, [workflowValue, pendingFocusMainRef])

  useEffect(() => {
    autoResize(textareaRef.current)
  }, [workflowValue])

  useEffect(() => {
    const handleResize = () => autoResize(textareaRef.current)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (!loading || !hasInlineSlash) return undefined
    const timer = window.setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % SLASH_LOADING_SUFFIX.length)
    }, 500)
    return () => window.clearInterval(timer)
  }, [loading, hasInlineSlash])

  const beforeSlash = hasInlineSlash ? workflowValue.slice(0, inlineSlashState.start) : workflowValue
  const slashSegment = hasInlineSlash ? workflowValue.slice(inlineSlashState.start) : ""
  const shouldPadMirror = workflowValue.endsWith("\n")

  return (
    <section className="w-full max-w-[742px]">
      <div className="h-[12px] w-full bg-white" />
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 whitespace-pre-wrap break-words"
          style={{ ...SLASH_TEXT_STYLE, color: SLASH_TEXT_PROMINENT }}
        >
          {beforeSlash}
          {hasInlineSlash && <span style={{ color: SLASH_ACTIVE_COLOR }}>{slashSegment}</span>}
          {suggestion && isCaretAtEnd && isFocused && !hasInlineSlash && <span className="text-[#8e8a8f]">{suggestion}</span>}
          {shouldPadMirror && "\n"}
        </div>
        <textarea
          ref={textareaRef}
          className="relative w-full resize-none overflow-hidden bg-transparent text-transparent outline-none"
          rows={1}
          value={workflowValue}
          onChange={(event) => setValue(event.target.value)}
          onInput={(event) => autoResize(event.currentTarget)}
          onFocus={handleFocus}
          onBlur={() => {
            setIsFocused(false)
            clearSuggestion()
          }}
          onClick={updateCaretState}
          onKeyUp={updateCaretState}
          onSelect={updateCaretState}
          onKeyDown={handleKeyDown}
          disabled={loading}
          style={{
            ...SLASH_TEXT_STYLE,
            caretColor: SLASH_TEXT_PROMINENT,
          }}
        />
      </div>
      {hasInlineSlash && (
        <p className="mt-[2px] text-[15px] leading-[24px] tracking-[-0.15px] text-[#bbb]">
          {loading ? `Working on it${SLASH_LOADING_SUFFIX[loadingStep]}` : "Cmnd+Enter"}
        </p>
      )}
      {errorMessage && <p className="mt-[2px] text-[13px] leading-[20px] text-[#c62828]">{errorMessage}</p>}
      <div className="h-[24px] w-full bg-white" />
    </section>
  )
}
