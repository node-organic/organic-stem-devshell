let {define, extend} = require('../alchemy')

module.exports.Cell = define({
  type: 'Cell',
  name: String,
  cwd: String,
  groups: Array,
  selected: Boolean,
  focused: Boolean,
  commandRunning: Boolean,
  runningCommandsCount: Number,
  port: Number,
  mountPoint: Number,
  released: Boolean,
  scripts: Object /*
    name<String>: String
  */,
  dependencies: Object /*
    name<String>: String
  */
})

module.exports.Group = define({
  type: 'Group',
  name: String,
  selected: Boolean
})

module.exports.FetchClientState = define({
  type: 'FetchClientState',
  transportType: 'socketio'
})

module.exports.ClientState = define({
  type: 'ClientState',
  transportType: 'socketio',
  cells: Array, // Cell
  groups: Array,
  cwd: String,
  userhome: String,
  runningCommand: String,
  executeType: String
})

module.exports.ChangeClientState = extend(module.exports.ClientState, {
  type: 'ChangeClientState'
})


module.exports.FetchReleasedState = define({
  type: 'FetchReleasedState',
  transportType: 'socketio'
})
