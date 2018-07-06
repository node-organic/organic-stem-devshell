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
  byCell: function (cell) {
    return {
      type: this.type,
      cell: {
        name: cell.name
      }
    }
  }
})

module.exports.RunAll = define({
  type: 'RunAll',
  value: String,
  cells: Array
})

module.exports.RunCommand = define({
  type: 'RunCommand',
  value: String,
  cell: Object
})

module.exports.RunningCommand = define({
  type: 'RunningCommand',
  value: String,
  cell: Object,
  child: Object
})

module.exports.CommandOutput = define({
  type: 'CommandOutput',
  transportType: 'socketio',
  terminal: Object,
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
  terminal: Object,
  statusCode: Number,
  byCell: function (input) {
    return {
      type: this.type,
      cell: {
        name: input.name
      }
    }
  }
})
