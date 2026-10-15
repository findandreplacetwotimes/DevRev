import { MemoryRouter } from "react-router-dom"
import { IssuesProvider } from "../context/IssuesContext"
import { ProjectsTable } from "./ProjectsTable"

const meta = {
  title: "Components/ProjectsTable",
  component: ProjectsTable,
  parameters: {
    layout: "fullscreen",
  },
}

export default meta

export const Default = {
  render: () => (
    <div className="h-screen w-full bg-white p-[24px]">
      <MemoryRouter>
        <IssuesProvider>
          <ProjectsTable />
        </IssuesProvider>
      </MemoryRouter>
    </div>
  ),
}
