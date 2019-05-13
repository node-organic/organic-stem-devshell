module.exports = function (component) {
  component.els = function (input) {
    if (!component.el) return
    if (input) {
      return component.el.querySelector('[els="' + input + '"')
    } else {
      return component.el.querySelectorAll('[els]')
    }
  }
}
