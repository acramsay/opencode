# Handoff — opencode plugin event channel

Next task: implement the plugin event-channel change requested on anomalyco/opencode#6330,
running in the user's local clone (user will fork/clone; GitHub login `acramsay`).

## Goal (the feature)

Let server-side plugins publish events to clients (at minimum the TUI). Today server plugins
can only receive events via the `event` hook; anything live has to be shipped to the TUI via a
plugin-run loopback HTTP server + pid-file discovery. Remove that workaround by letting server
plugins define and emit custom event types (e.g. `<pluginID>.<name>`) that TUI plugins subscribe
to via `api.event.on(...)`. Out of scope for the first cut: client→plugin RPC (`/plugin/<id>/rpc`
mount) can be a follow-up.

## Why / issue references

- Issue: <https://github.com/anomalyco/opencode/issues/6330> — User posted their scoped comment
  (see <https://github.com/anomalyco/opencode/issues/6330#issuecomment-5462822665>); keep the
  PR text aligned with that comment's narrow framing.
- Related context uncovered during research: #5305 (inverse direction), draft PR #6549 (prior
  art on UI intents), #15747 (closed; explicit bridge protocol, `/global/plugin/<id>/` assets).

## Research already done (do not redo)

- Canonical repo: anomalyco/opencode (sst/opencode redirects). `2.0` branch head: `7a6ce05`
  ("2.0 exploration" PR #22335). npm dist-tags of interest: `next`, `beta`, `tui-v2`.
- 2.0 branch, `packages/opencode/src/server/instance/tui.ts`: TuiRoutes mount endpoints that
  `Bus.publish(TuiEvent, ...)`; `/tui/publish` validator restricts to the TuiEvent union;
  `/tui/execute-command` uses a fixed whitelist map. These endpoints demonstrate the accepted
  HTTP→Bus publish pattern; our proposal generalizes that for plugin-defined types.
- 2.0 branch, `packages/opencode/src/plugin/`: server plugin hook surface loaded via loader
  `PluginInput = { client, project, directory, worktree, experimental_workspace, serverUrl, $ }`.
  No plugin-exposed HTTP routes today.
- The TUI plugin API (`@opencode-ai/plugin/tui` dist): `api.event.on(type, handler)` filters by
  `event.type ===` at runtime, so namespaced custom types pass once type assertions are loosened;
  `api.slots.register` mounts sidebar content; `api.route.register` for full-screen pages.
- opencode 2.0 runs server in a worker thread inside the TUI process with RPC bridge; still a
  serialized boundary, so the bus-event path is the correct direction (no in-process singleton
  sharing like opencode-pty's `manager`).

## Suggested first steps

1. Clone/fork anomalyco/opencode (user does this), branch from `2.0` unless maintainer said
   otherwise.
2. Re-read issue comment + PR #6549 draft to keep scope aligned.
3. Implement: (a) server-side `Bus` publish access for plugins, (b) event-type namespacing,
   (c) SDK/runtime type loosening for custom types in TUI `api.event.on`.
4. Demo with a small sample plugin (e.g. a counter emitting `<demo>.tick` events) visible in a
   TUI sidebar slot. That same plugin also drives the eventual opencode-pty side panel demo.
5. Before opening the PR, run skill `code-review` against the diff.

## Demo run notes

- Run `bun run dev -- --port <free-port>`. Do **not** use `--port 0`: `server/adapter.bun.ts` treats 0 as "try 4096 first, fall back to random", which collides with stray `opencode serve` listeners non-deterministically. (If the global config `~/.config/opencode/opencode.json` sets `server.port`, the TUI-external check uses raw argv, so any explicit `--port` still spawns its own worker server — fine.)
- Demo via `.opencode/plugins/demo-tick.ts` (emits `plugin.demo.tick` every 1s) + `.opencode/plugins/demo-tick-view.tsx` (sidebar slot). Ticks render in the session route sidebar (Ctrl+X B or auto if width ≥ 120).

## Guardrails

- Follow #6330 comment framing: narrow, event-channel only; avoid UI-rendering debate.
- opencode dotfiles config changes (in this repo) belong in `home/.config/opencode/**`.
- Do not push to user forks without explicit confirmation.

## Suggested skills for the next agent

- `code-review` — review the fork diff before opening the PR
- `llm-instruction-authoring` — only if PR/issue text needs LLM-facing instruction edits
