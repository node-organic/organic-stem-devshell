module.exports = function (component) {
  component.els = function (input) {
    if (input) {
      return component.querySelector('[els="' + input + '"')
    } else {
      return component.querySelectorAll('[els]')
    }
  }
}
