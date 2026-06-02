import { useMemo, useRef, useState } from "react"
import { getAiResponse } from "../lib/aiClient"

function parseSlashCommand(input) {
  const slashIndex = input.indexOf("/")
  if (slashIndex === -1) throw new Error('Use "/" to separate text and command.')

  const lineStart = input.lastIndexOf("\n", slashIndex) + 1
  const lineEndRaw = input.indexOf("\n", slashIndex)
  const lineEnd = lineEndRaw === -1 ? input.length : lineEndRaw

  const command = input.slice(slashIndex + 1, lineEnd).trim()
  if (!command) throw new Error("Add a command after '/'.")

  const lineBeforeSlash = input.slice(lineStart, slashIndex)
  const isWholePageCommand = lineBeforeSlash.trim() === ""

  if (isWholePageCommand) {
    const removeStart = lineStart
    const removeEnd = lineEndRaw === -1 ? input.length : lineEndRaw + 1
    const sourceText = `${input.slice(0, removeStart)}${input.slice(removeEnd)}`.trim()

    return {
      command,
      sourceText,
      replaceWithResult: (nextText) => nextText.trim(),
      valueWithoutCommand: sourceText,
    }
  }

  const paragraphStartRaw = input.lastIndexOf("\n\n", slashIndex)
  const paragraphStart = paragraphStartRaw === -1 ? 0 : paragraphStartRaw + 2
  const paragraphEndRaw = input.indexOf("\n\n", slashIndex)
  const paragraphEnd = paragraphEndRaw === -1 ? input.length : paragraphEndRaw

  const commandStartInParagraph = slashIndex - paragraphStart
  const commandEndInParagraph = lineEnd - paragraphStart
  const paragraphText = input.slice(paragraphStart, paragraphEnd)
  const paragraphWithoutCommand = `${paragraphText.slice(0, commandStartInParagraph)}${paragraphText.slice(
    commandEndInParagraph
  )}`.trim()
  const valueWithoutCommand = `${input.slice(0, paragraphStart)}${paragraphWithoutCommand}${input.slice(paragraphEnd)}`

  return {
    command,
    sourceText: paragraphWithoutCommand,
    replaceWithResult: (nextText) =>
      `${input.slice(0, paragraphStart)}${nextText.trim()}${input.slice(paragraphEnd)}`,
    valueWithoutCommand,
  }
}

function isGrammarCheckCommand(command) {
  return /gramm?a?r/i.test(command) && /(check|fix|correct)/i.test(command)
}

