import { MemoryRouter, Route, Routes } from "react-router-dom"
import { IssuesProvider } from "../context/IssuesContext"
import { SprintsPage } from "./SprintsPage"

const meta = {
  title: "Pages/SprintsPage",
  component: SprintsPage,
  parameters: {
    layout: "fullscreen",
  },
}

export default meta

export const Default = {
  render: () => (
    <div className="h-screen w-full bg-white">
      <MemoryRouter initialEntries={["/sprints"]}>
        <IssuesProvider>
          <Routes>
            <Route path="/sprints" element={<SprintsPage />} />
          </Routes>
        </IssuesProvider>
      </MemoryRouter>
    </div>
  ),
}
