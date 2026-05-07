import { useEffect, useRef, useState } from "react"
import { getRandomDevTaskSample } from "../lib/devTaskPlaceholders"

const TITLE_TYPOGRAPHY = {
  fontFamily: '"Chip Display Variable", "Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "33px",
  lineHeight: "40px",
  letterSpacing: "0px",
  fontStyle: "normal",
  fontVariationSettings: '"wght" 650',
}

const TEXT_PROMINENT = "rgba(48, 46, 47, 0.94)"

/** Default visible copy for Overview title before the user edits (former long placeholder). */
export const TITLE_OUTCOME_PREFILL = "Describe the outcome you want for this work…"

const DEFAULT_PLACEHOLDER = "Title"

export function TextEditTitle({
  id,
  initialValue,
  value: valueProp,
  onChange: onChangeProp,
  placeholder = DEFAULT_PLACEHOLDER,
}) {
  const isControlled = valueProp !== undefined && typeof onChangeProp === "function"
  const [internal, setInternal] = useState(() => {
    if (isControlled) return ""
    if (initialValue !== undefined) return initialValue
    return getRandomDevTaskSample().title
  })

  const value = isControlled ? valueProp : internal
  const setValue = isControlled ? onChangeProp : setInternal

  const textareaRef = useRef(null)

  const autoResize = (element) => {
    if (!element) return
    element.style.height = "auto"
    element.style.height = `${element.scrollHeight}px`
  }

  useEffect(() => {
    autoResize(textareaRef.current)
  }, [value])

  useEffect(() => {
    const element = textareaRef.current
    if (!element) return undefined

    const handleResize = () => autoResize(element)
    handleResize()

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(handleResize)
      observer.observe(element)
      return () => observer.disconnect()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const textareaBase =
    "w-full max-w-[740px] resize-none overflow-hidden bg-transparent outline-none placeholder:text-[var(--control-content-secondary)] "

  return (
    <section className="relative flex w-full max-w-[740px] min-w-0 flex-col items-stretch justify-center">
      <textarea
        id={id}
        ref={textareaRef}
        className={textareaBase}
        rows={1}
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onInput={(event) => autoResize(event.currentTarget)}
        style={{
          ...TITLE_TYPOGRAPHY,
          color: TEXT_PROMINENT,
          caretColor: TEXT_PROMINENT,
        }}
      />
    </section>
  )
}
