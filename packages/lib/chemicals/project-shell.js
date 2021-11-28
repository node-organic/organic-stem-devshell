let {define} = require('../alchemy')

module.exports.CommandInput = define({
  type: 'ProjectShellCommandInput',
  transportType: 'socketio',
  char: String
})

module.exports.Resize = define({
  type: 'ProjectShellResize',
  transportType: 'socketio',
  cols: Number,
  rows: Number
})

module.exports.CommandOutput = define({
  type: 'ProjectShellCommandOutput',
  transportType: 'socketio',
  chunk: String
})

module.exports.RequestScripts = define({
  type: 'ProjectShellRequestScripts',
  transportType: 'socketio'
})
module.exports.Scripts = define({
  type: 'ProjectShellScripts',
  transportType: 'socketio',
  scripts: Array // String
})

module.exports.Execute = define({
  type: 'ProjectShellExecute',
  transportType: 'socketio',
  value: String
})
