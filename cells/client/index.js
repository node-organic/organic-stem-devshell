require('./index.css')

const DNA = window.DNA
const Cell = require('organic-stem-cell')
const oval = require('organic-oval')
Object.assign(oval, require('organic-oval/engines/incremental-dom'))

let cellInstance = new Cell({
  dna: DNA,
  buildBranch: 'build',
  defaultKillChemical: 'kill'
})
window.plasma = cellInstance.plasma

window.plasma.on('cellReady', () => {
  require('./ui/devshell')
})

cellInstance.start()
