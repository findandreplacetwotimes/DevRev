import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import "./index.css"
import App from "./App.jsx"
import { IssuesProvider } from "./context/IssuesContext"

const LEGACY_BUILD_PAGE_LS_KEYS = [
  "devrev.buildPage.bodies.v1",
  "devrev.buildPage.overviewTitle.v1",
  "devrev.buildPage.ownerId.v1",
  "devrev.buildPage.dueDateId.v1",
]
try {
  for (const key of LEGACY_BUILD_PAGE_LS_KEYS) {
    window.localStorage.removeItem(key)
  }
} catch {
  /* private mode / access denied — ignore */
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <IssuesProvider>
        <App />
      </IssuesProvider>
    </BrowserRouter>
  </StrictMode>
)
