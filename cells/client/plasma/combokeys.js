const Combokeys = require('combokeys')
module.exports = class CombokeysOrganelle {
  constructor (plasma, dna) {
    plasma.combokeys = new Combokeys(document.documentElement)
  }
}
