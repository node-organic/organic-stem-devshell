let {define} = require('../alchemy')

module.exports.RunSerialCommand = define({
  type: 'RunSerialCommand',
  cells: Array,
  value: String
})

module.exports.TerminateSerialCommand = define({
  type: 'TerminateSerialCommand',
  transportType: 'socketio'
})
