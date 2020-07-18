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
          break
        case 'ft':
        case 'focusterminal':
          window.plasma.emit('focusterminal')
          break
        case 'df':
        case 'defocus':
          cells.forEach(c => {
            c.focused = false
          })
          needsChange = true
          break
        case 'f':
        case 'focus':
          cells.forEach(c => {
            if (needsChange) {
              c.focused = false
              return
            }
            if (c.name.includes(parts[1])) {
              c.focused = true
              needsChange = true
            } else {
              c.focused = false
            }
          })
          break
        case 's':
        case 'select':
          cells.forEach(c => {
            if (!parts[1]) {
              c.selected = true
              needsChange = true
            }
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
      }
      if (needsChange) {
        this.plasma.emit(ChangeClientState.create(c.devshell.state))
      }
    })
  }
}

module.exports.RunFrontCommand = RunFrontCommand
