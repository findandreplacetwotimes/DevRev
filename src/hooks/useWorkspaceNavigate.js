import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useWorkspaceOutletContext } from "../context/WorkspaceOutletContext"

/** Navigate within the active workspace session; split panes stay in their own window. */
export function useWorkspaceNavigate() {
  const navigate = useNavigate()
  const { navigateInSession } = useWorkspaceOutletContext()

  return useCallback(
    (href, options) => {
      if (!href) return
      if (navigateInSession) {
        navigateInSession(href)
        return
      }
      navigate(href, options)
    },
    [navigate, navigateInSession]
  )

}
