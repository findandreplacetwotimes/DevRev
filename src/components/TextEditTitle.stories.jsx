import { TextEditTitle } from "./TextEditTitle"

const meta = {
  title: "Components/TextEditTitle",
  component: TextEditTitle,
  parameters: {
    layout: "padded",
  },
}

export default meta

/** Random dev-task title (paired samples in `devTaskPlaceholders`) */
export const Default = {}

/** Figma: Property 1=Empty — placeholder “Title”, secondary #dedede, 740×40 */
export const Empty = {
  args: {
    initialValue: "",
    placeholder: "Title",
  },
}
