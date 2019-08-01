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
    this.watchedMap = {
      // 'packagejson_path': Watcher
    }
    this.plasma.on('kill', () => {
      this.cleanWatchers()
    })
  }

  cleanWatchers () {
    for (let p in this.watchedMap) {
      let w = this.watchedMap[p]
      if (w.ready) {
        w.close()
        delete this.watchedMap[p]
      } else {
        w.on('ready', () => {
          w.close()
          delete this.watchedMap[p]
        })
      }
    }
  }

  watchClientStateForChanges (c) {
    c.cells.forEach((cell) => {
      let packagejson_path = path.join(c.cwd, cell.cwd, 'package.json')
      if (this.watchedMap[packagejson_path]) return // skip for watched paths
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
        this.watchedMap[packagejson_path] = watcher
      } catch (e) {
        // ignore exception
        console.log(e)
      }
    })
  }
}
