const kill = require('terminate')

module.exports = class RunningCommand {
  constructor (options) {
    this.type = 'RunningCommand'
    this.transportType = 'socketio'
    this.cmdInfo = options.cmdInfo
    this.child = options.child
    this.running = true
    this.child.on('close', (statusCode) => {
      this.running = false
    })
  }
  toJSON () {
    return {
      cmdInfo: this.cmdInfo,
      running: this.running,
      child: {
        pid: this.child.pid
      }
    }
  }
  terminate () {
    kill(this.child.pid)
  }
}
