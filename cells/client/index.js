require('./index.css')

const DNA = window.DNA
DNA.build['socketio-channel'].endpoint = 'localhost:' + DNA.build['socketio-channel'].port
console.log(DNA)
const Cell = require('organic-stem-cell')

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