export function useSlashCommandWorkflow({
  initialValue = "",
  value: valueProp,
  onChange: onChangeProp,
  executeLocalSlashCommand,
  executeAiSlashSignal,
} = {}) {
  const isControlled = valueProp !== undefined && typeof onChangeProp === "function"
  const [internalValue, setInternalValue] = useState(initialValue)
  const value = isControlled ? valueProp : internalValue

  const setValue = (next) => {
    const resolved = typeof next === "function" ? next(value) : next
    if (isControlled) onChangeProp(resolved)
    else setInternalValue(resolved)
  }
  const [loading, setLoading] = useState(false)
  const [flaggedWords, setFlaggedWords] = useState([])
  const [errorMessage, setErrorMessage] = useState("")
  const pendingFocusMainRef = useRef(false)

  const slashIndex = value.indexOf("/")
  const rawCommand = slashIndex >= 0 ? value.slice(slashIndex + 1) : ""
  const cleanedCommand = rawCommand.replaceAll("/", "")
  const hasSlash = slashIndex >= 0
  const hasCommandPill = slashIndex >= 0 && cleanedCommand.length > 0
  const leadingText = slashIndex >= 0 ? value.slice(0, slashIndex) : value
  const commandText = cleanedCommand

  const model = useMemo(
    () => ({
      value,
      loading,
      flaggedWords,
      errorMessage,
      hasSlash,
      hasCommandPill,
      leadingText,
      commandText,
      pendingFocusMainRef,
    }),
    [value, loading, flaggedWords, errorMessage, hasSlash, hasCommandPill, leadingText, commandText]
  )

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

  const runGrammarFix = async () => {
    const textToFix = hasSlash ? leadingText : value
    if (!textToFix.trim()) return

    setLoading(true)
    setErrorMessage("")
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
      pendingFocusMainRef.current = true
    } catch (error) {
      setErrorMessage(error?.message || "AI request failed. Check API key and network.")
    } finally {
      setLoading(false)
    }
  }

  const runCommand = async (inputOverride, parsedOverride) => {
    setLoading(true)
    setErrorMessage("")
    try {
      const {
        sourceText,
        command,
        replaceWithResult,
        valueWithoutCommand,
        /** Full page sent with Computer-strip selection so the model has document context. */
        fullPageContextForPrompt,
      } =
        parsedOverride ??
        parseSlashCommand(
          inputOverride !== undefined && inputOverride !== null ? inputOverride : value
        )
      const grammarMode = isGrammarCheckCommand(command)

      if (typeof executeLocalSlashCommand === "function") {
        const local = await executeLocalSlashCommand({
          command,
          sourceText,
          replaceWithResult,
          valueWithoutCommand,
        })
        if (local?.handled) {
          pendingFocusMainRef.current = true
          setFlaggedWords([])
          setValue(typeof local.nextValue === "string" ? local.nextValue : valueWithoutCommand)
          return true
        }
      }

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
        setValue(valueWithoutCommand)
        return true
      }

      const prompt =
        fullPageContextForPrompt && sourceText
          ? `The user selected a portion of a document. Use the full page for context (tone, facts, structure). Apply the command only to the selected text. The app will replace ONLY that selection—the JSON "text" field must be the replacement segment alone, not the full document.

Full document (context):
${fullPageContextForPrompt}

Selected text (rewrite only this; returned "text" replaces this range only):
${sourceText}

Command:
${command}

Return ONLY valid JSON:
{"text":"<replacement for the selection only>","signals":[{"type":"set_due_date","value":"<natural date text>"}]}
Rules:
- "text" must replace only the selected range—never return the full document.
- Use "signals" only when the command implies a record attribute change (like due date).
- If no signals apply, return "signals": [].
- No markdown, no prose, no code fences.`
          : sourceText
            ? `Rewrite the provided text by applying the command.
Return ONLY valid JSON:
{"text":"<final text>","signals":[{"type":"set_due_date","value":"<natural date text>"}]}
Rules:
- "text" must be the final rewritten text (or unchanged when command is metadata-only).
- Use "signals" only when command implies a record attribute change (like due date).
- If no signals apply, return "signals": [].
- No markdown, no prose, no code fences.

Text:
${sourceText}

Command:
${command}`
            : `Write text from this command.
Return ONLY valid JSON:
{"text":"<final text>","signals":[{"type":"set_due_date","value":"<natural date text>"}]}
Rules:
- If command is only metadata/action (no content rewrite), set "text" to empty string.
- Use "signals" only when command implies attribute changes.
- If none, return "signals": [].
- No markdown, no prose, no code fences.

Command:
${command}`

      const response = await getAiResponse(prompt)
      let payload = null
      try {
        payload = JSON.parse(response)
      } catch {
        payload = null
      }

      if (payload && typeof payload === "object") {
        const signals = Array.isArray(payload.signals) ? payload.signals : []
        let handledDueDateSignal = false
        if (typeof executeAiSlashSignal === "function" && signals.length > 0) {
          for (const signal of signals) {
            if (!signal || typeof signal !== "object") continue
            const handled = await executeAiSlashSignal(signal)
            if (handled === true && signal.type === "set_due_date") handledDueDateSignal = true
          }
        }
        if (handledDueDateSignal) {
          pendingFocusMainRef.current = true
          setValue(valueWithoutCommand)
          setFlaggedWords([])
          return true
        }
        const nextText = typeof payload.text === "string" ? payload.text : sourceText
        pendingFocusMainRef.current = true
        setValue(replaceWithResult(nextText))
        setFlaggedWords([])
        return true
      }

      pendingFocusMainRef.current = true
      setValue(replaceWithResult(response))
      setFlaggedWords([])
      return true
    } catch (error) {
      setErrorMessage(error?.message || "AI request failed. Check API key and network.")
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Computer strip: run AI without inserting `/…` into the editor.
   * - Collapsed caret (no range): same as whole-page slash command — send full document, replace whole page.
   * - Non-empty selection: send full page + selected range to the model; prompt says only the selection is replaced.
   */
  const runComputerCommand = async (commandText, pinnedSelection) => {
    const cmd = commandText.trim().replace(/^\//, "")
    if (!cmd) return false

    const pin =
      pinnedSelection &&
      typeof pinnedSelection.start === "number" &&
      typeof pinnedSelection.end === "number"
        ? {
            start: Math.min(pinnedSelection.start, pinnedSelection.end),
            end: Math.max(pinnedSelection.start, pinnedSelection.end),
          }
        : null

    if (pin && pin.start < pin.end) {
      const lo = pin.start
      const hi = pin.end
      const sourceText = value.slice(lo, hi)
      const valueWithoutCommand = value
      const replaceWithResult = (nextText) => {
        const t = typeof nextText === "string" ? nextText.trim() : String(nextText ?? "")
        return `${value.slice(0, lo)}${t}${value.slice(hi)}`
      }
      return runCommand(null, {
        command: cmd,
        sourceText,
        replaceWithResult,
        valueWithoutCommand,
        fullPageContextForPrompt: value,
      })
    }

    const base = value.trimEnd()
    const synthetic = base === "" ? `/${cmd}` : `${base}\n/${cmd}`
    return runCommand(synthetic)
  }

  return {
    ...model,
    setValue,
    setFlaggedWords,
    updateMainText,
    updateCommandText,
    runCommand,
    runComputerCommand,
    runGrammarFix,
  }
}
