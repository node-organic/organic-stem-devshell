module.exports = class SocketIOServerChannel {
  constructor (plasma, dna) {
    this.plasma = plasma
    this.dna = dna
    this.sockets = []
    this.plasma.on(dna.reactOnConnection, this.handleConnection, this)
    this.plasma.on(dna.transportChemicalsShape, this.transportChemical, this)
  }

  handleConnection (c) {
    this.sockets.push(c.socket)
    c.socket.on('chemical', (c, callback) => {
      c['$SocketIOServerChannel'] = true
      this.plasma.emit(c, callback)
    })
    c.socket.on('disconnect', () => {
      this.sockets.splice(this.sockets.indexOf(c.socket), 1)
    })
  }

  transportChemical (c, callback) {
    if (c['$SocketIOServerChannel']) return
    this.sockets.forEach(socket => {
      socket.emit('chemical', c, callback)
    })
  }
}
