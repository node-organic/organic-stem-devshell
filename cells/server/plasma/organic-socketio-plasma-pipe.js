module.exports = class SocketIOPlasmaPipe {
  constructor (plasma, dna) {
    this.plasma = plasma
    this.dna = dna
    this.sockets = []
    this.plasma.on(dna.reactOnConnection, this.handleConnection, this)
    this.plasma.on(dna.transportChemicalsShape, this.transportChemical, this)
  }

  handleConnection (c) {
    this.sockets.push(c.socket)
    c.socket.on('disconnect', () => {
      this.sockets.splice(this.sockets.indexOf(c.socket), 1)
    })
  }

  transportChemical (c, callback) {
    this.sockets.forEach(socket => {
      socket.emit(c.type, c, callback)
    })
  }
}
