const {
  ClientState,
  ChangeClientState
} = require('lib/chemicals')

const path = require('path')
const fs = require('fs')
const readFile = require('util').promisify(fs.readFile)
const readJSON = async function (filepath) {
  return JSON.parse((await readFile(filepath)).toString())
}

module.exports = class CellInfoRefreshOrganelle {
  constructor (plasma, dna) {
    this.plasma = plasma
    this.dna = dna
    this.plasma.on(ClientState.type, this.watchClientStateForChanges, this)
    this.watchers = []
    this.plasma.on('kill', () => {
      this.watchers.forEach((w) => w.close())
      this.watchers = []
    })
  }

  watchClientStateForChanges (c) {
    c.cells.forEach((cell) => {
      let packagejson_path = path.join(c.cwd, cell.cwd, 'package.json')
      let watcher = fs.watch(packagejson_path, async () => {
        try {
          cell.scripts = (await readJSON(packagejson_path)).scripts
          this.plasma.emit(ChangeClientState.create(c))
        } catch (e) {
          console.error(e)
        }
      })
      this.watchers.push(watcher)
    })
  }
}
