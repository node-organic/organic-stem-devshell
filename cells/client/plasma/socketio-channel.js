const io = require('socket.io-client')

module.exports = class SocketIOClientChannel {
  constructor (plasma, dna) {
    this.plasma = plasma
    this.dna = dna
    this.io = io(`http://localhost:${dna.port}`, {
      transports: ['websocket']
    })
    this.io.on('chemical', (c, callback) => {
      c['$SocketIOClientChannel'] = true
      this.plasma.emit(c, callback)
      delete c['$SocketIOClientChannel']
    })
    this.plasma.on(dna.transportChemicalsShape, this.transportChemical, this)
  }

  transportChemical (c, callback) {
    if (c['$SocketIOClientChannel']) return console.log('refused', c)
    this.io.emit('chemical', c, callback)
  }
}
