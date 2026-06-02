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
import { getTextareaCaretLineMetrics } from "../lib/measureTextareaLineBottom"
import { trimTrailingEmptyLines } from "../lib/trimTrailingEmptyLines"
import { NakeAiStrip } from "./NakeAiStrip"

const STRIP_HEIGHT_PX = 40
/** Gap (px) between the bottom of the caret / selection line and the top of the Computer strip. */
const COMPUTER_STRIP_GAP_BELOW_LINE_PX = 4

/** Char index whose line determines strip Y: caret, or last character of a non-empty selection. */
function getComputerAnchorCharIndex(selStart, selEnd, valueLength) {
  if (selStart === selEnd) return selStart
  const hi = Math.max(selStart, selEnd)
  const lo = Math.min(selStart, selEnd)
  return Math.max(lo, Math.min(hi - 1, valueLength - 1))
}

function stripTopBelowLineBottom(lineBottomPx) {
  return Math.max(0, lineBottomPx + COMPUTER_STRIP_GAP_BELOW_LINE_PX)
}

const HELPER_COPY = "Press Tab for Computer"

/** Mirror-only fake selection while Computer strip is focused (native highlight hides on blur). */
const COMPUTER_PINNED_SELECTION_BG = "rgba(71, 127, 209, 0.35)"

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
  /** Editor range pinned when Computer opens (caret or selection); overlay + strip anchor while strip is focused. */
  const [computerPinnedSelection, setComputerPinnedSelection] = useState(null)
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
        const lo = Math.min(s, e)
        const hi = Math.max(s, e)
        setComputerPinnedSelection({ start: lo, end: hi })
        const anchor = getComputerAnchorCharIndex(s, e, ta.value.length)
        const { lineBottom } = getTextareaCaretLineMetrics(ta, anchor)
        const top = stripTopBelowLineBottom(lineBottom)
        setComputerStripTop(top)
        setComputerStripSpacer(Math.max(0, top + STRIP_HEIGHT_PX - ta.offsetHeight))
      } else {
        setComputerStripTop(0)
        setComputerStripSpacer(0)
        setComputerPinnedSelection(null)
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
    const rt = event.relatedTarget
    const focusToComputerPanel = computerPanelRef.current?.contains(rt) ?? false

    if (!focusToComputerPanel) {
      const next = trimTrailingEmptyLines(workflowValue)
      if (next !== workflowValue) setValue(next)
    }

    if (computerOpen && !focusToComputerPanel) {
      closeComputerPanel()
    }
  }

  const closeComputerPanel = () => {
    setComputerOpen(false)
    setComputerDraft("")
    setComputerStripTop(null)
    setComputerStripSpacer(0)
    setComputerPinnedSelection(null)
  }

  useEffect(() => {
    if (!computerOpen) return
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
    if (!ta || !computerPinnedSelection) return
    const idx = getComputerAnchorCharIndex(
      computerPinnedSelection.start,
      computerPinnedSelection.end,
      ta.value.length
    )
    const { lineBottom } = getTextareaCaretLineMetrics(ta, idx)
    const top = stripTopBelowLineBottom(lineBottom)
    setComputerStripTop(top)
    setComputerStripSpacer(Math.max(0, top + STRIP_HEIGHT_PX - ta.offsetHeight))
  }, [computerOpen, workflowValue, computerPinnedSelection])

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
    const onPointerDownCapture = (event) => {
      const ta = textareaRef.current
      const panel = computerPanelRef.current
      const target = event.target
      if (ta && (target === ta || ta.contains(target))) return
      if (panel && (target === panel || panel.contains(target))) return
      closeComputerPanel()
    }
    document.addEventListener("pointerdown", onPointerDownCapture, true)
    return () => document.removeEventListener("pointerdown", onPointerDownCapture, true)
  }, [computerOpen])

  useEffect(() => {
    if (!computerOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      const pinned = computerPinnedSelection
      closeComputerPanel()
      const ta = textareaRef.current
      if (ta && pinned) {
        ta.focus()
        ta.setSelectionRange(pinned.start, pinned.end)
        setSelection({ start: pinned.start, end: pinned.end })
      } else {
        textareaRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [computerOpen, computerPinnedSelection])

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
      const pinned = computerPinnedSelection
      if (!pinned) return
      const idx = getComputerAnchorCharIndex(pinned.start, pinned.end, ta.value.length)
      const { lineBottom } = getTextareaCaretLineMetrics(ta, idx)
      const top = stripTopBelowLineBottom(lineBottom)
      setComputerStripTop(top)
      setComputerStripSpacer(Math.max(0, top + STRIP_HEIGHT_PX - ta.offsetHeight))
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [computerOpen, workflowValue, computerPinnedSelection])

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
  const pin = computerPinnedSelection
  const showComputerPinnedHighlight =
    computerOpen &&
    pin != null &&
    pin.start < pin.end &&
    !hasInlineSlash
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
    const ok = await runComputerCommand(trimmed, computerPinnedSelection)
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
          ) : showComputerPinnedHighlight ? (
            <>
              {workflowValue.slice(0, pin.start)}
              <span style={{ backgroundColor: COMPUTER_PINNED_SELECTION_BG }}>
                {workflowValue.slice(pin.start, pin.end)}
              </span>
              {workflowValue.slice(pin.end)}
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
