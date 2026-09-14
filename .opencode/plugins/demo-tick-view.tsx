/** @jsxImportSource @opentui/solid */
import { createSignal } from "solid-js"
import type { TuiPluginModule } from "@opencode-ai/plugin/tui"

function View(props: { n: number }) {
  return <text>{`demo ticks: ${props.n}`}</text>
}

export default {
  id: "demo",
  tui: async (api) => {
    const [n, setN] = createSignal(0)
    api.event.on("plugin.demo.tick", (evt) => setN((evt.properties as { n: number }).n))

    api.slots.register({
      order: 100,
      slots: {
        sidebar_content() {
          return <View n={n()} />
        },
      },
    })
  },
} satisfies TuiPluginModule
