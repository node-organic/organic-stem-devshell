module.exports = function (component) {
  let pairs = {}
  component.onIO = function (eventName, eventHandler) {
    pairs[eventName] = eventHandler
    window.plasma.on(eventName, eventHandler)
  }
  component.on('unmounted', function () {
    for (let eventName in pairs) {
      let eventHandler = pairs[eventName]
      window.plasma.off(eventName, eventHandler)
    }
  })
}
