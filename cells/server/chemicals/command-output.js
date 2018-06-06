module.exports = class CommandOutput {
  constructor (options) {
    this.type = 'CommandOutput'
    this.transportType = 'socketio'
    this.cellName = options.cellName
    this.chunk = options.chunk
    this.outputType = options.outputType
  }
}
