// Entry point for the TUI RPC worker. Bun Workers silently drop messages
// posted before `onmessage` is assigned, and assignment is only safe if it
// happens before any top-level await in the module (including awaited
// imports like ../util/log through Global). The heavy implementation lives
// in worker-impl.ts and is loaded lazily inside the handler.
import type { rpc } from "./worker-impl"

export type { rpc } from "./worker-impl"

type Impl = typeof import("./worker-impl")
let impl: Promise<Impl> | undefined

onmessage = async (evt) => {
  const parsed = JSON.parse(evt.data)
  if (parsed.type !== "rpc.request") return
  impl ??= import("./worker-impl")
  const module = await impl
  const method = parsed.method as keyof Impl["rpc"]
  const result = await module.rpc[method](parsed.input)
  postMessage(JSON.stringify({ type: "rpc.result", result, id: parsed.id }))
}
