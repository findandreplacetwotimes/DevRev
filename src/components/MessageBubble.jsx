import { useEffect, useRef, useState } from "react"
import { Icon } from "./Icon"

const TEXT_STYLE = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "20px",
  fontVariationSettings: '"wght" 460',
  fontFeatureSettings: "'lnum' 1, 'tnum' 1",
}

/** Figma `6003:6841` — 18×18 chip for group-chat inbound rows (`6003:6852`). */
function GroupMessageAvatar({ initial = "M", isAgent = false }) {
  if (isAgent) {
    // Computer agent - uses Arcade intelligence color (jabuticaba purple)
    // Logo: two vertical bars representing Computer
    return (
      <span
        className="relative inline-flex size-[18px] shrink-0 items-center justify-center overflow-hidden rounded-full"
        style={{
          background: 'hsl(259 94% 44%)', // jabuticaba-400 from Arcade theme
        }}
        aria-hidden
        title="Computer"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
          <path d="M2.5 1.5C3.05 1.5 3.5 1.9 3.5 2.5v5c0 .6-.45 1-1 1S1.5 8.1 1.5 7.5v-5c0-.6.45-1 1-1z"/>
          <path d="M7.5 1.5c.55 0 1 .4 1 .9v5c0 .6-.45 1-1 1s-1-.4-1-1v-5c0-.5.45-.9 1-.9z"/>
        </svg>
      </span>
    )
  }

  const letter = (initial?.trim?.()?.[0] ?? "M").toUpperCase()
  return (
    <span
      className="relative inline-flex size-[18px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--control-bg-rest)]"
      aria-hidden
    >
      <span
        className="text-center text-[9.9px] capitalize text-[var(--control-content-primary)]"
        style={{
          fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
          fontVariationSettings: '"wght" 500',
        }}
      >
        {letter}
      </span>
    </span>
  )
}

export function MessageBubble({
  text = "Hi, can you help me with it",
  type = "me",
  state = "default",
  /** Initial letter for `type="groupPerson"` (Figma User Avatar `6003:6841`). */
  senderInitial = "M",
  /** Set to true for agent messages in group chat */
  isAgent = false,
}) {
  const textRef = useRef(null)
  const [isManyLines, setIsManyLines] = useState(false)
  const isGroupPerson = type === "groupPerson"
  const isPerson = type === "person"
  const isInbound = isPerson || isGroupPerson
  const isWriting = state === "writing" && isInbound

  useEffect(() => {
    if (isWriting) {
      setIsManyLines(false)
      return undefined
    }

    const element = textRef.current
    if (!element) return undefined

    const updateLineMode = () => {
      const styles = window.getComputedStyle(element)
      const lineHeight = Number.parseFloat(styles.lineHeight) || 20
      const lineCount = Math.round(element.getBoundingClientRect().height / lineHeight)
      setIsManyLines((prev) => (prev !== (lineCount > 1) ? lineCount > 1 : prev))
    }

    updateLineMode()
    const observer = new ResizeObserver(updateLineMode)
    observer.observe(element)
    return () => observer.disconnect()
  }, [text, isWriting])

  const bubble = (
    <div
      className={`relative z-[1] inline-flex max-w-full rounded-[20px] ${
        isInbound ? "bg-[var(--background-primary-subtle)]" : "bg-[var(--foreground-primary)]"
      } ${
        isWriting ? "px-[10px] py-[6px]" : `min-w-[60px] px-[14px] ${isManyLines ? "py-[8px]" : "py-[10px]"}`
      }`}
    >
      {isWriting ? (
        <Icon name="more" />
      ) : (
        <span
          ref={textRef}
          className={`whitespace-pre-wrap break-words ${isInbound ? "text-[var(--foreground-primary)]" : "text-white"}`}
          style={TEXT_STYLE}
        >
          {text}
        </span>
      )}
      <span
        aria-hidden
        className={`pointer-events-none absolute bottom-0 z-[-1] h-[20px] w-[36px] ${isInbound ? "left-[-10px]" : "right-[-10px]"}`}
      >
        <img
          src={isInbound ? "/icons/message-bubble-tail-person.svg" : "/icons/message-bubble-tail.svg"}
          alt=""
          className={`block h-full w-full select-none ${isInbound ? "scale-x-[-1]" : ""}`}
          draggable={false}
        />
      </span>
    </div>
  )

  return (
    <div className={`flex w-full ${isInbound ? "justify-start" : "justify-end pr-[10px]"}`}>
      {isGroupPerson ? (
        <div className="flex max-w-[80%] items-end gap-[14px]">
          <GroupMessageAvatar initial={senderInitial} isAgent={isAgent} />
          {bubble}
        </div>
      ) : (
        <div className="inline-flex max-w-[80%]">{bubble}</div>
      )}
    </div>
  )
}
