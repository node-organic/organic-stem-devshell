require('./index.css')

const DNA = window.DNA
const Cell = require('organic-stem-cell')

let cellInstance = new Cell({
  dna: DNA,
  buildBranch: 'build',
  defaultKillChemical: 'kill'
})

window.plasma = cellInstance.plasma

cellInstance.plasma.on('oval-ready', function () {
  require('./ui/devshell')
})

cellInstance.start()
