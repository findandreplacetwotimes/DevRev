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
function GroupMessageAvatar({ initial = "M" }) {
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
          <GroupMessageAvatar initial={senderInitial} />
          {bubble}
        </div>
      ) : (
        <div className="inline-flex max-w-[80%]">{bubble}</div>
      )}
    </div>
  )
}
