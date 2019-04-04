const Combokeys = require('combokeys')
module.exports = class CombokeysOrganelle {
  constructor (plasma, dna) {
    let combokeys = new Combokeys(document.documentElement)
    require('combokeys/plugins/global-bind')(combokeys)
    plasma.on({type: 'watchKeys'}, function (c, callback) {
      let trigger = function (e) {
        plasma.emit({type: 'keycombo', value: c.value})
        callback(e)
      }
      if (!c.global) {
        combokeys.bind(c.value, trigger, c.action)
      } else {
        combokeys.bindGlobal(c.value, trigger, c.action)
      }
    })
  }
}
