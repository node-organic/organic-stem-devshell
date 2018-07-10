module.exports = function (component) {
  component.els = function (input) {
    if (!component.shadowRoot) return
    if (input) {
      return component.shadowRoot.querySelector('[els="' + input + '"')
    } else {
      return component.shadowRoot.querySelectorAll('[els]')
    }
  }
}
