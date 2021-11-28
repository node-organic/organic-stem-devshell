const {
  WatchKeys
} = require('client-plasma/combokeys/chemicals')
const ExecuteCellTypes = require('./execute-cell-types')

/**
 * @this {devshell} component
 */
module.exports = function () {
  window.plasma.emit(
    WatchKeys.create({
      value: 'ctrl+alt+x',
      global: true,
      callback: (c) => {
        if (this.executeToAllCellsType !== ExecuteCellTypes.parallel) {
          this.executeToAllCellsType = ExecuteCellTypes.parallel
        } else {
          this.executeToAllCellsType = ExecuteCellTypes.none
        }
        this.update()
      }
    })
  )
  window.plasma.emit(
    WatchKeys.create({
      value: 'ctrl+alt+z',
      global: true,
      callback: (c) => {
        if (this.executeToAllCellsType !== ExecuteCellTypes.serial) {
          this.executeToAllCellsType = ExecuteCellTypes.serial
        } else {
          this.executeToAllCellsType = ExecuteCellTypes.none
        }
        this.update()
      }
    })
  )
  window.plasma.emit(
    WatchKeys.create({
      value: 'ctrl+space',
      global: true,
      callback: () => {
        this.els('cmdinput').component.gainFocus()
      }
    })
  )
  window.plasma.emit(
    WatchKeys.create({
      value: 'shift+space',
      global: true,
      callback: () => {
        this.focusCellTerminal()
      }
    })
  )
  window.plasma.emit(
    WatchKeys.create({
      value: 'ctrl+`',
      global: true,
      callback: () => {
        this.focusCellTerminal()
      }
    })
  )
  window.plasma.on('IO', (c) => {
    c.io.on('disconnect', () => {
      this.connectionError = true
      this.update()
    })
  })
}
