/**
 * Approximate bottom edge (px from top of content box) of the line containing
 * `charIndex` in a textarea, using an off-DOM mirror with matching width + typography.
 * Handles wrapping; charIndex is clamped to [0, value.length].
 */
export function getTextareaLineBottomOffset(textarea, charIndex) {
  const value = textarea.value
  const idx = Math.min(Math.max(0, charIndex), value.length)

  const mirror = document.createElement("div")
  const ms = mirror.style
  const cs = getComputedStyle(textarea)

  ms.position = "absolute"
  ms.visibility = "hidden"
  ms.whiteSpace = "pre-wrap"
  ms.wordWrap = "break-word"
  ms.wordBreak = "break-word"
  ms.overflow = "hidden"
  ms.boxSizing = cs.boxSizing
  ms.width = `${textarea.clientWidth}px`
  ms.padding = cs.padding
  ms.border = cs.border
  ms.font = cs.font
  ms.lineHeight = cs.lineHeight
  ms.letterSpacing = cs.letterSpacing
  ms.textIndent = cs.textIndent
  ms.textTransform = cs.textTransform
  ms.tabSize = cs.tabSize

  document.body.appendChild(mirror)

  try {
    const before = value.slice(0, idx)
    mirror.append(document.createTextNode(before))
    const marker = document.createElement("span")
    marker.textContent = "\u200b"
    mirror.append(marker)

    return { lineBottom: marker.offsetTop + marker.offsetHeight }
  } finally {
    document.body.removeChild(mirror)
  }
}
