const {
  FetchReleasedState
} = require('lib/chemicals')

/**
 * @this {devshell} component
 */
module.exports = function () {
  this.hasSelectedCell = () => {
    let result = false
    this.state.cells.forEach(c => {
      if (c.selected) result = true
    })
    return result
  }
  this.getFocusedCell = () => {
    for (let i = 0; i < this.state.cells.length; i++) {
      let c = this.state.cells[i]
      if (c.focused) {
        return c
      }
    }
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
}
