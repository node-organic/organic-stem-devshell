const loadDNA = require('organic-dna-loader')
const path = require('path')
const userhome = require('userhome')
const _ = require('lodash')

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
        if (cell.name === c.cell.name) {
          cell.commandRunning = false
        }
      })
      this.plasma.emit(this.currentState)
    })
    console.log('looking after', this.currentState.cwd)
  }

  change (newState) {
    if (newState.cells) {
      newState.cells.forEach((cell) => {
        let cellHasBeenSelected = false
        this.currentState.cells.forEach((oldCell) => {
          if (oldCell.name === cell.name && oldCell.selected) {
            cellHasBeenSelected = true
          }
        })
        if (!cell.selected && cellHasBeenSelected) {
          newState.groups.forEach((group) => {
            if (cell.groups.indexOf(group.name) !== -1) {
              group.selected = false
            }
          })
        }
      })
      newState.groups.forEach((group) => {
        if (group.selected) {
          newState.cells.forEach((cell) => {
            if (cell.groups.indexOf(group.name) !== -1) {
              cell.selected = true
            }
          })
        }
        let groupHasBeenSelected = false
        this.currentState.groups.forEach((oldGroup) => {
          if (oldGroup.name === group.name && oldGroup.selected) {
            groupHasBeenSelected = true
          }
        })
        if (!group.selected && groupHasBeenSelected) {
          newState.cells.forEach((cell) => {
            if (cell.groups.indexOf(group.name) !== -1) {
              cell.selected = false
            }
          })
        }
      })
      newState.cells.forEach((cell) => {
        let cellHasBeenSelected = false
        this.currentState.cells.forEach((oldCell) => {
          if (oldCell.name === cell.name && oldCell.selected) {
            cellHasBeenSelected = true
          }
        })
        if (!cell.selected && cellHasBeenSelected) {
          this.plasma.emit(TerminateCommand.byCell(cell))
        }
        if (cell.selected && !cellHasBeenSelected && this.currentState.runningCommand) {
          this.plasma.emit(RunCommand.create({
            value: this.currentState.runningCommand,
            cell: cell
          }))
        }
      })
    }
    if (newState.runningCommand !== this.currentState.runningCommand) {
      if (this.currentState.runningCommand) {
        this.plasma.emit(TerminateAll.create())
      }
      this.plasma.emit(RunAll.create({
        value: newState.runningCommand,
        cells: _.filter(this.currentState.cells, 'selected')
      }))
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
      let cells = []
      for (let key in dna.cells) {
        let cell = Cell.create({
          name: key,
          groups: dna.cells[key].groups,
          selected: false,
          focused: false,
          commandRunning: false
        })
        cells.push(cell)
      }
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
