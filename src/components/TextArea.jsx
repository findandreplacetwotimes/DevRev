import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { getInlineSlashState, SLASH_TEXT_PROMINENT } from "../lib/slashCommandConfig"
import { trimTrailingEmptyLines } from "../lib/trimTrailingEmptyLines"
import { useSlashCommandWorkflow } from "../hooks/useSlashCommandWorkflow"
import {
  DEFAULT_MENTION_TARGETS,
  estimateMentionMenuHeight,
  filterMentionTargets,
  getActiveMentionQuery,
  MENTION_COLOR_INPUT,
  parseMentionSegments,
} from "../lib/mentionUtils"
import { MentionMenu } from "./MentionMenu"

const systemTextStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
}

const LINE_HEIGHT_PX = 16

function MirrorMainContent({ text, mentionTargets, baseColor }) {
  const segs = parseMentionSegments(text, mentionTargets)
  return segs.map((seg, i) =>
    seg.type === "mention" ? (
      <span key={i} style={{ color: MENTION_COLOR_INPUT }}>
        {seg.text}
      </span>
    ) : (
      <span key={i} style={{ color: baseColor }}>
        {seg.text}
      </span>
    )
  )
}

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
  mentionsEnabled = true,
  mentionTargets = DEFAULT_MENTION_TARGETS,
}) {
  const textareaRef = useRef(null)
  const menuRef = useRef(null)
  const mentionSessionRef = useRef(null)
  /** Pinned `left` + `rangeStart` only — vertical `top` is recomputed when item count/height changes so a 1-row menu still sits under the field; `left` stays fixed while typing. */
  const mentionPinRef = useRef(null)
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

  const [mentionSession, setMentionSession] = useState(null)
  mentionSessionRef.current = mentionSession

  const autoResize = (element) => {
    if (!element) return
    element.style.height = "auto"
    const minHeight = LINE_HEIGHT_PX * Math.max(1, minRows)
    element.style.height = `${Math.max(minHeight, element.scrollHeight)}px`
  }

  const syncMentionFromElement = useCallback(
    (el, { fromLayout = false } = {}) => {
      const clearPin = () => {
        mentionPinRef.current = null
      }

      if (!mentionsEnabled || loading) {
        clearPin()
        setMentionSession(null)
        return
      }
      const caret = el.selectionStart
      const val = el.value
      const ctx = getActiveMentionQuery(val, caret)
      if (!ctx) {
        clearPin()
        setMentionSession(null)
        return
      }
      const filtered = filterMentionTargets(mentionTargets, ctx.query.toLowerCase())
      if (filtered.length === 0) {
        clearPin()
        setMentionSession(null)
        return
      }

      /** Gray field wrapper (`px-[14px]` rail) — same box as Figma Text Area `5893:38548`. */
      const shellEl = el.parentElement
      const shellRect = shellEl?.getBoundingClientRect()
      if (!shellRect?.width) {
        clearPin()
        setMentionSession(null)
        return
      }

      const estimatedMenuHeight = estimateMentionMenuHeight(filtered.length)
      const vh = typeof window !== "undefined" ? window.innerHeight : 800
      const gapWhenBelow = 4

      /**
       * Figma `6077:38305` / `6077:38490`: menu **above** the field; **bottom of menu = top of field** (no gap).
       * If it would clip the top of the viewport, open **below** the field instead.
       */
      let menuTop = shellRect.top - estimatedMenuHeight
      if (menuTop < 8) {
        menuTop = shellRect.bottom + gapWhenBelow
      }

      const pin = mentionPinRef.current
      const sameInvocation = pin && pin.rangeStart === ctx.start

      let left
      let top
      if (fromLayout) {
        left = shellRect.left
        top = menuTop
        mentionPinRef.current = { left: shellRect.left, rangeStart: ctx.start }
      } else if (sameInvocation) {
        left = pin.left
        top = menuTop
      } else {
        left = shellRect.left
        top = menuTop
        mentionPinRef.current = { left: shellRect.left, rangeStart: ctx.start }
      }

      setMentionSession((prev) => {
        const sameList =
          prev &&
          prev.rangeStart === ctx.start &&
          prev.filtered.length === filtered.length &&
          prev.filtered.every((x, i) => x.id === filtered[i]?.id)
        return {
          left,
          top,
          rangeStart: ctx.start,
          rangeEnd: caret,
          filtered,
          highlightIndex: sameList ? Math.min(prev.highlightIndex, filtered.length - 1) : 0,
        }
      })
    },
    [mentionsEnabled, loading, mentionTargets]
  )

  const insertMention = (target) => {
    const ta = textareaRef.current
    const session = mentionSessionRef.current
    if (!ta || !session) return
    const { rangeStart, rangeEnd } = session
    let caretPos = 0
    setValue((prev) => {
      const before = prev.slice(0, rangeStart)
      const after = prev.slice(rangeEnd)
      const insertion = `@${target.label} `
      caretPos = before.length + insertion.length
      return before + insertion + after
    })
    mentionPinRef.current = null
    setMentionSession(null)
    queueMicrotask(() => {
      const node = textareaRef.current
      if (!node) return
      node.focus()
      node.setSelectionRange(caretPos, caretPos)
      autoResize(node)
    })
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
  }, [value, pendingFocusMainRef])

  /** Re-anchor menu when the viewport scrolls or window resizes — NOT `ResizeObserver` on the textarea: each keystroke runs `autoResize`, which would fire RO and call `{ fromLayout: true }`, overwriting the pin and making the menu track the caret again. */
  useLayoutEffect(() => {
    if (!mentionSession) return undefined
    const ta = textareaRef.current
    if (!ta) return undefined
    const sync = () => syncMentionFromElement(ta, { fromLayout: true })
    window.addEventListener("scroll", sync, true)
    window.addEventListener("resize", sync)
    return () => {
      window.removeEventListener("scroll", sync, true)
      window.removeEventListener("resize", sync)
    }
  }, [mentionSession, syncMentionFromElement])

  useEffect(() => {
    if (!mentionsEnabled || loading) {
      mentionPinRef.current = null
      setMentionSession(null)
    }
  }, [mentionsEnabled, loading])

  useEffect(() => {
    if (!mentionSession) return undefined
    const onDocPointerDown = (event) => {
      const t = event.target
      if (textareaRef.current?.contains(t) || menuRef.current?.contains(t)) return
      mentionPinRef.current = null
      setMentionSession(null)
    }
    document.addEventListener("pointerdown", onDocPointerDown)
    return () => document.removeEventListener("pointerdown", onDocPointerDown)
  }, [mentionSession])

  const handleFocus = () => {
    onFocusChange?.(true)
  }

  const handleKeyDown = async (event) => {
    const session = mentionSessionRef.current
    const hasMenu = session && session.filtered.length > 0

    if (hasMenu && event.key === "Escape") {
      event.preventDefault()
      event.stopPropagation()
      mentionPinRef.current = null
      setMentionSession(null)
      return
    }

    const arrowDown = event.key === "ArrowDown" || event.code === "ArrowDown"
    const arrowUp = event.key === "ArrowUp" || event.code === "ArrowUp"
    if (hasMenu && (arrowDown || arrowUp)) {
      event.preventDefault()
      event.stopPropagation()
      const len = session.filtered.length
      if (len === 0) return
      const delta = arrowDown ? 1 : -1
      setMentionSession((prev) => {
        if (!prev) return prev
        const nextIndex = (prev.highlightIndex + delta + len) % len
        return { ...prev, highlightIndex: nextIndex }
      })
      return
    }

    if (hasMenu && (event.key === "Enter" || (event.key === "Tab" && !event.ctrlKey && !event.shiftKey))) {
      event.preventDefault()
      event.stopPropagation()
      const choice = session.filtered[session.highlightIndex]
      if (choice) insertMention(choice)
      return
    }

    if (onSubmit && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      await onSubmit(value)
      return
    }
    if (event.key === "Tab" && event.ctrlKey) {
      event.preventDefault()
      await runGrammarFix()
      return
    }
    if (event.key === "Enter" && event.metaKey) {
      event.preventDefault()
      await runCommand()
    }
  }

  const beforeSlash = hasInlineSlash ? value.slice(0, inlineSlashState.start) : value
  const slashSegment = hasInlineSlash ? value.slice(inlineSlashState.start) : ""
  const shouldPadMirror = value.endsWith("\n")
  const isEmpty = value.length === 0

  const handleChange = (event) => {
    const el = event.target
    setValue(el.value)
    syncMentionFromElement(el)
  }

  const handleSelect = (event) => {
    syncMentionFromElement(event.target)
  }

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
          {isEmpty ? (
            <span className="text-[var(--control-content-secondary)]">{placeholder}</span>
          ) : (
            <>
              <MirrorMainContent
                text={beforeSlash}
                mentionTargets={mentionTargets}
                baseColor={SLASH_TEXT_PROMINENT}
              />
              {hasInlineSlash && <span style={{ color: "rgba(71, 7, 209, 0.81)" }}>{slashSegment}</span>}
            </>
          )}
          {shouldPadMirror && "\n"}
        </div>
        <textarea
          ref={textareaRef}
          rows={Math.max(1, minRows)}
          value={value}
          onChange={handleChange}
          onSelect={handleSelect}
          onInput={(event) => autoResize(event.currentTarget)}
          onFocus={handleFocus}
          onBlur={() => {
            onFocusChange?.(false)
            const next = trimTrailingEmptyLines(value)
            if (next !== value) setValue(next)
            window.setTimeout(() => {
              if (document.activeElement === textareaRef.current) return
              if (menuRef.current?.contains(document.activeElement)) return
              mentionPinRef.current = null
              setMentionSession(null)
            }, 120)
          }}
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

      <MentionMenu
        open={Boolean(mentionSession?.filtered?.length)}
        left={mentionSession?.left ?? 0}
        top={mentionSession?.top ?? 0}
        items={mentionSession?.filtered ?? []}
        highlightIndex={mentionSession?.highlightIndex ?? 0}
        menuRef={menuRef}
        onPick={insertMention}
        onHighlightChange={(index) =>
          setMentionSession((prev) => (prev ? { ...prev, highlightIndex: index } : prev))
        }
      />
    </div>
  )
}
