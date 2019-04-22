const {
  ClientState,
  ChangeClientState,
  FetchReleasedState
} = require('lib/chemicals')
const path = require('path')
const {exec} = require('child_process')
const {forEachSeries} = require('p-iteration')

const execOutput = function (cmd, cwd) {
  return new Promise((resolve, reject) => {
    let child = exec(cmd, {cwd: path.join(process.env.PRJROOT, cwd), env: process.env})
    let output = ''
    child.stdout.on('data', function (chunk) {
      output += chunk.toString()
    })
    child.on('exit', function () {
      resolve(output)
    })
  })
}

module.exports = class CellReleasedStatus {
  constructor (plasma, dna) {
    this.plasma = plasma
    this.dna = dna
    this.plasma.on(ClientState.type, this.rememberClientState, this)
    this.plasma.on(FetchReleasedState.type, this.fetchReleasedStatusForCells, this)
  }

  rememberClientState (c) {
    this.clientState = c
  }

  async fetchReleasedStatusForCells (c, done) {
    let changed = false
    // reset state
    this.clientState.cells.forEach((cell) => {
      cell.released = undefined
    })
    this.plasma.emit(ChangeClientState.create(this.clientState))
    // build new state
    await forEachSeries(this.clientState.cells, async (cell) => {
      if (cell.dependencies['angelscripts-k8s-deployments']) {
        let output = await execOutput('npx angel changes', cell.cwd)
        let released = output.split('\n').filter(v => v).length === 0
        if (cell.released !== released) {
          cell.released = released
          changed = true
        }
      }
    })
    if (changed) {
      this.plasma.emit(ChangeClientState.create(this.clientState))
    }
    done()
  }
}
