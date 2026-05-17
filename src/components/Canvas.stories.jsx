import { Canvas } from "./Canvas"

export default {
  title: "Components/Canvas",
  component: Canvas,
  parameters: {
    layout: "fullscreen",
  },
}

export const Default = {
  render: () => (
    <div className="flex h-screen items-stretch bg-[hsl(var(--bg-layer-02))]">
      <Canvas onClose={() => console.log("close")} onMinimize={() => console.log("minimize")} />
    </div>
  ),
}
