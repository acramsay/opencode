export default {
  id: "demo",
  async server(input: any) {
    let n = 0
    setInterval(() => {
      n += 1
      input.event.emit("plugin.demo.tick", { n })
    }, 1000)
    return {}
  },
}
