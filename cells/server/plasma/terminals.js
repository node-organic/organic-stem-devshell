const pty = require('node-pty')
const path = require('path')
const terminate = require('terminate')
const dateFormat = require('dateformat')

const {
  RunAll,
  RunCommand,
  RunningCommand,
  CommandStarted,
  CommandInput,
  CommandOutput,
  CommandTerminated,
  TerminateAll,
  AllRunningCommandsTerminated,
  TerminateCommand,
  RestartCommands,
  Resize
} = require('lib/chemicals/terminals')

module.exports = class TerminalsOrganelle {
  constructor (plasma, dna) {
    if (!dna.PRJROOT || dna.PRJROOT === 'undefined') throw new Error('missing dna.PRJROOT')
    this.plasma = plasma
    this.dna = dna
    this.runningCommands = []
    this.projectRoot = path.resolve(dna.PRJROOT)
    this.plasma.on(RunAll.type, (c) => {
      c.cells.map(this.executeCommand(c.value))
    })
    this.plasma.on(TerminateAll.type, (c) => {
      this.runningCommands.forEach((r) => {
        terminate(r.child.pid, 'SIGINT')
      })
    })
    this.plasma.on(TerminateCommand.type, (c) => {
      this.runningCommands.forEach((r) => {
        if (r.cell.name === c.cell.name) {
          terminate(r.child.pid, 'SIGINT')
        }
      })
    })
    this.plasma.on(RestartCommands.type, (c) => {
      this.runningCommands.forEach((r) => {
        if (r.cell.name === c.cell.name) {
          terminate(r.child.pid, 'SIGINT', () => {
            this.executeCommand(r.value)(r.cell)
          })
        }
      })
    })
    this.plasma.on(RunCommand.type, (c) => {
      this.executeCommand(c.value)(c.cell)
    })
    this.plasma.on(CommandInput.type, (c) => {
      let lastRunningCommandIndex = -1
      this.runningCommands.forEach((r, index) => {
        if (r.cell.name === c.cell.name) {
          lastRunningCommandIndex = index
        }
      })
      if (lastRunningCommandIndex === -1) return
      this.runningCommands[lastRunningCommandIndex].child.write(c.char)
    })
    this.plasma.on(Resize.type, (c) => {
      this.runningCommands.forEach((r) => {
        if (r.cell.name === c.cell.name) {
          r.child.resize(c.cols, c.rows)
        }
      })
    })
    this.plasma.on('kill', () => {
      this.runningCommands.forEach((r) => {
        terminate(r.child.pid)
      })
    })
  }

  getRunningCommandsCount (cell) {
    let result = 0
    for (let i = 0; i < this.runningCommands.length; i++) {
      if (this.runningCommands[i].cell.name === cell.name) {
        result += 1
      }
    }
    return result
  }

  executeCommand (value) {
    return (cell) => {
      let cmd = 'bash'
      let args = ['-c', value]
      let cwd = path.join(this.projectRoot, cell.cwd)
      let envCopy = Object.assign({}, process.env)
      delete envCopy['CELL_MODE']
      envCopy['COLORTERM'] = 'truecolor'
      let child = pty.spawn(cmd, args, {
        name: cell.name,
        cols: 800,
        rows: 240,
        cwd: cwd,
        env: envCopy
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
          statusCode: statusCode,
          commandValue: value,
          runningCommandsCount: this.getRunningCommandsCount(cell)
        }))
        if (this.runningCommands.length === 0) {
          this.plasma.emit(AllRunningCommandsTerminated.create())
        }
      })
      this.runningCommands.push(runningCommand)
      this.plasma.emit(CommandStarted.create({
        cell: cell,
        chunk: dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss') + ' >| ' + value + '\n\r',
        runningCommandsCount: this.getRunningCommandsCount(cell)
      }))
      return runningCommand
    }
  }
}
