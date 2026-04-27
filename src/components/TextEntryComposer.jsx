import { useEffect, useRef, useState } from "react"
import { getAiResponse } from "../lib/aiClient"

export function TextEntryComposer() {
  const supportTicketIcon = "/icons/support-ticket-open.svg"
  const [value, setValue] = useState("This is an update just one line as an example")
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState("")
  const [flaggedWords, setFlaggedWords] = useState([])
  const [isCaretAtEnd, setIsCaretAtEnd] = useState(true)
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef(null)
  const commandMainTextareaRef = useRef(null)
  const commandTextareaRef = useRef(null)
  const debounceTimerRef = useRef(null)
  const activeSuggestionRequestRef = useRef(null)
  const prevHasCommandPillRef = useRef(false)
  const pendingFocusMainRef = useRef(false)

  const parseSlashCommand = (input) => {
    const slashIndex = input.indexOf("/")
    if (slashIndex === -1) throw new Error('Use "/" to separate text and command.')
    const sourceText = input.slice(0, slashIndex).trim()
    const command = input.slice(slashIndex + 1).trim()
    if (!command) throw new Error("Add a command after '/'.")
    return { sourceText, command }
  }

  const normalizeWord = (word) => word.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/gi, "")
  const isGrammarCheckCommand = (command) =>
    /gramm?a?r/i.test(command) && /(check|fix|correct)/i.test(command)

  const renderHighlightedText = (text) => {
    if (!flaggedWords.length) return text
    const flagged = new Set(flaggedWords.map(normalizeWord).filter(Boolean))
    const parts = text.split(/(\s+)/)
    return parts.map((part, index) => {
      if (/^\s+$/.test(part)) return <span key={`ws-${index}`}>{part}</span>
      const normalized = normalizeWord(part)
      if (normalized && flagged.has(normalized)) {
        return (
          <span key={`word-${index}`} className="text-[#c62828]">
            {part}
          </span>
        )
      }
      return <span key={`word-${index}`}>{part}</span>
    })
  }

  const slashIndex = value.indexOf("/")
  const rawCommand = slashIndex >= 0 ? value.slice(slashIndex + 1) : ""
  const cleanedCommand = rawCommand.replaceAll("/", "")
  const hasSlash = slashIndex >= 0
  const hasCommandPill = slashIndex >= 0 && cleanedCommand.length > 0
  const leadingText = slashIndex >= 0 ? value.slice(0, slashIndex) : value
  const commandText = cleanedCommand

  const runGrammarFix = async () => {
    const textToFix = slashIndex >= 0 ? leadingText : value
    if (!textToFix.trim()) return
    setLoading(true)
    setSuggestion("")
    try {
      const corrected = await getAiResponse(
        `Fix grammar and spelling in this text.
Keep the original meaning and tone.
Return only the corrected text with no explanation.

Text:
${textToFix}`
      )
      setValue(corrected.trim())
      setFlaggedWords([])
    } catch {
      // Keep UI minimal.
    } finally {
      setLoading(false)
    }
  }

  const updateMainText = (nextLeadingText) => {
    if (hasSlash) {
      setValue(`${nextLeadingText}/${commandText}`)
      return
    }
    setValue(nextLeadingText)
  }

  const updateCommandText = (nextCommandText) => {
    const sanitized = nextCommandText.replaceAll("/", "")
    if (!sanitized.length) {
      pendingFocusMainRef.current = true
      setValue(leadingText)
      return
    }
    setValue(`${leadingText}/${sanitized}`)
  }

  const runCommand = async () => {
    setLoading(true)
    setSuggestion("")
    try {
      const { sourceText, command } = parseSlashCommand(value)
      const grammarMode = isGrammarCheckCommand(command)
      if (grammarMode && sourceText) {
        const response = await getAiResponse(
          `Find incorrect or misspelled words in this text.
Return ONLY a JSON array of words from the original text that are incorrect.
Do not include explanations.
If no mistakes, return [].

Text:
${sourceText}`
        )
        let extracted = []
        try {
          extracted = JSON.parse(response)
        } catch {
          extracted = []
        }
        setFlaggedWords(Array.isArray(extracted) ? extracted.filter((item) => typeof item === "string") : [])
        pendingFocusMainRef.current = true
        setValue(sourceText)
        return
      }
      const prompt = sourceText
        ? `Rewrite the provided text by applying the command.
Return only the final rewritten text.
Do not add explanations, quotes, labels, or extra lines.

Text:
${sourceText}

Command:
${command}`
        : `Write a text based on this command.
Return only the final text.
Do not add explanations, quotes, labels, or extra lines.

Command:
${command}`
      const response = await getAiResponse(prompt)
      pendingFocusMainRef.current = true
      setValue(response.trim())
      setFlaggedWords([])
    } catch {
      // Keep the UI clean in this design surface.
    } finally {
      setLoading(false)
    }
  }

  const updateCaretState = () => {
    const element = textareaRef.current
    if (!element) return
    const atEnd =
      element.selectionStart === element.selectionEnd && element.selectionEnd === element.value.length
    setIsCaretAtEnd(atEnd)
    if (!atEnd) setSuggestion("")
  }

  const autoResize = (element) => {
    if (!element) return
    element.style.height = "auto"
    element.style.height = `${element.scrollHeight}px`
  }

  const handleKeyDown = async (event) => {
    if (event.key === "Tab" && event.ctrlKey) {
      event.preventDefault()
      await runGrammarFix()
      return
    }
    if (event.key === "Tab" && suggestion) {
      event.preventDefault()
      const words = suggestion.trim().split(/\s+/)
      const nextWord = words[0]
      const remainingWords = words.slice(1).join(" ")
      const separator = value.length > 0 && !/\s$/.test(value) ? " " : ""
      setValue((current) => `${current}${separator}${nextWord}`)
      setSuggestion(remainingWords)
      return
    }
    if (event.key === "Escape") {
      setSuggestion("")
      return
    }
    if (event.key === "Enter" && event.metaKey) {
      event.preventDefault()
      await runCommand()
    }
  }

  useEffect(() => {
    if (activeSuggestionRequestRef.current && loading) activeSuggestionRequestRef.current.abort()
    if (loading || !isCaretAtEnd || !isFocused || hasSlash) {
      setSuggestion("")
      return
    }
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    const baseText = value.trim()
    if (!baseText) {
      setSuggestion("")
      return
    }
    debounceTimerRef.current = setTimeout(async () => {
      if (activeSuggestionRequestRef.current) activeSuggestionRequestRef.current.abort()
      const controller = new AbortController()
      activeSuggestionRequestRef.current = controller
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
    }, 140)
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      if (activeSuggestionRequestRef.current) activeSuggestionRequestRef.current.abort()
    }
  }, [value, loading, isCaretAtEnd, isFocused, hasSlash])

  useEffect(() => {
    const justEnteredCommandMode = hasCommandPill && !prevHasCommandPillRef.current
    prevHasCommandPillRef.current = hasCommandPill
    if (!justEnteredCommandMode) return
    const element = commandTextareaRef.current
    if (!element) return
    element.focus()
    const end = element.value.length
    element.setSelectionRange(end, end)
    setIsFocused(true)
    setIsCaretAtEnd(true)
  }, [hasCommandPill, commandText])

  useEffect(() => {
    if (!pendingFocusMainRef.current || hasSlash) return
    const element = textareaRef.current
    if (!element) return
    pendingFocusMainRef.current = false
    element.focus()
    const end = element.value.length
    element.setSelectionRange(end, end)
    setIsFocused(true)
    setIsCaretAtEnd(true)
  }, [hasSlash, value])

  useEffect(() => {
    autoResize(textareaRef.current)
    autoResize(commandMainTextareaRef.current)
    autoResize(commandTextareaRef.current)
  }, [value, hasCommandPill])

  return (
    <section className="flex min-h-[92px] w-full flex-col rounded-[2px] bg-[#f4f4f6] px-[13px] pb-[15px] pt-[9px]">
      <div className="relative w-full flex-1">
        {!hasCommandPill && (
          <div className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 whitespace-pre-wrap break-words text-[#302e2ff0]"
              style={{
                fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: "13px",
                lineHeight: "22px",
                fontVariationSettings: '"wght" 460',
              }}
            >
              <span>{renderHighlightedText(value)}</span>
              {suggestion && isCaretAtEnd && isFocused && <span className="text-[#8e8a8f]">{suggestion}</span>}
            </div>
            <textarea
              ref={textareaRef}
              className="relative w-full resize-none overflow-hidden bg-transparent text-transparent outline-none"
              rows={1}
              value={value}
              onChange={(event) => updateMainText(event.target.value)}
              onInput={(event) => autoResize(event.currentTarget)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false)
                setSuggestion("")
              }}
              onClick={updateCaretState}
              onKeyUp={updateCaretState}
              onSelect={updateCaretState}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{
                fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: "13px",
                lineHeight: "22px",
                fontVariationSettings: '"wght" 460',
                caretColor: "#302e2ff0",
              }}
            />
          </div>
        )}

        {hasCommandPill && (
          <div>
            <textarea
              ref={commandMainTextareaRef}
              className="w-full resize-none overflow-hidden bg-transparent text-[#302e2ff0] outline-none"
              rows={1}
              value={leadingText}
              onChange={(event) => updateMainText(event.target.value)}
              onInput={(event) => autoResize(event.currentTarget)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{
                fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: "13px",
                lineHeight: "22px",
                fontVariationSettings: '"wght" 460',
                caretColor: "#302e2ff0",
              }}
            />
            <div className="mt-[2px]">
              <span
                className="mb-[2px] inline-flex h-[18px] items-center rounded-[2px] bg-[#00bf89] px-[6px] text-white uppercase"
                style={{
                  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: "9px",
                  lineHeight: "16px",
                  letterSpacing: "2px",
                  fontVariationSettings: '"wght" 460',
                }}
              >
                Computer
              </span>
              <textarea
                ref={commandTextareaRef}
                className="w-full resize-none overflow-hidden bg-transparent text-[#302e2ff0] outline-none"
                rows={1}
                value={commandText}
                onChange={(event) => updateCommandText(event.target.value)}
                onInput={(event) => autoResize(event.currentTarget)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                style={{
                  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: "13px",
                  lineHeight: "22px",
                  fontVariationSettings: '"wght" 460',
                  caretColor: "#302e2ff0",
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-[17px] flex items-end justify-between">
        <button className="grid size-[29px] place-items-center rounded-[2px] bg-white" type="button" aria-label="Insert">
          <span className="grid size-[26px] place-items-center overflow-hidden">
            <img src={supportTicketIcon} alt="" className="size-[16px]" />
          </span>
        </button>
        <button
          className="h-[28px] rounded-[34px] bg-white px-[10px] text-[#000000e6]"
          style={{
            fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: "13px",
            lineHeight: "16px",
            letterSpacing: "0.13px",
            fontVariationSettings: '"wght" 460',
          }}
          type="button"
          onClick={runCommand}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </section>
  )
}
