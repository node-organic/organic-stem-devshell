let define = require('../alchemy').defineChemical

module.exports.CommandOutput = define({
  type: 'CommandOutput',
  transportType: 'socketio',
  cellName: String,
  chunk: String
})
module.exports.CommandTerminated = define({
  type: 'CommandTerminated',
  transportType: 'socketio',
  cellName: String,
  statusCode: Number
})
