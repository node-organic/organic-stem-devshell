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
const chokidar = require('chokidar')

module.exports = class CellInfoRefreshOrganelle {
  constructor (plasma, dna) {
    this.plasma = plasma
    this.dna = dna
    this.plasma.on(ClientState.type, this.watchClientStateForChanges, this)
    this.watchers = []
    this.plasma.on('kill', () => {
      this.cleanWatchers()
    })
  }

  cleanWatchers () {
    this.watchers.forEach((w) => {
      if (w.ready) {
        w.close()
      } else {
        w.on('ready', () => {
          w.close()
        })
      }
    })
    this.watchers = []
  }

  watchClientStateForChanges (c) {
    this.cleanWatchers()
    c.cells.forEach((cell) => {
      let packagejson_path = path.join(c.cwd, cell.cwd, 'package.json')
      try {
        let watcher = chokidar.watch(packagejson_path, {
          awaitWriteFinish: {
            stabilityThreshold: 1000,
            pollInterval: 100
          }
        })
        watcher.on('change', async () => {
          cell.scripts = (await readJSON(packagejson_path)).scripts
          this.plasma.emit(ChangeClientState.create(c))
        })
        watcher.on('ready', () => {
          watcher.ready = true
        })
        this.watchers.push(watcher)
      } catch (e) {
        // ignore exception
      }
    })
  }
}
