import { createElement } from "react"
import { MemoryRouter } from "react-router-dom"
import { IssuesProvider } from "../context/IssuesContext"
import { Table } from "./Table"

function tableWithIssuesRouter(RenderStory) {
  return (
    <MemoryRouter>
      <IssuesProvider>{createElement(RenderStory)}</IssuesProvider>
    </MemoryRouter>
  )
}

const meta = {
  title: "Components/Table",
  component: Table,
  parameters: {
    layout: "padded",
  },
  decorators: [tableWithIssuesRouter],
}

export default meta

export const Default = {
  render: () => (
    <div className="w-full max-w-[900px]">
      <Table />
    </div>
  ),
}
