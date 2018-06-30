const loadDNA = require('organic-dna-loader')
const path = require('path')
const userhome = require('userhome')
const _ = require('lodash')

const {
  ClientState,
  FetchClientState,
  ChangeClientState
} = require('../../../lib/chemicals')

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
    this.runningCommand = ''
    this.projectRoot = path.resolve(dna.PRJROOT)
    this.plasma.on(FetchClientState.type, this.fetch, this)
    this.plasma.on(ChangeClientState.type, this.change, this)
    console.log('looking after', this.projectRoot)
  }

  change (newState) {
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
    this.plasma.emit(ClientState.create(newState))
    this.currentState = newState
  }

  fetch () {
    loadDNA({
      dnaSourcePaths: [
        path.join(this.projectRoot, 'dna')
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
          selected: false
        })
      }
      let groups = extractUniqueGroups(cells)
      this.currentState = ClientState.create({
        userhome: userhome(),
        cwd: this.projectRoot,
        cells: cells,
        groups: groups,
        runningCommand: this.runningCommand
      })
      this.plasma.emit(this.currentState)
    })
  }
}
