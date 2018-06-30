const ProjectChemical = require('../chemicals/project')
const ExecuteProjectCommands = require('../chemicals/execute-project-commands')
const CommandOutput = require('../chemicals/command-output')
const CommandTerminated = require('../chemicals/command-terminated')
const RunningCommand = require('../chemicals/running-command')
const TerminateCommand = require('../chemicals/terminate-command')

const pty = require('node-pty')

module.exports = class TerminalsOrganelle {
  executeCommands (c, callback) {
    let commands = c.commands
    commands.forEach(cmdInfo => {
      let parts = cmdInfo.value.split(' ')
      let cmd = parts.shift()
      let args = parts
      let child = pty.spawn(cmd, args, {
        name: cmdInfo.cellName,
        cols: 80,
        rows: 24,
        cwd: path.join(this.projectRoot, 'cells', cmdInfo.cellName),
        env: process.env
      })
      let runningCommand = new RunningCommand({
        cmdInfo: cmdInfo,
        child: child
      })
      this.runningCommands.push(runningCommand)
      this.plasma.emit(runningCommand)
      child.on('data', (chunk) => {
        this.plasma.emit(new CommandOutput({
          cellName: cmdInfo.cellName,
          chunk: chunk
        }))
      })
      child.on('close', (statusCode) => {
        this.runningCommands.splice(this.runningCommands.indexOf(runningCommand), 1)
        this.plasma.emit(new CommandTerminated({
          cellName: cmdInfo.cellName,
          statusCode: statusCode
        }))
      })
    })
    callback(null, this.runningCommands)
  }

  terminateCommand (c) {
    this.runningCommands.forEach(cmd => {
      if (cmd.child.pid === c.pid) {
        cmd.terminate()
      }
    })
  }
}
