const pty = require('node-pty')
const path = require('path')
const terminate = require('terminate')
const dateFormat = require('dateformat')

const {
  RunAll,
  RunCommand,
  RunningCommand,
  CommandOutput,
  CommandTerminated,
  TerminateAll,
  AllRunningCommandsTerminated,
  TerminateCommand
} = require('../../../lib/chemicals/terminals')

module.exports = class TerminalsOrganelle {
  constructor (plasma, dna) {
    if (!dna.PRJROOT || dna.PRJROOT === 'undefined') throw new Error('missing dna.PRJROOT')
    this.plasma = plasma
    this.dna = dna
    this.runningCommands = []
    this.projectRoot = path.resolve(dna.PRJROOT)
    this.plasma.on(RunAll.type, (c) => {
      this.runningCommands = c.cells.map(this.executeCommand(c.value))
    })
    this.plasma.on(TerminateAll.type, (c) => {
      this.runningCommands.forEach((r) => {
        terminate(r.child.pid)
      })
    })
    this.plasma.on(TerminateCommand.type, (c) => {
      this.runningCommands.forEach((r, index) => {
        if (r.cell.name === c.cell.name) {
          terminate(r.child.pid)
        }
      })
    })
    this.plasma.on(RunCommand.type, (c) => {
      let cmd = this.executeCommand(c.value)(c.cell)
      this.runningCommands.push(cmd)
    })
  }

  executeCommand (value) {
    return (cell) => {
      let parts = value.split(' ')
      let cmd = parts.shift()
      let args = parts
      let cwd = path.join(this.projectRoot, 'cells', cell.name)
      let child = pty.spawn(cmd, args, {
        name: cell.name,
        cols: 80,
        rows: 24,
        cwd: cwd,
        env: process.env
      })
      let runningCommand = RunningCommand.create({
        cell: cell,
        child: child,
        value: value
      })
      child.on('data', (chunk) => {
        this.plasma.emit(CommandOutput.create({
          cell: cell,
          chunk: chunk
        }))
      })
      child.on('close', (statusCode) => {
        this.runningCommands.splice(this.runningCommands.indexOf(runningCommand), 1)
        this.plasma.emit(CommandOutput.create({
          cell: cell,
          chunk: '\n\r' + dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss') + ' <| terminated. \n\r'
        }))
        this.plasma.emit(CommandTerminated.create({
          cell: cell,
          statusCode: statusCode
        }))
        if (this.runningCommands.length === 0) {
          this.plasma.emit(AllRunningCommandsTerminated.create())
        }
      })
      this.plasma.emit(CommandOutput.create({
        cell: cell,
        chunk: dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss') + ' >| ' + value + '\n\r'
      }))
      return runningCommand
    }
  }
}
