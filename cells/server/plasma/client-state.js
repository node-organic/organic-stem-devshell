const loadDNA = require('organic-dna-loader')
const path = require('path')
const userhome = require('userhome')
const _ = require('lodash')
const cellsinfo = require('organic-dna-cells-info')

const {
  ClientState,
  FetchClientState,
  ChangeClientState,
  Cell,
  Group
} = require('../../../lib/chemicals')

const {
  TerminateAll,
  RunCommand,
  RunAll,
  CommandStarted,
  CommandTerminated,
  AllRunningCommandsTerminated,
  TerminateCommand
} = require('../../../lib/chemicals/terminals')

let extractUniqueGroups = function (cells) {
  let names = _.uniq(_.flatten(cells.map(v => v.groups)))
  return names.map(name => {
    return Group.create({
      name: name,
      selected: false
    })
  })
}

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
          cell.commandRunning = true
        }
      })
      this.plasma.emit(this.currentState)
    })
    this.plasma.on(CommandTerminated.type, (c) => {
      this.currentState.cells.forEach(cell => {
        if (cell.name === c.cell.name && !c.cellHasMoreCommands) {
          cell.commandRunning = false
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
    // if a new command is set -> terminate all running commands and run new command to selected cells
    if (newState.runningCommand !== this.currentState.runningCommand) {
      if (this.currentState.runningCommand) {
        this.plasma.emit(TerminateAll.create())
      }
      this.plasma.emit(RunAll.create({
        value: newState.runningCommand,
        cells: _.filter(this.currentState.cells, 'selected')
      }))
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

  fetch () {
    if (this.currentState.resolved) return this.plasma.emit(this.currentState)
    loadDNA({
      dnaSourcePaths: [
        path.join(this.currentState.cwd, 'dna')
      ]
    }, (err, dna) => {
      if (err) {
        console.error(err)
        return
      }
      let cells = cellsinfo(dna.cells).map((cellInfo) => {
        return Cell.create({
          name: cellInfo.name,
          groups: cellInfo.groups,
          cwd: cellInfo.cwd,
          selected: false,
          focused: false,
          commandRunning: false,
          port: dna['cell-ports'] ? dna['cell-ports'][cellInfo.name] : false,
          mountPoint: dna['cell-mountpoints'] ? dna['cell-mountpoints'][cellInfo.name] : false,
          scripts: require(path.join(this.currentState.cwd, cellInfo.cwd, 'package.json')).scripts
        })
      })
      let groups = extractUniqueGroups(cells)
      Object.assign(this.currentState, ClientState.create({
        cells: cells,
        groups: groups,
        resolved: true
      }))
      this.plasma.emit(this.currentState)
    })
  }
}
