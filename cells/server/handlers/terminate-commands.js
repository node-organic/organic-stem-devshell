const TerminateCommand = require('../chemicals/terminate-command')

module.exports = function (plasma, dna) {
  return function (pid) {
    plasma.emit(new TerminateCommand({
      pid: pid
    }))
  }
}
