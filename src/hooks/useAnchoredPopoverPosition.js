import { useLayoutEffect, useState } from "react"

/**
 * Tracks viewport position below `triggerRef` for fixed popovers/portals so menus
 * aren't clipped by `overflow:auto` ancestors.
 */
export function useAnchoredPopoverPosition(triggerRef, open, gutterPx = 0) {
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return undefined

    const compute = () => {
      const el = triggerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setPos({
        top: Math.round(rect.bottom + gutterPx),
        left: Math.round(rect.left),
      })
    }

    compute()
    window.addEventListener("scroll", compute, true)
    window.addEventListener("resize", compute)
    return () => {
      window.removeEventListener("scroll", compute, true)
      window.removeEventListener("resize", compute)
    }
  }, [open, triggerRef, gutterPx])

  return pos
}
