module.exports = class ProjectChemical {
  constructor (options) {
    this.type = 'ProjectChemical'
    this.transportType = 'socketio'
    this.cwd = options.cwd
    this.cells = options.cells
    this.runningCommands = options.runningCommands
    this.userhome = options.userhome
  }
  static get scan () {
    return 'ScanCWD'
  }
}
