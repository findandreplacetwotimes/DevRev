import "../src/index.css"
import { createElement } from "react"

const VIEWPORTS = {
  responsive: { label: "Responsive", width: "100%" },
  desktop: { label: "Desktop 1280", width: "1280px" },
  tablet: { label: "Tablet 768", width: "768px" },
  mobile: { label: "Mobile 390", width: "390px" },
}

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Storybook theme mode",
      defaultValue: "light",
      toolbar: {
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
      },
    },
    viewportMode: {
      name: "Viewport",
      description: "Canvas viewport width",
      defaultValue: "desktop",
      toolbar: {
        icon: "browser",
        items: [
          { value: "responsive", title: "Responsive" },
          { value: "desktop", title: "Desktop 1280" },
          { value: "tablet", title: "Tablet 768" },
          { value: "mobile", title: "Mobile 390" },
        ],
      },
    },
  },
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          "Foundations",
          ["Design tokens"],
          "Components",
          [
            "Topbar",
            "ChatHeader",
            "ChatWindow",
            "NavPanel",
            "Control",
            "NavItem",
            "Table",
            "TableCell",
            "Selector",
            "TableHeaderCell",
            "Page",
            "TabItem",
            "MenuItem",
            "TextInput",
            "TextArea",
            "Menu",
            "TextEditTitle",
            "TextEdit",
            "NakeAiStrip",
            "MessageInput",
            "MessageBubble",
            "AiMessageBubble",
            "Breadcrumbs",
            "Icon",
          ],
        ],
      },
    },

    a11y: {
      test: "off",
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || "light"
      const viewportMode = context.globals.viewportMode || "responsive"
      const viewport = VIEWPORTS[viewportMode] || VIEWPORTS.responsive

      return createElement(
        "div",
        {
          style: {
            minHeight: "100vh",
            width: "100%",
            background: theme === "dark" ? "#0e0e10" : "#ffffff",
            color: theme === "dark" ? "#f5f5f6" : "#211e20",
            display: "flex",
            justifyContent: "center",
            padding: "24px",
            boxSizing: "border-box",
          },
        },
        createElement(
          "div",
          { style: { width: viewport.width, maxWidth: "100%" } },
          createElement(Story)
        )
      )
    },
  ],
};

export default preview;