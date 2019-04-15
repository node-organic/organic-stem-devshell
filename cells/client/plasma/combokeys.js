const Combokeys = require('combokeys')
module.exports = class CombokeysOrganelle {
  constructor (plasma, dna) {
    let combokeys = new Combokeys(document.documentElement)
    require('combokeys/plugins/global-bind')(combokeys)
    this.handlersMap = {}
    plasma.on({type: 'watchKeys'}, (c, callback) => {
      let handlerKey = c.value + c.action
      if (!this.handlersMap[handlerKey]) {
        let trigger = this.makeTriggerFn(handlerKey)
        if (!c.global) {
          combokeys.bind(c.value, trigger, c.action)
        } else {
          combokeys.bindGlobal(c.value, trigger, c.action)
        }
        this.handlersMap[handlerKey] = [callback]
      } else {
        this.handlersMap[handlerKey].push(callback)
      }
    })
  }

  makeTriggerFn (key) {
    return (e) => {
      this.handlersMap[key].forEach(f => f(e))
    }
  }
}
