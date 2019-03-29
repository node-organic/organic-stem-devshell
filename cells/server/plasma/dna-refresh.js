const dnaToCells = require('lib/dna-to-cells')
const extractUniqueGroups = require('lib/cells-to-unique-groups')

const {
  ClientState,
  ChangeClientState
} = require('lib/chemicals')

const path = require('path')
const fs = require('fs')

module.exports = class DNARefreshOrganelle {
  constructor (plasma, dna) {
    this.plasma = plasma
    this.dna = dna
    this.plasma.on(ClientState.type, this.watchClientStateForChanges, this)
    this.watchers = []
    this.plasma.on('kill', () => {
      this.watcher.close()
    })
  }

  watchClientStateForChanges (c) {
    this.watcher = fs.watch(path.join(c.cwd, 'dna'), {recursive: true}, async () => {
      try {
        let updated_cells = await dnaToCells(c.cwd, c.cells)
        let groups = extractUniqueGroups(updated_cells)
        Object.assign(c, ClientState.create({
          cells: updated_cells,
          groups: groups,
          resolved: true
        }))
        this.plasma.emit(ChangeClientState.create(c))
      } catch (e) {
        console.error(e)
      }
    })
  }
}
