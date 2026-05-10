import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { getRandomDevTaskSample } from "../lib/devTaskPlaceholders"
import {
  getInlineSlashState,
  SLASH_ACTIVE_COLOR,
  SLASH_LOADING_SUFFIX,
  SLASH_TEXT_PROMINENT,
  SLASH_TEXT_STYLE,
} from "../lib/slashCommandConfig"
import { useSlashCommandWorkflow } from "../hooks/useSlashCommandWorkflow"
import { getTextareaLineBottomOffset } from "../lib/measureTextareaLineBottom"
import { trimTrailingEmptyLines } from "../lib/trimTrailingEmptyLines"
import { NakeAiStrip } from "./NakeAiStrip"

const STRIP_HEIGHT_PX = 40
const STRIP_GAP_PX = 8

const HELPER_COPY = "Press Tab for Computer"

function getCaretLineIndex(value, caret) {
  const c = Math.min(Math.max(0, caret), value.length)
  return value.slice(0, c).split("\n").length - 1
}

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
    runComputerCommand,
    runGrammarFix,
  } = useSlashCommandWorkflow(workflowArgs)

  const textareaRef = useRef(null)
  const computerPanelRef = useRef(null)
  const computerInputRef = useRef(null)
  const skipAutofocusComputerRef = useRef(false)
  const selectionRestoreRef = useRef(null)
  const computerPlacementIndexRef = useRef(0)
  const [computerOpen, setComputerOpen] = useState(false)
  const [computerDraft, setComputerDraft] = useState("")
  const [computerStripTop, setComputerStripTop] = useState(null)
  const [computerStripSpacer, setComputerStripSpacer] = useState(0)
  const inlineSlashState = useMemo(() => getInlineSlashState(workflowValue), [workflowValue])
  const hasInlineSlash = inlineSlashState.active
  const [loadingStep, setLoadingStep] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const [selection, setSelection] = useState({ start: 0, end: 0 })

  const syncSelectionFromTextarea = () => {
    const el = textareaRef.current
    if (!el) return
    setSelection({ start: el.selectionStart, end: el.selectionEnd })
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
    if (event.key === "Tab" && !event.shiftKey && !event.altKey && !event.metaKey) {
      event.preventDefault()
      const ta = textareaRef.current
      if (ta) {
        const s = ta.selectionStart
        const e = ta.selectionEnd
        const tail = Math.max(s, e)
        computerPlacementIndexRef.current = tail
        if (s !== e) {
          skipAutofocusComputerRef.current = true
          selectionRestoreRef.current = { start: s, end: e }
        } else {
          selectionRestoreRef.current = null
        }
        const { lineBottom } = getTextareaLineBottomOffset(ta, tail)
        const top = lineBottom + STRIP_GAP_PX
        setComputerStripTop(top)
        setComputerStripSpacer(Math.max(0, top + STRIP_HEIGHT_PX - ta.scrollHeight))
      } else {
        setComputerStripTop(STRIP_GAP_PX)
        setComputerStripSpacer(0)
      }
      setComputerOpen(true)
      return
    }
    if (event.key === "Enter" && event.metaKey) {
      event.preventDefault()
      await runCommand()
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    syncSelectionFromTextarea()
  }

  const handleBlur = (event) => {
    setIsFocused(false)
    const next = trimTrailingEmptyLines(workflowValue)
    if (next !== workflowValue) setValue(next)

    if (computerOpen) {
      const rt = event.relatedTarget
      if (!computerPanelRef.current?.contains(rt)) {
        closeComputerPanel()
      }
    }
  }

  const closeComputerPanel = () => {
    setComputerOpen(false)
    setComputerDraft("")
    setComputerStripTop(null)
    setComputerStripSpacer(0)
  }

  useEffect(() => {
    if (!computerOpen) return
    if (skipAutofocusComputerRef.current) {
      skipAutofocusComputerRef.current = false
      return
    }
    const id = window.requestAnimationFrame(() => {
      computerInputRef.current?.focus()
    })
    return () => window.cancelAnimationFrame(id)
  }, [computerOpen])

  useLayoutEffect(() => {
    if (!computerOpen) {
      setComputerStripTop(null)
      setComputerStripSpacer(0)
      return
    }
    const ta = textareaRef.current
    if (!ta) return
    const snap = selectionRestoreRef.current
    if (snap) {
      selectionRestoreRef.current = null
      ta.focus()
      ta.setSelectionRange(snap.start, snap.end)
      setSelection({ start: snap.start, end: snap.end })
    }
    const idx =
      computerPlacementIndexRef.current ?? Math.max(ta.selectionStart, ta.selectionEnd)
    const { lineBottom } = getTextareaLineBottomOffset(ta, idx)
    const top = lineBottom + STRIP_GAP_PX
    setComputerStripTop(top)
    setComputerStripSpacer(Math.max(0, top + STRIP_HEIGHT_PX - ta.scrollHeight))
  }, [computerOpen, workflowValue])

  useEffect(() => {
    if (!computerOpen) return undefined
    const el = computerPanelRef.current
    if (!el) return undefined
    const onFocusOut = (event) => {
      const next = event.relatedTarget
      if (el.contains(next)) return
      closeComputerPanel()
    }
    el.addEventListener("focusout", onFocusOut)
    return () => el.removeEventListener("focusout", onFocusOut)
  }, [computerOpen])

  useEffect(() => {
    if (!computerOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      closeComputerPanel()
      textareaRef.current?.focus()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [computerOpen])

  useEffect(() => {
    if (!pendingFocusMainRef.current) return

    const element = textareaRef.current
    if (!element) return
    pendingFocusMainRef.current = false
    element.focus()
    const end = element.value.length
    element.setSelectionRange(end, end)
    setSelection({ start: end, end })
  }, [workflowValue, pendingFocusMainRef])

  useEffect(() => {
    autoResize(textareaRef.current)
  }, [workflowValue])

  useEffect(() => {
    const handleResize = () => {
      autoResize(textareaRef.current)
      if (!computerOpen) return
      const ta = textareaRef.current
      if (!ta) return
      const idx =
        computerPlacementIndexRef.current ?? Math.max(ta.selectionStart, ta.selectionEnd)
      const { lineBottom } = getTextareaLineBottomOffset(ta, idx)
      const top = lineBottom + STRIP_GAP_PX
      setComputerStripTop(top)
      setComputerStripSpacer(Math.max(0, top + STRIP_HEIGHT_PX - ta.scrollHeight))
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [computerOpen])

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

  const mirrorLines = useMemo(() => workflowValue.split("\n"), [workflowValue])
  const caretLineIndex = useMemo(() => {
    if (selection.start !== selection.end) return -1
    return getCaretLineIndex(workflowValue, selection.start)
  }, [workflowValue, selection.start, selection.end])

  const showInlineCaretHelper =
    isFocused &&
    !computerOpen &&
    !loading &&
    selection.start === selection.end &&
    caretLineIndex >= 0 &&
    (mirrorLines[caretLineIndex] ?? "").trim() === ""

  const onComputerSubmit = async (trimmed) => {
    const ok = await runComputerCommand(trimmed)
    if (ok) {
      closeComputerPanel()
    }
  }

  return (
    <section className="w-full max-w-[742px]">
      <div className="h-[12px] w-full bg-white" />
      <div
        className="relative z-0"
        style={{
          paddingBottom: computerStripSpacer > 0 ? computerStripSpacer : undefined,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 whitespace-pre-wrap break-words"
          style={{ ...SLASH_TEXT_STYLE, color: SLASH_TEXT_PROMINENT }}
        >
          {hasInlineSlash ? (
            <>
              {beforeSlash}
              <span style={{ color: SLASH_ACTIVE_COLOR }}>{slashSegment}</span>
              {shouldPadMirror && "\n"}
            </>
          ) : (
            mirrorLines.map((line, lineIndex) => {
              const showHelperHere =
                showInlineCaretHelper && lineIndex === caretLineIndex
              return (
                <span key={lineIndex}>
                  {lineIndex > 0 ? "\n" : null}
                  {showHelperHere ? (
                    <span style={{ color: "var(--control-content-secondary)" }}>{HELPER_COPY}</span>
                  ) : (
                    line
                  )}
                </span>
              )
            })
          )}
        </div>
        <textarea
          ref={textareaRef}
          className="relative z-0 w-full resize-none overflow-hidden bg-transparent text-transparent outline-none"
          rows={1}
          value={workflowValue}
          onChange={(event) => {
            setValue(event.target.value)
            window.requestAnimationFrame(() => syncSelectionFromTextarea())
          }}
          onInput={(event) => autoResize(event.currentTarget)}
          onSelect={syncSelectionFromTextarea}
          onKeyUp={syncSelectionFromTextarea}
          onClick={syncSelectionFromTextarea}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={loading}
          style={{
            ...SLASH_TEXT_STYLE,
            caretColor: SLASH_TEXT_PROMINENT,
          }}
        />
        {computerOpen && computerStripTop != null && (
          <div
            ref={computerPanelRef}
            className="absolute left-0 right-0 z-20 w-full bg-transparent"
            style={{ top: computerStripTop }}
          >
            <NakeAiStrip
              ref={computerInputRef}
              value={computerDraft}
              onChange={setComputerDraft}
              placeholder="Command"
              disabled={loading}
              onSubmit={onComputerSubmit}
            />
          </div>
        )}
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
