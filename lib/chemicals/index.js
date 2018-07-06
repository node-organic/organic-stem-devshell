let {define, extend} = require('../alchemy')

module.exports.Cell = define({
  type: 'Cell',
  name: String,
  groups: Array,
  selected: Boolean,
  focused: Boolean
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
  cells: Array,
  groups: Array,
  cwd: String,
  userhome: String,
  runningCommand: String
})

module.exports.ChangeClientState = extend(module.exports.ClientState, {
  type: 'ChangeClientState'
})
