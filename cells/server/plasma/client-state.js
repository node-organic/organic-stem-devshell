const dnaToCells = require('lib/dna-to-cells')
const path = require('path')
const userhome = require('userhome')
const _ = require('lodash')

const {
  ClientState,
  FetchClientState,
  ChangeClientState
} = require('lib/chemicals')

const {
  TerminateAll,
  RunCommand,
  RunAll,
  CommandStarted,
  CommandTerminated,
  AllRunningCommandsTerminated,
  TerminateCommand
} = require('lib/chemicals/terminals')

const {
  RunSerialCommand,
  TerminateSerialCommand
} = require('lib/chemicals/serial-commands')

const extractUniqueGroups = require('lib/cells-to-unique-groups')

module.exports = class ClientStateOrganelle {
  constructor (plasma, dna) {
    if (!dna.PRJROOT || dna.PRJROOT === 'undefined') throw new Error('missing dna.PRJROOT')
    this.plasma = plasma
    this.dna = dna
    this.currentState = ClientState.create({
      userhome: userhome(),
      cwd: path.resolve(dna.PRJROOT),
      runningCommand: '',
      cells: [],
      groups: [],
      resolved: false
    })
    this.plasma.on(FetchClientState.type, this.fetch, this)
    this.plasma.on(ChangeClientState.type, this.change, this)
    this.plasma.on(AllRunningCommandsTerminated.type, () => {
      this.currentState.runningCommand = ''
      this.plasma.emit(this.currentState)
    })
    this.plasma.on(CommandStarted.type, (c) => {
      this.currentState.cells.forEach(cell => {
        if (cell.name === c.cell.name) {
          cell.runningCommandsCount = c.runningCommandsCount
          cell.commandRunning = c.runningCommandsCount !== 0
        }
      })
      this.plasma.emit(this.currentState)
    })
    this.plasma.on(CommandTerminated.type, (c) => {
      this.currentState.cells.forEach(cell => {
        if (cell.name === c.cell.name) {
          cell.runningCommandsCount = c.runningCommandsCount
          cell.commandRunning = c.runningCommandsCount !== 0
        }
      })
      this.plasma.emit(this.currentState)
    })
    console.log('looking after', this.currentState.cwd)
  }

  change (newState) {
    if (newState.groups) {
      newState.groups.forEach(group => {
        let groupHasBeenSelected = _.find(this.currentState.groups, (g) => {
          return g.name === group.name && g.selected
        })
        // if group has been selected -> select its cells
        if (group.selected && !groupHasBeenSelected) {
          newState.cells.forEach(cell => {
            if (cell.groups.indexOf(group.name) !== -1) {
              cell.selected = true
            }
          })
        }
        // if group has been unselected -> unselect its cells
        if (!group.selected && groupHasBeenSelected) {
          newState.cells.forEach(cell => {
            if (cell.groups.indexOf(group.name) !== -1) {
              cell.selected = false
            }
          })
        }
      })
    }
    if (newState.cells) {
      newState.cells.forEach(cell => {
        let cellHasBeenSelected = _.find(this.currentState.cells, (c) => {
          return c.name === cell.name && c.selected
        })
        // if cell has been selected and there is runningCommand -> run the command at cell
        if (cell.selected && !cellHasBeenSelected && this.currentState.runningCommand) {
          // needed to properly update currentState
          // otherwise the CommandStarted chemical's effect get lost due currentState override
          cell.commandRunning = true
          this.plasma.emit(RunCommand.create({
            value: this.currentState.runningCommand,
            cell: cell
          }))
        }
        // if cell has been deselected and it runs a command(s) -> terminate its command(s)
        if (!cell.selected && cellHasBeenSelected) {
          // needed to properly update currentState
          // otherwise the CommandTerminated chemical's effect get lost due currentState override
          cell.commandRunning = false
          this.plasma.emit(TerminateCommand.byCell(cell))
        }
      })
    }
    if (newState.runningCommand !== this.currentState.runningCommand || newState.executeType !== this.currentState.executeType) {
      let selectedCells = _.filter(this.currentState.cells, 'selected')
      if (selectedCells.length === 0) {
        newState.runningCommand = ''
      }
      // if a new command is set -> terminate all running commands and run new command to selected cells
      if (this.currentState.runningCommand) {
        if (this.currentState.executeType === 'serial') {
          this.plasma.emit(TerminateSerialCommand.create())
        } else {
          this.plasma.emit(TerminateAll.create())
        }
      }
      if (newState.executeType === 'parallel') {
        this.plasma.emit(RunAll.create({
          value: newState.runningCommand,
          cells: selectedCells
        }))
      }
      if (newState.executeType === 'serial') {
        this.plasma.emit(RunSerialCommand.create({
          value: newState.runningCommand,
          cells: selectedCells
        }))
      }
    }
    if (newState.groups && newState.cells) {
      newState.groups.forEach(group => {
        let allCount = 0
        let count = 0
        newState.cells.forEach(cell => {
          if (cell.groups.indexOf(group.name) !== -1) {
            allCount += 1
            if (cell.selected) count += 1
          }
        })
        // if all cells of a group are selected -> select the group
        if (allCount === count) group.selected = true
        // if all cells of a group are unselected and there is no running command -> unselect the group
        if (count === 0) group.selected = false
      })
    }
    Object.assign(this.currentState, ClientState.create(newState))
    this.plasma.emit(this.currentState)
  }

  async fetch () {
    if (this.currentState.resolved) return this.plasma.emit(this.currentState)
    let cells = await dnaToCells(this.currentState.cwd)
    let groups = extractUniqueGroups(cells)
    Object.assign(this.currentState, ClientState.create({
      cells: cells,
      groups: groups,
      resolved: true
    }))
    this.plasma.emit(this.currentState)
  }
}
