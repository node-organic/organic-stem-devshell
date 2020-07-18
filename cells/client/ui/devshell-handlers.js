const _ = require('lodash')

const ExecuteCellTypes = require('./execute-cell-types')
const {
  ChangeClientState,
} = require('lib/chemicals')
const {
  TerminateAll,
  RunCommand
} = require('lib/chemicals/terminals')
const {
  TerminateSerialCommand
} = require('lib/chemicals/serial-commands')

const {
  RunFrontCommand
} = require('plasma/front-commands')
const {
  Execute: ProjectExecute
} = require('lib/chemicals/project-shell')

/**
 * @this {devshell} component
 */
module.exports = function () {
  this.onCellSelected = (cell) => {
    cell.selected = !cell.selected
    window.plasma.emit(ChangeClientState.create(this.state))
  }
  this.onCellFocused = (focusedCell) => {
    this.state.cells.forEach((cell) => {
      if (cell.name !== focusedCell.name) {
        cell.focused = false
      } else {
        cell.focused = !cell.focused
      }
    })
    window.plasma.emit(ChangeClientState.create(this.state))
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
  this.onCellGroupSelected = (group) => {
    return () => {
      // cant use the group as reference
      // seems JS passes it as cloned object
      // therefore `group.selected = !group.selected`
      // wont work here and instead we need to do
      this.state.groups.forEach((g) => {
        if (g.name === group.name) {
          g.selected = !g.selected
        }
      })
      window.plasma.emit(ChangeClientState.create(this.state))
    }
  }
  this.onExecute = async (c) => {
    let value = c.cmd
    let result = await window.plasma.emitOnce(RunFrontCommand.create({
      value: value,
      devshell: this
    }))
    if (result) return
    switch (this.executeToAllCellsType) {
      case ExecuteCellTypes.parallel:
        window.plasma.emit(ChangeClientState.create({
          runningCommand: value,
          executeType: 'parallel'
        }))
        break
      case ExecuteCellTypes.serial:
        window.plasma.emit(ChangeClientState.create({
          runningCommand: value,
          executeType: 'serial'
        }))
        break
      case ExecuteCellTypes.none:
      default:
        this.state.cells.forEach((cell) => {
          if (cell.focused) {
            window.plasma.emit(RunCommand.create({
              value: value,
              cell: cell
            }))
          }
        })
        break
    }
    this.executeToAllCellsType = ExecuteCellTypes.none
    this.update()
  }
  this.onCellScriptClick = (script) => {
    return (e) => {
      this.onExecute({ cmd: 'npm run ' + script })
    }
  }
  this.onTerminateAll = (e) => {
    if (this.state.executeType === 'serial') {
      window.plasma.emit(TerminateSerialCommand.create())
    } else {
      window.plasma.emit(TerminateAll.create())
    }
  }
  this.onProjectScriptClick = (script) => {
    return () => {
      if (!this.projectShellFocused) {
        this.projectShellFocused = true
        this.update()
      }
      window.plasma.emit(ProjectExecute.create({
        value: 'npm run ' + script
      }))
    }
  }
}
