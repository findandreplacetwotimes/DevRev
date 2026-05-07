import { useEffect, useRef, useState } from "react"
import { getAiResponse } from "../lib/aiClient"

const SUGGESTION_DEBOUNCE_MS = 140

export function useInlineSuggestion({
  value,
  loading,
  isFocused,
  isCaretAtEnd,
  disabled = false,
  setValue,
}) {
  const [suggestion, setSuggestion] = useState("")
  const debounceTimerRef = useRef(null)
  const activeRequestRef = useRef(null)

  useEffect(() => {
    if (activeRequestRef.current && loading) activeRequestRef.current.abort()

    if (loading || disabled || !isCaretAtEnd || !isFocused) {
      setSuggestion("")
      return
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)

    const baseText = value.trim()
    if (!baseText) {
      setSuggestion("")
      return
    }

    debounceTimerRef.current = window.setTimeout(async () => {
      if (activeRequestRef.current) activeRequestRef.current.abort()
      const controller = new AbortController()
      activeRequestRef.current = controller
      try {
        const result = await getAiResponse(
          `Continue this text naturally.
Return only 3 to 4 next words.
Do not repeat the given text.
Do not add quotes or explanation.

Text:
${value}`,
          { signal: controller.signal }
        )
        if (!controller.signal.aborted) setSuggestion(result.trim())
      } catch {
        if (!controller.signal.aborted) setSuggestion("")
      }
    }, SUGGESTION_DEBOUNCE_MS)

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      if (activeRequestRef.current) activeRequestRef.current.abort()
    }
  }, [value, loading, disabled, isCaretAtEnd, isFocused])

  const clearSuggestion = () => setSuggestion("")

  const acceptNextSuggestionWord = () => {
    if (!suggestion) return false
    const words = suggestion.trim().split(/\s+/)
    const nextWord = words[0]
    const remainingWords = words.slice(1).join(" ")
    const separator = value.length > 0 && !/\s$/.test(value) ? " " : ""
    setValue((current) => `${current}${separator}${nextWord}`)
    setSuggestion(remainingWords)
    return true
  }

  return {
    suggestion,
    clearSuggestion,
    acceptNextSuggestionWord,
  }
}
