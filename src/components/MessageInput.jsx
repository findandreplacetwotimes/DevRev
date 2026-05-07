import { useEffect, useMemo, useState } from "react"
import { Icon } from "./Icon"
import { TextArea } from "./TextArea"
import { getInlineSlashState, SLASH_LOADING_SUFFIX } from "../lib/slashCommandConfig"
import { useSlashCommandWorkflow } from "../hooks/useSlashCommandWorkflow"

const INPUT_TEXT_STYLE = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
}

export function MessageInput({ mode = "ai", initialValue = "", onSendMessage }) {
  const {
    value,
    loading,
    errorMessage,
    pendingFocusMainRef,
    setValue,
    runCommand,
    runGrammarFix,
  } = useSlashCommandWorkflow({
    initialValue,
  })
  const [loadingStep, setLoadingStep] = useState(0)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const inlineSlashState = useMemo(() => getInlineSlashState(value), [value])
  const hasInlineSlash = inlineSlashState.active
  const hasText = value.trim().length > 0
  const showActions = mode === "ai" || isInputFocused || hasText

  useEffect(() => {
    if (!loading || !hasInlineSlash) return undefined
    const timer = window.setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % SLASH_LOADING_SUFFIX.length)
    }, 500)
    return () => window.clearInterval(timer)
  }, [loading, hasInlineSlash])

  const outerClass = mode === "message" && showActions ? "bg-[#f2f2f2]" : ""
  const handleSubmit = async (currentValue) => {
    if (typeof onSendMessage === "function") {
      const nextText = currentValue.trim()
      if (!nextText) return
      await onSendMessage(nextText)
      setValue("")
      return
    }
    await runCommand()
  }

  return (
    <section
      className={`flex w-full flex-col items-center ${showActions ? "gap-[4px]" : "gap-0"} ${outerClass} transition-all duration-200 ease-out`}
    >
      <TextArea
        fullWidth
        minRows={1}
        placeholder="Your message"
        onFocusChange={setIsInputFocused}
        onSubmit={handleSubmit}
        workflow={{
          value,
          setValue,
          loading,
          pendingFocusMainRef,
          runCommand,
          runGrammarFix,
        }}
      />

      <div
        className={`flex w-full items-center justify-between overflow-hidden transition-all duration-200 ease-out ${
          showActions ? "max-h-[56px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-1 pointer-events-none"
        } ${mode === "message" && showActions ? "px-[14px] pb-[14px]" : ""}`}
      >
        {mode === "ai" ? (
          <>
            <button
              type="button"
              className="inline-flex size-[40px] items-center justify-center rounded-[2px] bg-[var(--background-primary-subtle)] text-[var(--foreground-primary)]"
              aria-label="Add"
            >
              <Icon name="plus" size="large" />
            </button>
            <button
              type="button"
              className="inline-flex size-[40px] items-center justify-center rounded-[28px] bg-[#ffea00] text-[var(--foreground-primary)]"
              aria-label="Run command"
              onClick={() => handleSubmit(value)}
              disabled={loading}
            >
              <Icon name="arrowUp" size="large" />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="inline-flex size-[28px] items-center justify-center rounded-[2px] bg-white text-[var(--foreground-primary)]"
              aria-label="Add"
            >
              <Icon name="plus" />
            </button>
            <button
              type="button"
              className="inline-flex size-[28px] shrink-0 items-center justify-center rounded-[28px] bg-white text-[var(--foreground-primary)]"
              aria-label="Send"
              onClick={() => handleSubmit(value)}
              disabled={loading}
            >
              <Icon name="arrowRight" />
            </button>
          </>
        )}
      </div>

      {hasInlineSlash && (
        <p className="w-full px-[4px] text-[11px] leading-[16px] text-[#8e8a8f]">
          {loading ? `Thinking${SLASH_LOADING_SUFFIX[loadingStep]}` : "Cmnd+Enter"}
        </p>
      )}
      {errorMessage && <p className="w-full px-[4px] text-[11px] leading-[16px] text-[#c62828]">{errorMessage}</p>}
    </section>
  )
}
