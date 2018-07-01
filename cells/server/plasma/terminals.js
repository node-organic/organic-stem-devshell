const pty = require('node-pty')
const path = require('path')

const {
  RunAll,
  RunningCommand,
  CommandOutput,
  CommandTerminated
} = require('../../../lib/chemicals/terminals')

module.exports = class TerminalsOrganelle {
  constructor (plasma, dna) {
    if (!dna.PRJROOT || dna.PRJROOT === 'undefined') throw new Error('missing dna.PRJROOT')
    this.plasma = plasma
    this.dna = dna
    this.runningCommands = []
    this.projectRoot = path.resolve(dna.PRJROOT)
    this.plasma.on(RunAll.type, (c) => {
      this.runningCommands = c.terminals.map(this.executeCommand(c.value))
    })
  }

  executeCommand (value) {
    return (terminal) => {
      let parts = value.split(' ')
      let cmd = parts.shift()
      let args = parts
      let cwd = path.join(this.projectRoot, 'cells', terminal.cellName)
      let child = pty.spawn(cmd, args, {
        name: terminal.name,
        cols: 80,
        rows: 24,
        cwd: cwd,
        env: process.env
      })
      let runningCommand = RunningCommand.create({
        terminal: terminal,
        child: child,
        value: value
      })
      child.on('data', (chunk) => {
        this.plasma.emit(CommandOutput.create({
          terminal: terminal,
          chunk: chunk
        }))
      })
      child.on('close', (statusCode) => {
        this.runningCommands.splice(this.runningCommands.indexOf(runningCommand), 1)
        this.plasma.emit(CommandTerminated.create({
          terminal: terminal,
          statusCode: statusCode
        }))
      })
      return runningCommand
    }
  }
}
