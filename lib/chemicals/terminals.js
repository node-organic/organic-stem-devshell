let define = require('../alchemy').define

module.exports.TerminateAll = define({
  type: 'TerminateAll'
})

module.exports.RunAll = define({
  type: 'RunAll',
  value: String,
  terminals: Array
})

module.exports.RunningCommand = define({
  type: 'RunningCommand',
  value: String,
  terminal: Object,
  child: Object
})

module.exports.CommandOutput = define({
  type: 'CommandOutput',
  transportType: 'socketio',
  terminal: Object,
  chunk: String
})

module.exports.CommandTerminated = define({
  type: 'CommandTerminated',
  transportType: 'socketio',
  terminal: Object,
  statusCode: Number
})
