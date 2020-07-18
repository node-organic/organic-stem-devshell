const { define } = require('lib/alchemy')

const RunFrontCommand = define({
  type: 'RunFrontCommand',
  value: String,
  devshell: 'Component'
})
const {
  ChangeClientState
} = require('lib/chemicals')

module.exports = class FrontCommands {
  constructor (plasma, dna) {
    this.plasma = plasma
    this.dna = dna
    this.plasma.on(RunFrontCommand.type, (c) => {
      let parts = c.value.split(' ')
      let needsChange = false
      let cells = c.devshell.state.cells
      let groups = c.devshell.state.groups
      switch (parts[0]) {
        case 's':
        case 'select':
          cells.forEach(c => {
            if (c.name.includes(parts[1])) {
              c.selected = true
              needsChange = true
            }
          })
          groups.forEach(g => {
            if (g.name.includes(parts[1])) {
              g.selected = true
              needsChange = true
            }
          })
          break
        case 'ds':
        case 'deselect':
          cells.forEach(c => {
            c.selected = false
          })
          needsChange = true
          break
      }
      if (needsChange) {
        this.plasma.emit(ChangeClientState.create(c.devshell.state))
      }
    })
  }
}

module.exports.RunFrontCommand = RunFrontCommand
