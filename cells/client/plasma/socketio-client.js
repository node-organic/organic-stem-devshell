const io = require('socket.io-client')

module.exports = class SocketIOClient {
  constructor (plasma, dna) {
    this.plasma = plasma
    this.dna = dna
    this.plasma.io = io(`http://localhost:${dna.port}`, {
      transports: ['websocket']
    })
  }
}
