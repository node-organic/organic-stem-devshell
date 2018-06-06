module.exports = class CommandTerminated {
  constructor (options) {
    this.type = 'CommandTerminated'
    this.transportType = 'socketio'
    this.cellName = options.cellName
    this.statusCode = options.statusCode
  }
}
