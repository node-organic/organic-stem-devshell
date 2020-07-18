const Combokeys = require('combokeys')
const {WatchKeys} = require('./chemicals')

module.exports = class CombokeysOrganelle {
  constructor (plasma, dna) {
    let combokeys = new Combokeys(document.documentElement)
    require('combokeys/plugins/global-bind')(combokeys)
    this.handlersMap = {}
    plasma.on(WatchKeys.type, (c) => {
      let handlerKey = c.value + c.action
      if (!this.handlersMap[handlerKey]) {
        let trigger = this.makeTriggerFn(handlerKey)
        if (!c.global) {
          combokeys.bind(c.value, trigger, c.action)
        } else {
          console.log(c.value)
          combokeys.bindGlobal(c.value, trigger, c.action)
        }
        this.handlersMap[handlerKey] = [c.callback]
      } else {
        if (!this.handlersMap[handlerKey].includes(c.callback)) {
          this.handlersMap[handlerKey].push(c.callback)
        }
      }
    })
  }

  makeTriggerFn (key) {
    return (e) => {
      this.handlersMap[key].forEach(f => f(e))
    }
  }
}
