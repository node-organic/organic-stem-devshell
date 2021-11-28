const DNA = window.DNA
DNA.build['socketio-channel'].endpoint = window.location.hostname + ':' + DNA.build['socketio-channel'].port
const Cell = require('organic-stem-cell')

require('./index.css')

const cellInstance = new Cell({
  dna: DNA,
  buildBranch: 'build',
  defaultKillChemical: 'kill'
})
window.plasma = cellInstance.plasma
window.enableDebug = function () {
  console.info('piping all plasma chemicals into console')
  window.plasma.pipe(function (c) {
    console.log('[plasma]', c)
  })
}

window.plasma.on('cellReady', () => {
  require('./ui/devshell')
})
window.plasma.on('IOReady', () => {
  console.info('connected to server')
})

cellInstance.start()
