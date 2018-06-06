const ExecuteProjectCommands = require('../chemicals/execute-project-commands')

module.exports = function (plasma, dna) {
  return function (commands, callback) {
    plasma.emit(new ExecuteProjectCommands({
      commands: commands
    }), callback)
  }
}
