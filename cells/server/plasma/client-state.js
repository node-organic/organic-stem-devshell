const loadDNA = require('organic-dna-loader')
const path = require('path')
const userhome = require('userhome')
const _ = require('lodash')

const {
  ClientState,
  FetchClientState,
  ChangeClientState
} = require('../../../lib/chemicals')

const {
  TerminateAll,
  RunAll
} = require('../../../lib/chemicals/terminals')

let extractUniqueGroups = function (cells) {
  let names = _.uniq(_.flatten(cells.map(v => v.groups)))
  return names.map(name => {
    return {name: name, selected: false}
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
      groups: []
    })
    this.plasma.on(FetchClientState.type, this.fetch, this)
    this.plasma.on(ChangeClientState.type, this.change, this)
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
    }
    if (newState.runningCommand) {
      if (this.currentState.runningCommand) {
        this.plasma.emit(TerminateAll.create())
      }
      Object.assign(this.currentState, newState)
      let terminals
      if (this.currentState.cells.length === 0) {
        terminals = [{name: '$all-list$'}]
      } else {
        terminals = _.filter(this.currentState.cells, 'selected').map(c => {
          return {name: c.name, cellName: c.name}
        })
      }
      this.plasma.emit(RunAll.create({
        value: newState.runningCommand,
        terminals: terminals
      }))
    }
    Object.assign(this.currentState, ClientState.create(newState))
    this.plasma.emit(this.currentState)
  }

  fetch () {
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
        cells.push({
          name: key,
          groups: dna.cells[key].groups,
          selected: false,
          focused: false
        })
      }
      let groups = extractUniqueGroups(cells)
      Object.assign(this.currentState, ClientState.create({
        cells: cells,
        groups: groups
      }))
      this.plasma.emit(this.currentState)
    })
  }
}
