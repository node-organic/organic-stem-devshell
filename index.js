let cell = require('./cells/server')
cell.plasma.on('HandlersReady', () => {
  open(`http://localhost:${devShell.dna.port}`)
})
cell.start()
