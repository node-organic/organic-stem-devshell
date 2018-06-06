const loadDNA = require('organic-dna-loader')
const path = require('path')
const ProjectChemical = require('../chemicals/project')
const ExecuteProjectCommands = require('../chemicals/execute-project-commands')
const CommandOutput = require('../chemicals/command-output')
const CommandTerminated = require('../chemicals/command-terminated')
const RunningCommand = require('../chemicals/running-command')
const TerminateCommand = require('../chemicals/terminate-command')
const userhome = require('userhome')
const {exec} = require('child_process')

module.exports = class ProjectDevshell {
  constructor (plasma, dna) {
    this.plasma = plasma
    this.dna = dna
    this.projectRoot = path.resolve(process.env.PRJ_ROOT)
    this.runningCommands = []
    this.plasma.on(ProjectChemical.scan, this.scanCWD, this)
    this.plasma.on(ExecuteProjectCommands, this.executeCommands, this)
    this.plasma.on(TerminateCommand, this.terminateCommand, this)
  }

  executeCommands (c, callback) {
    let commands = c.commands
    commands.forEach(cmdInfo => {
      let child = exec(cmdInfo.value, {
        cwd: path.join(this.projectRoot, 'cells', cmdInfo.cellName)
      })
      let runningCommand = new RunningCommand({
        cmdInfo: cmdInfo,
        child: child
      })
      this.runningCommands.push(runningCommand)
      this.plasma.emit(runningCommand)
      child.stderr.on('data', (chunk) => console.error(chunk.toString()))
      child.stderr.on('data', (chunk) => {
        this.plasma.emit(new CommandOutput({
          cellName: cmdInfo.cellName,
          outputType: 'error',
          chunk: chunk
        }))
      })
      child.stdout.on('data', (chunk) => console.error(chunk.toString()))
      child.stdout.on('data', (chunk) => {
        this.plasma.emit(new CommandOutput({
          cellName: cmdInfo.cellName,
          outputType: 'error',
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

  scanCWD () {
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
          groups: dna.cells[key].groups
        })
      }
      this.plasma.emit(new ProjectChemical({
        userhome: userhome(),
        cwd: this.projectRoot,
        cells: cells,
        runningCommands: this.runningCommands
      }))
    })
  }
}
