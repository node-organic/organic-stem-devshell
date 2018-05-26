const DNA = window.DNA
const Cell = require('organic-stem-cell')

let cellInstance = new Cell({
  dna: DNA,
  buildBranch: 'build',
  defaultKillChemical: 'kill'
})
cellInstance.plasma.on('oval-ready', function () {
  require('./index.css')
  require('./ui/devshell')
})
cellInstance.start()
