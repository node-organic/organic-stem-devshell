const Combokeys = require('combokeys')
module.exports = class CombokeysOrganelle {
  constructor (plasma, dna) {
    let combokeys = new Combokeys(document.documentElement)
    require('combokeys/plugins/global-bind')(combokeys)
    this.handlersMap = {}
    plasma.on({type: 'watchKeys'}, (c, callback) => {
      if (!this.handlersMap[c.value]) {
        let trigger = this.makeTriggerFn(c.value)
        if (!c.global) {
          combokeys.bind(c.value, trigger, c.action)
        } else {
          combokeys.bindGlobal(c.value, trigger, c.action)
        }
        this.handlersMap[c.value] = [callback]
      } else {
        this.handlersMap[c.value].push(callback)
      }
    })
  }

  makeTriggerFn (value) {
    return (e) => {
      this.handlersMap[value].forEach(f => f(e))
    }
  }
}
