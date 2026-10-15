import { Route, Routes } from "react-router-dom"
import { AppWorkspaceLayout } from "./components/AppWorkspaceLayout"
import { renderWorkspaceRoutes } from "./routes/workspaceRoutes"

export default function App() {
  return (
    <Routes>
      <Route element={<AppWorkspaceLayout />}>{renderWorkspaceRoutes()}</Route>
    </Routes>
  )
}
