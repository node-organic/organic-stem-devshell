const {ChangeClientState} = require('lib/chemicals')

const {
  RunSerialCommand,
  TerminateSerialCommand
} = require('lib/chemicals/serial-commands')

const {
  RunCommand,
  CommandTerminated,
  TerminateAll
} = require('lib/chemicals/terminals')

module.exports = class SerialCommandsOrganelle {
  constructor (plasma, dna) {
    this.plasma = plasma
    this.dna = dna

    this.currentCellIndex = -1
    this.currentCells = null
    this.currentCommand = null
    this.terminateAll = false

    plasma.on(RunSerialCommand.type, (c) => {
      this.cleanup()
      this.currentCellIndex = 0
      this.currentCells = c.cells
      this.currentCommand = c.value
      this.terminateAll = false
      this.runNextCell()
    })
    plasma.on(TerminateSerialCommand.type, (c) => {
      this.cleanup()
      this.terminateAll = true
      plasma.emit(TerminateAll.create())
    })
    plasma.on(CommandTerminated.type, (c) => {
      if (this.terminateAll) return
      if (this.currentCellIndex === -1) return
      if (c.commandValue !== this.currentCommand) return
      let found = false
      for (let i = 0; i < this.currentCells.length; i++) {
        if (this.currentCells[i].name === c.cell.name) {
          found = true
          break
        }
      }
      if (!found) return
      this.currentCellIndex += 1
      if (this.currentCellIndex >= this.currentCells.length) {
        this.cleanup()
        return
      }
      this.runNextCell()
    })
  }

  cleanup () {
    this.currentCellIndex = -1
    this.TerminateAll = false
    this.currentCells = null
    this.currentCommand = false
  }

  runNextCell () {
    this.plasma.emit(RunCommand.create({
      cell: this.currentCells[this.currentCellIndex],
      value: this.currentCommand
    }))
  }
}
