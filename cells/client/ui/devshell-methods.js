const {
  FetchReleasedState
} = require('lib/chemicals')
const {
  ChangeClientState
} = require('lib/chemicals')

const ExecuteCellTypes = require('./execute-cell-types')

const _ = require('lodash')

/**
 * @this {devshell} component
 */
module.exports = function () {
  this.clearFocusedCellOutput = () => {
    window.plasma.emit('clearterminal')
  }
  this.executeFocusedCellScriptByIndex = (index) => {
    let scripts = null
    if (this.executeToAllCellsType === ExecuteCellTypes.none) {
      scripts = this.getFocusedCellScripts()
    } else {
      scripts = this.getCommonCellScripts()
    }
    this.onExecute({ cmd: 'npm run ' + scripts[index] })
  }
  this.hasSelectedCell = () => {
    let result = false
    this.state.cells.forEach(c => {
      if (c.selected) result = true
    })
    return result
  }
  this.getFocusedCell = () => {
    return _.find(this.state.cells, 'focused')
  }
  this.getFocusedCellScripts = () => {
    let focusedCell = this.getFocusedCell()
    if (!focusedCell) return []
    return _.keys(focusedCell.scripts)
  }
  this.getCommonCellScripts = () => {
    let filter = _.filter(this.state.cells, 'selected')
    let arr = _.map(filter, (c) => {
      return _.keys(c.scripts)
    })
    let result = _.intersection.apply(_, arr)
    return result
  }
  this.getCellTabClass = () => {
    return this.state.cells.length > 3 ? '' : 'flexAutoGrow'
  }
  this.toggleProjectShell = () => {
    this.projectShellFocused = !this.projectShellFocused
    this.update()
  }
  this.refreshReleasedState = () => {
    window.plasma.emit(FetchReleasedState.create(), () => {
      this.fetchingReleasedState = false
      this.update()
    })
    this.fetchingReleasedState = true
    this.update()
  }
  this.getCellsPerGroup = function (group) {
    let result = []
    this.state.cells.forEach(function (cell) {
      if (cell.groups[0] === group.name) {
        result.push(cell)
      }
    })
    return result
  }
  this.isGroupVirtual = function (group) {
    let result = []
    this.state.cells.forEach(function (cell) {
      if (cell.groups[0] === group.name) {
        result.push(cell)
      }
    })
    return result.length === 0
  }
  this.getCellGroups = function () {
    let result = []
    this.state.groups.forEach((group) => {
      if (this.isGroupVirtual(group)) return
      result.push(group)
    })
    return result
  }
  this.getCellVirtualGroups = function () {
    let result = []
    this.state.groups.forEach((group) => {
      if (!this.isGroupVirtual(group)) return
      result.push(group)
    })
    return result
  }
  this.focusCellTerminal = function () {
    let cell = this.getFocusedCell()
    if (!cell) return
    let needsChange = this.setFocusedCellByNameQuery(cell.name)
    if (needsChange) {
      window.plasma.emit(ChangeClientState.create(this.state))
    }
  }
  this.defocusCellTerminal = function () {
    let cell = this.getFocusedCell()
    let needsChange = this.setFocusedCellByNameQuery(cell.name, false)
    if (needsChange) {
      window.plasma.emit(ChangeClientState.create(this.state))
    }
  }
  this.setFocusedCellByNameQuery = function (nameQuery, focusValue = true) {
    let found = null
    this.state.cells.forEach(c => {
      if (c.name.includes(nameQuery) && !found) {
        found = c
        c.focused = focusValue
      }
    })
    if (found) {
      this.state.cells.forEach(c => {
        if (c !== found) {
          c.focused = false
        }
      })
      setTimeout(function () {
        window.plasma.emit('focusterminal')
      }, 200)
    }
    return found
  }
  this.setSelectedCellsByNameQuery = function (nameQuery) {
    let needsChange = false
    this.state.cells.forEach(c => {
      if (!nameQuery) {
        c.selected = true
        needsChange = true
      }
      if (c.name.includes(nameQuery)) {
        c.selected = true
        needsChange = true
      }
    })
    this.state.groups.forEach(g => {
      if (g.name.includes(nameQuery)) {
        g.selected = true
        needsChange = true
      }
    })
    return needsChange
  }
}
