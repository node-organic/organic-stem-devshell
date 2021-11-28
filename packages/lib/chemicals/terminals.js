let {define} = require('../alchemy')

module.exports.AllRunningCommandsTerminated = define({
  type: 'AllRunningCommandsTerminated'
})

module.exports.TerminateAll = define({
  type: 'TerminateAll',
  transportType: 'socketio'
})

module.exports.TerminateCommand = define({
  type: 'TerminateCommand',
  transportType: 'socketio',
  byCell: function (cell) {
    return {
      type: this.type,
      transportType: 'socketio',
      cell: {
        name: cell.name
      }
    }
  }
})

module.exports.RestartCommands = define({
  type: 'RestartCommands',
  transportType: 'socketio',
  byCell: function (cell) {
    return {
      type: this.type,
      transportType: 'socketio',
      cell: {
        name: cell.name
      }
    }
  }
})

module.exports.RunAll = define({
  type: 'RunAll',
  value: String,
  cells: Array,
  executeType: String
})

module.exports.RunCommand = define({
  type: 'RunCommand',
  transportType: 'socketio',
  value: String,
  cell: Object
})

module.exports.RunningCommand = define({
  type: 'RunningCommand',
  value: String,
  cell: Object,
  child: Object
})

module.exports.CommandStarted = define({
  type: 'CommandStarted',
  transportType: 'socketio',
  cell: Object,
  chunk: String,
  byCell: function (input) {
    return {
      type: this.type,
      cell: {
        name: input.name
      }
    }
  }
})

module.exports.CommandInput = define({
  type: 'CommandInput',
  transportType: 'socketio',
  char: String,
  cell: Object
})

module.exports.Resize = define({
  type: 'Resize',
  transportType: 'socketio',
  cell: Object,
  cols: Number,
  rows: Number
})


module.exports.CommandOutput = define({
  type: 'CommandOutput',
  transportType: 'socketio',
  cell: Object,
  chunk: String,
  byCell: function (input) {
    return {
      type: this.type,
      cell: {
        name: input.name
      }
    }
  }
})

module.exports.CommandTerminated = define({
  type: 'CommandTerminated',
  transportType: 'socketio',
  cell: Object,
  statusCode: Number,
  commandValue: String,
  byCell: function (input) {
    return {
      type: this.type,
      cell: {
        name: input.name
      }
    }
  }
})
