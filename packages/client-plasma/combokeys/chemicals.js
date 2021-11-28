let { define } = require('lib/alchemy')

module.exports.WatchKeys = define({
  type: 'watch-keys',
  value: String,
  global: Boolean,
  action: String,
  callback: Function
})