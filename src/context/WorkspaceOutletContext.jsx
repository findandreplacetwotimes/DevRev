import { createContext, useContext } from "react"
import { useOutletContext } from "react-router-dom"

const WorkspaceOutletContext = createContext(null)

export function WorkspaceOutletProvider({ value, children }) {
  return <WorkspaceOutletContext.Provider value={value}>{children}</WorkspaceOutletContext.Provider>
}

/** Outlet context for workspace pages — works in top-level Outlet and split WorkspacePane. */
export function useWorkspaceOutletContext() {
  const paneContext = useContext(WorkspaceOutletContext)
  const outletContext = useOutletContext()
  return paneContext ?? outletContext ?? {}
}
