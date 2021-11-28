const { define } = require('lib/alchemy')
const {
  TerminateCommand,
} = require('lib/chemicals/terminals')
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
        case 'x':
        case 'exit':
          let cell = c.devshell.getFocusedCell()
          if (cell) {
            window.plasma.emit(TerminateCommand.byCell(cell))
          }
          return true
        case 'df':
        case 'defocus':
          cells.forEach(c => {
            c.focused = false
          })
          needsChange = true
          break
        case 'f':
        case 'focus':
          needsChange = c.devshell.setFocusedCellByNameQuery(parts[1])
          break
        case 's':
        case 'select':
          needsChange = c.devshell.setSelectedCellsByNameQuery(parts[1])
          break
        case 'ds':
        case 'deselect':
          cells.forEach(c => {
            if (parts[1]) {
              if (c.name.includes(parts[1])) {
                c.selected = false
                needsChange = true
              }
            } else {
              c.selected = false
              needsChange = true
            }
          })
          if (parts[1]) {
            groups.forEach(g => {
              if (g.name.includes(parts[1])) {
                g.selected = false
                needsChange = true
              }
            })
          }
          break
        case 'r':
        case 'run':
          let index = null
          try {
            index = parseInt(parts[1])
          } catch (e) {}
          if (index !== null) {
            c.devshell.executeFocusedCellScriptByIndex(index)
            return true
          }
          break
        case 'clear':
          c.devshell.clearFocusedCellOutput()
          return true
      }
      if (needsChange) {
        this.plasma.emit(ChangeClientState.create(c.devshell.state))
        return true
      }
    })
  }
}

module.exports.RunFrontCommand = RunFrontCommand
